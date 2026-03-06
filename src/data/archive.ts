import { mkdir, rename } from "node:fs/promises"
import { resolve, join } from "node:path"

export async function archiveDocsTeam(watchPath: string, dirName: string): Promise<void> {
  const archivePath = resolve(watchPath, "..", "teams-archived")
  await mkdir(archivePath, { recursive: true })
  await rename(join(watchPath, dirName), join(archivePath, dirName))
}
