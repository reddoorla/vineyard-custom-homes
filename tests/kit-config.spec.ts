// SvelteKit 3 moved its configuration out of svelte.config.js and into the
// `sveltekit(...)` Vite plugin (reddoor-maintenance P1-53, ported from
// reddoor-starter#187 and la-homelessness-youth#32; this repo was held out
// of P1-53 behind P1-64 and moved in the 2026-10-20 kit 3 pass). These tests hold the
// places that move can go wrong without a build failing:
//   - the config object never reaching the plugin (the CSP would just vanish);
//   - a svelte.config.js coming back beside it (kit 3 refuses to start);
//   - `paths.origin` being set, which in kit 3 is also the only origin the
//     CSRF check accepts, so the contact form answers 403 on every other host;
//   - an environment variable read in src/ but not declared in src/env.ts,
//     which kit 3 turns into `undefined` at runtime (svelte-check flags it in
//     .ts and .svelte files, nothing flags it in a .js file);
//   - a `$app/stores` import, whose stores throw `app_stores_removed`.
//   - a matcher in src/params.ts returning a boolean, which kit 3 reads as a
//     match whose value is `false`;
//   - the upstream PrismicPreview, whose goto() options kit 3 rejects.
// This repo's only test runner is Playwright (`pnpm test:smoke`), so the gate
// is a spec here rather than reddoor-starter's vitest file, as in 1836dig. It
// needs no browser.
import { test, expect } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfigFromFile, type Plugin, type PluginOption } from "vite";
import { variables } from "../src/env";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function flatten(option: PluginOption): Promise<Plugin[]> {
  const value = await option;
  if (!value) return [];
  if (Array.isArray(value)) return (await Promise.all(value.map(flatten))).flat();
  return [value as Plugin];
}

/** The options SvelteKit itself validated, read off its own plugin: what kit
 *  will actually use, not what a config file says. */
async function kitOptions(): Promise<Record<string, unknown>> {
  const loaded = await loadConfigFromFile(
    { command: "build", mode: "production" },
    join(repoRoot, "vite.config.js"),
    repoRoot,
    "silent",
  );
  if (!loaded) throw new Error("vite.config.js did not load");
  const plugins = await flatten(loaded.config.plugins ?? []);
  const setup = plugins.find((p) => p.name === "vite-plugin-sveltekit-setup");
  if (!setup) throw new Error("vite.config.js does not register the sveltekit() plugin");
  return (setup.api as { options: Record<string, unknown> }).options;
}

// Netlify's build sets all of these, and a config can branch on any of them
// (this one already reads NETLIFY), so a check that sets only URL passes a
// `paths.origin` guarded on NETLIFY or CONTEXT. Every deploy context is tried.
const NETLIFY_CONTEXTS = ["production", "deploy-preview", "branch-deploy"] as const;
const netlifyEnv = (context: string) => ({
  NETLIFY: "true",
  CONTEXT: context,
  URL: "https://www.example.com",
  DEPLOY_URL: "https://6123abc--example-site.netlify.app",
  DEPLOY_PRIME_URL: "https://deploy-preview-4--example-site.netlify.app",
  SITE_NAME: "example-site",
});

async function withNetlifyEnv<T>(context: string, run: () => Promise<T>): Promise<T> {
  const env = netlifyEnv(context);
  const names = Object.keys(env) as (keyof typeof env)[];
  const saved = Object.fromEntries(names.map((n) => [n, process.env[n]]));
  Object.assign(process.env, env);
  try {
    return await run();
  } finally {
    for (const n of names) {
      if (saved[n] === undefined) delete process.env[n];
      else process.env[n] = saved[n];
    }
  }
}

