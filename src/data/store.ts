import { createStore, produce } from "solid-js/store"
import { createMemo } from "solid-js"
import type { AppState, Team, ViewMode } from "../types"

const [state, setState] = createStore<AppState>({
  teams: [],
  selectedTeamIndex: 0,
  selectedTaskIndex: 0,
  viewMode: "teams",
  watchPath: "./docs/teams",
  lastUpdate: null,
})

export { state }

// Derived memos
export const selectedTeam = createMemo<Team | undefined>(() =>
  state.teams[state.selectedTeamIndex]
)

export const selectedTask = createMemo(() => {
  const team = selectedTeam()
  if (!team) return undefined
  return team.tasks[state.selectedTaskIndex]
})

export const teamCount = createMemo(() => state.teams.length)

// Actions
export function setTeams(teams: Team[]) {
  setState(
    produce((s) => {
      s.teams = teams
      s.lastUpdate = new Date()
      // Clamp indices
      if (s.selectedTeamIndex >= teams.length) {
        s.selectedTeamIndex = Math.max(0, teams.length - 1)
      }
      const team = teams[s.selectedTeamIndex]
      if (team && s.selectedTaskIndex >= team.tasks.length) {
        s.selectedTaskIndex = Math.max(0, team.tasks.length - 1)
      }
    })
  )
}

export function updateTeam(dirName: string, team: Team) {
  setState(
    produce((s) => {
      const idx = s.teams.findIndex((t) => t.dir === dirName)
      if (idx >= 0) {
        s.teams[idx] = team
      } else {
        s.teams.push(team)
        s.teams.sort((a, b) =>
          a.dir.localeCompare(b.dir, undefined, { numeric: true, sensitivity: "base" })
        )
      }
      s.lastUpdate = new Date()
    })
  )
}

export function setWatchPath(path: string) {
  setState("watchPath", path)
}

export function selectTeam(index: number) {
  setState(
    produce((s) => {
      s.selectedTeamIndex = Math.max(0, Math.min(index, s.teams.length - 1))
      s.selectedTaskIndex = 0
    })
  )
}

export function selectTask(index: number) {
  const team = selectedTeam()
  if (!team) return
  setState("selectedTaskIndex", Math.max(0, Math.min(index, team.tasks.length - 1)))
}

export function setViewMode(mode: ViewMode) {
  setState("viewMode", mode)
}

export function navigateBack() {
  if (state.viewMode === "detail") {
    setState("viewMode", "tasks")
  } else if (state.viewMode === "tasks") {
    setState("viewMode", "teams")
    setState("selectedTaskIndex", 0)
  }
}

export function navigateForward() {
  if (state.viewMode === "teams") {
    setState("viewMode", "tasks")
    setState("selectedTaskIndex", 0)
  } else if (state.viewMode === "tasks") {
    setState("viewMode", "detail")
  }
}
