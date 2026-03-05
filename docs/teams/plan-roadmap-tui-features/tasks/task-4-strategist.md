---
title: Implementation Phases with Business Rationale
owner: Strategist
task: 4
date: 2026-03-04
---

# Implementation Phases: claude-team-tasks-tui

References: task-1-strategist.md (strategic goals), task-2-stakeholder.md (user needs, data schemas, constraints)

---

## Phase Summary

| Phase | Name | Business Value | Unblocks |
|-------|------|---------------|---------|
| 1 | Live Task Monitoring | App becomes useful during active sessions | P0 user needs |
| 2 | Team Context & Identity | Multi-agent work becomes interpretable | P1/P2 user needs |
| 3 | Full Output Navigation | TUI replaces file browser for team artifacts | P1 user need |
| 4 | Polish & Resilience | Ready for broader adoption | Sustainable distribution |

---

## Phase 1 — Live Task Monitoring

**Business value:** Closes the largest gap in the current tool. Without live JSON watching, the TUI is a static file browser — useful only after a team finishes. Phase 1 makes it useful *while* agents are running, which is the primary motivation for the tool.

**User stories addressed:**
- Know if a team is stuck, blocked, or progressing without actively querying it (P0)
- See what each agent is actively doing via `activeForm` (P0)

### Deliverables

**1a. JSON task watcher**
- Watch `~/.claude/tasks/` at depth 2 for `.json` file changes
- Reuse chokidar; change file filter from `.md` to `.json`
- 200ms debounce per team dir (same pattern as existing watcher)
- `mkdir -p` on startup to prevent ENOENT (established pattern)

**1b. UUID → team name resolution**
- On startup: scan `~/.claude/teams/*/config.json`, build `{uuid → name}` and `{name → config}` maps
- Fallback: display first 8 chars of UUID for unresolved dirs
- Watch `~/.claude/teams/` for new config.json files added during runtime

**1c. Live task store slice**
- New `liveTeams` store slice: `{ [teamName: string]: LiveTask[] }`
- `LiveTask` type: `{ id, subject, description, activeForm, status, blocks, blockedBy }`
- Keep independent from existing `teams` (markdown) slice — unify only in display

**1d. Live task display**
- In TaskList: show live tasks when a team has JSON data, markdown tasks as fallback
- Status badge column: `●` pending, `▶` in_progress, `✓` completed (color-coded)
- `activeForm` shown as subtitle/secondary line when status is `in_progress`
- Header indicator: live vs. static mode

**Architecture note:** Two chokidar instances (one for `~/.claude/tasks/`, one for `docs/teams/`) running concurrently. Both feed into separate store slices. This is the primary complexity addition — isolated by design.

---

## Phase 2 — Team Context & Identity

**Business value:** With live tasks visible, users need to understand *who* is doing *what*. Without team config, tasks show only subject strings. With config, tasks are attributed to named agents with colors — multi-agent work becomes readable at a glance.

**User stories addressed:**
- Understand team structure: who is on the team, what model they use (P1)
- Dependency visualization: which tasks are blocked/blocking (P2)
- Team member color coding (P3)

### Deliverables

**2a. Team config reader**
- Parse `~/.claude/teams/{team-name}/config.json` on startup and on change
- Extract: `name`, `description`, `members[{name, agentType, model, color}]`
- Store in config slice keyed by team name

**2b. Task attribution**
- Map task `subject` prefix `[Role Name]` to member roster from config
- Display agent name and color beside task in TaskList
- Fall back to subject string if no config match

**2c. Dependency display**
- In TaskDetail: show "Blocks: #N, #M" and "Blocked by: #N" from task JSON
- Highlight tasks that are blocked (dim) vs. active (bright) in TaskList

**2d. Team member roster**
- In TeamDetail / header area: show member count, member names/models
- Uses config data already loaded in 2a

---

## Phase 3 — Full Output Navigation

**Business value:** Currently users must leave the TUI to read team artifacts (specs, reports, roadmaps). Phase 3 makes the TUI self-contained — a single interface for monitoring and reading all team work. Eliminates context switching entirely.

**User stories addressed:**
- Read agent-produced documents as they emerge (P1)
- Navigate between teams' full output file sets (P1)

### Deliverables

**3a. Output file discovery**
- Scan all `.md` files in `docs/teams/{team-name}/` (not just `tasks/`)
- Separate `files` list from `tasks` list in team data model
- Include: README.md, primary artifacts (e.g. `roadmap.md`, `spec.md`), any other `.md`

**3b. File browser view**
- New `ViewMode`: `"files"` — sibling to `"tasks"` and `"detail"`
- Tab or key shortcut to switch between task list and file list for the selected team
- File list shows filename, size/date indicator

**3c. File content viewer**
- Reuse or extend existing TaskDetail markdown renderer
- Render any `.md` file: headings bold, lists indented, code blocks preserved
- Scroll support (already handled by OpenTUI `<text>` box behavior)

**3d. Navigation integration**
- From TeamList: Enter goes to tasks (current behavior) OR press `f` to go to files
- Escape returns from file view to team view
- StatusBar updated with file-view keybindings

---

## Phase 4 — Polish & Resilience

**Business value:** Removes friction for new users and edge cases. Enables confident distribution via `bunx` to broader audience without hand-holding.

### Deliverables

