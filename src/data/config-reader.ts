import { readdir, readFile } from "fs/promises"
import { join } from "path"
import { homedir } from "os"
import type { TeamConfig, TeamMember } from "../types"

function asString(val: unknown): string | undefined {
  return typeof val === "string" ? val : undefined
}

function parseMember(m: unknown): TeamMember | null {
  if (typeof m !== "object" || m === null) return null
  const obj = m as Record<string, unknown>
  const name = asString(obj.name)
  if (!name) return null
  return {
    name,
    agentType: asString(obj.agentType) || "unknown",
    model: asString(obj.model) || "unknown",
    color: asString(obj.color) || "white",
  }
}

function parseConfig(raw: string): TeamConfig | null {
  try {
    const data = JSON.parse(raw)
    if (typeof data !== "object" || data === null) return null
    const name = asString(data.name)
    if (!name) return null

    const members: TeamMember[] = []
    if (Array.isArray(data.members)) {
      for (const m of data.members) {
        const parsed = parseMember(m)
        if (parsed) members.push(parsed)
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

export function getTeamsDir(): string {
  return join(homedir(), ".claude", "teams")
}

export function getTasksDir(): string {
  return join(homedir(), ".claude", "tasks")
}

/**
 * Scan ~/.claude/teams/\*\/config.json and return a map keyed by BOTH
 * the directory name and config.name, so lookups work for UUID and named dirs.
 */
export async function scanTeamConfigs(): Promise<Map<string, TeamConfig>> {
  const configs = new Map<string, TeamConfig>()
  const teamsDir = getTeamsDir()

  try {
    const entries = await readdir(teamsDir, { withFileTypes: true })
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

    await Promise.all(
      dirs.map(async (dirName) => {
        try {
          const raw = await readFile(join(teamsDir, dirName, "config.json"), "utf-8")
          const config = parseConfig(raw)
          if (config) {
            configs.set(dirName, config)
            if (config.name !== dirName) {
              configs.set(config.name, config)
            }
          }
        } catch {
          // No config.json or unreadable — skip
        }
      })
    )
  } catch {
    // ~/.claude/teams/ doesn't exist — no configs
  }

  return configs
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUUID(s: string): boolean {
  return UUID_RE.test(s)
}

/**
 * Resolve a task directory name to a display name.
 * Named dirs (e.g. "feature-live-task-monitor") use the config name or dir name.
 * UUID dirs show first 8 chars.
 */
export function resolveDisplayName(dirName: string, configs: Map<string, TeamConfig>): string {
  const config = configs.get(dirName)
  if (config) return config.name

  if (isUUID(dirName)) return dirName.slice(0, 8)
  return dirName
}
