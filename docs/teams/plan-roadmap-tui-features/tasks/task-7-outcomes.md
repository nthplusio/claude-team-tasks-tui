---
title: Success Criteria & Acceptance Conditions Per Phase
owner: Outcomes Analyst
task: 7
date: 2026-03-04
---

# Success Criteria & Acceptance Conditions Per Phase

References: task-4-strategist.md (phases), task-3-prioritizer.md (features), task-2-stakeholder.md (user needs, data schemas)

---

## How to Read This Document

Each phase has:
- **Phase gate**: binary pass/fail condition before starting the next phase
- **Acceptance tests**: specific, observable behaviors a tester can verify
- **KPIs**: quantifiable signals that phase delivered intended value
- **Anti-goals**: what passing this phase does NOT mean

---

## Phase 1 — Live Task Monitoring

**Thesis:** The TUI transitions from a static file browser to a live status panel.

### Phase Gate (must pass before Phase 2 begins)

> A user running a live agent team can open the TUI and see task statuses update in real time, without restarting the process, within 1 second of a JSON file change.

### Acceptance Tests

| ID | Test | Pass Condition |
|----|------|---------------|
| 1.1 | Launch TUI with `~/.claude/tasks/` populated | Teams from that dir appear in team list alongside docs teams |
| 1.2 | A task JSON changes status from `pending` to `in_progress` | TUI updates the task row within 1s, no restart needed |
| 1.3 | A task JSON sets `activeForm: "Writing test suite"` | That string appears as secondary line on the in_progress task row |
| 1.4 | A new task JSON file is created | New task appears in the list within 1s |
| 1.5 | A task JSON is deleted or zeroed | Task disappears or shows gracefully degraded (no crash) |
| 1.6 | `~/.claude/tasks/` contains a UUID-named dir | Team appears with first-8-chars of UUID as fallback name |
| 1.7 | `~/.claude/tasks/` does not exist on startup | TUI starts without error; auto-creates the directory |
| 1.8 | A task JSON contains unknown extra fields | Parsed without crash; unknown fields ignored |
| 1.9 | A task JSON is malformed (invalid JSON) | TUI logs error and skips that file; other tasks unaffected |
| 1.10 | Status badges are visually distinct | `pending`=dim, `in_progress`=yellow/bold, `completed`=green |

### KPIs

- **Latency:** Status change visible in TUI ≤1s after file write (chokidar + 200ms debounce = ~300ms typical)
- **Zero crashes:** 0 TUI crashes from malformed or missing JSON files across 10 test files
- **Coverage:** 100% of task fields (`id`, `subject`, `activeForm`, `status`, `blocks`, `blockedBy`) displayed or used in Phase 1 UI

### Anti-goals

- UUID→name resolution is NOT required for Phase 1 gate (truncated UUID is acceptable)
- Team config colors/attribution are NOT required (Phase 2)

---

## Phase 2 — Team Context & Identity

**Thesis:** Tasks are attributable to named agents; dependencies are visible; teams are interpretable at a glance.

### Phase Gate (must pass before Phase 3 begins)

> Given a team with a `config.json` defining 3 members, the TUI shows each in_progress task attributed to its owner by name and color, and the detail view shows blocks/blockedBy relationships.

### Acceptance Tests

| ID | Test | Pass Condition |
|----|------|---------------|
| 2.1 | Team has `~/.claude/teams/{name}/config.json` | Team displays with config-derived name (not UUID) |
| 2.2 | Config defines member `{name: "Strategist", color: "blue"}` | Tasks owned by "Strategist" render in blue |
| 2.3 | Task has `owner` matching a config member | Agent name shown beside task subject in task list |
| 2.4 | Task has `blockedBy: ["3"]` | Detail view shows "Blocked by: #3" |
| 2.5 | Task has `blocks: ["5", "7"]` | Detail view shows "Blocks: #5, #7" |
| 2.6 | Blocked tasks are visually dimmed in task list | Tasks with non-empty `blockedBy` render at reduced brightness |
| 2.7 | Team header shows member count and names | e.g., "3 members: Strategist, Researcher, Tester" |
| 2.8 | `activeForm` shown on `in_progress` tasks | Phase 1 behavior preserved; this is a regression check |
| 2.9 | Config file absent for a team | Graceful fallback: UUID/name shown, no colors, no attribution |
| 2.10 | New team spawned during runtime (new config.json added) | TUI picks up new config without restart |

