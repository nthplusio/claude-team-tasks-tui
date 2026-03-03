import solidPlugin from "@opentui/solid/bun-plugin"

const result = await Bun.build({
  entrypoints: ["./index.tsx"],
  outdir: "./dist",
  target: "bun",
  format: "esm",
  plugins: [solidPlugin],
  external: [
    "@opentui/solid",
    "@opentui/core",
    "solid-js",
    "solid-js/store",
    "solid-js/web",
    "chokidar",
    "gray-matter",
  ],
  naming: "cli.js",
})

if (!result.success) {
  console.error("Build failed:")
  for (const log of result.logs) console.error(log)
  process.exit(1)
}

// Prepend shebang for direct execution
const outPath = "./dist/cli.js"
const content = await Bun.file(outPath).text()
await Bun.write(outPath, `#!/usr/bin/env bun\n${content}`)

console.log("Built dist/cli.js")
