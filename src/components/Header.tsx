import { colors } from "../theme"

export function Header() {
  return (
    <box
      width="100%"
      height={3}
      borderStyle="single"
      borderColor={colors.border}
      backgroundColor={colors.bgDark}
      justifyContent="center"
      alignItems="center"
    >
      <text bold fg={colors.blue}>
        TEAM TASKS TUI
      </text>
    </box>
  )
}
