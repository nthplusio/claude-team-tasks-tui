import { createMemo } from "solid-js"
import { state } from "../data/store"
import { colors } from "../theme"
import type { ProjectStage, StageStatus } from "../types"

function stageIcon(status: StageStatus): string {
  switch (status) {
    case "completed": return "\uF058"    // nf-fa-check_circle
    case "in_progress": return "\uEB99"  // nf-cod-robot
    case "skipped": return "\uF00D"      // nf-fa-times
    case "pending":
    default: return "\uF252"             // nf-fa-hourglass_half
  }
}

function stageOptionName(stage: ProjectStage): string {
  return `${stageIcon(stage.status)} ${stage.name}`
}

function stageOptionDesc(stage: ProjectStage): string {
  const parts: string[] = [stage.status]
  if (stage.teamName) parts.push(stage.teamName)
  return parts.join(" | ")
}

export function StageList(props: { focused: boolean; onSelect: (index: number) => void; onChange?: (index: number) => void }) {
  const project = createMemo(() => state.projects[state.selectedProjectIndex])

  const options = createMemo(() => {
    const p = project()
    if (!p) return []
    return p.stages.map((stage) => ({
      name: stageOptionName(stage),
      description: stageOptionDesc(stage),
    }))
  })

  const headerText = createMemo(() => {
    const p = project()
    if (!p) return "No project selected"
    const desc = p.description ? ` — ${p.description}` : ""
    return `${p.stages.length} stages${desc}`
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
        <text bold fg={colors.purple}>
          {project()?.name || "Stages"}
        </text>
      </box>
      <box height={1} padding={{ left: 1 }}>
        <text fg={colors.fgMuted}>{headerText()}</text>
      </box>
      {options().length > 0 ? (
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
      ) : (
        <box padding={1}>
          <text fg={colors.fgDark}>No stages</text>
        </box>
      )}
    </box>
  )
}
