import { resolve } from "path"
import { render } from "@opentui/solid"
import { App } from "./src/App"
import { setWatchPath, setTeams, setLiveTeams, setProjects } from "./src/data/store"
import { parseAllTeams } from "./src/data/parser"
import { parseAllLiveTeams } from "./src/data/json-parser"
import { startFileWatcher } from "./src/data/watcher"
import { startJsonWatcher, setConfigCache } from "./src/data/json-watcher"
import { startProjectWatcher } from "./src/data/project-watcher"
import { parseAllProjects } from "./src/data/project-parser"
import { scanTeamConfigs, getTasksDir } from "./src/data/config-reader"

const watchPath = resolve(process.argv[2] || "docs/teams")
const projectsPath = resolve(watchPath, "..", "projects")
const tasksPath = getTasksDir()

// Load all data before render — @opentui/solid requires data set before render()
const [teams, configs, liveTeams, projects] = await Promise.all([
  parseAllTeams(watchPath),
  scanTeamConfigs(),
  parseAllLiveTeams(tasksPath),
  parseAllProjects(projectsPath),
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
setProjects(projects)
setConfigCache(configs)

startFileWatcher(watchPath)
startJsonWatcher(tasksPath)
startProjectWatcher(projectsPath)

render(() => <App watchPath={watchPath} projectsPath={projectsPath} />)
