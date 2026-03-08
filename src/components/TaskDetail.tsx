import { createMemo, Show, Switch, Match } from "solid-js"
import { state, getUnifiedTeams } from "../data/store"
import { colors, teamTypeColors } from "../theme"
import type { UnifiedTeamEntry, LiveTask, TaskMeta, TeamConfig } from "../types"

function statusLabel(status: LiveTask["status"]): string {
  switch (status) {
    case "in_progress": return "\uEB99 In Progress"   // nf-cod-robot
    case "completed": return "\uF058 Completed"       // nf-fa-check_circle
    case "pending":
    default: return "\uF252 Pending"                  // nf-fa-hourglass_half
  }
}

/** Resolve owner color from team config members */
function ownerColor(owner: string | undefined, config: TeamConfig | undefined): string {
  if (!owner || !config) return colors.fg
  const member = config.members.find((m) => m.name === owner)
  return member?.color || colors.fg
}

/** Format dependency list with resolved subjects */
function depStr(label: string, ids: string[], allTasks: LiveTask[]): string {
  if (ids.length === 0) return ""
  const resolved = ids.map((id) => {
    const dep = allTasks.find((t) => t.id === id)
    return dep ? `#${id} ${dep.subject}` : `#${id}`
  })
  return `${label}: ${resolved.join(", ")}`
}

export function TaskDetail() {
  const entry = createMemo((): UnifiedTeamEntry | undefined => {
    if (state.stageTeam) return { kind: "docs", team: state.stageTeam }
    const unified = getUnifiedTeams()
    return unified[state.selectedTeamIndex]
  })

  const liveTask = createMemo((): LiveTask | undefined => {
    const e = entry()
    if (!e || e.kind !== "live") return undefined
    return e.team.tasks[state.selectedTaskIndex]
  })

  const docsTask = createMemo((): TaskMeta | undefined => {
    const e = entry()
    if (!e || e.kind !== "docs") return undefined
    return e.team.tasks[state.selectedTaskIndex]
  })

  const teamConfig = createMemo((): TeamConfig | undefined => {
    const e = entry()
    if (!e || e.kind !== "live") return undefined
    return e.team.config
  })

  const headerColor = createMemo(() => {
    const e = entry()
    if (!e) return colors.fgDark
    if (e.kind === "live") return colors.green
    return teamTypeColors[e.team.meta.type || "unknown"]
  })

  const title = createMemo(() => {
    const lt = liveTask()
    if (lt) return lt.subject
    const dt = docsTask()
    if (dt) return dt.title
    return "No task selected"
  })

  const allTasks = createMemo((): LiveTask[] => {
    const e = entry()
    if (!e || e.kind !== "live") return []
    return e.team.tasks
  })

  const depsLine = createMemo(() => {
    const lt = liveTask()
    if (!lt) return ""
    const tasks = allTasks()
    const parts: string[] = []
    const blocksStr = depStr("Blocks", lt.blocks, tasks)
    const blockedByStr = depStr("Blocked by", lt.blockedBy, tasks)
    if (blocksStr) parts.push(blocksStr)
    if (blockedByStr) parts.push(blockedByStr)
    return parts.join(" | ")
  })

  const ownerFg = createMemo(() => {
    const lt = liveTask()
    return ownerColor(lt?.owner, teamConfig())
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
        <text bold fg={headerColor()}>
          {title()}
        </text>
      </box>
      <Switch>
        <Match when={liveTask()}>
          <box padding={{ left: 1, right: 1 }}>
            <text fg={colors.fgMuted}>
              {`${statusLabel(liveTask()!.status)}${liveTask()!.owner ? ` | ${liveTask()!.owner}` : ""} | #${liveTask()!.id}`}
            </text>
          </box>
          <Show when={liveTask()!.status === "in_progress" && liveTask()!.activeForm}>
            <box padding={{ left: 1, right: 1 }}>
              <text fg={colors.yellow}>
                {liveTask()!.activeForm}
              </text>
            </box>
          </Show>
          <Show when={depsLine()}>
            <box padding={{ left: 1, right: 1 }}>
              <text fg={colors.orange}>
                {depsLine()}
              </text>
            </box>
          </Show>
          <Show when={liveTask()!.description}>
            <scrollbox flexGrow={1} width="100%">
              <box padding={{ left: 1, right: 1 }}>
                <text fg={colors.fg}>{liveTask()!.description}</text>
              </box>
            </scrollbox>
          </Show>
          <Show when={!liveTask()!.description}>
            <box padding={1}>
              <text fg={colors.fgDark}>No description</text>
            </box>
          </Show>
        </Match>
        <Match when={docsTask()}>
          <box padding={{ left: 1, right: 1 }}>
            <text fg={colors.fgMuted}>
              {docsTask()!.filename}
              {docsTask()!.owner ? ` | ${docsTask()!.owner}` : ""}
              {docsTask()!.date ? ` | ${docsTask()!.date}` : ""}
            </text>
          </box>
          <scrollbox flexGrow={1} width="100%">
            <markdown>{docsTask()!.content}</markdown>
          </scrollbox>
        </Match>
        <Match when={true}>
          <box padding={1}>
            <text fg={colors.fgDark}>Select a task to view details</text>
          </box>
        </Match>
      </Switch>
    </box>
  )
}
