---
title: Refined Success Criteria & Acceptance Conditions (Post-Feasibility)
owner: Outcomes Analyst
task: 9
date: 2026-03-04
---

# Refined Success Criteria & Acceptance Conditions

References: task-7-outcomes.md (original), task-8-stakeholder.md (feasibility), task-6-prioritizer.md (sequencing, depth correction)

This document supersedes task-7-outcomes.md with corrections from the feasibility review. Changes are marked **[REVISED]** or **[NEW]**.

---

## Summary of Changes from task-7

| Change | Original (task-7) | Revised |
|--------|------------------|---------|
| Watcher depth in tests | "depth 2" implied | **[REVISED]** depth 1 — task files at `{teamDir}/{N}.json` |
| UUID resolution phase | Phase 2 scope | **[REVISED]** Phase 1 required — Phase 1 is incoherent without it |
| `activeForm` null guard | Assumed non-null | **[REVISED]** explicitly guard for null/empty string |
| `owner` field reliability | "unreliable until plugin mandates it" | **[REVISED]** `owner` confirmed present in current plugin output |
| Plugin changes for Phase 1-2 | Flagged as open question | **[REVISED]** no plugin changes required for Phase 1 or 2 |
| `docsPath` for Phase 3 | Recommended | **[CONFIRMED]** required optional field for reliable docs linking |

---

## Phase 1 — Live Task Monitoring

**Thesis:** The TUI transitions from a static file browser to a live status panel.

### Phase Gate

> A user running a live agent team can open the TUI, identify their team by name (not UUID), and see task statuses update in real time within 1 second of a JSON file change.

**[REVISED]** Gate now includes name resolution — Phase 1 is not acceptable if teams appear only as UUIDs.

### Acceptance Tests

| ID | Test | Pass Condition |
|----|------|---------------|
| 1.1 | Launch TUI with `~/.claude/tasks/` populated | Teams from that dir appear in team list alongside docs teams |
| 1.2 | A task JSON changes status from `pending` to `in_progress` | TUI updates the task row within 1s; no restart needed |
| 1.3 | A task JSON has `activeForm: "Writing test suite"` and `status: "in_progress"` | That string appears as secondary line on the task row **[REVISED: only when activeForm is a non-empty string]** |
| 1.4 | A task JSON has `activeForm: null` or `activeForm: ""` | No subtitle rendered; task row shows subject only (no crash, no empty line) **[NEW]** |
| 1.5 | A new task JSON file is created | New task appears in the list within 1s |
| 1.6 | A task JSON is deleted | Task disappears cleanly; no crash |
| 1.7 | `~/.claude/tasks/{team-name}/` dir is a named dir | Team displays with that name (no resolution needed) |
| 1.8 | `~/.claude/tasks/{uuid}/` dir has a matching `~/.claude/teams/*/config.json` | Team displays with config `name` field, not UUID **[REVISED: UUID resolution is Phase 1]** |
| 1.9 | `~/.claude/tasks/{uuid}/` dir has no matching config | Team displays with first 8 chars of UUID as fallback |
| 1.10 | `~/.claude/tasks/` does not exist on startup | TUI starts without error; auto-creates the directory |
| 1.11 | A task JSON is malformed (invalid JSON) | TUI logs error and skips that file; other tasks unaffected |
| 1.12 | Task dir contains `.lock` and `.highwatermark` files | Watcher ignores them; only `*.json` processed **[NEW]** |
| 1.13 | Status badges are visually distinct | `pending`=dim, `in_progress`=yellow/bold, `completed`=green |
| 1.14 | Watcher uses depth 1 (not depth 2) | Task files at `{teamDir}/{N}.json` are watched; no deeper dirs needed **[REVISED]** |

### KPIs

- **Latency:** Status change visible in TUI ≤1s after file write (200ms debounce + ~100ms stabilityThreshold = ~300ms typical)
- **Zero crashes:** 0 TUI crashes from malformed, missing, or non-JSON files in `~/.claude/tasks/`
- **Name resolution:** 100% of teams with a matching `~/.claude/teams/*/config.json` display by name, not UUID
- **Field coverage:** All 7 task fields (`id`, `subject`, `description`, `activeForm`, `status`, `blocks`, `blockedBy`) parsed and available for display

### Anti-goals

- Full agent color coding is NOT required (Phase 2)
- `blocks`/`blockedBy` display in detail view is NOT required (Phase 2)

---

## Phase 2 — Team Context & Identity

**Thesis:** Tasks are attributable to named agents; dependencies are visible.

