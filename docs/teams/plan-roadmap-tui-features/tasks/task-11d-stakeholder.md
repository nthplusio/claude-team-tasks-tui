---
title: "Domain Section: Constraints & Stakeholder Impact"
owner: Stakeholder Advocate
task: 11d
date: 2026-03-04
---

# Constraints & Stakeholder Impact

---

## User Segments & Phase Value

| Segment | Description | First Value At |
|---------|-------------|---------------|
| Active session monitor | Runs teams frequently, wants live status without switching context | Phase 1 |
| Output reader | Primarily reads team artifacts (specs, reports) after teams complete | Phase 3 |
| Multi-team operator | Runs 2+ concurrent teams, needs to distinguish them at a glance | Phase 1 (name resolution) |
| New user / evaluator | Discovering the tool via `bunx`, zero tolerance for friction | Phase 4 |

Phase 1 delivers value to the primary user segment (active session monitor). Phase 3 addresses the secondary segment (output reader). Phase 4 gates distribution to new users.

---

## Hard Constraints

These are non-negotiable. Violating any of them requires explicit user decision to proceed.

| Constraint | Implication for Roadmap |
|-----------|------------------------|
| **Dual data sources required** — both `~/.claude/tasks/` JSON and `docs/teams/` markdown must be supported | Cannot simplify to a single-source model. Two watchers are required from Phase 1. |
| **Bun runtime** — all dependencies must be Bun-compatible | No Node-only native modules. `chokidar` and `gray-matter` are already verified. |
| **bunx distribution** — no build step on end-user machine | `dist/` must be committed to the repo. Package size affects cold-start. Minimize new dependencies. |
| **Terminal-only** — no web server, browser dependency, or network ports | All rendering is OpenTUI/SolidJS. No HTTP, no WebSocket, no external process. |
| **Read-only TUI** — the TUI observes, does not control | No task mutation, no agent messaging, no inbox replies. Out of scope for all phases. |

---

## Soft Constraints

These should be respected but can be overridden with justification.

| Constraint | Current Status | Override Condition |
|-----------|---------------|-------------------|
| **OpenTUI/SolidJS architecture** | Preferred — no stack change needed | Only if a capability is provably impossible within OpenTUI |
| **Minimal new dependencies** | Prefer zero new deps per phase | Allowed if a dependency solves a problem that would otherwise require 200+ lines of custom code |
| **Single-process** | Current design; two watchers stay in-process | No override anticipated |
| **Basic markdown only** | Headings bold, lists indented, code blocks preserved. No tables, images, or inline HTML | User can request richer rendering if needed; not on current roadmap |

---

## External Dependencies & Integration Risks

### agent-teams plugin (external dependency)

The TUI depends on data written by the agent-teams plugin. The plugin is not controlled by this project. Two open questions must be resolved before Phase 1 ships:

**Q1: Named task dirs vs. UUID dirs**

Observed behavior: both `~/.claude/tasks/plan-roadmap-tui-features/` (named) and UUID dirs exist. It is unconfirmed whether the plugin always writes named dirs or only sometimes.

- If named dirs are always written: UUID resolution is a graceful fallback only. Phase 1 works out of the box for all current teams.
- If only UUID dirs are written: the TUI silently shows UUID strings for all teams unless UUID→name resolution succeeds via config. This is a poor Phase 1 experience.

**Resolution required before Phase 1 implementation.** Ask the plugin maintainer directly.

**Q2: Atomic task file writes**

The TUI's `awaitWriteFinish` stability threshold (100ms) handles non-atomic writes. If the plugin writes atomically (write-to-tmp, rename), this is unnecessary overhead. If not, it's essential.

Low-urgency but affects latency tuning in Phase 1.

### chokidar on Linux (inotify limits)

Running two chokidar watchers (`~/.claude/tasks/` + `docs/teams/`) on Linux consumes inotify watch descriptors. Default limits (`max_user_watches=8192`) can be exhausted in environments with many directories.

- **Risk level:** Medium. Affects Linux users with large `~/.claude/tasks/` directories.
- **Mitigation:** Document the fix in README. Add a clear error message when inotify limit is hit (Phase 4 acceptance test 4.7).
- **Not a blocker** for Phase 1-3 on typical developer machines.

---

## Stakeholder Impact Per Phase

### Phase 1 — Live Task Monitoring

**Who benefits immediately:** Any developer running agent-teams sessions. The TUI becomes useful *during* a session rather than only after.

**What changes for users:** They now have a terminal panel showing live task status. No workflow change required — it's additive.

**Risk to users:** If UUID resolution does not work (Q1 above), teams appear as 8-char UUIDs. Confusing but not harmful. This is the only Phase 1 user experience risk.

**Distribution impact:** Phase 1 is a new minor version (`v0.2.0`). Existing users who `bunx` without pinning get the new version automatically.

---

### Phase 2 — Team Context & Identity

**Who benefits:** Users running teams with multiple agents. Single-agent users see minimal change.

**What changes for users:** Task rows now show agent name + color. Blocked tasks dim. Detail view shows dependency relationships. Richer information density.

**Risk to users:** If a team has no `~/.claude/teams/{name}/config.json` (older session, non-standard setup), Phase 2 features silently degrade to Phase 1 appearance. No crash, no data loss.

**Plugin dependency:** `owner` field in task JSON enables reliable attribution. Already confirmed present in current plugin output. No plugin change needed.

---

### Phase 3 — Full Output Navigation

**Who benefits:** Users who produce and consume team artifacts (specs, roadmaps, research reports). The "output reader" segment.

**What changes for users:** Pressing `f` on any team opens a file browser for that team's `docs/teams/{name}/` directory. New navigation mode with keyboard-only access to all markdown files.

**Risk to users:** UUID-only teams (no `docsPath` in config, no named dir) show an empty file browser — they have no docs path to link to. This is expected degradation, not a bug.

**Plugin dependency (optional):** `docsPath` field in team config enables reliable docs linking for UUID teams. Without it, the heuristic `./docs/teams/{name}/` works for named teams.

---

### Phase 4 — Polish & Distribution

**Who benefits:** New users discovering the tool via `bunx`.

**What changes for users:** `?` overlay surfaces all keybindings. `--tasks-path` and `--docs-path` CLI args enable custom setups. No functional change for existing users.

**Distribution impact:** Phase 4 is the release gate for broader distribution/promotion. Before Phase 4, the tool is suitable for users who are already familiar with agent-teams. After Phase 4, it can be recommended to any Claude Code user.

---

## Sequencing Constraint: UUID Resolution Must Be Phase 1

The most important sequencing constraint identified in the feasibility review:

UUID resolution (F6) is currently sequenced in Phase 2. It should be in Phase 1.

**Reason:** If a user's active team appears as `02b891df` instead of `plan-roadmap-tui-features`, the Phase 1 value proposition ("see your active team") is undermined. The fix is low-effort (scan `~/.claude/teams/*/config.json` once on startup) and unblocks a coherent Phase 1 user experience.

This is the only sequencing change the Stakeholder Advocate advocates for. Everything else in the phase plan is correctly ordered.

---

## Out of Scope (All Phases)

- Sending messages to agents or controlling task state
- Web UI or server-side components
- Multi-user collaboration or shared views
- Full markdown rendering (tables, images, footnotes, inline HTML)
- Agent inbox reading — no send capability makes read-only inbox viewing low-value
- Automatic team deletion cleanup — if a team dir is deleted while TUI is watching, graceful removal is sufficient; no archival or history required
