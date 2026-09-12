import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

const htmlPath = resolve(target, "index.html");
const html = await readFile(htmlPath, "utf8");
await writeFile(
  htmlPath,
  html.replace(
    /<script src="miuixRenderer\.js"[^>]*><\/script>/,
    '<script src="miuixRenderer.js" type="module"></script>',
  ),
);

// kotlinx-io emits a Node-only helper that mentions `import.meta`. That token is a
// SyntaxError in classic scripts, so the whole Compose bundle never starts.
const jsPath = resolve(target, "miuixRenderer.js");
const js = await readFile(jsPath, "utf8");
if (js.includes("import.meta")) {
  await writeFile(jsPath, js.replaceAll("import.meta", "undefined"));
}
