import { createMemo, Show } from "solid-js"
import { state } from "../data/store"
import { colors, teamTypeColors } from "../theme"

export function TaskDetail() {
  const team = createMemo(() => state.teams[state.selectedTeamIndex])
  const task = createMemo(() => {
    const t = team()
    if (!t) return undefined
    return t.tasks[state.selectedTaskIndex]
  })

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
