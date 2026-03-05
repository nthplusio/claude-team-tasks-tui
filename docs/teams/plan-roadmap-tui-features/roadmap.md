---
title: claude-team-tasks-tui Product Roadmap
date: 2026-03-04
status: final
team: plan-roadmap-tui-features
contributors: [Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate]
---

# claude-team-tasks-tui — Product Roadmap

## Executive Summary

claude-team-tasks-tui is a terminal UI for monitoring Claude agent team sessions in real time. It currently displays team outputs from `docs/teams/` (markdown files) but has no visibility into live agent activity.

This roadmap defines 4 phases that transform it from a static file browser into a live operational dashboard:

| Phase | Name | Ships As | Core Capability Unlocked |
|-------|------|----------|--------------------------|
| **1** | Live Task Monitoring | v0.2.0 | Real-time task status from `~/.claude/tasks/`; teams identified by name |
| **2** | Team Context & Identity | v0.3.0 | Agent attribution, member colors, dependency visualization |
| **3** | Full Output Navigation | v0.4.0 | In-TUI file browser for all team artifacts |
| **4** | Polish & Resilience | v0.5.0 | Keyboard help, configurable paths, distribution-ready |

**No plugin changes are required for Phases 1 or 2.** One optional addition (`docsPath` in team config) improves Phase 3. Each phase ships independently — Phase 1 alone is a useful product.

**One open item before Phase 1 ships:** Confirm with the agent-teams plugin team whether named dirs in `~/.claude/tasks/` are always written by the plugin. This determines whether UUID resolution is fallback-only or critical-path.

---

## Strategic Vision & Phase Rationale

### Why This Tool Exists

When running a multi-agent Claude team, there is no passive visibility into what's happening. You must actively query files, open directories, or run commands to check progress. The TUI replaces that friction — you glance at a terminal panel and know what every agent is doing.

Value grows with team complexity. A 4-6 agent team with parallel work, interdependent tasks, and multiple output files is the primary user. This tool is their dashboard.

### Core Value Propositions

| Value | Description |
|-------|-------------|
| **Real-time progress** | Task statuses, `activeForm` verb phrases, and blocking relationships update live as agents work — no polling, no refresh |
| **Two-source coherence** | Shows both live operational state (`~/.claude/tasks/`) and durable outputs (`docs/teams/`) simultaneously — neither alone tells the full story |
| **Zero-friction operation** | `bunx github:nthplusio/claude-team-tasks-tui` — no install, no config, no build step on the end-user machine |
| **Terminal-native** | No browser, no web server, no port conflicts — lives in the developer's existing terminal session |

### What This Tool Is Not

- **Not a controller** — read-only observer; no task mutation, no message sending, no agent coordination
- **Not a log viewer** — shows structured task state, not raw agent stdout
- **Not a full markdown renderer** — headings, lists, code blocks only (no tables, images, footnotes)
- **Not a multi-user tool** — one TUI per user, one set of watched directories

### Phase Rationale

**Phase 1 first:** Without live JSON watching, the TUI is only useful after a team finishes. Phase 1 makes it useful *while* agents are running — the primary motivation for the tool. UUID resolution (F5+F6) is included in Phase 1 (not Phase 2) because teams appearing as cryptic UUIDs undermine the core value proposition.

**Phase 2 second:** Phase 1 answers "what is happening." Phase 2 answers "who is doing it and what depends on what." With parallel agents, anonymous task rows are hard to interpret. The `blocks`/`blockedBy` display enables users to detect coordination failures in real time.

**Phase 3 third:** Teams produce artifacts as they work. Phase 3 makes them accessible without context-switching to a file browser or editor. The TUI becomes the single interface for both monitoring and reading.

**Phase 4 last:** Phases 1-3 build a capable tool. Phase 4 makes it a distributable product — one that works for someone encountering it for the first time.

---

## Constraints

### Hard Constraints

These are non-negotiable for all phases.

| Constraint | Implication |
|-----------|-------------|
| **Dual data sources required** | Both `~/.claude/tasks/` (JSON) and `docs/teams/` (markdown) must be supported. Cannot simplify to a single-source model. |
| **Bun runtime** | All dependencies must be Bun-compatible. No Node-only native modules. `chokidar` and `gray-matter` already verified. |
| **bunx distribution** | `dist/` committed to repo; no build step on end-user machine. Minimize new dependencies — package size affects cold-start. |
| **Terminal-only** | All rendering via OpenTUI/SolidJS. No HTTP, WebSocket, web server, or external process. |
| **Read-only TUI** | The TUI observes; it does not control. No task mutation, no agent messaging, no inbox replies. Out of scope for all phases. |

