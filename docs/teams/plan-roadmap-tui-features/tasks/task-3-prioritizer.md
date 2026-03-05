---
title: Dependency Map & Technical Prerequisites
owner: Prioritizer
date: 2026-03-04
---

# Dependency Map & Technical Prerequisites

## Feature Inventory

| ID | Feature | Phase (Strategist) |
|----|---------|-------------------|
| F1 | `~/.claude/tasks/` chokidar watcher (JSON) | 1 |
| F2 | JSON task parser (`{id, subject, description, activeForm, status, blocks, blockedBy}`) | 1 |
| F3 | Second store slice for live tasks | 1 |
| F4 | Live task list UI (status badges: pending/in_progress/completed) | 1 |
| F5 | Team config reader (`~/.claude/teams/{name}/config.json` → member list) | 2 |
| F6 | UUID→team-name resolution (`~/.claude/tasks/{uuid}` ↔ team config) | 2 |
| F7 | Task attribution: agent name + color per task | 2 |
| F8 | `blocks`/`blockedBy` dependency graph display | 2 |
| F9 | `activeForm` as status indicator | 2 |
| F10 | Output file browser (all `.md` in `docs/teams/{team}/`) | 3 |
| F11 | New `ViewMode: "files"` + file list component | 3 |
| F12 | Arbitrary `.md` artifact viewer (scrollable, markdown-rendered) | 3 |
| F13 | Keyboard help overlay | 4 |
| F14 | Configurable watch paths (CLI args or config file) | 4 |

## Dependency Graph

```
F2 (JSON parser)
 └─▶ F3 (live task store slice)
      └─▶ F1 (JSON watcher — writes into F3)
           └─▶ F4 (live task list UI)

F5 (team config reader)
 └─▶ F6 (UUID→name resolution)
      ├─▶ F7 (task attribution / colors)  requires F4
      ├─▶ F8 (blocks/blockedBy graph)     requires F4
      └─▶ F9 (activeForm indicator)       requires F4

F11 (ViewMode "files" + file list)
 └─▶ F10 (output file browser)
      └─▶ F12 (artifact viewer)

F14 (configurable paths) — independent, no blockers
F13 (keyboard help)      — independent, no blockers
```

### Critical path (longest dependency chain)
`F2 → F3 → F1 → F4 → F7/F8/F9` (4 sequential steps before rich task metadata)

## Technical Prerequisites by Feature

### F1 — JSON Watcher
- **New chokidar instance** watching `~/.claude/tasks/` for `*.json` at depth 2
- Separate from existing `.md` watcher — different file type, different path, different store target
- `mkdir -p` on startup (same pattern as existing docs watcher)
- Debounce: same 200ms pattern is sufficient; JSON writes are typically atomic

### F2 — JSON Task Parser
- New `parseJsonTask(filePath)` function: `JSON.parse` + defensive field extraction
- No gray-matter needed; fields are typed: `id`, `subject`, `description`, `activeForm`, `status`, `blocks[]`, `blockedBy[]`
- Must handle missing/extra fields gracefully (format may evolve)

### F3 — Live Task Store Slice
- Extend `AppState` with `liveTeams: LiveTeam[]` (parallel to existing `teams: Team[]`)
- New `LiveTeam` type: `{ uuid: string; tasks: LiveTask[] }`
- New `LiveTask` type mirrors JSON schema
- `updateLiveTeam(uuid, tasks[])` action using same `produce` pattern
- `selectedLiveTeamIndex` + navigation actions (or reuse existing indices if unified)

### F4 — Live Task List UI
- New component `LiveTaskList` or extend `TaskList` with a source toggle
- Status badge rendering: color per status (`pending`=dim, `in_progress`=yellow/bold, `completed`=green)
- Toggle between live tasks and markdown tasks — single keystroke (e.g. `t`)

### F5 — Team Config Reader
- Parse `~/.claude/teams/{team-name}/config.json`: `{ name, description, members: [{name, agentType, model, color}] }`
- Load once on startup; re-read on config file change (optional — configs rarely change mid-session)

