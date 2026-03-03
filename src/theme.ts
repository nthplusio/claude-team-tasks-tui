import type { TeamType } from "./types"

// Tokyo Night palette
export const colors = {
  bg: "#1a1b26",
  bgDark: "#16161e",
  bgHighlight: "#292e42",
  fg: "#c0caf5",
  fgDark: "#565f89",
  fgMuted: "#545c7e",
  blue: "#7aa2f7",
  cyan: "#7dcfff",
  green: "#9ece6a",
  yellow: "#e0af68",
  orange: "#ff9e64",
  purple: "#bb9af7",
  red: "#f7768e",
  magenta: "#ff007c",
  white: "#c0caf5",
  border: "#3b4261",
  selection: "#283457",
} as const

export const teamTypeColors: Record<TeamType, string> = {
  review: colors.blue,
  feature: colors.green,
  planning: colors.yellow,
  research: colors.purple,
  brainstorm: colors.orange,
  unknown: colors.fgDark,
}

export function teamTypeLabel(type: TeamType): string {
  return type.toUpperCase()
}
