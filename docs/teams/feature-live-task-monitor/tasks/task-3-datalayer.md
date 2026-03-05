# Task 3: JSON Task Parser and LiveTask Types

## Files Created/Modified

- **src/types.ts** — Added `LiveTask`, `TeamMember`, `TeamConfig`, `LiveTeam` interfaces; added `liveTeams: LiveTeam[]` to `AppState`
- **src/data/json-parser.ts** — New file: JSON task parser, config parser, UUID helpers, bulk loaders

## Types Added to src/types.ts

- `LiveTask` — id, subject, description?, activeForm?, owner?, status, blocks[], blockedBy[]
- `TeamMember` — name, agentType, model, color
- `TeamConfig` — name, description, members[]
- `LiveTeam` — dirName, displayName, tasks[], config?
- `AppState.liveTeams` — new store slice for live teams

## json-parser.ts Exports

| Function | Purpose |
|---|---|
| `parseJsonTask(raw, fileId)` | Parse JSON string into LiveTask, defensive field extraction |
| `parseTaskFile(filePath)` | Read file + parse, returns null on any error |
| `parseTeamTasks(teamDirPath)` | Parse all *.json in a team directory |
| `parseTeamConfig(raw)` | Parse team config JSON into TeamConfig |
| `isUUID(s)` / `shortUUID(s)` | UUID detection and truncation for display names |
| `parseAllLiveTeams(tasksPath)` | Scan all team dirs, return LiveTeam[] (mkdir -p on startup) |

## Defensive Handling

- Missing/invalid `subject` → returns null (task skipped)
- Invalid `status` → defaults to "pending"
- Missing `id` → falls back to filename without extension
- Non-array `blocks`/`blockedBy` → empty array
- Invalid JSON or read errors → null/empty, never throws
- Config members with missing `name` → skipped; missing other fields → defaults
