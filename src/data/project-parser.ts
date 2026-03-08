import { readdir, readFile, stat } from "fs/promises"
import { join, basename } from "path"
import type { Project, ProjectStage, StageStatus } from "../types"

interface ProjectConfig {
  name?: string
  description?: string
  status?: string
  stages?: Record<string, { status?: StageStatus; teamName?: string }>
  stageOrder?: string[]
}

async function getDirMtime(dirPath: string): Promise<number> {
  try {
    const s = await stat(dirPath)
    return s.mtimeMs
  } catch { return 0 }
}

export async function parseProject(dirPath: string): Promise<Project | null> {
  const dirName = basename(dirPath)
  try {
    const configPath = join(dirPath, "project.json")
    const raw = await readFile(configPath, "utf-8")
    const config: ProjectConfig = JSON.parse(raw)

    const name = config.name || dirName
    const stageOrder = config.stageOrder || Object.keys(config.stages || {})
    const stagesConfig = config.stages || {}

    // Check which stage dirs actually exist
    let existingDirs: Set<string>
    try {
      const entries = await readdir(dirPath, { withFileTypes: true })
      existingDirs = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name))
    } catch {
      existingDirs = new Set()
    }

    const stages: ProjectStage[] = stageOrder.map((stageName) => {
      const stageConf = stagesConfig[stageName]
      return {
        name: stageName,
        status: stageConf?.status || (existingDirs.has(stageName) ? "completed" : "pending"),
        teamName: stageConf?.teamName,
        dir: existingDirs.has(stageName) ? join(dirPath, stageName) : undefined,
      }
    })

    // Determine current stage — first non-completed, non-skipped
    const currentStage = stages.find((s) => s.status === "in_progress")?.name
      || stages.find((s) => s.status === "pending")?.name

    const lastModified = await getDirMtime(join(dirPath, "project.json"))

    return {
      name,
      description: config.description,
      status: config.status || "active",
      stages,
      stageOrder,
      currentStage,
      dir: dirName,
      lastModified,
    }
  } catch {
    return null
  }
}

export async function parseAllProjects(projectsPath: string): Promise<Project[]> {
  try {
    const entries = await readdir(projectsPath, { withFileTypes: true })
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

    const results = await Promise.all(
      dirs.map((d) => parseProject(join(projectsPath, d)))
    )
    return results.filter((p): p is Project => p !== null)
      .sort((a, b) => b.lastModified - a.lastModified)
  } catch {
    return []
  }
}
