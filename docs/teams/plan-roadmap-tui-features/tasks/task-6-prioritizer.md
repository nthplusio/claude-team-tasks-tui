---
title: Phase Sequencing, Risk Ordering & Plugin Changes
owner: Prioritizer
task: 6
date: 2026-03-04
---

# Phase Sequencing, Risk Ordering & Plugin Changes

References: task-1-strategist.md, task-2-stakeholder.md, task-3-prioritizer.md (F-IDs), task-4-strategist.md

---

## Confirmed File Structure (from codebase inspection)

**Actual task file layout** (verified against live `~/.claude/tasks/`):
```
~/.claude/tasks/{team-name-or-uuid}/
  {N}.json          ← task files at depth 1, NOT depth 2
  .lock
  .highwatermark
```

**Correction to task-3 and task-4:** Prior outputs assumed depth 2. Actual structure is `{team-dir}/{N}.json` — single level. The watcher should watch at depth 1, not 2.

**UUID resolution confirmed:**
- `~/.claude/teams/{name}/config.json` provides name for named team dirs
- UUID-only dirs in `~/.claude/teams/` may have only `inboxes/` — no `config.json`
- Named dirs in `~/.claude/tasks/` (e.g. `plan-roadmap-tui-features`) do NOT need UUID resolution
- Orphaned UUID task dirs (no matching teams config) must fall back to truncated UUID

---

## Phase Sequence (Finalized)

| Phase | Name | Core Deliverables | Ships As |
|-------|------|------------------|----------|
| 1 | Live Task Monitoring | F2, F3, F1, F4, F9 | v0.2.0 |
| 2 | Team Context & Identity | F5, F6, F7, F8 | v0.3.0 |
| 3 | Full Output Navigation | F11, F10, F12 | v0.4.0 |
| 4 | Polish & Distribution | F13, F14 | v0.5.0 |

Phase order from task-4 is confirmed correct. No reordering needed.

---

## Within-Phase Sequencing (Implementation Order)

### Phase 1 — Critical Path

```
Step 1: F2 — JSON task parser
Step 2: F3 — liveTeams store slice + LiveTask type
Step 3: F1 — JSON watcher (depth:1, filter *.json, watch ~/.claude/tasks/)
Step 4: F4 — Live task list UI (status badges)
Step 5: F9 — activeForm subtitle (add to F4 in same PR — near-zero extra work)
```

**Watcher correction:** Watch `~/.claude/tasks/` with `depth: 1` (not 3). Task files are `{teamDir}/{N}.json` — one level deep. The team dir IS the watch boundary.

**Store architecture choice:** Recommend `liveTeams` as a parallel slice keyed by dir name, not UUID. UUID dirs shown as truncated fallback. Named dirs shown by name. Both live in the same slice — the key is just the dir name as-found.

### Phase 2 — Implementation Order

```
Step 1: F5 — team config reader (scan ~/.claude/teams/*/config.json on startup)
Step 2: F6 — UUID resolution map (build {taskDirName → displayName} from F5 data)
Step 3: F9 already done in Phase 1
Step 4: F7 — task attribution/colors (requires F5+F6)
Step 5: F8 — blocks/blockedBy display (requires F4; data already in JSON)
```

Note: F6 is simpler than previously estimated. The TUI doesn't need to resolve `taskDir UUID → team name` via a separate lookup if it simply uses the **team config's `name` field** as the display name when a matching config exists. The linkage is: scan `~/.claude/teams/*/config.json`, extract `name`; check if `~/.claude/tasks/{name}` exists — if so, use that dir. For UUID-only task dirs with no match, show first 8 chars of UUID.

### Phase 3 — Implementation Order

```
Step 1: F11 — add "files" ViewMode to store + routing
Step 2: F10 — output file scanner (readdir + filter .md, exclude tasks/)
Step 3: F12 — file viewer component (reuse TaskDetail scrollbox pattern)
```

### Phase 4 — Implementation Order

```
Step 1: F14 — configurable paths (CLI args; no new deps)
Step 2: F13 — keyboard help overlay (polish; last)
```

---

## Risk-Ordered Feature Table

| Risk | Feature | Reason | Mitigation |
|------|---------|--------|-----------|
| HIGH | F6 (UUID resolution) | Task dir names are UUIDs; no reliable mapping exists for old/orphaned dirs | Show truncated UUID as fallback; never crash on unresolved |
| HIGH | F3 (dual store slices) | Parallel `teams` + `liveTeams` slices creates state sync complexity | Keep fully independent; unify only in display layer |
| MEDIUM | F1 (JSON watcher) | Depth was miscalculated in earlier analysis (depth 1, not 2); easy to get wrong | Verified: `depth: 1` against live `~/.claude/tasks/` |
| MEDIUM | F5 (team config) | Config schema has more fields than originally specced (`leadAgentId`, `leadSessionId`, etc.) | Parse defensively; extract only needed fields |
| LOW | F2 (JSON parser) | Simple `JSON.parse`; existing pattern | Wrap in try/catch; skip malformed files |
| LOW | F4 (live task UI) | Follows existing `<select>` pattern | No unknowns |
| LOW | F7-F9 | Cosmetic enrichment | No architectural dependencies |
| LOW | F10-F12 | Follows established patterns | `<scrollbox><markdown>` already proven |
| LOW | F13-F14 | Polish/config; no unknowns | — |

