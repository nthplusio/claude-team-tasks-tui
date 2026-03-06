import { createMemo } from "solid-js"
import { state, getUnifiedTeams } from "../data/store"
import { colors } from "../theme"

export function StatusBar(props: { lastKey?: string; panelFocus?: string }) {
  const timeStr = createMemo(() => {
    const d = state.lastUpdate
    if (!d) return "\u2014"
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  })

  const shortPath = createMemo(() => {
    const p = state.watchPath
    const parts = p.split("/").filter(Boolean)
    if (parts.length <= 2) return p
    return ".../" + parts.slice(-2).join("/")
  })

  return (
    <box
      width="100%"
      height={1}
      backgroundColor={colors.bgDark}
      flexDirection="row"
      padding={{ left: 1, right: 1 }}
    >
      <text fg={colors.fgMuted}>
        {shortPath()} | {state.teams.length + state.liveTeams.length} teams{state.liveTeams.length > 0 ? ` (${state.liveTeams.length} live)` : ""} | {timeStr()} | focus:{props.panelFocus || "?"} | {props.lastKey || "j/k:nav enter:select q:quit"}{(() => { const entry = getUnifiedTeams()[state.selectedTeamIndex]; return entry?.kind === "docs" ? " \uF187 a:archive" : ""; })()}
      </text>
    </box>
  )
}
