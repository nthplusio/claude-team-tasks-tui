import { createMemo } from "solid-js"
import { state } from "../data/store"
import { colors } from "../theme"
import type { Project } from "../types"

function statusIcon(status: string): string {
  switch (status) {
    case "completed": return "\uF058"    // nf-fa-check_circle
    case "active": return "\uEB99"       // nf-cod-robot
    case "paused": return "\uF04C"       // nf-fa-pause
    default: return "\uF114"             // nf-fa-folder_o
  }
}

function progressBar(project: Project): string {
  const total = project.stages.length
  if (total === 0) return ""
  const done = project.stages.filter((s) => s.status === "completed").length
  const filled = Math.round((done / total) * 6)
  const empty = 6 - filled
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${done}/${total}`
}

function projectOptionName(project: Project): string {
  return `${statusIcon(project.status)} ${project.name}`
}

function projectOptionDesc(project: Project): string {
  const bar = progressBar(project)
  const current = project.currentStage ? `→ ${project.currentStage}` : "done"
  return `${bar} ${current}`
}

export function ProjectList(props: { focused: boolean; onSelect: (index: number) => void; onChange?: (index: number) => void }) {
  const options = createMemo(() =>
    state.projects.map((project) => ({
      name: projectOptionName(project),
      description: projectOptionDesc(project),
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
        <text bold fg={colors.purple}>
          Projects
        </text>
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
          <text fg={colors.fgDark}>No projects found</text>
        </box>
      )}
    </box>
  )
}