---

## Agent-Teams Plugin Integration

### What the Plugin Currently Writes

The agent-teams plugin writes task data via the SDK's `TaskCreate`/`TaskUpdate` tools. Based on inspection of live task files:

**Current task JSON (written by plugin):**
```json
{
  "id": "1",
  "subject": "[RoleName] Brief imperative title",
  "description": "Full task description with markdown content",
  "activeForm": "Present continuous verb phrase",
  "owner": "RoleName",
  "status": "pending | in_progress | completed",
  "blocks": ["2", "4"],
  "blockedBy": []
}
```

**Current team config JSON (written by plugin on TeamCreate):**
```json
{
  "name": "team-name",
  "description": "...",
  "createdAt": 1772682174595,
  "leadAgentId": "team-lead@team-name",
  "leadSessionId": "uuid",
  "members": [{
    "agentId": "Role@team-name",
    "name": "RoleName",
    "agentType": "general-purpose",
    "model": "claude-sonnet-4-6",
    "color": "blue",
    "joinedAt": 1772682289578,
    "tmuxPaneId": "in-process",
    "cwd": "/path/to/project",
    "subscriptions": [],
    "backendType": "in-process"
  }]
}
```

### What the TUI Needs (No Plugin Changes Required for Phase 1-2)

The existing data is sufficient for Phase 1 and 2. The TUI can consume `status`, `activeForm`, `subject`, `blocks`, `blockedBy`, `owner` from task files and `name`, `members[{name, color, model}]` from config — all already present.

### Plugin Changes That Would Add Value (Phase 3+)

These are **optional enhancements** that would improve TUI display but require plugin-side changes:

| Enhancement | What Plugin Would Add | TUI Benefit |
|-------------|----------------------|-------------|
| Task `metadata` field | `{ phase, priority, tags }` — arbitrary KV | Phase/tag filtering in TUI |
| Config `docsPath` field | Path to team's docs output dir | TUI can auto-discover docs without scanning `./docs/teams/` heuristically |
| Config `outputFiles` field | List of primary artifact paths produced by team | TUI can navigate directly to artifacts without scanning |
| Task `startedAt` / `completedAt` timestamps | ISO timestamps on status transitions | Display elapsed time per task |
| Config `taskDirPath` field | Explicit path to task dir | Decouples task storage from `~/.claude/tasks/{name}` convention |

**Recommended for Phase 3:** Add `docsPath` to team config. This is the cleanest way to link a live team (identified by name) to its docs output directory. Without it, the TUI must guess that `docs/teams/{name}/` corresponds to `~/.claude/tasks/{name}/` — which works for named dirs but fails for UUID dirs.

**Plugin change spec (minimal):**
```json
// ~/.claude/teams/{name}/config.json — add field:
{
  "docsPath": "./docs/teams/plan-roadmap-tui-features"
}
```

This is a non-breaking addition. Plugin writes it at `TeamCreate` time using the lead's `cwd` + conventional `docs/teams/{name}` path. TUI reads it during Phase 3 file discovery.

### What Stays Out of Scope (Plugin Side)

- Plugin should NOT write TUI-specific metadata — the TUI should adapt to the plugin's natural data model
- Plugin should NOT add a separate "TUI output" format — the existing JSON schemas are sufficient
- No protocol changes needed for Phase 1 or 2

---

## Conflict Resolution

**Conflict: F9 phase placement**
- task-3-prioritizer.md proposed moving `activeForm` (F9) to Phase 1
- task-4-strategist.md placed it in Phase 2
- **Resolution:** Move F9 to Phase 1. It is a single line of text in the task row component. Including it in Phase 1 costs ~30 minutes and makes the live task view immediately more useful. No dependencies on Phase 2 features.

**Conflict: Watcher depth**
- task-3 and task-4 both stated "watch at depth 2"
- Verified against live data: task files are at `{teamDir}/{N}.json` — depth 1
- **Resolution:** Watcher `depth: 1`. This is a correctness fix, not a conflict.

**Conflict: F14 phase placement**
- task-3 suggested moving configurable paths to Phase 1 for broader adoption
- task-4 kept it in Phase 4
- **Resolution:** Keep F14 in Phase 4. The default paths (`~/.claude/tasks/` + `./docs/teams/`) work for all current use cases. Phase 1 should stay focused on the critical path. Configurable paths are a distribution concern, not a functionality concern.
