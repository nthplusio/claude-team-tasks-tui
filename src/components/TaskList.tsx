import { createMemo, createSignal, createEffect, Show } from "solid-js"
import { useKeyboard } from "@opentui/solid"
import { state, getUnifiedTeams } from "../data/store"
import { colors, teamTypeColors, teamTypeLabel } from "../theme"
import type { LiveTask, UnifiedTeamEntry } from "../types"

/** Map model ID to short label */
function modelShort(model: string): string {
  if (model.startsWith("claude-opus")) return "opus"
  if (model.startsWith("claude-sonnet")) return "sonnet"
  if (model.startsWith("claude-haiku")) return "haiku"
  return model
}

/** Resolve blockedBy IDs to "#id: subject" strings */
function resolveBlockedBy(task: LiveTask, allTasks: LiveTask[]): string {
  if (task.blockedBy.length === 0) return ""
  const resolved = task.blockedBy.map((id) => {
    const dep = allTasks.find((t) => t.id === id)
    return dep ? `#${id}: ${dep.subject}` : `#${id}`
  })
  return ` [BLOCKED by ${resolved.join(", ")}]`
}

/** Status badge for live tasks (Nerd Font glyphs) */
function statusBadge(status: LiveTask["status"]): string {
  switch (status) {
    case "in_progress": return "\uEB99"  // nf-cod-robot
    case "completed": return "\uF058"    // nf-fa-check_circle
    case "pending":
    default: return "\uF252"             // nf-fa-hourglass_half
  }
}

/** Extract [RoleName] prefix from subject as owner fallback */
function extractRolePrefix(subject: string): string | undefined {
  const match = subject.match(/^\[([^\]]+)\]/)
  return match ? match[1] : undefined
}

/** Resolve owner display with role fallback */
function resolveOwner(task: LiveTask): string {
  return task.owner || extractRolePrefix(task.subject) || `#${task.id}`
}

/** Build task description with owner and resolved blocked indicator */
function liveTaskDesc(task: LiveTask, allTasks: LiveTask[]): string {
  const owner = resolveOwner(task)
  const blockedTag = resolveBlockedBy(task, allTasks)
  if (task.status === "in_progress" && task.activeForm) {
    return `${task.activeForm} | ${owner}${blockedTag}`
  }
  return `${owner}${blockedTag}`
}

function liveTaskName(task: LiveTask): string {
  const badge = statusBadge(task.status)
  const blocked = task.blockedBy.length > 0 && task.status === "pending" ? "\uF023 " : ""  // nf-fa-lock
  return `${badge} ${blocked}${task.subject}`
}

type GroupedTask = { task: LiveTask; flatIndex: number }

const COLUMN_LABELS = ["PENDING", "ACTIVE", "DONE"] as const
const COLUMN_COLORS = [colors.fgMuted, colors.yellow, colors.green] as const

