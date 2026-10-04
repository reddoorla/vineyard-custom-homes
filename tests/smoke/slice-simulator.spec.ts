import { test, expect } from "@playwright/test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SIMULATOR_MARKERS = ["slice-simulator--root", "sliceSimulatorAccessedDirectly"];
const SIMULATOR_ROUTE = "/slice-simulator";

const client = ".svelte-kit/output/client";
const manifestPath = join(client, ".vite/manifest.json");
const appPath = ".svelte-kit/generated/client-optimized/app.js";
const built = existsSync(manifestPath) && existsSync(appPath);

type Chunk = { file: string; imports?: string[]; isEntry?: boolean };

test.describe("the built client", () => {
  test.skip(!built && !process.env.CI, "no production build to inspect");

  const read = () => {
    expect(built, "CI must build before the smoke suite").toBe(true);
    const manifest: Record<string, Chunk> = JSON.parse(readFileSync(manifestPath, "utf8"));
    const node = readFileSync(appPath, "utf8").match(/"\/slice-simulator":\s*\[~?(\d+)/)?.[1];
    expect(node, "no client node for /slice-simulator").toBeDefined();
    const entries = Object.keys(manifest).filter((key) => manifest[key].isEntry);
    const closure = (key: string, seen = new Set<string>()): Set<string> => {
      if (seen.has(key)) return seen;
      seen.add(key);
      for (const next of manifest[key]?.imports ?? []) closure(next, seen);
      return seen;
    };
    const simulatorFiles = (entry: string) =>
      [...closure(entry)]
        .map((key) => manifest[key].file)
        .filter((file) => {
          const source = readFileSync(join(client, file), "utf8");
          return SIMULATOR_MARKERS.some((marker) => source.includes(marker));
        });
    const isSimulatorNode = (key: string) => key.endsWith(`/nodes/${node}.js`);
    return { entries, simulatorFiles, isSimulatorNode };
  };

  test("loads the slice simulator on /slice-simulator", () => {
    const { entries, simulatorFiles, isSimulatorNode } = read();
    const node = entries.find(isSimulatorNode);
    expect(node).toBeDefined();
    expect(simulatorFiles(node!).length).toBeGreaterThan(0);
  });

  test("keeps it out of every other entry's static imports", () => {
    const { entries, simulatorFiles, isSimulatorNode } = read();
    const others = entries.filter((key) => !isSimulatorNode(key));
    expect(others.length).toBeGreaterThan(2);
    for (const key of others) expect(simulatorFiles(key), key).toEqual([]);
  });
});

test("the simulator route exists", () => {
  const dir = join("src/routes", ...SIMULATOR_ROUTE.split("/").filter(Boolean));
  expect(readdirSync(dir).some((file) => file.startsWith("+page."))).toBe(true);
});
