import { readdir, readFile, mkdir, stat } from "fs/promises"
import { join, basename } from "path"
import matter from "gray-matter"
import type { Team, TeamMeta, TeamType, TaskMeta } from "../types"

const TYPE_PREFIXES: [string, TeamType][] = [
  ["review", "review"],
  ["feature", "feature"],
  ["plan", "planning"],
  ["research", "research"],
  ["brainstorm", "brainstorm"],
]

function inferType(dirName: string): TeamType {
  for (const [prefix, type] of TYPE_PREFIXES) {
    if (dirName.startsWith(prefix)) return type
  }
  return "unknown"
}

function formatDate(val: unknown): string | undefined {
  if (!val) return undefined
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  return String(val)
}

function normalizeMode(mode: unknown): string | undefined {
  if (typeof mode !== "string") return undefined
  // em-dash "—" means unset
  if (mode === "—" || mode === "\u2014") return undefined
  return mode
}

function extractTitleFromContent(content: string, filename: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  if (match) return match[1].trim()
  // Fall back to filename without extension
  return basename(filename, ".md").replace(/-/g, " ")
}

function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
}

async function parseReadme(dirPath: string, dirName: string): Promise<TeamMeta> {
  try {
    const readmePath = join(dirPath, "README.md")
    const raw = await readFile(readmePath, "utf-8")
    const { data } = matter(raw)

    return {
      team: (data.team as string) || dirName,
      type: (data.type as TeamType) || inferType(dirName),
      mode: normalizeMode(data.mode),
      topic: data.topic as string | undefined,
      date: formatDate(data.date),
      status: data.status as string | undefined,
      teammates: data.teammates as number | undefined,
      pipeline: data.pipeline as { from: string | null; to: string | null } | undefined,
    }
  } catch {
    // No README.md — derive metadata from directory name
    return {
      team: dirName,
      type: inferType(dirName),
    }
  }
}

async function parseTask(filePath: string): Promise<TaskMeta> {
  const filename = basename(filePath, ".md")
  const raw = await readFile(filePath, "utf-8")
  const { data, content } = matter(raw)

  const title = (data.title as string) || extractTitleFromContent(raw, filePath)

  return {
    id: filename,
    title,
    filename: basename(filePath),
    owner: data.owner as string | undefined,
    date: formatDate(data.date),
    content,
  }
}

async function parseTasks(dirPath: string): Promise<TaskMeta[]> {
  const tasksDir = join(dirPath, "tasks")
  try {
    const entries = await readdir(tasksDir)
    const mdFiles = entries.filter((f) => f.endsWith(".md")).sort(naturalSort)

    const tasks = await Promise.all(
      mdFiles.map((f) => parseTask(join(tasksDir, f)))
    )
    return tasks
  } catch {
    return []
  }
}

async function getDirMtime(dirPath: string): Promise<number> {
  try {
    const s = await stat(dirPath)
    return s.mtimeMs
  } catch { return 0 }
}

export async function parseTeam(dirPath: string): Promise<Team> {
  const dirName = basename(dirPath)
  const [meta, tasks, lastModified] = await Promise.all([
    parseReadme(dirPath, dirName),
    parseTasks(dirPath),
    getDirMtime(dirPath),
  ])

  return { dir: dirName, meta, tasks, lastModified }
}

export async function parseAllTeams(watchPath: string): Promise<Team[]> {
  await mkdir(watchPath, { recursive: true })
  const entries = await readdir(watchPath, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

  const teams = await Promise.all(
    dirs.map((d) => parseTeam(join(watchPath, d)))
  )
  // Sort by most recent first
  return teams.sort((a, b) => b.lastModified - a.lastModified)
}
