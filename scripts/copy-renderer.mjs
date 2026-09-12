import { access } from "node:fs/promises";
import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const production = resolve(root, "renderer/build/dist/wasmJs/productionExecutable");
const development = resolve(root, "renderer/build/dist/wasmJs/developmentExecutable");
const target = resolve(root, "public/renderer");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const source = (await exists(production)) ? production : development;
if (!(await exists(source))) {
  throw new Error("No Wasm renderer distribution found. Run npm run build:renderer first.");
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
