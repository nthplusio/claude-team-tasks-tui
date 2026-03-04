import { resolve } from "path"
import { render } from "@opentui/solid"
import { App } from "./src/App"
import { setWatchPath, setTeams } from "./src/data/store"
import { parseAllTeams } from "./src/data/parser"
import { startFileWatcher } from "./src/data/watcher"

const watchPath = resolve(process.argv[2] || "docs/teams")

// Load teams before render — @opentui/solid doesn't support onMount or reactive
// store updates after render(), so data must be set before render() is called
const teams = await parseAllTeams(watchPath)
setWatchPath(watchPath)
setTeams(teams)
startFileWatcher(watchPath)

render(() => <App watchPath={watchPath} />)
