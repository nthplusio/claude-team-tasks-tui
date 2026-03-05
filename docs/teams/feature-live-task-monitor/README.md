---
team: feature-live-task-monitor
type: feature
topic: Live task monitoring for Claude agent teams
status: completed
---

# Live Task Monitor

Real-time monitoring of Claude agent task status in the TUI. Watches `~/.claude/tasks/` for JSON task files and displays them with status badges, owner attribution, and dependency tracking.

## Features
- Live task list with status badges (pending/in_progress/completed)
- activeForm display showing what agents are currently doing
- Owner attribution with team-config-defined colors
- Dependency visualization (blocks/blockedBy)
- Unified team list merging live and docs teams
