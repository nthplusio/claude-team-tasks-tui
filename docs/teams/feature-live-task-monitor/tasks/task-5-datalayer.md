# Task 5: Live Task Store Slice and JSON Watcher

## Files Modified/Created

- **src/data/store.ts** — Added `liveTeams: LiveTeam[]` to initial state; added `setLiveTeams`, `updateLiveTeam`, `removeLiveTeam` actions
- **src/data/json-watcher.ts** — New file: chokidar watcher for `~/.claude/tasks/`
- **index.tsx** — Wired up: loads configs + live teams before render, starts JSON watcher

## Store Extensions

| Action | Purpose |
|---|---|
| `setLiveTeams(liveTeams)` | Bulk-set live teams (startup) |
| `updateLiveTeam(dirName, tasks, displayName, config?)` | Upsert a single live team (watcher callback) |
| `removeLiveTeam(dirName)` | Remove a live team by dir name |

## JSON Watcher (json-watcher.ts)

- Watches `~/.claude/tasks/` with chokidar, depth 1 (task files are `{teamDir}/{N}.json`)
- 200ms debounce per team dir, same pattern as existing markdown watcher
- Ignores `.lock`, `.highwatermark` files, and non-JSON files
- `mkdir -p` on startup
- Maintains config cache for display name resolution; updated via `setConfigCache()`
- On change: parses all JSON in affected team dir, calls `updateLiveTeam`

## Startup Flow (index.tsx)

1. Parallel load: `parseAllTeams`, `scanTeamConfigs`, `parseAllLiveTeams`
2. Apply config display names/configs to live teams
3. Set store state (teams, liveTeams, watchPath)
4. Cache configs in json-watcher
5. Start both watchers
6. Render
