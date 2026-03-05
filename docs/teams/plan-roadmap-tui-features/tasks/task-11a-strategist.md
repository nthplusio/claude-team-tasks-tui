---
title: "Domain Section: Strategic Vision & Phase Rationale"
owner: Strategist
task: 11a
date: 2026-03-04
---

# Strategic Vision & Phase Rationale

## Why This Tool Exists

claude-team-tasks-tui solves a specific problem: when you run a multi-agent Claude team, you have no passive visibility into what's happening. You must actively query files, open directories, or run commands to check progress. The TUI replaces that friction with a terminal panel that updates itself — you glance at it and know.

The tool's value grows with team complexity. A single agent running a simple task barely needs monitoring. A 4-6 agent team with interdependent tasks, working in parallel, producing multiple output files — that team needs a dashboard. This is the primary user.

## Core Value Propositions

**1. Real-time progress visibility**
The central proposition. Task statuses, `activeForm` verb phrases, and blocking relationships update live as agents work. No polling, no refreshing, no file-opening required.

**2. Two-source coherence**
Agent teams produce two kinds of data: live operational state (`~/.claude/tasks/`) and durable outputs (`docs/teams/`). Neither source alone tells the full story. The TUI is the only interface that shows both simultaneously — real-time progress alongside the artifacts being produced.

**3. Zero-friction operation**
Distributed via `bunx github:nthplusio/claude-team-tasks-tui` — no installation, no configuration, no build step. Works from any directory. The tool should be an afterthought to start, invisible while running, and disposable when done.

**4. Terminal-native**
No browser tab. No web server. No port conflicts. Works in the same terminal session where agents are running, on the same machine or over SSH. The TUI is a citizen of the developer's terminal workflow, not an intrusion into it.

## Strategic Phase Rationale

The 4-phase structure follows a deliberate progression: each phase delivers a complete, independently shippable capability increment. No phase is a dead-end or a prerequisite that only pays off later.

### Phase 1 — Live Task Monitoring (v0.2.0)

**Strategic rationale:** Without this phase, the tool is a static markdown browser. Any file browser (`less`, `bat`, `lf`) serves that use case adequately. Phase 1 is what makes this tool distinctively valuable — and it should ship first, before any other capability, because it answers the foundational question: "Is my team actually working?"

**User shift:** From "I need to open a file to check status" → "I glance at the TUI panel."

**Scope discipline:** UUID resolution (F6) is included in Phase 1, not Phase 2. A live task view that shows teams as cryptic UUIDs fails the user — they can't identify which UUID is their current session. Name resolution is part of the minimum viable experience for Phase 1.

### Phase 2 — Team Context & Identity (v0.3.0)

**Strategic rationale:** Phase 1 answers "what is happening." Phase 2 answers "who is doing it and what depends on what." With 4-6 agents in parallel, a task list without attribution is hard to interpret. Phase 2 turns a list of tasks into a picture of a team.

**User shift:** From "tasks are anonymous status rows" → "each task is owned by a named agent with a color, and I can see the dependency chain."

**The `blocks`/`blockedBy` display is the hidden gem of Phase 2.** A blocked task that's been stuck for 10 minutes is a signal that something is wrong upstream. Making that visible in the TUI enables users to diagnose coordination failures in real time.

### Phase 3 — Full Output Navigation (v0.4.0)

**Strategic rationale:** Teams produce artifacts — specs, roadmaps, reports — as they work. Currently users must leave the TUI to read these. Phase 3 closes that loop: the TUI becomes the single interface for both monitoring progress and reading outputs. Context switching to a file browser or editor is eliminated.

**User shift:** From "TUI for status, shell for reading outputs" → "TUI for everything."

**File browsing is not just convenience.** When an agent writes a spec or a report, the user often wants to read it immediately. Phase 3 means that as soon as a file appears, it's accessible without any additional steps.

### Phase 4 — Polish & Resilience (v0.5.0)

**Strategic rationale:** Phases 1-3 build a capable tool. Phase 4 makes it a distributable product. The difference is: a capable tool works for its creator; a distributable product works for someone encountering it for the first time. Keyboard help, configurable paths, and error resilience are the gap between those two states.

**User shift:** From "works if you know how it works" → "self-explaining to new users."

## What This Tool Is Not

Establishing boundaries is as important as defining capabilities.

- **Not a controller.** The TUI is read-only. It watches agents work; it does not direct them. No task mutation, no message sending, no agent coordination through the TUI.
- **Not a log viewer.** The TUI shows structured task state, not raw logs or terminal output. If you want to see what an agent printed to stdout, look at its terminal session.
- **Not a full markdown renderer.** Tables, images, footnotes, and inline HTML are out of scope. The TUI renders enough markdown to make task outputs readable — headings, lists, code blocks — not enough to replace a browser.
- **Not a multi-user tool.** One TUI per user, watching one set of directories. No real-time collaboration, no shared state, no server.

## Strategic Risks & Responses

| Risk | Strategic Response |
|------|--------------------|
| Plugin data model changes break the TUI | Define a minimal stable contract (`id`, `subject`, `status`) and parse defensively for everything else |
| Named task dirs may not be reliably written by plugin | Treat UUID resolution as Phase 1 requirement; confirm with plugin team before shipping |
| OpenTUI API limitations block Phase 3 | File browser stays within proven `<select>` + `<box>` + `<text>` primitives — no novel API surface |
| Tool is abandoned after Phase 1 | Each phase ships independently; Phase 1 alone is a useful product |

## Agent-Teams Plugin Integration: Strategic View

The TUI and the agent-teams plugin are separate tools with a data contract between them. The strategic principle is: **the TUI adapts to the plugin's natural data model; the plugin does not add TUI-specific output.**

The current plugin output is sufficient for Phases 1 and 2 without any plugin changes. Two additions would materially improve Phase 3 and beyond:

1. **`docsPath` in team config** — eliminates heuristic path guessing for docs output discovery. Recommended before Phase 3 ships.
2. **`schemaVersion` in task JSON** — enables forward-compatibility detection as both tools evolve. Recommended before Phase 4 (broad distribution).

Everything else in the plugin-side "recommended additions" lists (timestamps, progress fields, metadata tags) is a nice-to-have, not a dependency. The roadmap does not wait on them.
