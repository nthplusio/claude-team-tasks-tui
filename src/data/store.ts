import { createStore, produce } from "solid-js/store"
import type { AppState, Team, LiveTeam, TeamConfig, LiveTask, UnifiedTeamEntry, ViewMode } from "../types"

const [state, setState] = createStore<AppState>({
  teams: [],
  liveTeams: [],
  selectedTeamIndex: 0,
  selectedTaskIndex: 0,
  viewMode: "teams",
  watchPath: "./docs/teams",
  lastUpdate: null,
})

export { state }

// Actions
export function setTeams(teams: Team[]) {
  setState("teams", teams)
  setState("lastUpdate", new Date())
  if (state.selectedTeamIndex >= teams.length) {
    setState("selectedTeamIndex", Math.max(0, teams.length - 1))
  }
  const team = teams[state.selectedTeamIndex]
  if (team && state.selectedTaskIndex >= team.tasks.length) {
    setState("selectedTaskIndex", Math.max(0, team.tasks.length - 1))
  }
}

export function updateTeam(dirName: string, team: Team) {
  setState(
    produce((s) => {
      const idx = s.teams.findIndex((t) => t.dir === dirName)
      team.lastModified = Date.now()
      if (idx >= 0) {
        s.teams[idx] = team
      } else {
        s.teams.push(team)
      }
      s.lastUpdate = new Date()
    })
  )
}

export function setWatchPath(path: string) {
  setState("watchPath", path)
}

/** Build unified team list sorted by most recently modified */
export function getUnifiedTeams(): UnifiedTeamEntry[] {
  const entries: UnifiedTeamEntry[] = []
  for (const lt of state.liveTeams) {
    entries.push({ kind: "live", team: lt })
  }
  for (const dt of state.teams) {
    entries.push({ kind: "docs", team: dt })
  }
  entries.sort((a, b) => {
    const aTime = a.kind === "live" ? a.team.lastModified : a.team.lastModified
    const bTime = b.kind === "live" ? b.team.lastModified : b.team.lastModified
    return bTime - aTime
  })
  return entries
}

export function selectTeam(index: number) {
  const totalTeams = state.liveTeams.length + state.teams.length
  setState(
    produce((s) => {
      s.selectedTeamIndex = Math.max(0, Math.min(index, totalTeams - 1))
      s.selectedTaskIndex = 0
    })
  )
}

export function selectTask(index: number) {
  const unified = getUnifiedTeams()
  const entry = unified[state.selectedTeamIndex]
  if (!entry) return
  const taskCount = entry.kind === "live" ? entry.team.tasks.length : entry.team.tasks.length
  setState("selectedTaskIndex", Math.max(0, Math.min(index, taskCount - 1)))
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

// Live task store actions

export function setLiveTeams(liveTeams: LiveTeam[]) {
  setState("liveTeams", liveTeams)
  setState("lastUpdate", new Date())
}

export function updateLiveTeam(dirName: string, tasks: LiveTask[], displayName: string, config?: TeamConfig) {
  setState(
    produce((s) => {
      const idx = s.liveTeams.findIndex((t) => t.dirName === dirName)
      const team: LiveTeam = { dirName, displayName, tasks, config, lastModified: Date.now() }
      if (idx >= 0) {
        s.liveTeams[idx] = team
      } else {
        s.liveTeams.push(team)
      }
      s.lastUpdate = new Date()
    })
  )
}

export function removeLiveTeam(dirName: string) {
  setState(
    produce((s) => {
      const idx = s.liveTeams.findIndex((t) => t.dirName === dirName)
      if (idx >= 0) {
        s.liveTeams.splice(idx, 1)
        s.lastUpdate = new Date()
      }
    })
  )
}

export function removeTeam(dirName: string) {
  setState(
    produce((s) => {
      const idx = s.teams.findIndex((t) => t.dir === dirName)
      if (idx >= 0) {
        s.teams.splice(idx, 1)
        s.lastUpdate = new Date()
        const total = s.teams.length + s.liveTeams.length
        if (s.selectedTeamIndex >= total) {
          s.selectedTeamIndex = Math.max(0, total - 1)
        }
      }
    })
  )
}
