---
title: User Needs, Business Constraints & External Dependencies
owner: Stakeholder Advocate
task: 2
date: 2026-03-04
---

# User Needs, Business Constraints & External Dependencies

## Primary User: Agent-Teams Operator

The core user runs multi-agent Claude teams and needs situational awareness without leaving the terminal. They are a developer or technical lead who already uses `bunx` to run agent-teams and wants to monitor active sessions without opening multiple file managers or terminal tabs.

**User jobs to be done:**
- Know if a team is stuck, blocked, or progressing without actively querying it
- Read agent-produced documents (specs, reports, task outputs) as they emerge
- Navigate between teams when running concurrent sessions
- Understand team structure: who is on the team, what their status is, what they've produced

---

## Data Source Analysis

### Source 1: `~/.claude/tasks/{team-uuid}/*.json` — Live Task Status

**Schema confirmed from real data:**
```json
{
  "id": "2",
  "subject": "[Stakeholder Advocate] Identify user needs...",
  "description": "Full task description with markdown content",
  "activeForm": "Identifying user needs",
  "status": "in_progress | pending | completed",
  "blocks": ["4"],
  "blockedBy": ["1"]
}
```

**Key observations:**
- Directory named by team UUID, not team name — requires a mapping lookup
- Team UUID ↔ team name mapping lives in `~/.claude/teams/{team-name}/config.json`
- A named team dir (e.g., `plan-roadmap-tui-features`) also exists alongside UUID dirs
- Files are individual JSON per task, updated atomically in place
- `activeForm` is the human-readable "currently doing" verb phrase — high value for live display
- `status` transitions: `pending` → `in_progress` → `completed`
- `blocks`/`blockedBy` enable dependency visualization

**Watch requirements:**
- Must watch `~/.claude/tasks/` at depth 2 for `.json` changes
- Need to resolve team name from UUID via `~/.claude/teams/*/config.json` scan on startup
- Re-resolve when new team UUID dirs appear

### Source 2: `docs/teams/{team-name}/` — Markdown Outputs

**Actual structure from current codebase:**
```
docs/teams/{team-name}/
  README.md          — team metadata (YAML frontmatter + description)
  {artifact}.md      — primary artifact (spec, report, roadmap, etc.)
  tasks/
    task-{N}-{role-slug}.md   — individual task outputs
```

**Already handled** by current parser/watcher. Gaps:
- Only `tasks/*.md` are shown; artifact files (non-README, non-task) are not browsable
- Team README content is parsed for metadata but not displayed as readable content
- No way to view the primary artifact (e.g., `roadmap.md`) within the TUI

### Source 3: `~/.claude/teams/{team-name}/config.json` — Team Config

**Schema confirmed:**
```json
{
  "name": "plan-roadmap-tui-features",
  "description": "...",
  "createdAt": 1772682174595,
  "members": [{
    "name": "Strategist",
    "agentType": "general-purpose",
    "model": "claude-sonnet-4-6",
    "color": "blue"
  }]
}
```

**User value:** Team member roster with model and color — enables richer team display (who is on the team, what model they use). Currently unused by the TUI.

### Source 4: `~/.claude/teams/{team-name}/inboxes/{agent-name}.json` — Agent Inboxes

Low priority for initial roadmap. Inboxes are ephemeral message queues; reading them in TUI provides limited value without the ability to send messages.

---

## User Needs by Priority

| Priority | Need | Current Gap |
|---|---|---|
| P0 | Real-time task status (pending/in_progress/completed) | No JSON watching |
| P0 | See what each agent is actively doing (`activeForm`) | No JSON parsing |
| P1 | Navigate team files beyond task list (artifacts, README) | Only tasks/*.md shown |
| P1 | Know team composition (members, models) | Config not read |
| P2 | Dependency visualization (blocked/blocking) | Not displayed |
| P2 | Identify teams by name, not UUID | UUID resolution needed |
| P3 | Team member color coding | Config data available, not used |

---

## Business Constraints

### Hard Constraints
1. **Dual data sources required** — Both `~/.claude/tasks/` (live JSON) and `docs/teams/` (markdown) must be supported. Dropping either breaks the core use case.
2. **Bun runtime** — All dependencies must be Bun-compatible. No Node-only native modules.
3. **bunx distribution** — No build step on end-user machine; dist must be committed. Package size affects cold-start time of `bunx`.
4. **Terminal-only** — No web server, no browser dependency, no network ports.
5. **Read-only** — TUI is an observer, not a controller. No task mutation, no message sending.

### Soft Constraints
1. **OpenTUI/SolidJS architecture** — Preferred to keep; justified deviation requires clear benefit
2. **Single-process** — Current design is one process watching one path; adding a second watcher adds complexity but is manageable
3. **Markdown rendering is basic** — Headings bold, lists indented, code blocks preserved. Not full terminal markdown (no tables, no images)

### External Dependencies
- `chokidar` — already in use; works for JSON watching too (just change file filter)
- `gray-matter` — already in use for markdown frontmatter
- No new external dependencies needed for Phase 1 or 2

---

## UUID Resolution Problem

This is the key integration challenge. The live task data is keyed by UUID:
```
~/.claude/tasks/02b891df-7783-49f7-81cd-90d87b6075d8/   # what is this team?
~/.claude/tasks/plan-roadmap-tui-features/               # named dirs also exist
```

**Resolution strategy:**
1. On startup, scan `~/.claude/teams/*/config.json` to build `{uuid → name}` and `{name → uuid}` maps
2. For UUID dirs without a match, show UUID truncated (first 8 chars) as fallback
3. Named dirs (non-UUID) map directly — no resolution needed
4. Watch `~/.claude/teams/` for new config.json files to handle teams spawned during runtime

**Risk:** Teams without a `~/.claude/teams/` entry (older versions, edge cases) will show as UUIDs. Acceptable degradation.

---

## Stakeholder Validation Points

These assumptions should be challenged before phase sequencing:

1. **Is real-time status (P0) more valuable than full-file browsing (P1)?** — Assumed yes: watching agents work in real-time is the primary motivation for a TUI, not file browsing (which `less` already handles).

2. **Do users run multiple concurrent teams?** — If yes, the team list view matters more. If no, a single-team focused view may be simpler. Current multi-team architecture supports this.

3. **Is `activeForm` actually used by agents?** — Confirmed yes from real task JSON: `"activeForm": "Identifying user needs"`. High display value.

4. **Tech stack alternatives** — The user said "open to alternatives if needed." The only scenario that would force this is if OpenTUI cannot handle two concurrent file watchers or JSON parsing efficiently. This should be validated in the feasibility review (Task #8).

5. **Out-of-scope: sending messages/controlling agents** — Confirmed out of scope. TUI is read-only observer.