### F6 — UUID→Name Resolution
- `~/.claude/tasks/{uuid}/` dirs need mapping to team names
- Resolution path: `~/.claude/teams/` configs contain `name`; match against task dir uuid
- Fallback: display uuid truncated if no config match

### F7 — Task Attribution
- Requires F5/F6 to know member list
- `task.owner` (from JSON) matched against `members[].name`
- Apply `members[].color` as fg color on task row

### F8 — blocks/blockedBy Graph
- Read `task.blocks[]` and `task.blockedBy[]` (arrays of task IDs)
- Display in `TaskDetail` view: "Blocks: #4, #7 | Blocked by: #2"
- No graph rendering library needed — text representation is sufficient

### F9 — activeForm Indicator
- `task.activeForm` is a present-continuous string (e.g. "Fixing auth bug")
- Display as subtitle/secondary line on `in_progress` tasks
- Simple `<text>` addition in task row or detail view

### F10 — Output File Browser
- `readdir(teamDir)` filtering for `.md` files (excluding `tasks/` subdir)
- Reuse existing `naturalSort` for ordering
- Presented as a new list in existing `<select>` pattern

### F11 — ViewMode "files"
- Add `"files"` to `ViewMode` union type
- New navigation: from team list → `f` key to enter file browser for selected team
- Escape returns to team list

### F12 — Artifact Viewer
- Reuse `<scrollbox><markdown>` pattern already in `TaskDetail`
- New component `FileViewer` or extend `TaskDetail` with a `sourceType` prop
- Read file content on selection; store in local signal (not global store — ephemeral)

### F13 — Keyboard Help Overlay
- Modal overlay using absolute-positioned `<box>`
- Static content — list of keybindings
- Toggle with `?` key

### F14 — Configurable Paths
- CLI: parse `--docs-path` and `--tasks-path` from `process.argv`
- Config file: optional `~/.claude/tui-config.json` with `{ docsPath, tasksPath }`
- Priority: CLI args > config file > defaults
- Requires no new dependencies (Node `process.argv` + `JSON.parse`)

## Sequencing Recommendation

### Phase 1 priorities (in order)
1. **F2** — JSON parser (no UI, pure data; lowest risk, enables everything else)
2. **F3** — Store slice extension (type-safe foundation before watcher)
3. **F1** — JSON watcher (wires F2 + F3 together; testable end-to-end)
4. **F4** — Live task list UI (first visible payoff)

### Phase 2 priorities (in order)
5. **F5 + F6** — Config reader + UUID resolution (parallel, both needed before attribution)
6. **F9** — `activeForm` indicator (lowest effort, immediate UX value)
7. **F7** — Task attribution/colors (moderate effort)
8. **F8** — blocks/blockedBy display (moderate effort, high value for dependency-heavy workflows)

### Phase 3 priorities (in order)
9. **F11** — ViewMode + routing (prerequisite for everything in Phase 3)
10. **F10** — File browser (list component, reuses existing patterns)
11. **F12** — Artifact viewer (reuses TaskDetail scrollbox pattern)

### Phase 4 priorities (in order)
12. **F14** — Configurable paths (utility, enables broader adoption)
13. **F13** — Keyboard help overlay (polish, low risk)

## Risk-Adjusted Notes

- **Highest risk:** F6 (UUID→name resolution) — the mapping mechanism between `~/.claude/tasks/{uuid}` and team names is inferred from the planning context but not verified against actual file layout. Confirm directory structure before implementation.
- **Medium risk:** F3 (dual store slices) — keeping two parallel store namespaces in sync adds cognitive overhead. Consider whether a unified `teams` slice with a `source: "live" | "docs"` discriminator is cleaner.
- **Low risk:** F2, F9, F12, F13, F14 — all follow established patterns with minimal new surface area.

## Phase Boundaries

The Strategist's 4-phase grouping is technically sound. The only adjustment I'd propose:

- **F14 (configurable paths)** could move to Phase 1 if the `~/.claude/tasks/` path needs to vary by user environment — it's a low-effort prereq for adoption. Keep in Phase 4 if the hardcoded default is sufficient for initial release.
- **F9 (activeForm)** is so lightweight it could ship with F4 in Phase 1 rather than waiting for Phase 2.