### Soft Constraints

| Constraint | Override Condition |
|-----------|-------------------|
| **OpenTUI/SolidJS architecture** | Only if a capability is provably impossible within OpenTUI |
| **Minimal new dependencies** | Allowed if a dep solves a problem that would otherwise require 200+ lines of custom code |
| **Basic markdown only** | User can request richer rendering; not on current roadmap |

---

## User Segments

| Segment | Description | First Value At |
|---------|-------------|---------------|
| Active session monitor | Runs teams frequently, wants live status without context switching | Phase 1 |
| Multi-team operator | Runs 2+ concurrent teams, needs to distinguish them at a glance | Phase 1 (name resolution) |
| Output reader | Primarily reads team artifacts (specs, reports) after teams complete | Phase 3 |
| New user / evaluator | Discovering via `bunx`, zero tolerance for friction | Phase 4 |

---

## Data Sources & Contracts

### Source 1: `~/.claude/tasks/{team-dir}/` — Live Task Status

```
~/.claude/tasks/{team-name-or-uuid}/
  {N}.json          <- one file per task, updated in place
  .lock             <- ignored by TUI watcher
  .highwatermark    <- ignored by TUI watcher
```

**Task JSON schema:**
```json
{
  "id": "string",
  "subject": "[RoleName] Brief imperative title",
  "description": "Full task description (markdown)",
  "activeForm": "Present-continuous verb phrase | null",
  "owner": "RoleName",
  "status": "pending | in_progress | completed",
  "blocks": ["id"],
  "blockedBy": ["id"]
}
```

**Watcher config:** `depth: 1`, filter `*.json`, 200ms debounce, `awaitWriteFinish: {stabilityThreshold: 100}`.

### Source 2: `~/.claude/teams/{team-name}/config.json` — Team Config

```json
{
  "name": "team-name",
  "description": "Human-readable description",
  "createdAt": 1234567890000,
  "members": [{
    "name": "RoleName",
    "agentType": "general-purpose",
    "model": "claude-sonnet-4-6",
    "color": "blue"
  }]
}
```

### Source 3: `docs/teams/{team-name}/` — Markdown Outputs

```
docs/teams/{team-name}/
  README.md                       <- team metadata (YAML frontmatter)
  {artifact-name}.md              <- primary output files
  tasks/
    task-{N}-{role-slug}.md       <- individual task outputs
```

Already consumed (tasks only). Phase 3 extends to all top-level `.md` files.

---

## Feature Inventory

| ID | Feature | Phase | Notes |
|----|---------|-------|-------|
| F2 | JSON task parser | 1 | `JSON.parse` + defensive field extraction |
| F3 | `liveTeams` store slice + `LiveTask` type | 1 | Parallel to existing `teams` slice |
| F5 | Team config reader | 1 | Scan `~/.claude/teams/*/config.json` on startup |
| F6 | UUID->name resolution map | **1** | Moved from Phase 2 — required for coherent Phase 1 UX |
| F1 | JSON watcher (`~/.claude/tasks/`) | 1 | `depth: 1`, `*.json` filter, `mkdir -p` on startup |
| F4 | Live task list UI + status badges | 1 | pending (dim) / in_progress (yellow/bold) / completed (green) |
| F9 | `activeForm` subtitle | **1** | Moved from Phase 2 — additive to F4, near-zero cost |
| F7 | Task attribution: agent name + color | 2 | Uses `owner` field; fallback to subject-prefix parsing |
| F8 | `blocks`/`blockedBy` display | 2 | Text in TaskDetail; blocked tasks dimmed in list |
| F11 | `ViewMode: "files"` + routing | 3 | `f` key from team view; Escape returns to team list |
| F10 | Output file scanner | 3 | Top-level `.md` in team dir; excludes `tasks/` subdir |
| F12 | Artifact viewer | 3 | Reuse `<scrollbox><markdown>` pattern from TaskDetail |
| F14 | Configurable watch paths | 4 | `--tasks-path`, `--docs-path` CLI args |
| F13 | Keyboard help overlay | 4 | `?` key; static keybinding list; any key dismisses |

### Dependency Graph

