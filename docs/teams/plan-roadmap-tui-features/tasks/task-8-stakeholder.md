---
title: Feasibility Review — Assumptions, Risks & Plugin Integration
owner: Stakeholder Advocate
task: 8
date: 2026-03-04
---

# Feasibility Review: Assumptions, Risks & Plugin Integration

References: task-2-stakeholder.md, task-4-strategist.md, task-6-prioritizer.md, task-7-outcomes.md

---

## Verdict Summary

**The 4-phase plan is feasible without architecture change.** The OpenTUI/SolidJS stack extends cleanly. The primary risks are implementation-level, not architectural. No tech stack alternatives are needed.

| Phase | Feasibility | Key Risk | Confidence |
|-------|------------|----------|-----------|
| 1 | High | Dual watcher correctness | 90% |
| 2 | High | UUID resolution coverage | 85% |
| 3 | High | ViewMode routing complexity | 90% |
| 4 | High | None significant | 95% |

---

## Assumption Challenges

### 1. "Two concurrent chokidar instances is straightforward"

**Challenge:** The plan assumes adding a second chokidar watcher (for `~/.claude/tasks/`) is a simple addition. This is mostly true, but there are two edge cases not addressed:

- `~/.claude/tasks/` lives outside the project directory. On systems with inotify limits (Linux), watching two high-churn paths simultaneously can hit `ENOSPC` errors.
- The existing watcher uses `depth: 3` for markdown files. The JSON watcher must use `depth: 1` (confirmed by task-6). These are different instances — they must not share config.

**Mitigation:** Separate `startJsonWatcher()` function mirroring `startFileWatcher()` with `depth: 1`, `filter: *.json`. Add inotify limit note to README for Linux users.

**Verdict:** Assumption is sound with implementation care.

---

### 2. "Named dirs in `~/.claude/tasks/` eliminate the UUID problem"

**Challenge:** task-6 observes that both `plan-roadmap-tui-features/` (named) and UUID dirs exist in `~/.claude/tasks/`. The assumption is that named dirs are reliable and UUID dirs are edge cases.

**Actual risk:** This depends on agent-teams plugin behavior that is not formally documented. If the plugin writes tasks only to UUID dirs for some session types (e.g., resumed sessions, delegate mode), the named dir may not exist. The observed co-existence may be coincidental to how the current session was spawned.

**Test to validate:** Check whether a `plan-roadmap-tui-features` named dir actually gets created by the plugin, or whether it was created manually/by another process. If plugin-only creates UUID dirs, UUID resolution becomes P0, not fallback.

**Recommendation:** Treat UUID resolution as required for Phase 1, not Phase 2. The Prioritizer's Phase 2 placement is optimistic. If named dirs are not reliably written by the plugin, Phase 1 without UUID resolution will silently miss many teams.

**Verdict:** Assumption is UNVALIDATED. Flag for plugin-side confirmation before Phase 1 ships. See Plugin Requirements section below.

---

### 3. "Phase 1 success criteria: ≤1s latency"

**Challenge:** task-7 specifies ≤1s update latency. The existing watcher uses 200ms debounce + `awaitWriteFinish` with 100ms stability threshold. This gives ~300ms typical. Under load (many files changing simultaneously) debounce resets and latency grows.

**Real-world scenario:** An active team with 5 agents all completing tasks in quick succession will batch all changes into one 200ms window — single update, latency is fine. No issue.

**Verdict:** Assumption is sound. 1s target is achievable.

---

### 4. "SolidJS store handles two independent slices cleanly"

