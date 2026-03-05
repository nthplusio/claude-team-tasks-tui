import { createMemo } from "solid-js"
import { state, getUnifiedTeams } from "../data/store"
import { colors, teamTypeLabel } from "../theme"
import type { UnifiedTeamEntry } from "../types"

function teamOptionName(entry: UnifiedTeamEntry): string {
  if (entry.kind === "live") {
    const t = entry.team
    const inProgress = t.tasks.filter((tk) => tk.status === "in_progress").length
    const completed = t.tasks.filter((tk) => tk.status === "completed").length
    const total = t.tasks.length
    const prefix = inProgress > 0 ? "\u25B6" : completed === total && total > 0 ? "\u2713" : "\u25CF"
    return `${prefix} ${t.displayName}`
  }
  const t = entry.team
  const icon = t.meta.status === "completed" ? "\u2713" : "\u25CB"
  return `${icon} ${t.dir}`
}

function teamOptionDesc(entry: UnifiedTeamEntry): string {
  if (entry.kind === "live") {
    const t = entry.team
    const inProgress = t.tasks.filter((tk) => tk.status === "in_progress").length
    const completed = t.tasks.filter((tk) => tk.status === "completed").length
    return `LIVE | ${t.tasks.length} tasks | ${inProgress} active | ${completed} done`
  }
  const t = entry.team
  return `${teamTypeLabel(t.meta.type)} | ${t.tasks.length} tasks`
}

export function TeamList(props: { focused: boolean; onSelect: (index: number) => void; onChange?: (index: number) => void }) {
  const unified = createMemo(() => getUnifiedTeams())

  const options = createMemo(() =>
    unified().map((entry) => ({
      name: teamOptionName(entry),
      description: teamOptionDesc(entry),
    }))
  )

  const hasLive = createMemo(() => state.liveTeams.length > 0)

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={props.focused ? colors.blue : colors.border}
      flexGrow={1}
      height="100%"
    >
      <box height={1} backgroundColor={colors.bgDark} padding={{ left: 1 }}>
        <text bold fg={colors.cyan}>
          Teams
        </text>
        {hasLive() && (
          <text bold fg={colors.green}>
            {" "}LIVE
          </text>
        )}
      </box>
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
    </box>
  )
}