### Phase Gate

> Given a team with a `config.json` defining 3+ members, the TUI shows each task attributed to its owner by name and color, and the detail view shows blocks/blockedBy relationships.

### Acceptance Tests

| ID | Test | Pass Condition |
|----|------|---------------|
| 2.1 | Team has `~/.claude/teams/{name}/config.json` with `members` | Config is read; member data available for attribution |
| 2.2 | Config defines `{name: "Strategist", color: "blue"}` | Tasks with `owner: "Strategist"` render in blue |
| 2.3 | Task JSON has `owner: "Strategist"` | Agent name shown beside task subject; color applied from config **[REVISED: owner field is reliable — use directly]** |
| 2.4 | Task JSON has no `owner` field | Fall back to subject-string prefix `[RoleName]` extraction; no crash |
| 2.5 | Task has `blockedBy: ["3"]` | Detail view shows "Blocked by: #3" |
| 2.6 | Task has `blocks: ["5", "7"]` | Detail view shows "Blocks: #5, #7" |
| 2.7 | Blocked tasks are visually dimmed in task list | Tasks with non-empty `blockedBy` where those tasks are not `completed` render at reduced brightness |
| 2.8 | Team header shows member names and models | e.g., "Strategist (claude-sonnet-4-6), Researcher (claude-sonnet-4-6)" |
| 2.9 | Config absent for a team | Graceful fallback: name/UUID shown, no colors, no attribution |
| 2.10 | New team config appears during runtime | TUI picks up new config without restart |
| 2.11 | All Phase 1 acceptance tests still pass | Regression check |

### KPIs

- **Attribution via `owner`:** 100% of tasks with an `owner` field show agent name and color (config present)
- **Attribution fallback:** Subject-prefix parsing correctly attributes tasks lacking `owner` field
- **Regression:** All Phase 1 KPIs still met

### Anti-goals

- Graphical dependency DAG visualization is NOT in scope — text representation only
- Inbox reading is NOT in scope

---

## Phase 3 — Full Output Navigation

**Thesis:** A user can read any team artifact without leaving the TUI.

### Phase Gate

> Given a team directory with a README.md and at least one artifact `.md` file, the user can navigate to and read the full content of each file from the TUI using keyboard only, starting from the team list.

### Acceptance Tests

| ID | Test | Pass Condition |
|----|------|---------------|
| 3.1 | Team has `docs/teams/{name}/roadmap.md` | File appears in file browser for that team |
| 3.2 | User presses `f` on selected team | View switches to file list (not task list) |
| 3.3 | User selects a file and presses Enter | File content renders in viewer pane |
| 3.4 | File is longer than terminal height | Content is scrollable (up/down or j/k) |
| 3.5 | File uses headings (`# H1`, `## H2`) | Headings render bold |
| 3.6 | File uses fenced code blocks | Code blocks render with preserved whitespace and distinct style |
| 3.7 | User presses Escape from file viewer | Returns to file list; Escape again returns to team list |
| 3.8 | `tasks/` subdir files are excluded from file browser | Only top-level `.md` files shown (no task-{N}-*.md) |
| 3.9 | File browser shows at minimum the filename | Metadata (size, date) is a plus; filename alone is acceptable |
| 3.10 | `t` key from file view returns to task list for same team | Toggle between file browser and task list without losing team selection |
| 3.11 | Team config has `docsPath` field | TUI uses that path for file discovery instead of guessing `./docs/teams/{name}/` **[NEW — Phase 3 optional enhancement]** |
| 3.12 | Team config has no `docsPath` field | TUI falls back to `./docs/teams/{name}/` heuristic; works for named teams, degrades for UUID teams |
| 3.13 | All Phase 1-2 acceptance tests still pass | Regression check |

### KPIs

- **File coverage:** 100% of `.md` files in team top-level dir are discoverable in file browser
- **Navigation completeness:** Any file reachable and readable using keyboard only, max 4 keystrokes from team list
- **Render fidelity:** Headings, lists, and code blocks render with distinct formatting (3 element types minimum)
- **UUID teams:** Teams identified by UUID that have no `docsPath` in config show empty file browser (graceful degradation, not crash) **[NEW]**

### Anti-goals

- Tables, images, footnotes, and inline HTML rendering are NOT required
- Real-time file content refresh in viewer is NOT required (refresh on re-selection is acceptable)

---

## Phase 4 — Polish & Resilience

**Thesis:** The TUI is ready for distribution to users who have never seen it before.

