---
title: Strategic Vision — claude-team-tasks-tui Roadmap
owner: Strategist
date: 2026-03-04
---

# Strategic Vision: claude-team-tasks-tui

## Core Value Proposition

The tool provides **real-time operational visibility** into Claude agent team activity directly in the terminal — no browser, no switching context. For developers running multi-agent workflows, it collapses the feedback loop from "run agents, check files manually" to "watch progress unfold as it happens."

The two-source model is the strategic differentiator:
- `~/.claude/tasks/{team-uuid}/*.json` — live task status (what agents are doing *right now*)
- `docs/teams/{team-name}/` — durable outputs (what agents *produced*)

Neither source alone is sufficient. Together they give the full picture: real-time progress + persistent artifacts.

## Strategic Goals

| Goal | Rationale |
|------|-----------|
| Real-time task status | The #1 missing capability — without it, the tool is a static file browser |
| Unified dual-source model | Agents write to both paths; the TUI must reflect both coherently |
| Output file navigation | Teams produce multiple artifacts; users need in-TUI access to all of them |
| Team config awareness | Member list, colors, agent types add rich context to task attribution |
| Minimal footprint | `bunx` distribution — no install, no config; must stay zero-friction |

## Foundational vs Incremental Capabilities

### Foundational (must precede other work)
1. **Dual-source data layer** — separate store namespaces + watchers for JSON tasks and markdown outputs
2. **Live task JSON parsing** — read `{id, subject, description, activeForm, status, blocks, blockedBy}` and map to UI state
3. **Watcher for `~/.claude/tasks/`** — distinct from existing docs watcher; handles JSON not markdown

### Incremental (builds on foundation)
4. **Team config reader** — parse `team.json` for member list, enrich task attribution with agent name/color
5. **Output file browser** — list and navigate all `.md` files in a team dir (not just `tasks/`)
6. **Rich task metadata** — display `blocks`/`blockedBy` graph, `activeForm` as status indicator, member colors
7. **Markdown file viewer** — render any artifact file (README, output docs) with basic formatting

## Strategic Phases (draft — for Prioritizer/Stakeholder to challenge)

### Phase 1 — Live Visibility (Foundation)
**Business value:** The app becomes *useful for active agent sessions* rather than only post-hoc review.
- Add `~/.claude/tasks/` watcher (JSON files)
- Parse live task JSON into separate store slice
- Display live task list alongside (or instead of) static markdown tasks
- Status indicators: pending / in_progress / completed

### Phase 2 — Team Context (Enrichment)
**Business value:** Users understand *who* is doing *what* — multi-agent work becomes interpretable.
- Read team config JSON (`name`, `description`, `members`)
- Attribute tasks to agents with names and colors
- Surface `blocks`/`blockedBy` relationships
- Display `activeForm` (present-continuous action description)

### Phase 3 — Output Navigation (Completeness)
**Business value:** The TUI becomes the single interface for both monitoring and reading all team work.
- Browse all output files in `docs/teams/{team}/` (not just `tasks/`)
- Navigate and render arbitrary `.md` artifacts
- Link from team view to its output files

### Phase 4 — Polish and Distribution
**Business value:** Ready for broader adoption; zero-friction for new users.
- Keyboard help overlay
- Configurable watch paths (CLI args or config file)
- Version tagging + publish workflow

## Key Risks

| Risk | Mitigation |
|------|-----------|
| `~/.claude/tasks/` path may not exist | `mkdir -p` on startup (already done for docs path) |
| JSON task format may evolve | Parse defensively; unknown fields are ignored |
| Two watchers + store slices adds state complexity | Keep slices independent; unify only in display layer |
| OpenTUI API constraints | Phase 3 file browsing must stay within known `<select>`, `<box>`, `<text>` primitives |

## Architecture Constraint Note

The current OpenTUI/SolidJS architecture is well-suited for Phase 1-2. The `createStore` + `produce` pattern already handles surgical updates. The main addition is a second store slice for live tasks and a second chokidar instance. No stack change required or recommended.

Phase 3 requires a new view mode (`"files"`) and a file content viewer, both of which fit the existing `ViewMode` + component pattern.
