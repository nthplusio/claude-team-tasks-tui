---
title: "Domain Section: Success Criteria & KPIs"
owner: Outcomes Analyst
task: 11c
date: 2026-03-04
---

# Success Criteria & KPIs

Source: task-9-outcomes.md (authoritative, supersedes task-7-outcomes.md)

---

## How to Use This Section

Each phase has a **phase gate** — a binary pass/fail condition that must be met before the next phase begins. Gates are testable by anyone with a running agent team session. Below each gate are the specific acceptance tests and KPIs that define it.

---

## Phase 1 — Live Task Monitoring

### Phase Gate

> A user running a live agent team can open the TUI, identify their team by name (not UUID), and see task statuses update in real time within 1 second of a JSON file change.

### Acceptance Tests (abbreviated — full list in task-9-outcomes.md)

| Test | Pass Condition |
|------|---------------|
| Task JSON changes status | TUI updates within 1s; no restart |
| `activeForm` is non-empty string | Renders as subtitle on `in_progress` task row |
| `activeForm` is null or `""` | No subtitle rendered; no crash |
| UUID task dir with matching config | Displays team name, not UUID |
| UUID task dir with no config | Displays first 8 chars of UUID |
| Malformed JSON file | Logged, skipped; other tasks unaffected |
| `.lock`/`.highwatermark` files present | Ignored by watcher (`*.json` filter only) |

### KPIs

| KPI | Target |
|-----|--------|
| Status update latency | ≤1s end-to-end |
| Crash rate (malformed/missing input) | 0 crashes |
| Name resolution coverage | 100% of teams with a matching config |
| Task field coverage | All 7 fields parsed (`id`, `subject`, `description`, `activeForm`, `status`, `blocks`, `blockedBy`) |

---

## Phase 2 — Team Context & Identity

### Phase Gate

> Given a team with a `config.json` defining 3+ members, each task with an `owner` field shows the agent name in their configured color, and the detail view shows blocks/blockedBy relationships.

### Acceptance Tests (abbreviated)

| Test | Pass Condition |
|------|---------------|
| Task has `owner: "Strategist"`, config has `color: "blue"` | Task row renders "Strategist" in blue |
| Task has no `owner` field | Falls back to `[RoleName]` subject-prefix extraction |
| Task has `blockedBy: ["3"]` | Detail view shows "Blocked by: #3" |
| Blocked tasks in task list | Rendered at reduced brightness |
| Config absent | Graceful: name/UUID shown, no colors |
| All Phase 1 tests | Still pass (regression) |

### KPIs

| KPI | Target |
|-----|--------|
| Attribution coverage | 100% of tasks with `owner` field show agent name + color |
| Fallback attribution | Subject-prefix extraction works when `owner` absent |
| Regression | All Phase 1 KPIs still met |

---

## Phase 3 — Full Output Navigation

### Phase Gate

> Given a team directory with a README.md and at least one artifact `.md` file, the user can navigate to and read the full content of each file using keyboard only, within 4 keystrokes from the team list.

### Acceptance Tests (abbreviated)

| Test | Pass Condition |
|------|---------------|
| Team has `roadmap.md` | Appears in file browser |
| Press `f` on selected team | Switches to file list view |
| Select file, press Enter | Content renders in viewer |
| File longer than terminal height | Scrollable |
| `tasks/` subdir files | Excluded from file browser |
| Team config has `docsPath` | Used for file discovery; overrides heuristic |
| Team config has no `docsPath` | Falls back to `./docs/teams/{name}/`; UUID teams show empty browser (no crash) |
| All Phase 1-2 tests | Still pass (regression) |

### KPIs

| KPI | Target |
|-----|--------|
| File discoverability | 100% of top-level `.md` files in browser |
| Navigation depth | Any file reachable in ≤4 keystrokes from team list |
| Render fidelity | Headings, lists, code blocks — 3 element types minimum with distinct formatting |
| UUID team degradation | Empty file browser (not crash) when no `docsPath` and no name match |

---

## Phase 4 — Polish & Resilience

### Phase Gate (release condition)

> A new user can run `bunx github:nthplusio/claude-team-tasks-tui`, understand all keybindings from within the app, and point it at custom paths without reading source code.

### Acceptance Tests (abbreviated)

| Test | Pass Condition |
|------|---------------|
| Press `?` | Keybinding overlay appears |
| Press any key on overlay | Dismisses |
| `--tasks-path /custom` flag | Watches that path; ignores default |
| `--docs-path /custom` flag | Watches that path; ignores default |
| inotify limit hit (Linux) | Clear error message with fix instructions |
| All Phase 1-3 tests | Still pass (regression) |

### KPIs

| KPI | Target |
|-----|--------|
| Keybinding discoverability | 0 keybindings require source code reading |
| Path flexibility | Both `--tasks-path` and `--docs-path` work independently and combined |
| Session stability | 0 crashes in 30-minute active-monitoring session |
| Error clarity | inotify limit failure is actionable, not silent |

---

## Full Roadmap: Definition of Done

All five conditions must be true:

1. Task status changes appear in the TUI within 1 second, and teams display by name
2. Every task with an `owner` field shows the agent name in their configured color
3. Any team artifact `.md` is readable in-TUI via keyboard only, reachable in ≤4 keystrokes
4. The `?` overlay covers all keybindings; no source reading required
5. No crashes in 30 minutes of continuous use with a live team, including malformed input

---

## One Open Item Before Phase 1 Ships

**Unvalidated assumption (from task-8):** Are named dirs in `~/.claude/tasks/` reliably written by the plugin for every session, or only sometimes?

- If always: UUID resolution is fallback-only; Phase 1 works as-designed
- If sometimes: UUID resolution becomes critical-path; Phase 1 acceptance test 1.8 becomes a P0 requirement, not a nice-to-have

**Resolution:** Confirm with agent-teams plugin team before Phase 1 release. Does not block roadmap writing.