```
F2 (JSON parser)
 -> F3 (liveTeams store slice)
     -> F1 (JSON watcher -> feeds F3)
          -> F4 (live task list UI)
               -> F9 (activeForm subtitle — additive to F4)

F5 (team config reader)
 -> F6 (UUID->name resolution)     <- both Phase 1

Phase 2 consumes F4 + F5 + F6:
  F7 (attribution/colors)
  F8 (blocks/blockedBy display)

F11 (ViewMode "files" + routing)
 -> F10 (output file scanner)
      -> F12 (artifact viewer)

F13, F14 — independent, no blockers
```

**Critical path to first visible output:** `F2 -> F3 -> F1 -> F4` (4 sequential steps).

---

## Phase 1 — Live Task Monitoring (v0.2.0)

**Goal:** The TUI transitions from a static file browser to a live status panel.

**User shift:** From "I open a file to check status" to "I glance at the TUI panel."

### Implementation Order

| Step | Feature | Why This Order |
|------|---------|---------------|
| 1 | F2 — JSON parser | No UI; pure data; unblocks everything else |
| 2 | F3 — store slice | Type-safe foundation before watcher wires up |
| 3 | F5 — config reader | Startup scan; provides data for UUID resolution |
| 4 | F6 — UUID resolution | Build `{dirName -> displayName}` map; required before display |
| 5 | F1 — JSON watcher | Wires F2 + F3; `depth: 1`; `mkdir -p` on startup |
| 6 | F4 + F9 — live task list | First visible payoff; `activeForm` is one extra line — ship together |

### Architecture Notes

- Second chokidar instance (`depth: 1`, `*.json`) — never shares config with existing docs watcher (`depth: 3`, `*.md`)
- `liveTeams` store slice stays fully independent from `teams`; display layer merges via `createMemo` inside TaskList component (not at store level)
- Display merge strategy: show live tasks when available for selected team; fall back to markdown tasks
- UUID resolution: scan `~/.claude/teams/*/config.json` once on startup; re-scan when new config files appear

### Phase Gate

> A user running a live agent team can open the TUI, identify their team by name (not UUID), and see task statuses update in real time within 1 second of a JSON file change.

### Acceptance Tests

| Test | Pass Condition |
|------|---------------|
| Task changes `pending` to `in_progress` | TUI updates within 1s; no restart needed |
| `activeForm` is non-empty string | Subtitle appears on `in_progress` task row |
| `activeForm` is null or empty string | No subtitle rendered; no crash |
| UUID dir with matching `~/.claude/teams/*/config.json` | Team displays by config `name`, not UUID |
| UUID dir with no matching config | Displays first 8 chars of UUID as fallback |
| Malformed JSON file | Logged, skipped; other tasks unaffected |
| `.lock`/`.highwatermark` files in task dir | Ignored by `*.json` filter |
| `~/.claude/tasks/` does not exist on startup | Auto-created; TUI starts without error |
| New team spawned mid-session (new task dir + config) | Appears in team list without restart |

### KPIs

| KPI | Target |
|-----|--------|
| Status update latency | <=1s end-to-end |
| Crash rate | 0 on malformed/missing input |
| Name resolution coverage | 100% of teams with matching config display by name |
| Task field coverage | All 7 fields parsed and available |

---

## Phase 2 — Team Context & Identity (v0.3.0)

**Goal:** Tasks are attributable to named agents; dependencies are visible; multi-agent work is interpretable at a glance.

**User shift:** From "tasks are anonymous status rows" to "each task is owned by a named agent, blocked tasks are visible."

### Feature Details

**F7 — Task attribution + colors**
- Primary strategy: use `task.owner` field directly (confirmed present in current plugin output)
- Fallback: extract `[RoleName]` prefix from `task.subject` when `owner` is absent
- Apply `members[].color` as fg color on task row in TaskList

**F8 — `blocks`/`blockedBy` display**
- Text representation in TaskDetail: "Blocks: #5, #7 | Blocked by: #3"
- Tasks with non-empty `blockedBy` (where those tasks are not `completed`) render dimmed in TaskList
- No graph rendering library needed — text is sufficient

Phase 2 is lightweight because F5, F6, F9 shipped in Phase 1. Phase 2 is two focused UI additions consuming data already available.

### Phase Gate

> Given a team with a `config.json` defining 3+ members, each task with an `owner` field shows the agent name in their configured color, and the detail view shows blocks/blockedBy relationships.

### Acceptance Tests

| Test | Pass Condition |
|------|---------------|
| Task has `owner: "Strategist"`, config has `color: "blue"` | Task row shows "Strategist" in blue |
| Task has no `owner` field | Falls back to `[RoleName]` subject-prefix extraction |
| Task has `blockedBy: ["3"]` | Detail view shows "Blocked by: #3" |
| Tasks with non-empty `blockedBy` | Rendered at reduced brightness in list |
| Config absent for a team | Graceful: name/UUID shown, no colors, no crash |
| All Phase 1 tests | Pass (regression) |

