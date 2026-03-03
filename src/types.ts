export type TeamType = "review" | "feature" | "planning" | "research" | "brainstorm" | "unknown"

export interface TeamMeta {
  team: string
  type: TeamType
  mode?: string
  topic?: string
  date?: string
  status?: string
  teammates?: number
  pipeline?: { from: string | null; to: string | null }
}

export interface TaskMeta {
  id: string
  title: string
  filename: string
  owner?: string
  date?: string
  content: string
}

export interface Team {
  dir: string
  meta: TeamMeta
  tasks: TaskMeta[]
}

export type ViewMode = "teams" | "tasks" | "detail"

export interface AppState {
  teams: Team[]
  selectedTeamIndex: number
  selectedTaskIndex: number
  viewMode: ViewMode
  watchPath: string
  lastUpdate: Date | null
}