test.describe("the SvelteKit config reaches the sveltekit() plugin", () => {
  test("has no svelte.config.js or svelte.config.ts, which kit 3 refuses to start beside", () => {
    expect(existsSync(join(repoRoot, "svelte.config.js"))).toBe(false);
    expect(existsSync(join(repoRoot, "svelte.config.ts"))).toBe(false);
  });

  test("hands kit the adapter, and no CSP: this site has never opted into one", async () => {
    // Kept as it was on kit 2 (createSvelteConfig without `csp`). Opting in
    // is a behaviour change, not part of the kit 3 move.
    const options = await kitOptions();
    expect((options.adapter as { name?: string }).name).toBe("@sveltejs/adapter-netlify");
    // Kit fills every directive in with a default (undefined, or false for
    // the boolean ones), so "no CSP" is: no directive carries a value.
    const csp = options.csp as { directives: Record<string, unknown> };
    const set = Object.entries(csp.directives).filter(
      ([, value]) => value !== undefined && value !== false,
    );
    expect(set).toEqual([]);
  });

  test("keeps `$lib` resolving: kit 3 no longer provides it", async () => {
    const options = await kitOptions();
    expect(options.alias).toMatchObject({
      $lib: "src/lib",
      "$lib/*": "src/lib/*",
    });
  });
});

// Kit 3's `paths.origin` is both the prerender origin and the only origin its
// CSRF check accepts a form POST from. Set on Netlify, the contact form
// answered 403 on a domain alias and on a custom domain attached after the
// last build (measured on reddoor-starter#187's built server).
test.describe("the origin", () => {
  for (const context of NETLIFY_CONTEXTS) {
    test(`is never kit's paths.origin or a CSRF list on a Netlify ${context} build, so the form posts from any host it is served on`, async () => {
      const r = spawnSync(
        process.execPath,
        [
          "-e",
          `import("./sveltekit.config.js").then((m) => console.log(JSON.stringify({ paths: m.default.paths ?? null, csrf: m.default.csrf ?? null })))`,
        ],
        {
          cwd: repoRoot,
          env: { ...process.env, ...netlifyEnv(context) },
          encoding: "utf-8",
        },
      );
      expect(r.status, r.stderr).toBe(0);
      expect(JSON.parse(r.stdout)).toEqual({ paths: null, csrf: null });
      const options = await withNetlifyEnv(context, kitOptions);
      expect((options.paths as { origin?: string }).origin).toBeUndefined();
      expect((options.csrf as { trustedOrigins: string[] }).trustedOrigins).toEqual([]);
    });
  }
});

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(svelte|ts|js)$/.test(entry) && !/\.(test|spec)\.[jt]s$/.test(entry))
      out.push(full);
  }
  return out;
}

