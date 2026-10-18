import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildRenderer } from "./build-renderer.mjs";

const roots = [];
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
async function fixture() {
  const root = await mkdtemp(resolve(import.meta.dirname, "../.renderer-test-"));
  roots.push(root);
  for (const mode of ["production", "development"]) {
    const dir = resolve(root, `renderer/build/dist/wasmJs/${mode}Executable`);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, "index.html"), '<script src="miuixRenderer.js"></script>');
    await writeFile(resolve(dir, "miuixRenderer.js"), `const mode = '${mode}'; const meta = import.meta;`);
  }
  return root;
}
describe("renderer distribution", () => {
  it("copies development output even when old production output exists", async () => {
    const root = await fixture();
    await buildRenderer({ projectRoot: root, runGradle: () => true });
    expect(await readFile(resolve(root, "public/renderer/miuixRenderer.js"), "utf8")).toContain("'development'");
    expect(await readFile(resolve(root, "public/renderer/index.html"), "utf8")).toContain('type="module"');
  });
  it("copies the new development output after production optimization fails", async () => {
    const root = await fixture();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const runGradle = vi.fn((task) => task !== "wasmJsBrowserDistribution");
    await buildRenderer({ projectRoot: root, production: true, runGradle });
    const js = await readFile(resolve(root, "public/renderer/miuixRenderer.js"), "utf8");
    expect(js).toContain("'development'");
    expect(js).not.toContain("import.meta");
    expect(runGradle).toHaveBeenCalledTimes(2);
  });
  it("copies production output when its build succeeds", async () => {
    const root = await fixture();
    await buildRenderer({ projectRoot: root, production: true, runGradle: () => true });
    expect(await readFile(resolve(root, "public/renderer/miuixRenderer.js"), "utf8")).toContain("'production'");
  });
  it("fails without publishing stale output if compilation fails", async () => {
    const root = await fixture();
    await expect(buildRenderer({ projectRoot: root, runGradle: () => false })).rejects.toThrow("build failed");
    await expect(readFile(resolve(root, "public/renderer/index.html"))).rejects.toThrow();
  });
});
