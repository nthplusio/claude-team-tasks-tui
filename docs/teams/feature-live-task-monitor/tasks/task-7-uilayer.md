# Task 7: Task Attribution, Colors, and Dependency Display (Phase 2)

## Changes Made

### src/components/TaskList.tsx — Attribution & Blocked Indicators
- `extractRolePrefix()`: extracts `[RoleName]` from subject as owner fallback
- `resolveOwner()`: chain: `task.owner` -> `[RoleName]` prefix -> `#id`
- `liveTaskDesc()`: shows activeForm + owner for in_progress; owner + `[BLOCKED]` tag for blocked
- `liveTaskName()`: prepends `~ ` dim prefix on blocked pending tasks
- `memberRoster()`: displays team member names in purple below header when config available

### src/components/TaskDetail.tsx — Owner Colors & Dependencies
- `ownerColor()`: matches `task.owner` to `config.members[].name`, returns member's color
- Owner text rendered with resolved color (falls back to default fg)
- `depsLine()`: formats `Blocks: #5, #7 | Blocked by: #3` in orange
- Dependencies line shown between activeForm and description

### Visual Summary
- **List view**: blocked pending tasks prefixed with `~ `, `[BLOCKED]` in description
- **Detail view**: owner name colored per team config, dependency chains in orange
- **Header**: member roster in purple when team config exists

## Build
Compiles successfully with `bun run build`.