**Challenge:** The current store has a single `teams` slice. Adding `liveTeams` as a parallel slice (task-4's approach) is the right call. The risk is the display layer — the TaskList component must choose between live tasks and markdown tasks for the selected team.

**Looking at App.tsx:** The current `Switch/Match` pattern already handles view routing. Adding a `liveTeams` source is additive. The display merge logic (prefer live if available, fall back to markdown) belongs in a `createMemo` in the component, not in the store. This is clean SolidJS.

**Verdict:** Assumption is sound.

---

### 5. "Phase 3 file browser reuses TaskDetail"

**Challenge:** task-4 says "reuse or extend existing TaskDetail markdown renderer." Looking at App.tsx, TaskDetail is a full-screen component. The file viewer needs the same scrollable markdown display. This reuse is valid and saves work.

**Risk:** The ViewMode routing in App.tsx uses `Switch/Match` against `state.viewMode`. Adding `"files"` as a new ViewMode is straightforward but requires updates to App.tsx, StatusBar, and the escape/navigation key handlers. This is ~50 lines across 3 files — low risk but not zero.

**Verdict:** Assumption is sound. Flag the 3-file touch for implementation planning.

---

## Risks Not Addressed by Prior Outputs

### Risk: `activeForm` is null for non-active tasks

Phase 1 acceptance test 1.3 assumes `activeForm` has a value when `status === "in_progress"`. From real task data, `activeForm` is a string — but it could be an empty string or null for tasks that haven't started their active phase yet.

**Mitigation:** TUI should only render the `activeForm` subtitle when `activeForm` is a non-empty string. Guard in the component, not the parser.

---

### Risk: Task file `.lock` and `.highwatermark` files in task dirs

task-6 confirmed these files exist alongside JSON task files. The JSON watcher must filter to `*.json` only. The existing watcher's `.md` filter is a good pattern to replicate exactly.

**Status:** task-6 already called this out. Confirmed handled by `*.json` filter.

---

### Risk: Phase 2 task attribution via subject-string parsing

task-4 proposes mapping task `subject` prefix `[Role Name]` to member roster. This is brittle — it relies on a naming convention, not a data field. The `owner` field is present in some task JSON files (observed: `"owner": "team-lead"`) but not consistently.

**Better approach:** Use `owner` field directly when present; fall back to subject prefix extraction. The `owner` field is more reliable and already in the schema.

**Plugin recommendation:** Make `owner` a required field in task JSON (Phase 2 timeline). Until then, TUI implements both strategies.

---

## Agent-Teams Plugin: What Needs to Change

This section consolidates plugin requirements and recommendations across all phases. The TUI is a consumer — these requirements must be communicated to the plugin maintainers.

### Phase 1: Required Clarifications (Not Changes)

**Question 1: Are named task dirs reliably written by the plugin?**

The TUI depends on `~/.claude/tasks/plan-roadmap-tui-features/` existing alongside UUID dirs. If the plugin only writes UUID dirs in some session modes, Phase 1 will miss those teams.

**Required answer from plugin team:** Does every team session always produce a named dir in `~/.claude/tasks/`? Or only sometimes?

**If named dirs are unreliable:** Plugin must either:
- (A) Add `taskDirName` field to `~/.claude/teams/{name}/config.json` pointing to the UUID dir
- (B) Always write a symlink or named dir alongside the UUID dir

Option B is simplest — no TUI code change needed.

---

**Question 2: Are task files written atomically?**

The existing watcher uses `awaitWriteFinish: {stabilityThreshold: 100}` to handle non-atomic writes. If the plugin writes task JSON atomically (write to `.tmp`, then `rename()`), the `awaitWriteFinish` is unnecessary overhead. If it writes in-place, the stability threshold is essential.

**Required answer:** Does the plugin write task files atomically?

**If not atomic:** Keep `awaitWriteFinish`. If atomic: can remove it for lower latency.

---

### Phase 2: Recommended Plugin Additions

**Add `owner` as a required field to task JSON.**

Current state: `owner` field is present in some tasks (observed in `feature-lesson-integration` team) but not in the current team's tasks. It should be written by the SDK's `TaskCreate`/`TaskUpdate` tools whenever a task is assigned.

```json
// Task JSON — add required field:
{
  "owner": "Strategist"   // the agent name, matches config.members[].name
}
```

**Benefit:** Replaces brittle subject-string `[Role Name]` parsing. TUI Phase 2 attribution becomes reliable.

**Plugin change scope:** Minor — add `owner` field write in `TaskCreate` and `TaskUpdate` SDK tools.

---

**Add `taskDirPath` field to team config (UUID resolution).**

```json
// ~/.claude/teams/{name}/config.json — add field:
{
  "taskDirPath": "~/.claude/tasks/02b891df-7783-49f7-81cd-90d87b6075d8"
}
```

This gives the TUI an explicit path to the task directory for each named team — eliminating heuristic UUID resolution entirely. The TUI reads this field on startup and uses it directly.

**Alternative if plugin always writes named dirs:** Not needed. Only required if UUID-only dirs exist.

---

### Phase 3: Recommended Plugin Addition

**Add `docsPath` field to team config.**

```json
// ~/.claude/teams/{name}/config.json — add field:
{
  "docsPath": "./docs/teams/plan-roadmap-tui-features"
}
```

Written by the plugin at `TeamCreate` time using the lead's `cwd` + conventional path. Allows TUI to navigate directly from a live team to its documentation directory without guessing.

**Without this:** TUI must assume `docs/teams/{team-name}/` relative to cwd — works for single-project use but breaks if user runs TUI from a different directory.

---

### Phase 4: Recommended Plugin Addition

**Add `schemaVersion` to task JSON.**

```json
{
  "schemaVersion": "1",
  ...
}
```

Allows TUI to detect and warn on format mismatches as the plugin evolves. Not required to ship but strongly recommended before broad distribution.

---

### Plugin Stability Contracts

The TUI treats these fields as **required and stable** — any removal or rename is a breaking change:

**Task JSON:** `id`, `subject`, `status`

**Team config:** `name`, `members[].name`, `members[].color`

All other fields are consumed if present but gracefully ignored if absent. New fields can be added without breaking the TUI.

---

## Sequencing Concerns

**The Prioritizer's placement of UUID resolution in Phase 2 is a risk.**

If the plugin does not reliably write named task dirs, teams will be invisible in Phase 1 (shown as unknown UUIDs with no name). The Phase 1 value proposition (see your active team) is undermined if users can't identify which UUID corresponds to their current session.

**Recommendation:** Move the UUID resolution map (F6) into Phase 1. It is not technically complex (scan `~/.claude/teams/*/config.json` once on startup, build a map), and the risk of a confusing Phase 1 experience outweighs the sequencing simplicity of deferring it.

This is the single sequencing change I'd advocate for. Everything else in the phase plan is sound.

---

## Stakeholder Sign-Off

The 4-phase plan addresses all P0 and P1 user needs. The phase order is correct (live monitoring first, browsing later). Success criteria in task-7 are specific and testable.

**One open item before implementation begins:** Validate with the agent-teams plugin team that named task dirs are reliably written. This determines whether F6 (UUID resolution) belongs in Phase 1 or Phase 2.

**Everything else is green.**
