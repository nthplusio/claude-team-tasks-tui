# Task 4: Team Config Reader and UUID Resolution

## Files Created

- **src/data/config-reader.ts** — Config scanner, UUID resolution, path helpers

## Exports

| Function | Purpose |
|---|---|
| `scanTeamConfigs()` | Scans `~/.claude/teams/*/config.json`, returns `Map<name, TeamConfig>` |
| `resolveDisplayName(dirName, configs)` | Named dir → config name or dir name; UUID → first 8 chars |
| `isUUID(s)` | Regex test for standard UUID format |
| `getTeamsDir()` | Returns `~/.claude/teams` path |
| `getTasksDir()` | Returns `~/.claude/tasks` path |

## Key Design Decisions

- Task dirs use team name directly (e.g. `feature-live-task-monitor`), not UUIDs. UUID task dirs are standalone Claude sessions without team configs.
- Config parsing is defensive: missing fields get defaults, invalid JSON returns null.
- Member parsing extracts `name`, `agentType`, `model`, `color` — other fields (`agentId`, `joinedAt`, etc.) are ignored.
- `scanTeamConfigs` reads in parallel for speed.
