import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { copyRenderer } from "./copy-renderer.mjs";

const root = resolve(import.meta.dirname, "..");

function gradle(task) {
  const windows = process.platform === "win32";
  const wrapper = resolve(root, windows ? "renderer/gradlew.bat" : "renderer/gradlew");
  const result = spawnSync(windows ? `"${wrapper}"` : wrapper, ["-p", "renderer", task, "--console=plain"], {
    cwd: root,
    stdio: "inherit",
    shell: windows,
  });
  if (result.error) console.error(result.error.message);
  return result.status === 0;
}

export async function buildRenderer({
  projectRoot = root,
  production = false,
  runGradle = gradle,
} = {}) {
  if (production && runGradle("wasmJsBrowserDistribution")) {
    await copyRenderer(projectRoot, "production");
    return;
  }
  if (production) console.warn("Production Wasm optimize failed; building the development executable.");
  if (!runGradle("wasmJsBrowserDevelopmentExecutableDistribution")) {
    throw new Error("Wasm renderer build failed.");
  }
  // Copy the distribution built by THIS invocation, even when stale production output exists.
  await copyRenderer(projectRoot, "development");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await buildRenderer({
    production: process.argv.includes("--production") || process.env.CI === "true" || process.env.MIUIX_RENDERER_PRODUCTION === "1",
  });
}
