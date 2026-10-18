import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function copyRenderer(root, mode) {
  if (mode !== "production" && mode !== "development") throw new Error("Specify production or development renderer output.");
  const source = resolve(root, `renderer/build/dist/wasmJs/${mode}Executable`);
  const target = resolve(root, "public/renderer");
  if (!(await exists(resolve(source, "index.html"))) || !(await exists(resolve(source, "miuixRenderer.js")))) {
    throw new Error(`Incomplete ${mode} Wasm renderer distribution. Run npm run build:renderer first.`);
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
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await copyRenderer(resolve(import.meta.dirname, ".."), process.argv[2]);
}
