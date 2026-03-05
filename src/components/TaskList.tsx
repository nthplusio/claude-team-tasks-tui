import { createMemo, Show } from "solid-js"
import { state, getUnifiedTeams } from "../data/store"
import { colors, teamTypeColors, teamTypeLabel } from "../theme"
import type { LiveTask, UnifiedTeamEntry } from "../types"

/** Status badge for live tasks */
function statusBadge(status: LiveTask["status"]): string {
  switch (status) {
    case "in_progress": return "\u25B6"
    case "completed": return "\u2713"
    case "pending":
    default: return "\u25CF"
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

/** Build task description with owner and blocked indicator */
function liveTaskDesc(task: LiveTask): string {
  const owner = resolveOwner(task)
  const blockedTag = task.blockedBy.length > 0 ? " [BLOCKED]" : ""
  if (task.status === "in_progress" && task.activeForm) {
    return `${task.activeForm} | ${owner}${blockedTag}`
  }
  return `${owner}${blockedTag}`
}

/** Dim prefix for blocked tasks */
function liveTaskName(task: LiveTask): string {
  const badge = statusBadge(task.status)
  const dimPrefix = task.blockedBy.length > 0 && task.status === "pending" ? "~ " : ""
  return `${dimPrefix}${badge} ${task.subject}`
}

export function TaskList(props: { focused: boolean; onSelect: (index: number) => void; onChange?: (index: number) => void }) {
  const entry = createMemo((): UnifiedTeamEntry | undefined => {
    const unified = getUnifiedTeams()
    return unified[state.selectedTeamIndex]
  })

  const options = createMemo(() => {
    const e = entry()
    if (!e) return []

    if (e.kind === "live") {
      return e.team.tasks.map((task) => ({
        name: liveTaskName(task),
        description: liveTaskDesc(task),
      }))
    }

    return e.team.tasks.map((task) => ({
      name: task.title,
      description: task.owner || task.id,
    }))
  })

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
      return `LIVE | ${t.tasks.length} tasks | ${inProgress} active | ${completed} done`
    }
    const t = e.team
    return `${teamTypeLabel(t.meta.type)} | ${t.meta.topic || t.dir} | ${t.tasks.length} tasks`
  })

  const memberRoster = createMemo(() => {
    const e = entry()
    if (!e || e.kind !== "live" || !e.team.config) return ""
    return e.team.config.members.map((m) => m.name).join(" | ")
  })

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={props.focused ? colors.blue : colors.border}
      flexGrow={2}
      height="100%"
    >
      <box height={1} backgroundColor={colors.bgDark} padding={{ left: 1 }}>
        <text bold fg={headerColor()}>
          {headerName()}
        </text>
        <Show when={entry()?.kind === "live"}>
          <text bold fg={colors.green}>
            {" "}LIVE
          </text>
        </Show>
      </box>
      <box height={1} padding={{ left: 1 }}>
        <text fg={colors.fgMuted}>{headerText()}</text>
      </box>
      <Show when={memberRoster()}>
        <box height={1} padding={{ left: 1 }}>
          <text fg={colors.purple}>{memberRoster()}</text>
        </box>
      </Show>
      <Show
        when={options().length > 0}
        fallback={
          <box padding={1}>
            <text fg={colors.fgDark}>No tasks found</text>
          </box>
        }
      >
        <select
          options={options()}
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
    </box>
  )
}
