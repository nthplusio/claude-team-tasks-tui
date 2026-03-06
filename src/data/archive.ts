import { mkdir, cp, rm } from "node:fs/promises"
import { resolve, join } from "node:path"

export async function archiveDocsTeam(watchPath: string, dirName: string): Promise<void> {
  const archivePath = resolve(watchPath, "..", "teams-archived")
  await mkdir(archivePath, { recursive: true })
  const src = join(watchPath, dirName)
  const dest = join(archivePath, dirName)
  await cp(src, dest, { recursive: true })
  await rm(src, { recursive: true, force: true })
}
