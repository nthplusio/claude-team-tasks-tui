import { createMemo, Show } from "solid-js"
import { state } from "../data/store"
import { colors, teamTypeColors, teamTypeLabel } from "../theme"

export function TaskList(props: { focused: boolean; onSelect: (index: number) => void }) {
  const team = createMemo(() => state.teams[state.selectedTeamIndex])

  const options = createMemo(() => {
    const t = team()
    if (!t) return []
    return t.tasks.map((task) => ({
      name: task.title,
      description: task.owner || task.id,
    }))
  })

  const headerText = createMemo(() => {
    const t = team()
    if (!t) return "No team selected"
    return `${teamTypeLabel(t.meta.type)} | ${t.meta.topic || t.dir} | ${t.tasks.length} tasks`
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
        <text bold fg={teamTypeColors[team()?.meta.type || "unknown"]}>
          {team()?.dir || "\u2014"}
        </text>
      </box>
      <box height={1} padding={{ left: 1 }}>
        <text fg={colors.fgMuted}>{headerText()}</text>
      </box>
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
          on:itemSelected={(index: number) => props.onSelect(index)}
        />
      </Show>
    </box>
  )
}
