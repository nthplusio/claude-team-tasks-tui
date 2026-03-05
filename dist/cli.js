#!/usr/bin/env bun
// @bun
// index.tsx
import { createComponent as _$createComponent4 } from "@opentui/solid";
import { resolve } from "path";
import { render } from "@opentui/solid";

// src/App.tsx
import { effect as _$effect6 } from "@opentui/solid";
import { insertNode as _$insertNode6 } from "@opentui/solid";
import { insert as _$insert4 } from "@opentui/solid";
import { createComponent as _$createComponent3 } from "@opentui/solid";
import { setProp as _$setProp6 } from "@opentui/solid";
import { createElement as _$createElement6 } from "@opentui/solid";
import { createSignal, createMemo as createMemo5, Switch, Match } from "solid-js";
import { useKeyboard, useTerminalDimensions, useRenderer } from "@opentui/solid";

// src/components/Header.tsx
import { effect as _$effect } from "@opentui/solid";
import { createTextNode as _$createTextNode } from "@opentui/solid";
import { insertNode as _$insertNode } from "@opentui/solid";
import { setProp as _$setProp } from "@opentui/solid";
import { createElement as _$createElement } from "@opentui/solid";

// src/theme.ts
var colors = {
  bg: "#1a1b26",
  bgDark: "#16161e",
  bgHighlight: "#292e42",
  fg: "#c0caf5",
  fgDark: "#565f89",
  fgMuted: "#545c7e",
  blue: "#7aa2f7",
  cyan: "#7dcfff",
  green: "#9ece6a",
  yellow: "#e0af68",
  orange: "#ff9e64",
  purple: "#bb9af7",
  red: "#f7768e",
  magenta: "#ff007c",
  white: "#c0caf5",
  border: "#3b4261",
  selection: "#283457"
};
var teamTypeColors = {
  review: colors.blue,
  feature: colors.green,
  planning: colors.yellow,
  research: colors.purple,
  brainstorm: colors.orange,
  unknown: colors.fgDark
};
function teamTypeLabel(type) {
  return type.toUpperCase();
}