### Phase Gate (release condition)

> A new user can run `bunx github:nthplusio/claude-team-tasks-tui`, understand all keybindings from within the app, and point it at custom paths without reading source code.

### Acceptance Tests

| ID | Test | Pass Condition |
|----|------|---------------|
| 4.1 | User presses `?` | Keybinding help overlay appears |
| 4.2 | User presses any key while overlay is shown | Overlay dismisses |
| 4.3 | Help overlay lists all active keybindings | At minimum: navigation, `f` (files), `t` (tasks), `?` (help), Escape, Enter |
| 4.4 | User runs TUI with `--tasks-path /custom/path` | TUI watches that path instead of `~/.claude/tasks/` |
| 4.5 | User runs TUI with `--docs-path /custom/path` | TUI watches that path instead of `./docs/teams/` |
| 4.6 | `~/.claude/tasks/` disappears and reappears during runtime | Watcher reconnects; tasks repopulate without restart |
| 4.7 | Linux user hits inotify limit with two active watchers | TUI logs a clear error message; README documents the fix (`sudo sysctl fs.inotify.max_user_watches=...`) **[NEW — from task-8 risk]** |
| 4.8 | README documents all keybindings and CLI args | User can understand full feature set from README alone |
| 4.9 | All Phase 1-3 acceptance tests still pass | Regression coverage |

### KPIs

- **Discoverability:** 0 keybindings require reading source code — all in `?` overlay + README
- **Path flexibility:** `--tasks-path` and `--docs-path` overrides work independently and combined
- **Stability:** 0 crashes in a 30-minute active-monitoring session with a live team running
- **Error clarity:** inotify limit failure produces an actionable error message, not a silent hang **[NEW]**

---

## Cross-Phase KPI Summary

| KPI | Target | Phase |
|-----|--------|-------|
| Status update latency | ≤1s end-to-end | 1 |
| Crash rate (malformed/missing JSON) | 0 crashes | 1 |
| Name resolution coverage | 100% of teams with config | 1 **[REVISED from Phase 2]** |
| Attribution coverage (owner field) | 100% of tasks with `owner` | 2 |
| File discoverability | 100% of top-level `.md` files | 3 |
| Navigation depth | Any file reachable in ≤4 keystrokes | 3 |
| Keybinding discoverability | 0 require source reading | 4 |
| Regression | All prior phase tests pass | Each gate |

---

## Agent-Teams Plugin: Refined Requirements

Feasibility review (task-8) and sequencing (task-6) confirmed the plugin data model. Summary:

### Phase 1 & 2: No Plugin Changes Required

Current plugin output is sufficient:
- Task JSON already includes `id`, `subject`, `description`, `activeForm`, `owner`, `status`, `blocks`, `blockedBy`
- Team config already includes `name`, `members[{name, color, model}]`
- `owner` field confirmed present — reliable for Phase 2 attribution without schema change

**One open question remaining (task-8):** Do named dirs in `~/.claude/tasks/` always exist alongside UUID dirs, or only sometimes? This determines whether UUID resolution is fallback-only or critical-path.

### Phase 3: One Optional Plugin Addition

**Recommended:** Add `docsPath` to `~/.claude/teams/{name}/config.json`:

```json
{
  "docsPath": "./docs/teams/plan-roadmap-tui-features"
}
```

Without it: TUI uses `./docs/teams/{team-name}/` heuristic — works for named teams, silently empty for UUID-only teams.
With it: TUI reliably navigates to docs for all teams, including UUID-identified ones.

### Phase 4: Recommended Addition

Add `schemaVersion: "1"` to task JSON. Enables forward-compatibility warnings as plugin evolves.

### Stable Contract (Breaking if Removed)

**Task JSON:** `id`, `subject`, `status` — required; removal breaks TUI.
**Team config:** `name`, `members[].name`, `members[].color` — required; removal breaks Phase 2.

All other fields: consumed if present, gracefully ignored if absent. New fields safe to add at any time.

---

## Definition of Done — Full Roadmap

The roadmap is complete when:

1. A user monitoring a live agent session sees task status changes in the TUI within 1 second of agent activity, with teams identified by name
2. Every task row with an `owner` field shows the owning agent's name in their configured color
3. Any markdown artifact in `docs/teams/` is readable inside the TUI with keyboard navigation only (≤4 keystrokes from team list)
4. The `?` overlay explains all keybindings; no user needs to read source code
5. The TUI survives 30 minutes of continuous use without crashing, including malformed input and inotify edge cases
