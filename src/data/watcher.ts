import { watch } from "chokidar"
import { join, relative, sep } from "path"
import { parseTeam, parseAllTeams } from "./parser"
import { setTeams, updateTeam } from "./store"

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const pendingDirs = new Set<string>()

function getTeamDir(watchPath: string, changedPath: string): string | null {
  const rel = relative(watchPath, changedPath)
  const parts = rel.split(sep)
  // First segment is the team directory name
  if (parts.length >= 1 && parts[0] !== "." && parts[0] !== "..") {
    return parts[0]
  }
  return null
}

export async function startWatcher(watchPath: string) {
  // Initial load
  const teams = await parseAllTeams(watchPath)
  setTeams(teams)

  // Watch for changes
  const watcher = watch(watchPath, {
    ignoreInitial: true,
    depth: 3,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  })

  const scheduleUpdate = (filePath: string) => {
    // Only care about .md files
    if (!filePath.endsWith(".md")) return

    const teamDir = getTeamDir(watchPath, filePath)
    if (!teamDir) return

    pendingDirs.add(teamDir)

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const dirs = [...pendingDirs]
      pendingDirs.clear()

      for (const dir of dirs) {
        try {
          const team = await parseTeam(join(watchPath, dir))
          updateTeam(dir, team)
        } catch {
          // Directory may have been deleted
        }
      }
    }, 200)
  }

  watcher.on("add", scheduleUpdate)
  watcher.on("change", scheduleUpdate)
  watcher.on("unlink", scheduleUpdate)

  return watcher
}
