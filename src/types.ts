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
  lastModified: number
}

// Live task monitoring types

export interface LiveTask {
  id: string
  subject: string
  description?: string
  activeForm?: string
  owner?: string
  status: "pending" | "in_progress" | "completed"
  blocks: string[]
  blockedBy: string[]
}

export interface TeamMember {
  name: string
  agentType: string
  model: string
  color: string
}

export interface TeamConfig {
  name: string
  description: string
  members: TeamMember[]
}

export interface LiveTeam {
  dirName: string
  displayName: string
  tasks: LiveTask[]
  config?: TeamConfig
  lastModified: number
}

// Unified team entry for merged list display
export type UnifiedTeamEntry =
  | { kind: "live"; team: LiveTeam }
  | { kind: "docs"; team: Team }

// Project pipeline types

export type StageStatus = "pending" | "in_progress" | "completed" | "skipped"

export interface ProjectStage {
  name: string
  status: StageStatus
  teamName?: string
  dir?: string
}

export interface Project {
  name: string
  description?: string
  status: string
  stages: ProjectStage[]
  stageOrder: string[]
  currentStage?: string
  dir: string
  lastModified: number
}

export type ViewMode = "teams" | "tasks" | "detail" | "projects" | "project-stages"

export interface AppState {
  teams: Team[]
  liveTeams: LiveTeam[]
  projects: Project[]
  selectedTeamIndex: number
  selectedTaskIndex: number
  selectedProjectIndex: number
  selectedStageIndex: number
  stageTeam: Team | null
  viewMode: ViewMode
  watchPath: string
  lastUpdate: Date | null
}