### KPIs

- **Attribution coverage:** 100% of tasks with an `owner` field show agent name (assuming config is present)
- **Config load time:** Team configs loaded and applied before first render (no flash of unattributed state)
- **Regression:** All Phase 1 acceptance tests still pass

### Anti-goals

- Inbox reading is NOT in scope
- Full dependency graph visualization (arrows, DAG) is NOT in scope — text representation only

---

## Phase 3 — Full Output Navigation

**Thesis:** A user can read any team artifact without leaving the TUI.

### Phase Gate (must pass before Phase 4 begins)

> Given a team directory with a README.md and at least one artifact `.md` file, the user can navigate to and read the full content of each file from the TUI using keyboard only.

### Acceptance Tests

| ID | Test | Pass Condition |
|----|------|---------------|
| 3.1 | Team has `docs/teams/{name}/roadmap.md` | File appears in file browser for that team |
| 3.2 | User presses `f` on selected team | View switches to file list (not task list) |
| 3.3 | User selects a file and presses Enter | File content renders in viewer pane |
| 3.4 | File is >terminal height | Content is scrollable (up/down arrow or j/k) |
| 3.5 | File uses headings (`# H1`, `## H2`) | Headings render bold |
| 3.6 | File uses fenced code blocks | Code blocks rendered with distinct style (preserved whitespace) |
| 3.7 | User presses Escape from file viewer | Returns to file list; Escape again returns to team list |
| 3.8 | `tasks/` subdir files are excluded from file browser | Only top-level `.md` files shown (not task-{N}-*.md) |
| 3.9 | File browser shows filename + size or date | At minimum, filename is shown; metadata is a plus |
| 3.10 | Task list tab still accessible from same team | `t` key or equivalent toggles back to task view |

### KPIs

- **File coverage:** 100% of `.md` files in team top-level dir are discoverable in file browser
- **Navigation completeness:** User can reach any file and return to team list using keyboard only (no mouse required)
- **Render fidelity:** Headings, lists, and code blocks render distinctly (3 formatting elements minimum)

### Anti-goals

- Tables, images, footnotes, and inline HTML are NOT required
- Real-time file change update in viewer is NOT required (refresh on re-selection is acceptable)

---

## Phase 4 — Polish & Resilience

**Thesis:** The TUI is ready for distribution to users who have never seen it before.

### Phase Gate (release condition)

> A new user who has never used the TUI can run `bunx github:nthplusio/claude-team-tasks-tui`, understand all keybindings from within the app, and point it at a custom paths without reading source code.

### Acceptance Tests

| ID | Test | Pass Condition |
|----|------|---------------|
| 4.1 | User presses `?` | Keybinding help overlay appears |
| 4.2 | User presses any key while overlay is shown | Overlay dismisses |
| 4.3 | Help overlay lists all active keybindings | At minimum: navigation, `f` (files), `t` (tasks), `?` (help), Escape, Enter |
| 4.4 | User runs TUI with `--tasks-path /custom/path` | TUI watches that path instead of `~/.claude/tasks/` |
| 4.5 | User runs TUI with `--docs-path /custom/path` | TUI watches that path instead of `./docs/teams/` |
| 4.6 | `~/.claude/tasks/` disappears and reappears during runtime | Watcher reconnects; tasks repopulate without restart |
| 4.7 | 50 teams with 20 tasks each loaded simultaneously | No visible lag (render completes in <100ms) |
| 4.8 | README documents all keybindings and CLI args | User can understand full feature set from README alone |
| 4.9 | All Phase 1–3 acceptance tests still pass | Regression coverage |

