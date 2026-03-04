import { createMemo } from "solid-js"
import { basename } from "path"
import { state } from "../data/store"
import { colors } from "../theme"

export function StatusBar() {
  const timeStr = createMemo(() => {
    const d = state.lastUpdate
    if (!d) return "\u2014"
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  })

  const shortPath = createMemo(() => {
    const p = state.watchPath
    // Show last two path segments for context
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
        {shortPath()} | Teams: {state.teams.length} | Updated: {timeStr()}
      </text>
    </box>
  )
}
