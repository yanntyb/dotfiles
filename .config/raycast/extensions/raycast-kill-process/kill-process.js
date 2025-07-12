"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/kill-process.tsx
var kill_process_exports = {};
__export(kill_process_exports, {
  default: () => ProcessList
});
module.exports = __toCommonJS(kill_process_exports);
var import_react = require("react");
var import_api = require("@raycast/api");
var import_child_process4 = require("child_process");

// src/helpers/revealInFinder.ts
var import_child_process = require("child_process");
var revealInFinder = async (path) => new Promise((resolve, reject) => {
  (0, import_child_process.exec)(`open -R '${path}'`, (err) => {
    if (err != null) return reject(err);
    resolve();
  });
});

// src/helpers/fetchPorts.ts
var import_child_process2 = require("child_process");
var fetchPorts = async () => new Promise((resolve, reject) => {
  (0, import_child_process2.exec)(`/usr/sbin/lsof -P -i :3000-30000`, (err, stdout) => {
    if (err != null) return reject(err);
    const ports = stdout.split("\n").slice(1).filter(Boolean).map((line) => {
      const [, pid, , , , , , , name] = line.split(" ").filter(Boolean);
      return {
        pid,
        name,
        port: name.split(":")[1]
      };
    }).filter((p) => !p.port.includes("->")).filter((p) => !!p.port);
    resolve(ports);
  });
});

// src/helpers/fetchProcesses.ts
var import_child_process3 = require("child_process");
var fetchProcesses = async () => new Promise((resolve, reject) => {
  (0, import_child_process3.exec)(`ps -eo pid,pcpu,comm | sort -nrk 2,3`, (err, stdout) => {
    if (err != null) return reject(err);
    const processes = stdout.split("\n").map((line) => {
      const [, id, cpu, path] = line.match(/(\d+)\s+(\d+[.|,]\d+)\s+(.*)/) ?? ["", "", "", ""];
      const name = path.match(/[^/]*[^/]*$/i)?.[0] ?? "";
      const isPrefPane = path.includes(".prefPane");
      const isApp = path.includes(".app");
      return {
        id,
        cpu,
        path,
        name,
        type: isPrefPane ? "prefPane" : isApp ? "app" : "binary"
      };
    }).filter((process) => process.name !== "");
    resolve(processes);
  });
});

// src/helpers/uniq.ts
var uniq = (arr) => Array.from(new Set(arr));

// src/helpers/fetchProcessesWithPorts.ts
var fetchProcessesWithPorts = async () => {
  const [processes, ports] = await Promise.all([fetchProcesses(), fetchPorts()]);
  return processes.map((p) => ({
    ...p,
    ports: uniq(ports.filter((port) => port.pid === p.id).map((p2) => p2.port))
  }));
};

