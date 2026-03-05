---
team: plan-roadmap-tui-features
type: planning
topic: Product roadmap for claude-team-tasks-tui
date: 2026-03-04
status: complete
teammates: 4
---

# plan-roadmap-tui-features

Planning team that produced a 4-phase product roadmap for `claude-team-tasks-tui`.

## Objective

Define a product roadmap covering:
- New features for real-time agent-teams monitoring
- Agent-teams plugin integration requirements
- Markdown file viewing capabilities within the TUI

## Primary Output

**[roadmap.md](./roadmap.md)** — Full product roadmap with phases, feature inventory, acceptance criteria, plugin contracts, and definition of done.

## Team

| Role | Contribution |
|------|-------------|
| Strategist | Strategic vision, phase rationale, plugin integration strategy |
| Prioritizer | Dependency graph, feature sequencing, risk register |
| Outcomes Analyst | Success criteria, acceptance tests, KPIs per phase |
| Stakeholder Advocate | User needs, constraints, feasibility review, stakeholder impact |

## Summary of Findings

**4 phases, no architecture change required:**

- **Phase 1 (v0.2.0):** Add `~/.claude/tasks/` JSON watcher + live task list + UUID resolution
- **Phase 2 (v0.3.0):** Task attribution by agent name/color + `blocks`/`blockedBy` display
- **Phase 3 (v0.4.0):** Full output file browser for all team markdown artifacts
- **Phase 4 (v0.5.0):** Keyboard help overlay, configurable paths, inotify resilience

No plugin changes needed for Phases 1 or 2. One optional addition (`docsPath` in team config) improves Phase 3.

**One open item:** Confirm with agent-teams plugin team whether named dirs in `~/.claude/tasks/` are always written per session.