// src/components/Header.tsx
function Header() {
  return (() => {
    var _el$ = _$createElement("box"), _el$2 = _$createElement("text");
    _$insertNode(_el$, _el$2);
    _$setProp(_el$, "width", "100%");
    _$setProp(_el$, "height", 3);
    _$setProp(_el$, "borderStyle", "single");
    _$setProp(_el$, "justifyContent", "center");
    _$setProp(_el$, "alignItems", "center");
    _$insertNode(_el$2, _$createTextNode(`TEAM TASKS TUI`));
    _$setProp(_el$2, "bold", true);
    _$effect((_p$) => {
      var _v$ = colors.border, _v$2 = colors.bgDark, _v$3 = colors.blue;
      _v$ !== _p$.e && (_p$.e = _$setProp(_el$, "borderColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp(_el$, "backgroundColor", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp(_el$2, "fg", _v$3, _p$.a));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined
    });
    return _el$;
  })();
}

// src/components/TeamList.tsx
import { effect as _$effect2 } from "@opentui/solid";
import { createTextNode as _$createTextNode2 } from "@opentui/solid";
import { insertNode as _$insertNode2 } from "@opentui/solid";
import { setProp as _$setProp2 } from "@opentui/solid";
import { createElement as _$createElement2 } from "@opentui/solid";
import { createMemo } from "solid-js";

// src/data/store.ts
import { createStore, produce } from "solid-js/store";
var [state, setState] = createStore({
  teams: [],
  selectedTeamIndex: 0,
  selectedTaskIndex: 0,
  viewMode: "teams",
  watchPath: "./docs/teams",
  lastUpdate: null
});
function setTeams(teams) {
  setState("teams", teams);
  setState("lastUpdate", new Date);
  if (state.selectedTeamIndex >= teams.length) {
    setState("selectedTeamIndex", Math.max(0, teams.length - 1));
  }
  const team = teams[state.selectedTeamIndex];
  if (team && state.selectedTaskIndex >= team.tasks.length) {
    setState("selectedTaskIndex", Math.max(0, team.tasks.length - 1));
  }
}
function updateTeam(dirName, team) {
  setState(produce((s) => {
    const idx = s.teams.findIndex((t) => t.dir === dirName);
    if (idx >= 0) {
      s.teams[idx] = team;
    } else {
      s.teams.push(team);
      s.teams.sort((a, b) => a.dir.localeCompare(b.dir, undefined, { numeric: true, sensitivity: "base" }));
    }
    s.lastUpdate = new Date;
  }));
}
function setWatchPath(path) {
  setState("watchPath", path);
}
function selectTeam(index) {
  setState(produce((s) => {
    s.selectedTeamIndex = Math.max(0, Math.min(index, s.teams.length - 1));
    s.selectedTaskIndex = 0;
  }));
}
function selectTask(index) {
  const team = state.teams[state.selectedTeamIndex];
  if (!team)
    return;
  setState("selectedTaskIndex", Math.max(0, Math.min(index, team.tasks.length - 1)));
}
function setViewMode(mode) {
  setState("viewMode", mode);
}

// src/components/TeamList.tsx
function statusIcon(status) {
  if (status === "completed")
    return "\u2713";
  return "\u25CB";
}
function TeamList(props) {
  const options = createMemo(() => state.teams.map((team) => ({
    name: `${statusIcon(team.meta.status)} ${team.dir}`,
    description: `${teamTypeLabel(team.meta.type)} | ${team.tasks.length} tasks`
  })));
  return (() => {
    var _el$ = _$createElement2("box"), _el$2 = _$createElement2("box"), _el$3 = _$createElement2("text"), _el$5 = _$createElement2("select");
    _$insertNode2(_el$, _el$2);
    _$insertNode2(_el$, _el$5);
    _$setProp2(_el$, "flexDirection", "column");
    _$setProp2(_el$, "borderStyle", "single");
    _$setProp2(_el$, "flexGrow", 1);
    _$setProp2(_el$, "height", "100%");
    _$insertNode2(_el$2, _el$3);
    _$setProp2(_el$2, "height", 1);
    _$setProp2(_el$2, "padding", {
      left: 1
    });
    _$insertNode2(_el$3, _$createTextNode2(`Teams`));
    _$setProp2(_el$3, "bold", true);
    _$setProp2(_el$5, "width", "100%");
    _$setProp2(_el$5, "flexGrow", 1);
    _$setProp2(_el$5, "onSelect", (index) => props.onSelect(index));
    _$setProp2(_el$5, "onChange", (index) => props.onChange?.(index));
    _$effect2((_p$) => {
      var _v$ = props.focused ? colors.blue : colors.border, _v$2 = colors.bgDark, _v$3 = colors.cyan, _v$4 = options(), _v$5 = props.focused, _v$6 = colors.bg, _v$7 = colors.selection, _v$8 = colors.fg, _v$9 = colors.fgDark, _v$0 = colors.fgMuted;
      _v$ !== _p$.e && (_p$.e = _$setProp2(_el$, "borderColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp2(_el$2, "backgroundColor", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp2(_el$3, "fg", _v$3, _p$.a));
      _v$4 !== _p$.o && (_p$.o = _$setProp2(_el$5, "options", _v$4, _p$.o));
      _v$5 !== _p$.i && (_p$.i = _$setProp2(_el$5, "focused", _v$5, _p$.i));
      _v$6 !== _p$.n && (_p$.n = _$setProp2(_el$5, "backgroundColor", _v$6, _p$.n));
      _v$7 !== _p$.s && (_p$.s = _$setProp2(_el$5, "selectedBackgroundColor", _v$7, _p$.s));
      _v$8 !== _p$.h && (_p$.h = _$setProp2(_el$5, "selectedTextColor", _v$8, _p$.h));
      _v$9 !== _p$.r && (_p$.r = _$setProp2(_el$5, "textColor", _v$9, _p$.r));
      _v$0 !== _p$.d && (_p$.d = _$setProp2(_el$5, "descriptionColor", _v$0, _p$.d));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined,
      i: undefined,
      n: undefined,
      s: undefined,
      h: undefined,
      r: undefined,
      d: undefined
    });
    return _el$;
  })();
}

// src/components/TaskList.tsx
import { createTextNode as _$createTextNode3 } from "@opentui/solid";
import { createComponent as _$createComponent } from "@opentui/solid";
import { effect as _$effect3 } from "@opentui/solid";
import { insertNode as _$insertNode3 } from "@opentui/solid";
import { insert as _$insert } from "@opentui/solid";
import { memo as _$memo } from "@opentui/solid";
import { setProp as _$setProp3 } from "@opentui/solid";
import { createElement as _$createElement3 } from "@opentui/solid";
import { createMemo as createMemo2, Show } from "solid-js";
function TaskList(props) {
  const team = createMemo2(() => state.teams[state.selectedTeamIndex]);
  const options = createMemo2(() => {
    const t = team();
    if (!t)
      return [];
    return t.tasks.map((task) => ({
      name: task.title,
      description: task.owner || task.id
    }));
  });
  const headerText = createMemo2(() => {
    const t = team();
    if (!t)
      return "No team selected";
    return `${teamTypeLabel(t.meta.type)} | ${t.meta.topic || t.dir} | ${t.tasks.length} tasks`;
  });
  return (() => {
    var _el$ = _$createElement3("box"), _el$2 = _$createElement3("box"), _el$3 = _$createElement3("text"), _el$4 = _$createElement3("box"), _el$5 = _$createElement3("text");
    _$insertNode3(_el$, _el$2);
    _$insertNode3(_el$, _el$4);
    _$setProp3(_el$, "flexDirection", "column");
    _$setProp3(_el$, "borderStyle", "single");
    _$setProp3(_el$, "flexGrow", 2);
    _$setProp3(_el$, "height", "100%");
    _$insertNode3(_el$2, _el$3);
    _$setProp3(_el$2, "height", 1);
    _$setProp3(_el$2, "padding", {
      left: 1
    });
    _$setProp3(_el$3, "bold", true);
    _$insert(_el$3, () => team()?.dir || "\u2014");
    _$insertNode3(_el$4, _el$5);
    _$setProp3(_el$4, "height", 1);
    _$setProp3(_el$4, "padding", {
      left: 1
    });
    _$insert(_el$5, headerText);
    _$insert(_el$, _$createComponent(Show, {
      get when() {
        return options().length > 0;
      },
      get fallback() {
        return (() => {
          var _el$7 = _$createElement3("box"), _el$8 = _$createElement3("text");
          _$insertNode3(_el$7, _el$8);
          _$setProp3(_el$7, "padding", 1);
          _$insertNode3(_el$8, _$createTextNode3(`No tasks found`));
          _$effect3((_$p) => _$setProp3(_el$8, "fg", colors.fgDark, _$p));
          return _el$7;
        })();
      },
      get children() {
        var _el$6 = _$createElement3("select");
        _$setProp3(_el$6, "width", "100%");
        _$setProp3(_el$6, "flexGrow", 1);
        _$setProp3(_el$6, "onSelect", (index) => props.onSelect(index));
        _$setProp3(_el$6, "onChange", (index) => props.onChange?.(index));
        _$effect3((_p$) => {
          var _v$ = options(), _v$2 = props.focused, _v$3 = colors.bg, _v$4 = colors.selection, _v$5 = colors.fg, _v$6 = colors.fgDark, _v$7 = colors.fgMuted;
          _v$ !== _p$.e && (_p$.e = _$setProp3(_el$6, "options", _v$, _p$.e));
          _v$2 !== _p$.t && (_p$.t = _$setProp3(_el$6, "focused", _v$2, _p$.t));
          _v$3 !== _p$.a && (_p$.a = _$setProp3(_el$6, "backgroundColor", _v$3, _p$.a));
          _v$4 !== _p$.o && (_p$.o = _$setProp3(_el$6, "selectedBackgroundColor", _v$4, _p$.o));
          _v$5 !== _p$.i && (_p$.i = _$setProp3(_el$6, "selectedTextColor", _v$5, _p$.i));
          _v$6 !== _p$.n && (_p$.n = _$setProp3(_el$6, "textColor", _v$6, _p$.n));
          _v$7 !== _p$.s && (_p$.s = _$setProp3(_el$6, "descriptionColor", _v$7, _p$.s));
          return _p$;
        }, {
          e: undefined,
          t: undefined,
          a: undefined,
          o: undefined,
          i: undefined,
          n: undefined,
          s: undefined
        });
        return _el$6;
      }
    }), null);
    _$effect3((_p$) => {
      var _v$8 = props.focused ? colors.blue : colors.border, _v$9 = colors.bgDark, _v$0 = teamTypeColors[team()?.meta.type || "unknown"], _v$1 = colors.fgMuted;
      _v$8 !== _p$.e && (_p$.e = _$setProp3(_el$, "borderColor", _v$8, _p$.e));
      _v$9 !== _p$.t && (_p$.t = _$setProp3(_el$2, "backgroundColor", _v$9, _p$.t));
      _v$0 !== _p$.a && (_p$.a = _$setProp3(_el$3, "fg", _v$0, _p$.a));
      _v$1 !== _p$.o && (_p$.o = _$setProp3(_el$5, "fg", _v$1, _p$.o));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined
    });
    return _el$;
  })();
}

// src/components/TaskDetail.tsx
import { createTextNode as _$createTextNode4 } from "@opentui/solid";
import { createComponent as _$createComponent2 } from "@opentui/solid";
import { effect as _$effect4 } from "@opentui/solid";
import { insertNode as _$insertNode4 } from "@opentui/solid";
import { insert as _$insert2 } from "@opentui/solid";
import { memo as _$memo2 } from "@opentui/solid";
import { setProp as _$setProp4 } from "@opentui/solid";
import { createElement as _$createElement4 } from "@opentui/solid";
import { createMemo as createMemo3, Show as Show2 } from "solid-js";
function TaskDetail() {
  const team = createMemo3(() => state.teams[state.selectedTeamIndex]);
  const task = createMemo3(() => {
    const t = team();
    if (!t)
      return;
    return t.tasks[state.selectedTaskIndex];
  });
  return (() => {
    var _el$ = _$createElement4("box"), _el$2 = _$createElement4("box"), _el$3 = _$createElement4("text");
    _$insertNode4(_el$, _el$2);
    _$setProp4(_el$, "flexDirection", "column");
    _$setProp4(_el$, "borderStyle", "single");
    _$setProp4(_el$, "width", "100%");
    _$setProp4(_el$, "flexGrow", 1);
    _$insertNode4(_el$2, _el$3);
    _$setProp4(_el$2, "height", 1);
    _$setProp4(_el$2, "padding", {
      left: 1
    });
    _$setProp4(_el$3, "bold", true);
    _$insert2(_el$3, () => task()?.title || "No task selected");
    _$insert2(_el$, _$createComponent2(Show2, {
      get when() {
        return task();
      },
      get fallback() {
        return (() => {
          var _el$8 = _$createElement4("box"), _el$9 = _$createElement4("text");
          _$insertNode4(_el$8, _el$9);
          _$setProp4(_el$8, "padding", 1);
          _$insertNode4(_el$9, _$createTextNode4(`Select a task to view details`));
          _$effect4((_$p) => _$setProp4(_el$9, "fg", colors.fgDark, _$p));
          return _el$8;
        })();
      },
      get children() {
        return [(() => {
          var _el$4 = _$createElement4("box"), _el$5 = _$createElement4("text");
          _$insertNode4(_el$4, _el$5);
          _$setProp4(_el$4, "padding", {
            left: 1,
            right: 1
          });
          _$insert2(_el$5, () => task().filename, null);
          _$insert2(_el$5, (() => {
            var _c$ = _$memo2(() => !!task().owner);
            return () => _c$() ? ` | ${task().owner}` : "";
          })(), null);
          _$insert2(_el$5, (() => {
            var _c$2 = _$memo2(() => !!task().date);
            return () => _c$2() ? ` | ${task().date}` : "";
          })(), null);
          _$effect4((_$p) => _$setProp4(_el$5, "fg", colors.fgMuted, _$p));
          return _el$4;
        })(), (() => {
          var _el$6 = _$createElement4("scrollbox"), _el$7 = _$createElement4("markdown");
          _$insertNode4(_el$6, _el$7);
          _$setProp4(_el$6, "flexGrow", 1);
          _$setProp4(_el$6, "width", "100%");
          _$insert2(_el$7, () => task().content);
          return _el$6;
        })()];
      }
    }), null);
    _$effect4((_p$) => {
      var _v$ = colors.blue, _v$2 = colors.bgDark, _v$3 = teamTypeColors[team()?.meta.type || "unknown"];
      _v$ !== _p$.e && (_p$.e = _$setProp4(_el$, "borderColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp4(_el$2, "backgroundColor", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp4(_el$3, "fg", _v$3, _p$.a));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined
    });
    return _el$;
  })();
}

// src/components/StatusBar.tsx
import { effect as _$effect5 } from "@opentui/solid";
import { createTextNode as _$createTextNode5 } from "@opentui/solid";
import { insertNode as _$insertNode5 } from "@opentui/solid";
import { insert as _$insert3 } from "@opentui/solid";
import { memo as _$memo3 } from "@opentui/solid";
import { setProp as _$setProp5 } from "@opentui/solid";
import { createElement as _$createElement5 } from "@opentui/solid";
import { createMemo as createMemo4 } from "solid-js";
function StatusBar(props) {
  const timeStr = createMemo4(() => {
    const d = state.lastUpdate;
    if (!d)
      return "\u2014";
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  });
  const shortPath = createMemo4(() => {
    const p = state.watchPath;
    const parts = p.split("/").filter(Boolean);
    if (parts.length <= 2)
      return p;
    return ".../" + parts.slice(-2).join("/");
  });
  return (() => {
    var _el$ = _$createElement5("box"), _el$2 = _$createElement5("text"), _el$3 = _$createTextNode5(` | `), _el$4 = _$createTextNode5(` teams | `), _el$5 = _$createTextNode5(` | focus:`), _el$6 = _$createTextNode5(` | `);
    _$insertNode5(_el$, _el$2);
    _$setProp5(_el$, "width", "100%");
    _$setProp5(_el$, "height", 1);
    _$setProp5(_el$, "flexDirection", "row");
    _$setProp5(_el$, "padding", {
      left: 1,
      right: 1
    });
    _$insertNode5(_el$2, _el$3);
    _$insertNode5(_el$2, _el$4);
    _$insertNode5(_el$2, _el$5);
    _$insertNode5(_el$2, _el$6);
    _$insert3(_el$2, shortPath, _el$3);
    _$insert3(_el$2, () => state.teams.length, _el$4);
    _$insert3(_el$2, timeStr, _el$5);
    _$insert3(_el$2, () => props.panelFocus || "?", _el$6);
    _$insert3(_el$2, () => props.lastKey || "j/k:nav enter:select q:quit", null);
    _$effect5((_p$) => {
      var _v$ = colors.bgDark, _v$2 = colors.fgMuted;
      _v$ !== _p$.e && (_p$.e = _$setProp5(_el$, "backgroundColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp5(_el$2, "fg", _v$2, _p$.t));
      return _p$;
    }, {
      e: undefined,
      t: undefined
    });
    return _el$;
  })();
}

// src/App.tsx
function App(props) {
  const renderer = useRenderer();
  const dimensions = useTerminalDimensions();
  const isWide = createMemo5(() => dimensions().width >= 80);
  const [panelFocus, setPanelFocus] = createSignal("left");
  const [lastKey, setLastKey] = createSignal("");
  function handleTeamChange(index) {
    setLastKey(`onChange:team[${index}]`);
    selectTeam(index);
  }
  function handleTeamSelect(index) {
    setLastKey(`select:team[${index}]`);
    selectTeam(index);
    if (isWide()) {
      setPanelFocus("right");
    } else {
      setViewMode("tasks");
    }
  }
  function handleTaskChange(index) {
    setLastKey(`onChange:task[${index}]`);
    selectTask(index);
  }
  function handleTaskSelect(index) {
    setLastKey(`select:task[${index}]`);
    selectTask(index);
    setViewMode("detail");
  }
  useKeyboard((key) => {
    setLastKey(`key:${key.name}`);
    if (key.name === "q" || key.ctrl && key.name === "c") {
      renderer.destroy();
      process.exit(0);
    }
    if (key.name === "escape") {
      if (state.viewMode === "detail") {
        setViewMode("tasks");
        if (isWide())
          setPanelFocus("right");
      } else if (state.viewMode === "tasks" && !isWide()) {
        setViewMode("teams");
      } else if (isWide() && panelFocus() === "right") {
        setPanelFocus("left");
      }
    }
    if (key.name === "tab") {
      if (isWide() && state.viewMode !== "detail") {
        setPanelFocus((f) => f === "left" ? "right" : "left");
      }
    }
  });
  return (() => {
    var _el$ = _$createElement6("box");
    _$setProp6(_el$, "flexDirection", "column");
    _$setProp6(_el$, "width", "100%");
    _$setProp6(_el$, "height", "100%");
    _$insert4(_el$, _$createComponent3(Header, {}), null);
    _$insert4(_el$, _$createComponent3(Switch, {
      get children() {
        return [_$createComponent3(Match, {
          get when() {
            return state.viewMode === "detail";
          },
          get children() {
            return _$createComponent3(TaskDetail, {});
          }
        }), _$createComponent3(Match, {
          get when() {
            return isWide();
          },
          get children() {
            var _el$2 = _$createElement6("box"), _el$3 = _$createElement6("box"), _el$4 = _$createElement6("box");
            _$insertNode6(_el$2, _el$3);
            _$insertNode6(_el$2, _el$4);
            _$setProp6(_el$2, "flexDirection", "row");
            _$setProp6(_el$2, "flexGrow", 1);
            _$setProp6(_el$3, "width", "30%");
            _$insert4(_el$3, _$createComponent3(TeamList, {
              get focused() {
                return panelFocus() === "left";
              },
              onSelect: handleTeamSelect,
              onChange: handleTeamChange
            }));
            _$setProp6(_el$4, "flexGrow", 1);
            _$insert4(_el$4, _$createComponent3(TaskList, {
              get focused() {
                return panelFocus() === "right";
              },
              onSelect: handleTaskSelect,
              onChange: handleTaskChange
            }));
            return _el$2;
          }
        }), _$createComponent3(Match, {
          get when() {
            return state.viewMode === "tasks";
          },
          get children() {
            return _$createComponent3(TaskList, {
              focused: true,
              onSelect: handleTaskSelect,
              onChange: handleTaskChange
            });
          }
        }), _$createComponent3(Match, {
          get when() {
            return state.viewMode === "teams";
          },
          get children() {
            return _$createComponent3(TeamList, {
              focused: true,
              onSelect: handleTeamSelect,
              onChange: handleTeamChange
            });
          }
        })];
      }
    }), null);
    _$insert4(_el$, _$createComponent3(StatusBar, {
      get lastKey() {
        return lastKey();
      },
      get panelFocus() {
        return panelFocus();
      }
    }), null);
    _$effect6((_$p) => _$setProp6(_el$, "backgroundColor", colors.bg, _$p));
    return _el$;
  })();
}

// src/data/parser.ts
import { readdir, readFile, mkdir } from "fs/promises";
import { join, basename } from "path";
import matter from "gray-matter";
var TYPE_PREFIXES = [
  ["review", "review"],
  ["feature", "feature"],
  ["plan", "planning"],
  ["research", "research"],
  ["brainstorm", "brainstorm"]
];
function inferType(dirName) {
  for (const [prefix, type] of TYPE_PREFIXES) {
    if (dirName.startsWith(prefix))
      return type;
  }
  return "unknown";
}
function formatDate(val) {
  if (!val)
    return;
  if (val instanceof Date)
    return val.toISOString().slice(0, 10);
  return String(val);
}
function normalizeMode(mode) {
  if (typeof mode !== "string")
    return;
  if (mode === "\u2014" || mode === "\u2014")
    return;
  return mode;
}
function extractTitleFromContent(content, filename) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match)
    return match[1].trim();
  return basename(filename, ".md").replace(/-/g, " ");
}
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}
async function parseReadme(dirPath, dirName) {
  try {
    const readmePath = join(dirPath, "README.md");
    const raw = await readFile(readmePath, "utf-8");
    const { data } = matter(raw);
    return {
      team: data.team || dirName,
      type: data.type || inferType(dirName),
      mode: normalizeMode(data.mode),
      topic: data.topic,
      date: formatDate(data.date),
      status: data.status,
      teammates: data.teammates,
      pipeline: data.pipeline
    };
  } catch {
    return {
      team: dirName,
      type: inferType(dirName)
    };
  }
}
async function parseTask(filePath) {
  const filename = basename(filePath, ".md");
  const raw = await readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const title = data.title || extractTitleFromContent(raw, filePath);
  return {
    id: filename,
    title,
    filename: basename(filePath),
    owner: data.owner,
    date: formatDate(data.date),
    content
  };
}
async function parseTasks(dirPath) {
  const tasksDir = join(dirPath, "tasks");
  try {
    const entries = await readdir(tasksDir);
    const mdFiles = entries.filter((f) => f.endsWith(".md")).sort(naturalSort);
    const tasks = await Promise.all(mdFiles.map((f) => parseTask(join(tasksDir, f))));
    return tasks;
  } catch {
    return [];
  }
}
async function parseTeam(dirPath) {
  const dirName = basename(dirPath);
  const [meta, tasks] = await Promise.all([
    parseReadme(dirPath, dirName),
    parseTasks(dirPath)
  ]);
  return { dir: dirName, meta, tasks };
}
async function parseAllTeams(watchPath) {
  await mkdir(watchPath, { recursive: true });
  const entries = await readdir(watchPath, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort(naturalSort);
  const teams = await Promise.all(dirs.map((d) => parseTeam(join(watchPath, d))));
  return teams;
}

// src/data/watcher.ts
import { watch } from "chokidar";
import { join as join2, relative, sep } from "path";
var debounceTimer = null;
var pendingDirs = new Set;
function getTeamDir(watchPath, changedPath) {
  const rel = relative(watchPath, changedPath);
  const parts = rel.split(sep);
  if (parts.length >= 1 && parts[0] !== "." && parts[0] !== "..") {
    return parts[0];
  }
  return null;
}
function startFileWatcher(watchPath) {
  const watcher = watch(watchPath, {
    ignoreInitial: true,
    depth: 3,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50
    }
  });
  const scheduleUpdate = (filePath) => {
    if (!filePath.endsWith(".md"))
      return;
    const teamDir = getTeamDir(watchPath, filePath);
    if (!teamDir)
      return;
    pendingDirs.add(teamDir);
    if (debounceTimer)
      clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const dirs = [...pendingDirs];
      pendingDirs.clear();
      for (const dir of dirs) {
        try {
          const team = await parseTeam(join2(watchPath, dir));
          updateTeam(dir, team);
        } catch {}
      }
    }, 200);
  };
  watcher.on("add", scheduleUpdate);
  watcher.on("change", scheduleUpdate);
  watcher.on("unlink", scheduleUpdate);
  return watcher;
}

// index.tsx
var watchPath = resolve(process.argv[2] || "docs/teams");
var teams = await parseAllTeams(watchPath);
setWatchPath(watchPath);
setTeams(teams);
startFileWatcher(watchPath);
render(() => _$createComponent4(App, {
  watchPath
}));
