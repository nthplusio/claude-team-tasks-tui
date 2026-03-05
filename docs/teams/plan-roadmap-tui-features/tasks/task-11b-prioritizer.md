---
title: "Roadmap Section: Dependency Map & Sequencing"
owner: Prioritizer
task: 11b
date: 2026-03-04
---

# Dependency Map & Sequencing

*Section for inclusion in the final roadmap. All findings supersede earlier drafts (tasks 3 and 6) where noted.*

---

## Feature Inventory

| ID | Feature | Phase |
|----|---------|-------|
| F1 | `~/.claude/tasks/` chokidar watcher (JSON, depth 1) | 1 |
| F2 | JSON task parser (`id`, `subject`, `description`, `activeForm`, `status`, `blocks`, `blockedBy`) | 1 |
| F3 | `liveTeams` store slice + `LiveTask` type | 1 |
| F4 | Live task list UI (status badges: pending/in_progress/completed) | 1 |
| F5 | Team config reader (`~/.claude/teams/*/config.json`) | 1 |
| F6 | UUID→name resolution map (build on startup from config scan) | **1** *(moved from Phase 2)* |
| F9 | `activeForm` subtitle on `in_progress` tasks | **1** *(moved from Phase 2)* |
| F7 | Task attribution: agent name + color per task | 2 |
| F8 | `blocks`/`blockedBy` dependency display in TaskDetail | 2 |
| F10 | Output file scanner (top-level `.md` in `docs/teams/{team}/`) | 3 |
| F11 | `ViewMode: "files"` + file list component | 3 |
| F12 | Arbitrary `.md` artifact viewer (scrollable) | 3 |
| F13 | Keyboard help overlay (`?` key) | 4 |
| F14 | Configurable watch paths (`--tasks-path`, `--docs-path`) | 4 |

---

## Dependency Graph

```
F2 (JSON parser)
 └─▶ F3 (liveTeams store slice)
      └─▶ F1 (JSON watcher → feeds F3)
           └─▶ F4 (live task list UI)
                └─▶ F9 (activeForm subtitle — additive to F4)

F5 (team config reader)
 └─▶ F6 (UUID→name resolution)   ← both required Phase 1

Phase 2 requires F4 + F5 + F6:
  F7 (attribution/colors)
  F8 (blocks/blockedBy display)

F11 (ViewMode "files" + routing)
 └─▶ F10 (output file scanner)
      └─▶ F12 (artifact viewer)

F13, F14 — independent, no blockers
```

**Critical path (longest sequential chain):**
`F2 → F3 → F1 → F4` then `F5/F6 → F7/F8` = 6 steps before full Phase 2.

---

## Phase 1 — Implementation Order

| Step | Feature | Why This Order |
|------|---------|---------------|
| 1 | F2 — JSON parser | No UI; pure data; unblocks everything else |
| 2 | F3 — store slice | Type-safe foundation before watcher wires up |
| 3 | F5 — config reader | No UI; scan `~/.claude/teams/*/config.json` once on startup |
| 4 | F6 — UUID resolution | Build `{taskDirName → displayName}` map from F5 data; required before display |
| 5 | F1 — JSON watcher | Wires F2 + F3; testable end-to-end; `depth: 1` |
| 6 | F4 + F9 — live task list | First visible payoff; `activeForm` is a single text line, ship together |

**F5+F6 moved to Phase 1.** UUID resolution is necessary before Phase 1 is useful — teams appearing as `02b891df` instead of their name undermines the core value proposition. The implementation is lightweight: scan `~/.claude/teams/` on startup, build a map, re-scan when new configs appear.

---

## Phase 2 — Implementation Order

| Step | Feature | Why This Order |
|------|---------|---------------|
| 1 | F7 — attribution/colors | Depends on F5/F6 (now Phase 1); data already available |
| 2 | F8 — blocks/blockedBy | Data already in task JSON; display-only addition to TaskDetail |

Phase 2 is significantly lighter than planned — F5, F6, and F9 all moved to Phase 1. Phase 2 becomes two focused UI additions that enrich the already-working live view.

---

## Phase 3 — Implementation Order

| Step | Feature | Why This Order |
|------|---------|---------------|
| 1 | F11 — ViewMode "files" + routing | Prerequisite for all Phase 3 display |
| 2 | F10 — output file scanner | List component; reuses existing `<select>` pattern |
| 3 | F12 — artifact viewer | Reuses `<scrollbox><markdown>` from TaskDetail |

Phase 3 touches 3 files beyond its new components: `App.tsx` (new `ViewMode` case), `store.ts` (new state if needed), `StatusBar.tsx` (new keybinding hints). Low risk; established patterns.

---

## Phase 4 — Implementation Order

| Step | Feature | Why This Order |
|------|---------|---------------|
| 1 | F14 — configurable paths | Enables user customization before marketing Phase 4 |
| 2 | F13 — keyboard help overlay | Polish last; static content |

---

## Confirmed File Structure

Verified against live `~/.claude/tasks/` (not assumed):

```
~/.claude/tasks/{team-name-or-uuid}/
  {N}.json          ← task files at depth 1
  .lock             ← ignore
  .highwatermark    ← ignore

~/.claude/teams/{team-name}/
  config.json       ← team metadata + member roster
  inboxes/          ← out of scope
```

**Watcher config:** `depth: 1`, filter `*.json`. The existing `.md` watcher uses `depth: 3` — do not share config between watchers.

---

## Risk Register

| Risk | Level | Resolution |
|------|-------|-----------|
| Named task dirs not reliably written by plugin | MEDIUM | Named dirs confirmed present (`plan-roadmap-tui-features/`); UUID fallback required for older sessions |
| inotify limit with two watchers on Linux | MEDIUM | Document fix in README; add actionable error message (Phase 4) |
| UUID-only task dirs with no matching team config | LOW | Truncated UUID (8 chars) as display name; graceful degradation |
| `.lock`/`.highwatermark` files caught by watcher | LOW | `*.json` filter already handles this |
| Dual store slices add state complexity | LOW | Keep fully independent; merge only in display layer via `createMemo` |
| F6 resolution map stale if teams spawned mid-session | LOW | Watch `~/.claude/teams/` for new `config.json` files; re-scan on change |

---

## Agent-Teams Plugin: What Changes (and What Doesn't)

### Phase 1 & 2: No Plugin Changes Required

Current plugin output is sufficient for Phases 1 and 2:
- Task JSON already has all required fields including `owner`
- Team config already has `name` and `members[{name, color, model}]`
- No schema additions needed

### Phase 3: One Recommended Addition

Add `docsPath` to `~/.claude/teams/{name}/config.json`:

```json
{ "docsPath": "./docs/teams/plan-roadmap-tui-features" }
```

Without it: TUI guesses `./docs/teams/{team-name}/` — works for named teams, silently empty for UUID teams.
With it: file browser works for all teams, including UUID-identified ones.

### Phase 4: Recommended Addition

Add `schemaVersion: "1"` to task JSON for forward-compatibility detection.

### Stable Contract (Breaking if Removed)

**Task JSON:** `id`, `subject`, `status` — required; any removal breaks the TUI.
**Team config:** `name`, `members[].name`, `members[].color` — required for Phase 2.

All other fields consumed if present, gracefully ignored if absent.
