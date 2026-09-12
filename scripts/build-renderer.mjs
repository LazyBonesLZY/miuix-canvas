import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const gradlew = resolve(root, "renderer/gradlew");
const production = resolve(root, "renderer/build/dist/wasmJs/productionExecutable");
const development = resolve(root, "renderer/build/dist/wasmJs/developmentExecutable");
const preferProduction = process.env.CI === "true" || process.env.MIUIX_RENDERER_PRODUCTION === "1";

function gradle(task) {
  const result = spawnSync(gradlew, ["-p", "renderer", task, "--console=plain"], {
    cwd: root,
    stdio: "inherit",
  });
  return result.status === 0;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (preferProduction && gradle("wasmJsBrowserDistribution") && (await exists(production))) {
  process.exit(0);
}

if (preferProduction) {
  console.warn("Production Wasm optimize failed; building the development executable.");
}

if (!gradle("wasmJsBrowserDevelopmentExecutableDistribution") || !(await exists(development))) {
  process.exit(1);
}