export function TaskList(props: { focused: boolean; onSelect: (index: number) => void; onChange?: (index: number) => void }) {
  const entry = createMemo((): UnifiedTeamEntry | undefined => {
    const unified = getUnifiedTeams()
    return unified[state.selectedTeamIndex]
  })

  const isLive = createMemo(() => entry()?.kind === "live")

  // --- Shared header memos ---

  const headerName = createMemo(() => {
    const e = entry()
    if (!e) return "\u2014"
    return e.kind === "live" ? e.team.displayName : e.team.dir
  })

  const headerColor = createMemo(() => {
    const e = entry()
    if (!e) return colors.fgDark
    if (e.kind === "live") return colors.green
    return teamTypeColors[e.team.meta.type || "unknown"]
  })

  const headerText = createMemo(() => {
    const e = entry()
    if (!e) return "No team selected"
    if (e.kind === "live") {
      const t = e.team
      const inProgress = t.tasks.filter((tk) => tk.status === "in_progress").length
      const completed = t.tasks.filter((tk) => tk.status === "completed").length
      return `\uF0E7 ${t.tasks.length} tasks | ${inProgress} active | ${completed} done`
    }
    const t = e.team
    return `${teamTypeLabel(t.meta.type)} | ${t.meta.topic || t.dir} | ${t.tasks.length} tasks`
  })

  const teamDescription = createMemo(() => {
    const e = entry()
    if (!e || e.kind !== "live" || !e.team.config) return ""
    return e.team.config.description || ""
  })

  const memberRoster = createMemo(() => {
    const e = entry()
    if (!e || e.kind !== "live" || !e.team.config) return ""
    return e.team.config.members
      .map((m) => `${m.name} (${modelShort(m.model)}/${m.agentType})`)
      .join(" | ")
  })

  // --- Kanban state (live teams only) ---

  /** Group live tasks by status, preserving flat index */
  const groupedTasks = createMemo((): [GroupedTask[], GroupedTask[], GroupedTask[]] => {
    const e = entry()
    if (!e || e.kind !== "live") return [[], [], []]
    const pending: GroupedTask[] = []
    const active: GroupedTask[] = []
    const done: GroupedTask[] = []
    e.team.tasks.forEach((task, i) => {
      const gt = { task, flatIndex: i }
      switch (task.status) {
        case "pending": pending.push(gt); break
        case "in_progress": active.push(gt); break
        case "completed": done.push(gt); break
      }
    })
    // Sort pending: unblocked first, then blocked — preserve original order within each group
    const unblocked = pending.filter((gt) => gt.task.blockedBy.length === 0)
    const blocked = pending.filter((gt) => gt.task.blockedBy.length > 0)
    return [[...unblocked, ...blocked], active, done]
  })

  /** Select options for each column */
  const columnOptions = createMemo(() => {
    const e = entry()
    const allTasks = e?.kind === "live" ? e.team.tasks : []
    const groups = groupedTasks()
    return groups.map((col) =>
      col.map((gt) => ({
        name: liveTaskName(gt.task),
        description: liveTaskDesc(gt.task, allTasks),
      }))
    )
  })

  const [kanbanCol, setKanbanCol] = createSignal(0)
  const [colRows, setColRows] = createSignal([0, 0, 0])

  /** Reset kanban state when team changes */
  createEffect(() => {
    void state.selectedTeamIndex
    setKanbanCol(0)
    setColRows([0, 0, 0])
  })

  /** Clamp rows when columns shrink; auto-jump if current column empties */
  createEffect(() => {
    const groups = groupedTasks()
    const rows = colRows()
    const col = kanbanCol()

    // Clamp all rows to valid range
    const clamped = rows.map((r, i) => {
      const len = groups[i].length
      return len > 0 ? Math.min(r, len - 1) : 0
    })

    // Auto-jump to nearest non-empty column if current is empty
    if (groups[col].length === 0) {
      const nonEmpty = [0, 1, 2].filter((i) => groups[i].length > 0)
      if (nonEmpty.length > 0) {
        const closest = nonEmpty.reduce((a, b) =>
          Math.abs(b - col) < Math.abs(a - col) ? b : a
        )
        setKanbanCol(closest)
      }
    }

    if (clamped.some((v, i) => v !== rows[i])) {
      setColRows(clamped)
    }
  })

  /** Left/right arrows to switch kanban columns */
  useKeyboard((key) => {
    if (!props.focused || !isLive()) return

    if (key.name === "left" || key.name === "right") {
      const groups = groupedTasks()
      const dir = key.name === "left" ? -1 : 1
      const col = kanbanCol()

      // Find next non-empty column in direction
      let next = col + dir
      while (next >= 0 && next <= 2) {
        if (groups[next].length > 0) break
        next += dir
      }

      if (next >= 0 && next <= 2 && groups[next].length > 0) {
        setKanbanCol(next)
        const row = colRows()[next]
        const flatIndex = groups[next][row]?.flatIndex
        if (flatIndex !== undefined) {
          props.onChange?.(flatIndex)
        }
      }
    }
  })

  /** Map column select (Enter) to flat index */
  function handleColumnSelect(colIndex: number) {
    return (rowIndex: number) => {
      const gt = groupedTasks()[colIndex][rowIndex]
      if (gt) {
        setColRows((prev) => {
          const next = [...prev]
          next[colIndex] = rowIndex
          return next
        })
        props.onSelect(gt.flatIndex)
      }
    }
  }

  /** Map column navigation to flat index */
  function handleColumnChange(colIndex: number) {
    return (rowIndex: number) => {
      const gt = groupedTasks()[colIndex][rowIndex]
      if (gt) {
        setColRows((prev) => {
          const next = [...prev]
          next[colIndex] = rowIndex
          return next
        })
        props.onChange?.(gt.flatIndex)
      }
    }
  }

  // --- Docs team options ---

  const docsOptions = createMemo(() => {
    const e = entry()
    if (!e || e.kind !== "docs") return []
    return e.team.tasks.map((task) => ({
      name: task.title,
      description: task.owner || task.id,
    }))
  })

  // --- Render ---

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={props.focused ? colors.blue : colors.border}
      flexGrow={2}
      height="100%"
    >
      {/* Header */}
      <box height={1} backgroundColor={colors.bgDark} padding={{ left: 1 }}>
        <text bold fg={headerColor()}>
          {entry()?.kind === "live" ? `\uF0E7 ${headerName()}` : headerName()}
        </text>
      </box>
      <box height={1} padding={{ left: 1 }}>
        <text fg={colors.fgMuted}>{headerText()}</text>
      </box>
      <Show when={teamDescription()}>
        <box height={1} padding={{ left: 1 }}>
          <text fg={colors.fg}>{teamDescription()}</text>
        </box>
      </Show>
      <Show when={memberRoster()}>
        <box height={1} padding={{ left: 1 }}>
          <text fg={colors.purple}>{memberRoster()}</text>
        </box>
      </Show>

      {/* Kanban view for live teams */}
      <Show when={isLive()}>
        <Show
          when={groupedTasks().some((col) => col.length > 0)}
          fallback={
            <box padding={1}>
              <text fg={colors.fgDark}>No tasks found</text>
            </box>
          }
        >
          <box flexDirection="row" flexGrow={1}>
            {[0, 1, 2].map((colIndex) => (
              <box
                flexDirection="column"
                width={colIndex === 1 ? "34%" : "33%"}
                borderStyle="single"
                borderColor={props.focused && kanbanCol() === colIndex ? colors.blue : colors.border}
              >
                <box height={1} backgroundColor={colors.bgDark} padding={{ left: 1 }}>
                  <text bold fg={COLUMN_COLORS[colIndex]}>
                    {`${COLUMN_LABELS[colIndex]} (${groupedTasks()[colIndex].length})`}
                  </text>
                </box>
                <Show
                  when={columnOptions()[colIndex].length > 0}
                  fallback={
                    <box padding={{ left: 1 }}>
                      <text fg={colors.fgDark}>{"\u2014"}</text>
                    </box>
                  }
                >
                  <select
                    options={columnOptions()[colIndex]}
                    focused={props.focused && kanbanCol() === colIndex}
                    backgroundColor={colors.bg}
                    selectedBackgroundColor={colors.selection}
                    selectedTextColor={colors.fg}
                    textColor={colors.fgDark}
                    descriptionColor={colors.fgMuted}
                    width="100%"
                    flexGrow={1}
                    onSelect={handleColumnSelect(colIndex)}
                    onChange={handleColumnChange(colIndex)}
                  />
                </Show>
              </box>
            ))}
          </box>
        </Show>
      </Show>

      {/* Flat list view for docs teams */}
      <Show when={!isLive()}>
        <Show
          when={docsOptions().length > 0}
          fallback={
            <box padding={1}>
              <text fg={colors.fgDark}>No tasks found</text>
            </box>
          }
        >
          <select
            options={docsOptions()}
            focused={props.focused}
            backgroundColor={colors.bg}
            selectedBackgroundColor={colors.selection}
            selectedTextColor={colors.fg}
            textColor={colors.fgDark}
            descriptionColor={colors.fgMuted}
            width="100%"
            flexGrow={1}
            onSelect={(index: number) => props.onSelect(index)}
            onChange={(index: number) => props.onChange?.(index)}
          />
        </Show>
      </Show>
    </box>
  )
}
