import { render } from "@opentui/solid"
import { App } from "./src/App"

const watchPath = process.argv[2] || "./docs/teams"

render(() => <App watchPath={watchPath} />)
