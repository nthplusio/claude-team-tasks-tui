import { watch } from "chokidar"
import { join, relative, sep } from "path"
import { mkdir } from "fs/promises"
import { parseTeamTasks, isUUID } from "./json-parser"
import { scanTeamConfigs, resolveDisplayName } from "./config-reader"
import { updateLiveTeam } from "./store"
import type { TeamConfig } from "../types"

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const pendingDirs = new Set<string>()
let configCache: Map<string, TeamConfig> = new Map()

function getTeamDir(watchPath: string, changedPath: string): string | null {
  const rel = relative(watchPath, changedPath)
  const parts = rel.split(sep)
  // Expect {teamDir}/{N}.json — need at least 2 parts
  if (parts.length >= 2 && parts[0] !== "." && parts[0] !== "..") {
    return parts[0]
  }
  return null
}

const IGNORED_EXTENSIONS = new Set([".lock", ".highwatermark"])

function shouldIgnore(filePath: string): boolean {
  for (const ext of IGNORED_EXTENSIONS) {
    if (filePath.endsWith(ext)) return true
  }
  return !filePath.endsWith(".json")
}

export function setConfigCache(configs: Map<string, TeamConfig>) {
  configCache = configs
}

export async function startJsonWatcher(tasksPath: string) {
  await mkdir(tasksPath, { recursive: true })

  const watcher = watch(tasksPath, {
    ignoreInitial: true,
    depth: 1,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  })

  const scheduleUpdate = (filePath: string) => {
    if (shouldIgnore(filePath)) return

    const teamDir = getTeamDir(tasksPath, filePath)
    if (!teamDir || isUUID(teamDir)) return

    pendingDirs.add(teamDir)

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const dirs = [...pendingDirs]
      pendingDirs.clear()

      for (const dir of dirs) {
        try {
          const tasks = await parseTeamTasks(join(tasksPath, dir))
          const displayName = resolveDisplayName(dir, configCache)
          const config = configCache.get(dir)
          updateLiveTeam(dir, tasks, displayName, config)
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
