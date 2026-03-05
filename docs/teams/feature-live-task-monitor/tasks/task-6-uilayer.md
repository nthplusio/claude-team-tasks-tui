# Task 6: Live Task List with Status Badges and activeForm

## Changes Made

### src/types.ts
- Added `UnifiedTeamEntry` discriminated union type: `{ kind: "live", team: LiveTeam } | { kind: "docs", team: Team }`

### src/data/store.ts
- Added `getUnifiedTeams()`: builds merged list with live teams first, docs teams second
- Updated `selectTeam()`: clamps index against total unified count (liveTeams + teams)
- Updated `selectTask()`: resolves task count from unified entry (live or docs)

### src/components/TeamList.tsx
- Renders unified team list via `getUnifiedTeams()`
- Live teams show status-based prefix: `>` (has in_progress), `check` (all completed), `bullet` (pending)
- Docs teams keep existing icon logic
- Live team descriptions show: `LIVE | N tasks | X active | Y done`
- Header shows green "LIVE" badge when any live teams exist

### src/components/TaskList.tsx
- Resolves selected team from unified list
- Live tasks show status badges: `>` in_progress, `check` completed, `bullet` pending
- activeForm displayed as subtitle for in_progress tasks (guarded for null/empty)
- Header shows team displayName with "LIVE" indicator and green color for live teams
- Docs tasks unchanged

### src/components/TaskDetail.tsx
- Uses Switch/Match to render live vs docs task detail
- Live tasks show: status label, owner, task ID, activeForm (yellow, in_progress only), description
- Docs tasks show original markdown content view

### src/components/StatusBar.tsx
- Team count shows unified total with live count: `N teams (M live)`

## Build
Compiles successfully with `bun run build`.
