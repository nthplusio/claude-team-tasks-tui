import { createSignal, createMemo, Switch, Match, Show } from "solid-js"
import { useKeyboard, useTerminalDimensions, useRenderer } from "@opentui/solid"
import { Header } from "./components/Header"
import { TeamList } from "./components/TeamList"
import { TaskList } from "./components/TaskList"
import { TaskDetail } from "./components/TaskDetail"
import { StatusBar } from "./components/StatusBar"
import { colors } from "./theme"
import {
  state,
  selectTeam,
  selectTask,
  setViewMode,
  getUnifiedTeams,
  removeTeam,
} from "./data/store"
import { archiveDocsTeam } from "./data/archive"

export function App(props: { watchPath: string }) {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()
  const isWide = createMemo(() => dimensions().width >= 80)

  const [panelFocus, setPanelFocus] = createSignal<"left" | "right">("left")
  const [lastKey, setLastKey] = createSignal("")
  const [archiveConfirm, setArchiveConfirm] = createSignal<string | null>(null)

  // Update task panel preview as user navigates teams
  function handleTeamChange(index: number) {
    setLastKey(`onChange:team[${index}]`)
    selectTeam(index)
  }

  // Handle team selection (Enter) from the select component
  function handleTeamSelect(index: number) {
    setLastKey(`select:team[${index}]`)
    selectTeam(index)
    if (isWide()) {
      setPanelFocus("right")
    } else {
      setViewMode("tasks")
    }
  }

  // Update selected task as user navigates
  function handleTaskChange(index: number) {
    setLastKey(`onChange:task[${index}]`)
    selectTask(index)
  }

  // Handle task selection (Enter) from the select component
  function handleTaskSelect(index: number) {
    setLastKey(`select:task[${index}]`)
    selectTask(index)
    setViewMode("detail")
  }

  useKeyboard((key) => {
    setLastKey(`key:${key.name}`)

    // Archive confirmation mode
    const confirming = archiveConfirm()
    if (confirming) {
      if (key.name === "y") {
        const dir = confirming
        setArchiveConfirm(null)
        archiveDocsTeam(state.watchPath, dir).then(() => removeTeam(dir))
      } else if (key.name === "n" || key.name === "escape") {
        setArchiveConfirm(null)
      }
      return
    }

    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      renderer.destroy()
      process.exit(0)
    }

    if (key.name === "a") {
      const unified = getUnifiedTeams()
      const entry = unified[state.selectedTeamIndex]
      if (entry && entry.kind === "docs") {
        setArchiveConfirm(entry.team.dir)
      }
    }

    if (key.name === "escape") {
      if (state.viewMode === "detail") {
        setViewMode("tasks")
        if (isWide()) setPanelFocus("right")
      } else if (state.viewMode === "tasks" && !isWide()) {
        setViewMode("teams")
      } else if (isWide() && panelFocus() === "right") {
        setPanelFocus("left")
      }
    }

    if (key.name === "tab") {
      if (isWide() && state.viewMode !== "detail") {
        setPanelFocus((f) => (f === "left" ? "right" : "left"))
      }
    }
  })

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      backgroundColor={colors.bg}
    >
      <Header />

      <Switch>
        <Match when={state.viewMode === "detail"}>
          <TaskDetail />
        </Match>
        <Match when={isWide()}>
          <box flexDirection="row" flexGrow={1}>
            <box width="30%">
              <TeamList focused={panelFocus() === "left"} onSelect={handleTeamSelect} onChange={handleTeamChange} />
            </box>
            <box flexGrow={1}>
              <TaskList focused={panelFocus() === "right"} onSelect={handleTaskSelect} onChange={handleTaskChange} />
            </box>
          </box>
        </Match>
        <Match when={state.viewMode === "tasks"}>
          <TaskList focused={true} onSelect={handleTaskSelect} onChange={handleTaskChange} />
        </Match>
        <Match when={state.viewMode === "teams"}>
          <TeamList focused={true} onSelect={handleTeamSelect} onChange={handleTeamChange} />
        </Match>
      </Switch>

      <Show when={archiveConfirm()}>
        {(dir) => (
          <box width="100%" height={1} backgroundColor={colors.bgDark} padding={{ left: 1, right: 1 }}>
            <text fg={colors.yellow}>Archive {dir()}? (y/n)</text>
          </box>
        )}
      </Show>
      <StatusBar lastKey={lastKey()} panelFocus={panelFocus()} />
    </box>
  )
}
