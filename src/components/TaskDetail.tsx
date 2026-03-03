import { Show } from "solid-js"
import { selectedTask, selectedTeam } from "../data/store"
import { colors, teamTypeColors } from "../theme"

export function TaskDetail() {
  const task = selectedTask
  const team = selectedTeam

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={colors.blue}
      width="100%"
      flexGrow={1}
    >
      <box height={1} backgroundColor={colors.bgDark} padding={{ left: 1 }}>
        <text bold fg={teamTypeColors[team()?.meta.type || "unknown"]}>
          {task()?.title || "No task selected"}
        </text>
      </box>
      <Show
        when={task()}
        fallback={
          <box padding={1}>
            <text fg={colors.fgDark}>Select a task to view details</text>
          </box>
        }
      >
        <box padding={{ left: 1, right: 1 }}>
          <text fg={colors.fgMuted}>
            {task()!.filename}
            {task()!.owner ? ` | ${task()!.owner}` : ""}
            {task()!.date ? ` | ${task()!.date}` : ""}
          </text>
        </box>
        <scrollbox flexGrow={1} width="100%">
          <markdown>{task()!.content}</markdown>
        </scrollbox>
      </Show>
    </box>
  )
}