// What a source file reads from "$app/env/<type>": through a namespace import
// (`env.NAME`, `env["NAME"]`, `const { NAME } = env`) or a named import. Kit 3
// exports only the declared names, so any of these on an undeclared name is
// `undefined` at runtime with at most a build warning.
function envReads(source: string): { type: "public" | "private"; name: string }[] {
  const reads: { type: "public" | "private"; name: string }[] = [];
  const add = (type: string, name: string) =>
    reads.push({ type: type as "public" | "private", name });
  const namespaces = source.matchAll(
    /import\s+\*\s+as\s+(\w+)\s+from\s+["']\$app\/env\/(public|private)["']/g,
  );
  for (const [, binding, type] of namespaces) {
    for (const [, name] of source.matchAll(
      new RegExp(`\\b${binding}\\??\\.([A-Z][A-Z0-9_]*)`, "g"),
    )) {
      add(type, name);
    }
    for (const [, name] of source.matchAll(
      new RegExp(`\\b${binding}\\[\\s*["'\`]([A-Z][A-Z0-9_]*)["'\`]\\s*\\]`, "g"),
    )) {
      add(type, name);
    }
    for (const [, body] of source.matchAll(
      new RegExp(`\\{([^}]*)\\}\\s*=\\s*${binding}\\b`, "g"),
    )) {
      for (const [, name] of body.matchAll(/(?:^|,)\s*([A-Z][A-Z0-9_]*)\b/g)) add(type, name);
    }
  }
  const named = source.matchAll(
    /(?:import|export)\s*\{([^}]*)\}\s*from\s+["']\$app\/env\/(public|private)["']/g,
  );
  for (const [, body, type] of named) {
    for (const [, name] of body.matchAll(/(?:^|,)\s*([A-Z][A-Z0-9_]*)\b/g)) add(type, name);
  }
  return reads;
}

test.describe("environment variables (kit 3 exposes only what src/env.ts declares)", () => {
  const files = walk(join(repoRoot, "src"));

  test("finds the reads it is meant to check (the instrument's control)", () => {
    const names = files.flatMap((f) => envReads(readFileSync(f, "utf8")).map((r) => r.name));
    expect(names).toContain("FORMS_INGEST_URL");
    expect(names).toContain("FORMS_INGEST_TOKEN");
    expect(names).toContain("PUBLIC_TURNSTILE_SITE_KEY");
  });

  test("sees every way a file can read one (the instrument's own control)", () => {
    const source = [
      'import * as env from "$app/env/private";',
      'import { NAMED_A, NAMED_B as b } from "$app/env/public";',
      "env.DOTTED;",
      "env?.OPTIONAL;",
      'export { REEXPORTED } from "$app/env/private";',
      'env["BRACKETED"];',
      "const { DESTRUCTURED, RENAMED: r } = env;",
    ].join("\n");
    expect(
      envReads(source)
        .map((read) => `${read.type}:${read.name}`)
        .sort(),
    ).toEqual(
      [
        "private:BRACKETED",
        "private:DESTRUCTURED",
        "private:DOTTED",
        "private:OPTIONAL",
        "private:REEXPORTED",
        "private:RENAMED",
        "public:NAMED_A",
        "public:NAMED_B",
      ].sort(),
    );
  });

  test("declares every variable src/ reads, as public exactly when it is read from $app/env/public", () => {
    const declared = variables as Record<string, { public?: boolean }>;
    const missing = files.flatMap((file) =>
      envReads(readFileSync(file, "utf8"))
        .filter(
          ({ type, name }) =>
            !(name in declared) || !!declared[name].public !== (type === "public"),
        )
        .map(({ type, name }) => `${relative(repoRoot, file)}: ${name} from $app/env/${type}`),
    );
    expect(missing).toEqual([]);
  });

  test("imports nothing from $app/stores, whose stores throw app_stores_removed in kit 3", () => {
    const stores = files.filter((file) =>
      /(?:from|import\s*\()\s*["']\$app\/stores["']/.test(readFileSync(file, "utf8")),
    );
    expect(stores.map((f) => relative(repoRoot, f))).toEqual([]);
  });

  test("reads none through $env/*, whose `env` object is now only a view of the declared list", () => {
    const legacy = files.filter((file) =>
      /(?:from|import\s*\()\s*["']\$env\//.test(readFileSync(file, "utf8")),
    );
    expect(legacy.map((f) => relative(repoRoot, f))).toEqual([]);
  });
});

test.describe("routing on kit 3", () => {
  test("the preview matcher returns the segment or undefined, never a boolean", async () => {
    const { params } = await import("../src/params");
    // defineParams wraps each function as a standard schema: a value is a
    // match, and only `undefined` comes back as an issue (no match).
    type Schema = {
      "~standard": {
        validate: (v: string) => { value?: unknown; issues?: unknown[] };
      };
    };
    const preview = (params as unknown as Record<string, Schema>).preview;
    expect(existsSync(join(repoRoot, "src/params"))).toBe(false);
    expect(preview["~standard"].validate("preview")).toEqual({
      value: "preview",
    });
    expect(preview["~standard"].validate("about").issues).toHaveLength(1);
  });

  test("ends a Prismic preview through the local PrismicPreview, with kit 3's goto options", () => {
    // @prismicio/svelte 2.x passes { invalidateAll, noScroll }, which kit 3
    // rejects in dev (goto_options_removed) and ignores in production
    // (the page jumps to the top). reddoor-starter#188.
    const offenders = walk(join(repoRoot, "src")).filter((file) =>
      /import\s*\{[^}]*\bPrismicPreview\b[^}]*\}\s*from\s*["']@prismicio\/svelte\/kit["']/.test(
        readFileSync(file, "utf8"),
      ),
    );
    expect(offenders.map((f) => relative(repoRoot, f))).toEqual([]);
    const local = readFileSync(join(repoRoot, "src/lib/components/PrismicPreview.svelte"), "utf8");
    expect(local).toContain("reset: false");
    expect(local).not.toMatch(/noScroll|keepFocus|invalidateAll/);
  });
});
