import { createSignal, createMemo, Show, onMount, onCleanup } from "solid-js"
import { useKeyboard, useTerminalDimensions } from "@opentui/solid"
import { Header } from "./components/Header"
import { TeamList } from "./components/TeamList"
import { TaskList } from "./components/TaskList"
import { TaskDetail } from "./components/TaskDetail"
import { StatusBar } from "./components/StatusBar"
import { colors } from "./theme"
import {
  state,
  setWatchPath,
  selectTeam,
  selectTask,
  setViewMode,
  navigateBack,
} from "./data/store"
import { startWatcher } from "./data/watcher"

export function App(props: { watchPath: string }) {
  const dimensions = useTerminalDimensions()
  const isWide = createMemo(() => dimensions().width >= 80)

  const [panelFocus, setPanelFocus] = createSignal<"left" | "right">("left")

  onMount(async () => {
    setWatchPath(props.watchPath)
    const watcher = await startWatcher(props.watchPath)
    onCleanup(() => watcher.close())
  })

  // Handle team selection from the select component
  function handleTeamSelect(index: number) {
    selectTeam(index)
    if (isWide()) {
      // In wide mode, just switch focus to task panel
      setPanelFocus("right")
    } else {
      // In narrow mode, switch to tasks view
      setViewMode("tasks")
    }
  }

  // Handle task selection from the select component
  function handleTaskSelect(index: number) {
    selectTask(index)
    setViewMode("detail")
  }

  useKeyboard((key) => {
    if (key.name === "q") {
      process.exit(0)
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

      <Show when={state.viewMode === "detail"}>
        <TaskDetail />
      </Show>

      <Show when={state.viewMode !== "detail"}>
        <Show
          when={isWide()}
          fallback={
            <Show
              when={state.viewMode === "tasks"}
              fallback={<TeamList focused={true} onSelect={handleTeamSelect} />}
            >
              <TaskList focused={true} onSelect={handleTaskSelect} />
            </Show>
          }
        >
          <box flexDirection="row" flexGrow={1}>
            <box width="30%">
              <TeamList focused={panelFocus() === "left"} onSelect={handleTeamSelect} />
            </box>
            <box flexGrow={1}>
              <TaskList focused={panelFocus() === "right"} onSelect={handleTaskSelect} />
            </box>
          </box>
        </Show>
      </Show>

      <StatusBar />
    </box>
  )
}
