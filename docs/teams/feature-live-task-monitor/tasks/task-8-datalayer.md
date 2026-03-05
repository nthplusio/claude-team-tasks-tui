# Task 8: Integration Testing and Edge Case Handling

## Test Results

### 1. Malformed JSON — PASS
- Invalid JSON string → `null` (skipped)
- Empty object `{}` → `null` (no subject)
- JSON `null` → `null`
- No crashes, no exceptions thrown

### 2. Missing team config (UUID display) — PASS
- UUID dir `af8277b0-0c39-452a-963a-ce1a5c8654e3` → displays `af8277b0`
- Named dir without config → displays dir name as-is
- Named dir with config → displays config name

### 3. Null/empty activeForm — PASS
- `activeForm: null` → `undefined` (no subtitle)
- Missing `activeForm` → `undefined`

### 4. .lock/.highwatermark files — PASS
- `task.lock` → ignored
- `.highwatermark` → ignored
- `readme.md` → ignored
- `task.json` → processed

### 5. Team dir appears/disappears — PASS
- `parseTeamTasks` catches readdir errors → returns `[]`
- Watcher's `scheduleUpdate` catches errors → no crash
- `removeLiveTeam` store action available for cleanup

### 6. Status transitions — PASS
- Valid statuses ("pending", "in_progress", "completed") → preserved
- Invalid status ("bogus") → defaults to "pending"
- Bad `blocks`/`blockedBy` (non-array) → empty array

### 7. Full pipeline — PASS
- `parseAllLiveTeams` found 92 team dirs, 9 with tasks
- Config scan found 5 team configs
- Named teams correctly resolved display names
- Build succeeds with all new code
- Both watchers (markdown + JSON) use independent debounce timers and pending sets