### KPIs

| KPI | Target |
|-----|--------|
| Attribution coverage | 100% of tasks with `owner` field show name + color |
| Fallback attribution | Subject-prefix extraction works when `owner` absent |
| Regression | All Phase 1 KPIs still met |

---

## Phase 3 — Full Output Navigation (v0.4.0)

**Goal:** The TUI becomes the single interface for both monitoring agent progress and reading all team outputs.

**User shift:** From "TUI for status, shell for reading outputs" to "TUI for everything."

### Implementation Order

| Step | Feature | Why |
|------|---------|-----|
| 1 | F11 — ViewMode "files" + routing | Prerequisite for all Phase 3 display |
| 2 | F10 — output file scanner | List component; reuses `<select>` pattern |
| 3 | F12 — artifact viewer | Reuses `<scrollbox><markdown>` from TaskDetail |

**Files touched beyond new components:** `App.tsx` (new `ViewMode` case in `Switch/Match`), `StatusBar.tsx` (new keybinding hints). ~50 lines; low risk.

**`docsPath` support:** If team config has `docsPath` field, use it for file discovery instead of heuristic `./docs/teams/{team-name}/`. UUID teams without `docsPath` show empty file browser — graceful degradation, not crash.

### Phase Gate

> Given a team directory with a README.md and at least one artifact `.md` file, the user can navigate to and read the full content of each file using keyboard only, within 4 keystrokes from the team list.

### Acceptance Tests

| Test | Pass Condition |
|------|---------------|
| Team has `roadmap.md` in top-level dir | File appears in file browser |
| Press `f` on selected team | View switches to file list |
| Select file + Enter | Content renders in viewer |
| File longer than terminal height | Scrollable |
| `tasks/` subdir files | Excluded from file browser |
| Config has `docsPath` field | Used for file discovery; overrides heuristic |
| Config has no `docsPath`, named team | Falls back to `./docs/teams/{name}/`; works |
| Config has no `docsPath`, UUID team | Empty file browser; no crash |
| All Phase 1-2 tests | Pass (regression) |

### KPIs

| KPI | Target |
|-----|--------|
| File discoverability | 100% of top-level `.md` files appear in browser |
| Navigation depth | Any file reachable in <=4 keystrokes from team list |
| Render fidelity | Headings, lists, code blocks render with distinct formatting |

---

## Phase 4 — Polish & Resilience (v0.5.0)

**Goal:** The TUI is ready for distribution to users who have never encountered it before.

**User shift:** From "works if you know how it works" to "self-explaining to new users."

### Features

**F14 — Configurable watch paths**
- `--tasks-path <path>` and `--docs-path <path>` CLI args
- Priority: CLI args > defaults (`~/.claude/tasks/`, `./docs/teams/`)
- No new dependencies

**F13 — Keyboard help overlay**
- Press `?` to show all keybindings as an overlay
- Any key dismisses
- Must cover: navigation, Enter, Escape, `f` (files), `t` (tasks), `?` (help), `q`/Ctrl-C

**Resilience additions:**
- Clear, actionable error message when Linux inotify limit is hit (not a silent hang)
- README documents inotify fix: `sudo sysctl fs.inotify.max_user_watches=524288`
- Watcher reconnect if `~/.claude/tasks/` disappears and reappears during runtime

### Phase Gate (release condition)

> A new user can run `bunx github:nthplusio/claude-team-tasks-tui`, understand all keybindings from within the app, and point it at custom paths without reading source code.

### Acceptance Tests

| Test | Pass Condition |
|------|---------------|
| Press `?` | Keybinding overlay appears |
| Press any key on overlay | Overlay dismisses |
| `--tasks-path /custom` flag | Watches that path; ignores default |
| `--docs-path /custom` flag | Watches that path; ignores default |
| Linux inotify limit hit | Clear error message with fix instructions |
| All Phase 1-3 tests | Pass (regression) |

### KPIs

| KPI | Target |
|-----|--------|
| Keybinding discoverability | 0 require source code reading |
| Path flexibility | Both flags work independently and combined |
| Session stability | 0 crashes / 30-minute active session |
| Error clarity | inotify failure is actionable, not a silent hang |

---

## Agent-Teams Plugin Integration