**4a. Keyboard help overlay**
- Press `?` to show all keybindings as an overlay
- Dismisses on any key

**4b. Configurable watch paths**
- CLI args: `--tasks-path`, `--docs-path` to override defaults
- Sensible defaults: `~/.claude/tasks/` and `./docs/teams/`

**4c. Error resilience**
- Graceful handling of missing/malformed JSON task files (log, skip, don't crash)
- Watcher reconnect on `~/.claude/tasks/` disappearing and reappearing

**4d. Version & distribution**
- Enforce version tagging discipline in publish workflow
- README updated with new features and keybindings

---

## Phase Sequencing Rationale

Phase 1 must come first — it provides the primary value proposition (real-time visibility) that justifies the tool's existence over a simple `watch ls` command. All other phases are enrichments.

Phase 2 before Phase 3: team context (names, colors, dependencies) is higher P-value than file browsing. Users need to interpret live tasks before they need to read artifact files.

Phase 3 before Phase 4: full capability before polish. Phase 4 is release-readiness, not functionality.

**Gate condition between phases:** Each phase should be releasable independently. Phase 1 ships as a minor version bump; each subsequent phase ships as its own version. This allows real-world validation before investing in later phases.

---

## What Is Explicitly Out of Scope (All Phases)

- Sending messages to agents or controlling task state
- Web UI or server-side components
- Multi-user collaboration
- Full terminal markdown rendering (tables, images, footnotes)
- Agent inbox reading (low value without send capability)

---

## Agent-Teams Plugin Integration Requirements

The TUI is a consumer of data written by the agent-teams plugin. This section defines what the plugin must write or expose to support each phase. These are contracts — the TUI is designed around them.

### What the Plugin Already Writes (Current State)

The plugin currently writes:
- `~/.claude/tasks/{team-uuid}/{task-id}.json` — individual task files with full schema
- `~/.claude/teams/{team-name}/config.json` — team config with members roster
- `docs/teams/{team-name}/tasks/task-{N}-{role-slug}.md` — markdown task outputs with YAML frontmatter

The TUI can already consume all three with Phase 1-2 work. No plugin changes are strictly required to ship Phases 1-3.

### Phase 1: Plugin Contracts (Current Format, Confirmed)

**Task JSON schema** (must remain stable):
```json
{
  "id": "2",
  "subject": "[Role Name] Short description",
  "description": "Full markdown task description",
  "activeForm": "Present-continuous action string",
  "status": "pending | in_progress | completed",
  "blocks": ["3", "4"],
  "blockedBy": ["1"]
}
```

**Plugin obligation:** Write atomically (complete file replace, not append). The watcher uses `awaitWriteFinish` with 100ms stability threshold — plugin must complete writes within that window or TUI may read partial files.

**Plugin obligation:** Keep UUID dir alongside named dir, OR ensure named dirs exist. The TUI resolves names via `~/.claude/teams/*/config.json` — this lookup must work for every active team.

### Phase 2: Plugin Contracts (Config Format, Confirmed)

**Team config schema** (must remain stable):
```json
{
  "name": "team-name",
  "description": "Human readable description",
  "createdAt": 1772682174595,
  "members": [
    {
      "name": "Role Name",
      "agentType": "general-purpose",
      "model": "claude-sonnet-4-6",
      "color": "blue | green | yellow | red | cyan | magenta | white"
    }
  ]
}
```

**Plugin obligation:** Write config.json before spawning agents so UUID resolution works from session start.

**Plugin obligation:** `color` field should be one of the 8 standard terminal colors. If the TUI receives an unknown color, it falls back to white.

### Phase 3: Plugin Contracts (Markdown Output Structure)

**Directory structure** (already established, must remain stable):
```
docs/teams/{team-name}/
  README.md                         — YAML frontmatter + description
  {artifact-name}.md                — primary artifact output(s)
  tasks/
    task-{N}-{role-slug}.md         — individual task outputs
```

**Plugin obligation:** Do not nest markdown outputs deeper than one level beyond the team dir. The TUI scans at depth 1 for artifact files.

**Plugin obligation:** Use consistent naming conventions for primary artifacts — the TUI will display filenames directly in the file browser.

### Recommended Plugin Enhancements (Future, Not Required)

These are not required for any current phase but would improve the TUI experience if the plugin team chooses to add them:

| Enhancement | TUI Benefit | Plugin Change |
|-------------|-------------|---------------|
| Add `startedAt` / `completedAt` timestamps to task JSON | Show elapsed time per task | Add two optional fields to task schema |
| Write `~/.claude/tasks/{team}/team.json` manifest | Single source of truth for team name + member list per task dir | New file: `{name, members[]}` |
| Add `ownerAgent` field to task JSON | Direct attribution without subject-string parsing | Add optional field to task schema |
| Write `status: "failed"` for crashed tasks | TUI can show failed tasks distinctly | Add new status value (non-breaking if TUI handles unknown statuses) |
| Emit `progress` field (0.0–1.0) to task JSON | Progress bar per task | Add optional numeric field |

**Plugin stability contract:** The TUI treats all task and config JSON fields as optional except `id`, `subject`, and `status`. Unknown fields are silently ignored. New fields can be added without breaking the TUI. Removing or renaming `id`, `subject`, or `status` would be a breaking change requiring a coordinated update.
