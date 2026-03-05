import { readFile, readdir, mkdir } from "fs/promises"
import { join, basename } from "path"
import type { LiveTask, LiveTeam, TeamConfig, TeamMember } from "../types"

const VALID_STATUSES = new Set(["pending", "in_progress", "completed"])

function asString(val: unknown): string | undefined {
  return typeof val === "string" ? val : undefined
}

function asStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.filter((v) => typeof v === "string")
}

export function parseJsonTask(raw: string, fileId: string): LiveTask | null {
  try {
    const data = JSON.parse(raw)
    if (typeof data !== "object" || data === null) return null

    const subject = asString(data.subject)
    if (!subject) return null

    const status = VALID_STATUSES.has(data.status) ? data.status : "pending"

    return {
      id: asString(data.id) || fileId,
      subject,
      description: asString(data.description),
      activeForm: asString(data.activeForm),
      owner: asString(data.owner),
      status,
      blocks: asStringArray(data.blocks),
      blockedBy: asStringArray(data.blockedBy),
    }
  } catch {
    return null
  }
}

export async function parseTaskFile(filePath: string): Promise<LiveTask | null> {
  try {
    const raw = await readFile(filePath, "utf-8")
    const fileId = basename(filePath, ".json")
    return parseJsonTask(raw, fileId)
  } catch {
    return null
  }
}

function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
}

export async function parseTeamTasks(teamDirPath: string): Promise<LiveTask[]> {
  try {
    const entries = await readdir(teamDirPath)
    const jsonFiles = entries.filter((f) => f.endsWith(".json")).sort(naturalSort)

    const results = await Promise.all(
      jsonFiles.map((f) => parseTaskFile(join(teamDirPath, f)))
    )
    return results.filter((t): t is LiveTask => t !== null)
  } catch {
    return []
  }
}

export function parseTeamConfig(raw: string): TeamConfig | null {
  try {
    const data = JSON.parse(raw)
    if (typeof data !== "object" || data === null) return null

    const name = asString(data.name)
    if (!name) return null

    const members: TeamMember[] = []
    if (Array.isArray(data.members)) {
      for (const m of data.members) {
        if (typeof m !== "object" || m === null) continue
        const mName = asString(m.name)
        if (!mName) continue
        members.push({
          name: mName,
          agentType: asString(m.agentType) || "unknown",
          model: asString(m.model) || "unknown",
          color: asString(m.color) || "white",
        })
      }
    }

    return {
      name,
      description: asString(data.description) || "",
      members,
    }
  } catch {
    return null
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUUID(s: string): boolean {
  return UUID_RE.test(s)
}

export function shortUUID(s: string): string {
  return s.slice(0, 8)
}

export async function parseAllLiveTeams(tasksPath: string): Promise<LiveTeam[]> {
  await mkdir(tasksPath, { recursive: true })
  const entries = await readdir(tasksPath, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort(naturalSort)

  const teams = await Promise.all(
    dirs.map(async (dirName): Promise<LiveTeam> => {
      const tasks = await parseTeamTasks(join(tasksPath, dirName))
      return {
        dirName,
        displayName: isUUID(dirName) ? shortUUID(dirName) : dirName,
        tasks,
      }
    })
  )
  return teams
}
