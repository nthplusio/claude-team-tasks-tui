import { resolve } from "path"
import { render } from "@opentui/solid"
import { App } from "./src/App"
import { setWatchPath, setTeams, setLiveTeams } from "./src/data/store"
import { parseAllTeams } from "./src/data/parser"
import { parseAllLiveTeams } from "./src/data/json-parser"
import { startFileWatcher } from "./src/data/watcher"
import { startJsonWatcher, setConfigCache } from "./src/data/json-watcher"
import { scanTeamConfigs, getTasksDir } from "./src/data/config-reader"

const watchPath = resolve(process.argv[2] || "docs/teams")
const tasksPath = getTasksDir()

// Load all data before render — @opentui/solid requires data set before render()
const [teams, configs, liveTeams] = await Promise.all([
  parseAllTeams(watchPath),
  scanTeamConfigs(),
  parseAllLiveTeams(tasksPath),
])

// Apply config display names to live teams
for (const lt of liveTeams) {
  const config = configs.get(lt.dirName)
  if (config) {
    lt.displayName = config.name
    lt.config = config
  }
}

setWatchPath(watchPath)
setTeams(teams)
setLiveTeams(liveTeams)
setConfigCache(configs)

startFileWatcher(watchPath)
startJsonWatcher(tasksPath)

render(() => <App watchPath={watchPath} />)
