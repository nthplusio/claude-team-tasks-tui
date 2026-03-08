import { watch } from "chokidar"
import { join, relative, sep } from "path"
import { parseProject } from "./project-parser"
import { updateProject, removeProject } from "./store"

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const pendingDirs = new Set<string>()

function getProjectDir(watchPath: string, changedPath: string): string | null {
  const rel = relative(watchPath, changedPath)
  const parts = rel.split(sep)
  if (parts.length >= 1 && parts[0] !== "." && parts[0] !== "..") {
    return parts[0]
  }
  return null
}

export function startProjectWatcher(projectsPath: string) {
  const watcher = watch(projectsPath, {
    ignoreInitial: true,
    depth: 3,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  })

  const scheduleUpdate = (filePath: string) => {
    const projectDir = getProjectDir(projectsPath, filePath)
    if (!projectDir) return

    pendingDirs.add(projectDir)

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const dirs = [...pendingDirs]
      pendingDirs.clear()

      for (const dir of dirs) {
        try {
          const project = await parseProject(join(projectsPath, dir))
          if (project) {
            updateProject(dir, project)
          }
        } catch {
          // Directory may have been deleted
        }
      }
    }, 200)
  }

  const handleUnlink = (filePath: string) => {
    // If project.json is deleted, remove the project
    if (filePath.endsWith("project.json")) {
      const projectDir = getProjectDir(projectsPath, filePath)
      if (projectDir) {
        removeProject(projectDir)
        return
      }
    }
    scheduleUpdate(filePath)
  }

  watcher.on("add", scheduleUpdate)
  watcher.on("change", scheduleUpdate)
  watcher.on("unlink", handleUnlink)

  return watcher
}