// src/kill-process.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function ProcessList() {
  const [processes, setProcesses] = (0, import_react.useState)([]);
  const [query, setQuery] = (0, import_react.useState)(void 0);
  const fetchData = async () => {
    const data = await fetchProcessesWithPorts();
    setProcesses(data);
  };
  (0, import_react.useEffect)(() => {
    fetchData();
  }, []);
  const getProcessIcon = (process) => {
    if (process.type === "prefPane") {
      return { fileIcon: process.path?.replace(/(.+\.prefPane)(.+)/, "$1") ?? "" };
    }
    if (process.type === "app") {
      return { fileIcon: process.path?.replace(/(.+\.app)(.+)/, "$1") ?? "" };
    }
    return "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ExecutableBinaryIcon.icns";
  };
  const killProcess = (process) => {
    (0, import_child_process4.exec)(`kill -9 ${process.id}`);
    setProcesses(processes.filter((p) => p.id !== process.id));
    (0, import_api.clearSearchBar)({ forceScrollToTop: true });
    (0, import_api.popToRoot)();
    (0, import_api.showHUD)(`\u2705 Killed ${process.name === "-" ? `process ${process.id}` : process.name}`);
  };
  const filterProcesses = (process) => {
    if (!query) return true;
    const nameMatches = process.name.toLowerCase().includes(query.toLowerCase());
    const pathMatches = process.path?.toLowerCase().match(
      new RegExp(`.+${query}.*\\.[app|framework|prefpane]`, "ig")
    ) != null;
    const pidMatches = process.id.includes(query);
    const portMatches = process.ports.some((port) => port.toString().includes(query));
    return nameMatches || pathMatches || pidMatches || portMatches;
  };
  const sortProcesses = (a, b) => {
    if (a.type === "app" && b.type !== "app") return -1;
    if (a.type !== "app" && b.type === "app") return 1;
    return 0;
  };
  const ProcessListItem = ({ process }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_api.List.Item,
    {
      title: process.name,
      icon: getProcessIcon(process),
      accessories: [
        ...process.ports.length ? [{ text: process.ports.join(", "), icon: import_api.Icon.Plug }] : [],
        { text: `${process.cpu}%`, icon: import_api.Icon.ComputerChip }
      ],
      actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_api.ActionPanel, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_api.ActionPanel.Item,
          {
            title: "Kill",
            icon: import_api.Icon.XmarkCircle,
            onAction: () => killProcess(process)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_api.ActionPanel.Item,
          {
            title: "Reload",
            icon: import_api.Icon.ArrowClockwise,
            shortcut: { key: "r", modifiers: ["cmd"] },
            onAction: fetchData
          }
        ),
        process.path && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_api.ActionPanel.Item,
          {
            title: "Reveal in Finder",
            icon: import_api.Icon.Finder,
            shortcut: { key: "r", modifiers: ["cmd", "opt"] },
            onAction: () => revealInFinder(process.path)
          }
        )
      ] })
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_api.List,
    {
      isLoading: processes.length === 0,
      searchBarPlaceholder: "Filter by name or port...",
      onSearchTextChange: setQuery,
      children: processes.filter(filterProcesses).sort(sortProcesses).map((process, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProcessListItem, { process }, index))
    }
  );
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vRGVza3RvcC9teS1jb25maWcvdG9vbHMvcmF5Y2FzdC1raWxsLXByb2Nlc3Mvc3JjL2tpbGwtcHJvY2Vzcy50c3giLCAiLi4vLi4vLi4vLi4vRGVza3RvcC9teS1jb25maWcvdG9vbHMvcmF5Y2FzdC1raWxsLXByb2Nlc3Mvc3JjL2hlbHBlcnMvcmV2ZWFsSW5GaW5kZXIudHMiLCAiLi4vLi4vLi4vLi4vRGVza3RvcC9teS1jb25maWcvdG9vbHMvcmF5Y2FzdC1raWxsLXByb2Nlc3Mvc3JjL2hlbHBlcnMvZmV0Y2hQb3J0cy50cyIsICIuLi8uLi8uLi8uLi9EZXNrdG9wL215LWNvbmZpZy90b29scy9yYXljYXN0LWtpbGwtcHJvY2Vzcy9zcmMvaGVscGVycy9mZXRjaFByb2Nlc3Nlcy50cyIsICIuLi8uLi8uLi8uLi9EZXNrdG9wL215LWNvbmZpZy90b29scy9yYXljYXN0LWtpbGwtcHJvY2Vzcy9zcmMvaGVscGVycy91bmlxLnRzIiwgIi4uLy4uLy4uLy4uL0Rlc2t0b3AvbXktY29uZmlnL3Rvb2xzL3JheWNhc3Qta2lsbC1wcm9jZXNzL3NyYy9oZWxwZXJzL2ZldGNoUHJvY2Vzc2VzV2l0aFBvcnRzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBBY3Rpb25QYW5lbCwgY2xlYXJTZWFyY2hCYXIsIEljb24sIExpc3QsIHBvcFRvUm9vdCwgc2hvd0hVRCB9IGZyb20gXCJAcmF5Y2FzdC9hcGlcIjtcbmltcG9ydCB7IGV4ZWMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgUHJvY2VzcyB9IGZyb20gXCIuL2hlbHBlcnMvZmV0Y2hQcm9jZXNzZXNcIjtcbmltcG9ydCB7IHJldmVhbEluRmluZGVyIH0gZnJvbSBcIi4vaGVscGVycy9yZXZlYWxJbkZpbmRlclwiO1xuaW1wb3J0IHsgZmV0Y2hQcm9jZXNzZXNXaXRoUG9ydHMsIFByb2Nlc3NXaXRoUG9ydHMgfSBmcm9tIFwiLi9oZWxwZXJzL2ZldGNoUHJvY2Vzc2VzV2l0aFBvcnRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFByb2Nlc3NMaXN0KCkge1xuICBjb25zdCBbcHJvY2Vzc2VzLCBzZXRQcm9jZXNzZXNdID0gdXNlU3RhdGU8UHJvY2Vzc1dpdGhQb3J0c1tdPihbXSk7XG4gIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gdXNlU3RhdGU8c3RyaW5nIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xuXG4gIGNvbnN0IGZldGNoRGF0YSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgZmV0Y2hQcm9jZXNzZXNXaXRoUG9ydHMoKTtcbiAgICBzZXRQcm9jZXNzZXMoZGF0YSk7XG4gIH07XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBmZXRjaERhdGEoKTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGdldFByb2Nlc3NJY29uID0gKHByb2Nlc3M6IFByb2Nlc3MpOiBzdHJpbmcgfCB7IGZpbGVJY29uOiBzdHJpbmcgfSA9PiB7XG4gICAgaWYgKHByb2Nlc3MudHlwZSA9PT0gXCJwcmVmUGFuZVwiKSB7XG4gICAgICByZXR1cm4geyBmaWxlSWNvbjogcHJvY2Vzcy5wYXRoPy5yZXBsYWNlKC8oLitcXC5wcmVmUGFuZSkoLispLywgXCIkMVwiKSA/PyBcIlwiIH07XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLnR5cGUgPT09IFwiYXBwXCIpIHtcbiAgICAgIHJldHVybiB7IGZpbGVJY29uOiBwcm9jZXNzLnBhdGg/LnJlcGxhY2UoLyguK1xcLmFwcCkoLispLywgXCIkMVwiKSA/PyBcIlwiIH07XG4gICAgfVxuICAgIHJldHVybiBcIi9TeXN0ZW0vTGlicmFyeS9Db3JlU2VydmljZXMvQ29yZVR5cGVzLmJ1bmRsZS9Db250ZW50cy9SZXNvdXJjZXMvRXhlY3V0YWJsZUJpbmFyeUljb24uaWNuc1wiO1xuICB9O1xuXG4gIGNvbnN0IGtpbGxQcm9jZXNzID0gKHByb2Nlc3M6IFByb2Nlc3MpID0+IHtcbiAgICBleGVjKGBraWxsIC05ICR7cHJvY2Vzcy5pZH1gKTtcbiAgICBzZXRQcm9jZXNzZXMocHJvY2Vzc2VzLmZpbHRlcigocCkgPT4gcC5pZCAhPT0gcHJvY2Vzcy5pZCkpO1xuICAgIGNsZWFyU2VhcmNoQmFyKHsgZm9yY2VTY3JvbGxUb1RvcDogdHJ1ZSB9KTtcbiAgICBwb3BUb1Jvb3QoKTtcbiAgICBzaG93SFVEKGBcdTI3MDUgS2lsbGVkICR7cHJvY2Vzcy5uYW1lID09PSBcIi1cIiA/IGBwcm9jZXNzICR7cHJvY2Vzcy5pZH1gIDogcHJvY2Vzcy5uYW1lfWApO1xuICB9O1xuXG4gIGNvbnN0IGZpbHRlclByb2Nlc3NlcyA9IChwcm9jZXNzOiBQcm9jZXNzV2l0aFBvcnRzKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKCFxdWVyeSkgcmV0dXJuIHRydWU7XG5cbiAgICBjb25zdCBuYW1lTWF0Y2hlcyA9IHByb2Nlc3MubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xuICAgIGNvbnN0IHBhdGhNYXRjaGVzID0gcHJvY2Vzcy5wYXRoPy50b0xvd2VyQ2FzZSgpLm1hdGNoKFxuICAgICAgbmV3IFJlZ0V4cChgLiske3F1ZXJ5fS4qXFxcXC5bYXBwfGZyYW1ld29ya3xwcmVmcGFuZV1gLCBcImlnXCIpXG4gICAgKSAhPSBudWxsO1xuICAgIGNvbnN0IHBpZE1hdGNoZXMgPSBwcm9jZXNzLmlkLmluY2x1ZGVzKHF1ZXJ5KTtcbiAgICBjb25zdCBwb3J0TWF0Y2hlcyA9IHByb2Nlc3MucG9ydHMuc29tZSgocG9ydCkgPT4gcG9ydC50b1N0cmluZygpLmluY2x1ZGVzKHF1ZXJ5KSk7XG5cbiAgICByZXR1cm4gbmFtZU1hdGNoZXMgfHwgcGF0aE1hdGNoZXMgfHwgcGlkTWF0Y2hlcyB8fCBwb3J0TWF0Y2hlcztcbiAgfTtcblxuICBjb25zdCBzb3J0UHJvY2Vzc2VzID0gKGE6IFByb2Nlc3NXaXRoUG9ydHMsIGI6IFByb2Nlc3NXaXRoUG9ydHMpOiBudW1iZXIgPT4ge1xuICAgIGlmIChhLnR5cGUgPT09IFwiYXBwXCIgJiYgYi50eXBlICE9PSBcImFwcFwiKSByZXR1cm4gLTE7XG4gICAgaWYgKGEudHlwZSAhPT0gXCJhcHBcIiAmJiBiLnR5cGUgPT09IFwiYXBwXCIpIHJldHVybiAxO1xuICAgIHJldHVybiAwO1xuICB9O1xuXG4gIGNvbnN0IFByb2Nlc3NMaXN0SXRlbSA9ICh7IHByb2Nlc3MgfTogeyBwcm9jZXNzOiBQcm9jZXNzV2l0aFBvcnRzIH0pID0+IChcbiAgICA8TGlzdC5JdGVtXG4gICAgICB0aXRsZT17cHJvY2Vzcy5uYW1lfVxuICAgICAgaWNvbj17Z2V0UHJvY2Vzc0ljb24ocHJvY2Vzcyl9XG4gICAgICBhY2Nlc3Nvcmllcz17W1xuICAgICAgICAuLi4ocHJvY2Vzcy5wb3J0cy5sZW5ndGggPyBbeyB0ZXh0OiBwcm9jZXNzLnBvcnRzLmpvaW4oXCIsIFwiKSwgaWNvbjogSWNvbi5QbHVnIH1dIDogW10pLFxuICAgICAgICB7IHRleHQ6IGAke3Byb2Nlc3MuY3B1fSVgLCBpY29uOiBJY29uLkNvbXB1dGVyQ2hpcCB9LFxuICAgICAgXX1cbiAgICAgIGFjdGlvbnM9e1xuICAgICAgICA8QWN0aW9uUGFuZWw+XG4gICAgICAgICAgPEFjdGlvblBhbmVsLkl0ZW1cbiAgICAgICAgICAgIHRpdGxlPVwiS2lsbFwiXG4gICAgICAgICAgICBpY29uPXtJY29uLlhtYXJrQ2lyY2xlfVxuICAgICAgICAgICAgb25BY3Rpb249eygpID0+IGtpbGxQcm9jZXNzKHByb2Nlc3MpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEFjdGlvblBhbmVsLkl0ZW1cbiAgICAgICAgICAgIHRpdGxlPVwiUmVsb2FkXCJcbiAgICAgICAgICAgIGljb249e0ljb24uQXJyb3dDbG9ja3dpc2V9XG4gICAgICAgICAgICBzaG9ydGN1dD17eyBrZXk6IFwiclwiLCBtb2RpZmllcnM6IFtcImNtZFwiXSB9fVxuICAgICAgICAgICAgb25BY3Rpb249e2ZldGNoRGF0YX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHtwcm9jZXNzLnBhdGggJiYgKFxuICAgICAgICAgICAgPEFjdGlvblBhbmVsLkl0ZW1cbiAgICAgICAgICAgICAgdGl0bGU9XCJSZXZlYWwgaW4gRmluZGVyXCJcbiAgICAgICAgICAgICAgaWNvbj17SWNvbi5GaW5kZXJ9XG4gICAgICAgICAgICAgIHNob3J0Y3V0PXt7IGtleTogXCJyXCIsIG1vZGlmaWVyczogW1wiY21kXCIsIFwib3B0XCJdIH19XG4gICAgICAgICAgICAgIG9uQWN0aW9uPXsoKSA9PiByZXZlYWxJbkZpbmRlcihwcm9jZXNzLnBhdGghKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9BY3Rpb25QYW5lbD5cbiAgICAgIH1cbiAgICAvPlxuICApO1xuXG4gIHJldHVybiAoXG4gICAgPExpc3RcbiAgICAgIGlzTG9hZGluZz17cHJvY2Vzc2VzLmxlbmd0aCA9PT0gMH1cbiAgICAgIHNlYXJjaEJhclBsYWNlaG9sZGVyPVwiRmlsdGVyIGJ5IG5hbWUgb3IgcG9ydC4uLlwiXG4gICAgICBvblNlYXJjaFRleHRDaGFuZ2U9e3NldFF1ZXJ5fVxuICAgID5cbiAgICAgIHtwcm9jZXNzZXNcbiAgICAgICAgLmZpbHRlcihmaWx0ZXJQcm9jZXNzZXMpXG4gICAgICAgIC5zb3J0KHNvcnRQcm9jZXNzZXMpXG4gICAgICAgIC5tYXAoKHByb2Nlc3MsIGluZGV4KSA9PiAoXG4gICAgICAgICAgPFByb2Nlc3NMaXN0SXRlbSBrZXk9e2luZGV4fSBwcm9jZXNzPXtwcm9jZXNzfSAvPlxuICAgICAgICApKX1cbiAgICA8L0xpc3Q+XG4gICk7XG59IiwgImltcG9ydCB7IGV4ZWMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuXG5leHBvcnQgY29uc3QgcmV2ZWFsSW5GaW5kZXIgPSBhc3luYyAocGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PlxuICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZXhlYyhgb3BlbiAtUiAnJHtwYXRofSdgLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyICE9IG51bGwpIHJldHVybiByZWplY3QoZXJyKTtcblxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9KTtcbiIsICJpbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcblxuZXhwb3J0IHR5cGUgUG9ydCA9IHtcbiAgcGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgcG9ydDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNvbnN0IGZldGNoUG9ydHMgPSBhc3luYyAoKTogUHJvbWlzZTxQb3J0W10+ID0+XG4gIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBleGVjKGAvdXNyL3NiaW4vbHNvZiAtUCAtaSA6MzAwMC0zMDAwMGAsIChlcnIsIHN0ZG91dCkgPT4ge1xuICAgICAgaWYgKGVyciAhPSBudWxsKSByZXR1cm4gcmVqZWN0KGVycik7XG5cbiAgICAgIGNvbnN0IHBvcnRzID0gc3Rkb3V0XG4gICAgICAgIC5zcGxpdChcIlxcblwiKVxuICAgICAgICAuc2xpY2UoMSlcbiAgICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgICAubWFwPFBvcnQ+KChsaW5lKSA9PiB7XG4gICAgICAgICAgY29uc3QgWywgcGlkLCAsICwgLCAsICwgLCBuYW1lXSA9IGxpbmUuc3BsaXQoXCIgXCIpLmZpbHRlcihCb29sZWFuKTtcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwaWQ6IHBpZCxcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBwb3J0OiBuYW1lLnNwbGl0KFwiOlwiKVsxXSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgICAuZmlsdGVyKChwKSA9PiAhcC5wb3J0LmluY2x1ZGVzKFwiLT5cIikpXG4gICAgICAgIC5maWx0ZXIoKHApID0+ICEhcC5wb3J0KTtcblxuICAgICAgcmVzb2x2ZShwb3J0cyk7XG4gICAgfSk7XG4gIH0pO1xuIiwgImltcG9ydCB7IGV4ZWMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuXG5leHBvcnQgdHlwZSBQcm9jZXNzID0ge1xuICBpZDogc3RyaW5nO1xuICBjcHU6IHN0cmluZztcbiAgdHlwZTogXCJwcmVmUGFuZVwiIHwgXCJhcHBcIiB8IFwiYmluYXJ5XCI7XG4gIHBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgbmFtZTogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNvbnN0IGZldGNoUHJvY2Vzc2VzID0gYXN5bmMgKCk6IFByb21pc2U8UHJvY2Vzc1tdPiA9PlxuICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZXhlYyhgcHMgLWVvIHBpZCxwY3B1LGNvbW0gfCBzb3J0IC1ucmsgMiwzYCwgKGVyciwgc3Rkb3V0KSA9PiB7XG4gICAgICBpZiAoZXJyICE9IG51bGwpIHJldHVybiByZWplY3QoZXJyKTtcblxuICAgICAgY29uc3QgcHJvY2Vzc2VzID0gc3Rkb3V0XG4gICAgICAgIC5zcGxpdChcIlxcblwiKVxuICAgICAgICAubWFwPFByb2Nlc3M+KChsaW5lKSA9PiB7XG4gICAgICAgICAgY29uc3QgWywgaWQsIGNwdSwgcGF0aF0gPSBsaW5lLm1hdGNoKC8oXFxkKylcXHMrKFxcZCtbLnwsXVxcZCspXFxzKyguKikvKSA/PyBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl07XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHBhdGgubWF0Y2goL1teL10qW14vXSokL2kpPy5bMF0gPz8gXCJcIjtcbiAgICAgICAgICBjb25zdCBpc1ByZWZQYW5lID0gcGF0aC5pbmNsdWRlcyhcIi5wcmVmUGFuZVwiKTtcbiAgICAgICAgICBjb25zdCBpc0FwcCA9IHBhdGguaW5jbHVkZXMoXCIuYXBwXCIpO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgY3B1LFxuICAgICAgICAgICAgcGF0aCxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB0eXBlOiBpc1ByZWZQYW5lID8gXCJwcmVmUGFuZVwiIDogaXNBcHAgPyBcImFwcFwiIDogXCJiaW5hcnlcIixcbiAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgICAuZmlsdGVyKChwcm9jZXNzKSA9PiBwcm9jZXNzLm5hbWUgIT09IFwiXCIpO1xuXG4gICAgICByZXNvbHZlKHByb2Nlc3Nlcyk7XG4gICAgfSk7XG4gIH0pO1xuIiwgImV4cG9ydCBjb25zdCB1bmlxID0gPFQ+KGFycjogVFtdKTogVFtdID0+IEFycmF5LmZyb20obmV3IFNldChhcnIpKTtcbiIsICJpbXBvcnQgeyBmZXRjaFBvcnRzIH0gZnJvbSBcIi4vZmV0Y2hQb3J0c1wiO1xuaW1wb3J0IHsgUHJvY2VzcywgZmV0Y2hQcm9jZXNzZXMgfSBmcm9tIFwiLi9mZXRjaFByb2Nlc3Nlc1wiO1xuaW1wb3J0IHsgdW5pcSB9IGZyb20gXCIuL3VuaXFcIjtcblxuZXhwb3J0IHR5cGUgUHJvY2Vzc1dpdGhQb3J0cyA9IFByb2Nlc3MgJiB7IHBvcnRzOiBzdHJpbmdbXSB9O1xuXG5leHBvcnQgY29uc3QgZmV0Y2hQcm9jZXNzZXNXaXRoUG9ydHMgPSBhc3luYyAoKTogUHJvbWlzZTxQcm9jZXNzV2l0aFBvcnRzW10+ID0+IHtcbiAgY29uc3QgW3Byb2Nlc3NlcywgcG9ydHNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW2ZldGNoUHJvY2Vzc2VzKCksIGZldGNoUG9ydHMoKV0pO1xuXG4gIHJldHVybiBwcm9jZXNzZXMubWFwPFByb2Nlc3NXaXRoUG9ydHM+KChwKSA9PiAoe1xuICAgIC4uLnAsXG4gICAgcG9ydHM6IHVuaXEocG9ydHMuZmlsdGVyKChwb3J0KSA9PiBwb3J0LnBpZCA9PT0gcC5pZCkubWFwKChwKSA9PiBwLnBvcnQpKSxcbiAgfSkpO1xufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7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QUFTLEtBQUssU0FBUyxFQUFFLFNBQVMsS0FBSyxDQUFDO0FBRWhGLFdBQU8sZUFBZSxlQUFlLGNBQWM7QUFBQSxFQUNyRDtBQUVBLFFBQU0sZ0JBQWdCLENBQUMsR0FBcUIsTUFBZ0M7QUFDMUUsUUFBSSxFQUFFLFNBQVMsU0FBUyxFQUFFLFNBQVMsTUFBTyxRQUFPO0FBQ2pELFFBQUksRUFBRSxTQUFTLFNBQVMsRUFBRSxTQUFTLE1BQU8sUUFBTztBQUNqRCxXQUFPO0FBQUEsRUFDVDtBQUVBLFFBQU0sa0JBQWtCLENBQUMsRUFBRSxRQUFRLE1BQ2pDO0FBQUEsSUFBQyxnQkFBSztBQUFBLElBQUw7QUFBQSxNQUNDLE9BQU8sUUFBUTtBQUFBLE1BQ2YsTUFBTSxlQUFlLE9BQU87QUFBQSxNQUM1QixhQUFhO0FBQUEsUUFDWCxHQUFJLFFBQVEsTUFBTSxTQUFTLENBQUMsRUFBRSxNQUFNLFFBQVEsTUFBTSxLQUFLLElBQUksR0FBRyxNQUFNLGdCQUFLLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFBQSxRQUNwRixFQUFFLE1BQU0sR0FBRyxRQUFRLEdBQUcsS0FBSyxNQUFNLGdCQUFLLGFBQWE7QUFBQSxNQUNyRDtBQUFBLE1BQ0EsU0FDRSw2Q0FBQywwQkFDQztBQUFBO0FBQUEsVUFBQyx1QkFBWTtBQUFBLFVBQVo7QUFBQSxZQUNDLE9BQU07QUFBQSxZQUNOLE1BQU0sZ0JBQUs7QUFBQSxZQUNYLFVBQVUsTUFBTSxZQUFZLE9BQU87QUFBQTtBQUFBLFFBQ3JDO0FBQUEsUUFDQTtBQUFBLFVBQUMsdUJBQVk7QUFBQSxVQUFaO0FBQUEsWUFDQyxPQUFNO0FBQUEsWUFDTixNQUFNLGdCQUFLO0FBQUEsWUFDWCxVQUFVLEVBQUUsS0FBSyxLQUFLLFdBQVcsQ0FBQyxLQUFLLEVBQUU7QUFBQSxZQUN6QyxVQUFVO0FBQUE7QUFBQSxRQUNaO0FBQUEsUUFDQyxRQUFRLFFBQ1A7QUFBQSxVQUFDLHVCQUFZO0FBQUEsVUFBWjtBQUFBLFlBQ0MsT0FBTTtBQUFBLFlBQ04sTUFBTSxnQkFBSztBQUFBLFlBQ1gsVUFBVSxFQUFFLEtBQUssS0FBSyxXQUFXLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFBQSxZQUNoRCxVQUFVLE1BQU0sZUFBZSxRQUFRLElBQUs7QUFBQTtBQUFBLFFBQzlDO0FBQUEsU0FFSjtBQUFBO0FBQUEsRUFFSjtBQUdGLFNBQ0U7QUFBQSxJQUFDO0FBQUE7QUFBQSxNQUNDLFdBQVcsVUFBVSxXQUFXO0FBQUEsTUFDaEMsc0JBQXFCO0FBQUEsTUFDckIsb0JBQW9CO0FBQUEsTUFFbkIsb0JBQ0UsT0FBTyxlQUFlLEVBQ3RCLEtBQUssYUFBYSxFQUNsQixJQUFJLENBQUMsU0FBUyxVQUNiLDRDQUFDLG1CQUE0QixXQUFQLEtBQXlCLENBQ2hEO0FBQUE7QUFBQSxFQUNMO0FBRUo7IiwKICAibmFtZXMiOiBbImltcG9ydF9jaGlsZF9wcm9jZXNzIiwgImltcG9ydF9jaGlsZF9wcm9jZXNzIiwgImltcG9ydF9jaGlsZF9wcm9jZXNzIiwgInAiXQp9Cg==