### KPIs

- **Discoverability:** 0 keybindings require reading source code — all are in `?` overlay + README
- **Path flexibility:** Both `--tasks-path` and `--docs-path` overrides work independently and together
- **Stability:** 0 crashes in a 30-minute active-monitoring session with live team running

---

## Cross-Phase KPI Summary

| KPI | Target | Measured At |
|-----|--------|-------------|
| Status update latency | ≤1s end-to-end | Phase 1 gate |
| Crash rate (malformed input) | 0 crashes | Phase 1 gate |
| Attribution coverage | 100% of tasks with `owner` | Phase 2 gate |
| File discoverability | 100% of top-level `.md` files | Phase 3 gate |
| Keybinding discoverability | 0 require source reading | Phase 4 gate |
| Regression | All prior tests pass | Each phase gate |

---

## Agent-Teams Plugin: What the TUI Requires

The TUI is a read-only consumer of agent-teams outputs. For the roadmap to succeed, agent-teams must write data in a format the TUI can reliably consume.

### Required: Task JSON Schema (Phase 1)

The TUI depends on this exact schema at `~/.claude/tasks/{team-id}/*.json`:

```json
{
  "id": "string",
  "subject": "string",
  "description": "string",
  "activeForm": "string | null",
  "status": "pending | in_progress | completed",
  "blocks": ["string"],
  "blockedBy": ["string"]
}
```

**Stability requirement:** Fields `id`, `subject`, `status`, `activeForm`, `blocks`, `blockedBy` must be considered stable/versioned. Additions are safe; removals or renames break the TUI.

**Write behavior required:**
- Each task is a separate JSON file (one file per task, not one array)
- Files are written atomically (write to tmp, rename) to avoid partial-read corruption
- `activeForm` must be updated whenever an agent's active state changes (not only on status transitions)
- `status` transitions are `pending → in_progress → completed` — no other values

### Required: Team Directory Structure (Phase 2)

```
~/.claude/teams/{team-name}/config.json
```

```json
{
  "name": "string",
  "description": "string",
  "members": [{
    "name": "string",
    "agentType": "string",
    "model": "string",
    "color": "string"
  }]
}
```

**UUID resolution:** The TUI needs to map `~/.claude/tasks/{uuid}` dirs to team names. agent-teams must either:
- (Option A) Write a `teamId` or `uuid` field into `config.json` enabling reverse lookup
- (Option B) Also write task files to a named dir (`~/.claude/tasks/{team-name}/`) in addition to UUID dir

Option B is simpler and requires no TUI-side change. Option A requires the TUI to build a uuid→name map.

**Current behavior observed:** Both UUID dirs and named dirs exist (`plan-roadmap-tui-features/` alongside UUID). If this is stable behavior, the TUI can use named dirs directly — UUID resolution becomes fallback-only.

### Recommended: Version Field (Phase 4)

Adding `"schemaVersion": "1"` to task JSON files would allow the TUI to detect and handle format changes gracefully. Not required for Phase 1–3 but strongly recommended before broad distribution.

### Out of Scope (TUI Will Not Consume)

- Agent inbox files (`~/.claude/teams/{name}/inboxes/`)
- Internal agent state beyond task JSON
- Any non-JSON, non-Markdown formats

---

## Definition of "Done" — Full Roadmap

The roadmap is complete when:

1. A user monitoring a live agent-teams session sees task status changes in the TUI within 1 second of agent activity
2. Every task row shows the owning agent's name and color
3. Any markdown artifact in `docs/teams/` is readable inside the TUI with keyboard navigation only
4. The `?` overlay explains all keybindings; no user needs to read source code
5. The TUI survives 30 minutes of continuous use without crashing, including malformed input scenarios
