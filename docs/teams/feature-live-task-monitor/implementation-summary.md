# Live Task Monitor — Implementation Summary

## Overview
Added live task monitoring to the TUI, showing real-time Claude agent task status alongside existing markdown-based team documentation.

## Architecture

### Data Flow
```
~/.claude/tasks/{teamDir}/*.json  -->  chokidar watcher (200ms debounce)
                                       --> json-parser.ts (parseJsonTask)
                                       --> store.ts (updateLiveTeam)
                                       --> UI reactivity (SolidJS)
```

### Unified Team Model
Teams are displayed as a single merged list: live teams first, then docs teams. The `UnifiedTeamEntry` discriminated union (`kind: "live" | "docs"`) drives conditional rendering throughout all components.

## Files Changed

### New Files (Data Layer)
- `src/data/json-parser.ts` — JSON task file parser, defensive field extraction
- `src/data/config-reader.ts` — Reads `~/.claude/teams/*/config.json` for team metadata
- `src/data/json-watcher.ts` — chokidar watcher for `~/.claude/tasks/` with 200ms debounce

### Modified Files

**src/types.ts**
- Added: `LiveTask`, `TeamMember`, `TeamConfig`, `LiveTeam`, `UnifiedTeamEntry`
- `AppState` extended with `liveTeams: LiveTeam[]`

**src/data/store.ts**
- Added: `getUnifiedTeams()`, `setLiveTeams()`, `updateLiveTeam()`, `removeLiveTeam()`
- Updated: `selectTeam()` and `selectTask()` clamp against unified list length

**src/components/TeamList.tsx**
- Renders unified team list with live/docs distinction
- Status-based team icons: `▶` (active), `✓` (all done), `●` (pending)
- "LIVE" badge in header when live teams exist
- Descriptions show: `LIVE | N tasks | X active | Y done`

**src/components/TaskList.tsx**
- Status badges: `▶` in_progress (yellow), `✓` completed (green), `●` pending (gray)
- activeForm as subtitle for in_progress tasks
- `[BLOCKED]` tag and `~` prefix for blocked pending tasks
- `[RoleName]` extraction from subject as owner fallback
- Team member roster in header (purple)
- "LIVE" indicator in task panel header

**src/components/TaskDetail.tsx**
- Live task detail: status label, colored owner name, activeForm, description
- Dependency display: `Blocks: #5, #7 | Blocked by: #3` in orange
- Owner color resolved from `config.members[].color`

**src/components/StatusBar.tsx**
- Shows unified team count with live breakdown: `N teams (M live)`

**index.tsx**
- Loads team configs and live teams on startup
- Starts JSON watcher alongside markdown watcher

## Key Design Decisions
1. **Live teams first** in unified list — active work is most relevant
2. **No module-level createMemo** — all derived values computed inside component roots
3. **Fallback chain for owner**: `task.owner` -> `[RoleName]` subject prefix -> `#id`
4. **Member colors via config** — team configs define per-member colors, UI resolves at render
5. **Blocked task dimming** — `~` prefix + `[BLOCKED]` tag in list, orange deps in detail