The TUI is a read-only consumer of plugin output. The plugin does not need TUI-specific output formats — the TUI adapts to the plugin's natural data model.

### Phase 1 & 2: No Plugin Changes Required

Current plugin output is sufficient for both phases:
- Task JSON includes all required fields: `id`, `subject`, `description`, `activeForm`, `owner`, `status`, `blocks`, `blockedBy`
- Team config includes `name` and `members[{name, color, model}]`
- `owner` field confirmed present — no schema change needed for Phase 2 attribution

### Phase 3: One Recommended Addition

Add `docsPath` to `~/.claude/teams/{name}/config.json`:

```json
{ "docsPath": "./docs/teams/plan-roadmap-tui-features" }
```

Written by the plugin at `TeamCreate` time using the lead's `cwd` + conventional path. Non-breaking addition — TUI uses it when present, falls back to heuristic when absent.

- **Without it:** File browser works for named teams; silently empty for UUID-only teams
- **With it:** File browser works for all teams including UUID-identified ones

### Phase 4: Recommended Addition

Add `"schemaVersion": "1"` to task JSON. Allows the TUI to detect and warn on format mismatches as the plugin evolves. Not required for Phase 1-3 but strongly recommended before broad distribution.

### Future Nice-to-Haves (Not Required)

| Addition | Plugin Change | TUI Benefit |
|----------|--------------|-------------|
| `startedAt`/`completedAt` timestamps | Two optional fields on task | Elapsed time display per task |
| `taskDirPath` in team config | Optional path field | Eliminates UUID resolution guesswork entirely |
| `status: "failed"` | New status value | Distinct display for crashed tasks |
| `progress` (0.0-1.0) | Optional numeric field | Per-task progress bar |

### Stability Contract

**Breaking if removed:**
- Task JSON: `id`, `subject`, `status`
- Team config (Phase 2+): `name`, `members[].name`, `members[].color`

**Safe at any time:** adding new fields to either schema. Unknown fields are silently ignored.

---

## Risk Register

| Risk | Level | Mitigation |
|------|-------|-----------|
| Named task dirs not reliably written by plugin | MEDIUM | Confirm before Phase 1 ships; F6 UUID resolution in Phase 1 regardless |
| inotify limit with two watchers on Linux | MEDIUM | Document fix in README; actionable error message (Phase 4) |
| UUID-only dirs with no matching team config | LOW | Truncated UUID (8 chars) as display name; graceful degradation |
| Dual store slices add state complexity | LOW | Keep fully independent; merge only via `createMemo` in display layer |
| UUID resolution map stale for mid-session teams | LOW | Watch `~/.claude/teams/` for new config.json files; re-scan on change |
| Phase 3 ViewMode routing touches 3 files | LOW | Established `Switch/Match` pattern; ~50 lines |

---

## Open Item Before Phase 1 Ships

**Are named dirs in `~/.claude/tasks/` reliably written by the plugin for every session?**

Observed: both `~/.claude/tasks/plan-roadmap-tui-features/` (named) and UUID dirs exist. It is unconfirmed whether named dirs are always written or only for some session types.

- **If always:** UUID resolution (F6) is fallback-only. Phase 1 works as designed.
- **If sometimes missing:** UUID resolution becomes critical-path P0. Teams silently invisible to users without it.

**Action required:** Ask the agent-teams plugin maintainer before Phase 1 implementation begins.

---

## Cross-Phase KPI Summary

| KPI | Target | Phase Gate |
|-----|--------|-----------|
| Status update latency | <=1s end-to-end | 1 |
| Crash rate | 0 on malformed/missing input | 1 |
| Name resolution coverage | 100% of teams with matching config | 1 |
| Attribution coverage | 100% of tasks with `owner` field | 2 |
| File discoverability | 100% of top-level `.md` files | 3 |
| Navigation depth | Any file in <=4 keystrokes | 3 |
| Keybinding discoverability | 0 require source reading | 4 |
| Session stability | 0 crashes / 30-minute session | 4 |
| Regression | All prior phase tests pass | Each gate |

---

## Definition of Done — Full Roadmap

All five conditions must be true:

1. Task status changes appear in the TUI within 1 second; teams display by name (not UUID)
2. Every task with an `owner` field shows the agent name in their configured color
3. Any team artifact `.md` is readable in-TUI via keyboard only, reachable in <=4 keystrokes from the team list
4. The `?` overlay covers all keybindings; no user needs to read source code
5. No crashes in 30 minutes of continuous use with a live team, including malformed input and inotify edge cases
