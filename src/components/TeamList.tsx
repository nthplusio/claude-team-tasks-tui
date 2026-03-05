import { createMemo } from "solid-js"
import { state } from "../data/store"
import { colors } from "../theme"
import { teamTypeLabel } from "../theme"

function statusIcon(status?: string): string {
  if (status === "completed") return "\u2713"
  return "\u25CB"
}

export function TeamList(props: { focused: boolean; onSelect: (index: number) => void }) {
  const options = createMemo(() =>
    state.teams.map((team) => ({
      name: `${statusIcon(team.meta.status)} ${team.dir}`,
      description: `${teamTypeLabel(team.meta.type)} | ${team.tasks.length} tasks`,
    }))
  )

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
      />
    </box>
  )
}
