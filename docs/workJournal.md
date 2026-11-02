# Vineyard Custom Homes — Work Journal

Running log of build work: what was done, why, and where it landed.
Chronological — newest entry at the bottom. [README.md](../README.md) says what
the stack is and how to run it; this is the history of getting it there.

The convention is in [CLAUDE.md](../CLAUDE.md) under "The work journal". In
short: every working session appends a dated entry, prose over bullets, why
over what, and history is never edited to be right — a later entry corrects an
earlier one and says so.

---

## 2026-09-05 — Journal opened, and 111 commits summarised rather than reconstructed (`chore/work-journal`)

The journal starts today, so this first entry is a **backfill**: a coarse
summary read off the commit log, not written from memory. Detail below this
line is trustworthy; detail above it is not, and nothing here should be cited
as though someone recorded it at the time. For anything before 2026-09-05 the
commit log is the record.

**What this repo is.** The marketing site for Vineyard Custom Homes, a custom
home builder in Eagle, Idaho — SvelteKit 5 on Prismic and Tailwind v4, deployed
to Netlify. Home, about, contact, a gallery with per-project pages, and a
`[uid]` catch-all. 111 commits, 2025-05-08 to 2026-09-01.

**The eras, and they are sharp.** 2025 is the build: 36 commits between May and
September, with messages like `first commit`, `auto`, `cleaned up half height`,
`changes from tim` — a site made by hand, client rounds landing straight on
`main`. Then **nothing between 2025-09-08 and 2026-05-20**: eight months dark.

What ended the gap was not feature work. **June 2026 carries 43 commits, the
biggest month by far, and nearly all of it is this site being pulled into the
fleet** — eleven `chore: sync … from @reddoorla/maintenance` commits on
2026-06-04 alone (eslint, prettier, ci, renovate, netlify, lighthouse,
playwright-a11y), `jsconfig` → `tsconfig`, the `/dev/a11y-fixtures` route, and
two review PRs clearing what canonical tooling surfaced: a gallery build crash,
dynamic-route 404s, a slice migration. The rest of June is the same
consolidation by other means — Node 24 and pnpm 11, FontAwesome replaced with
`@lucide/svelte`, Typekit moved onto the shared kit `noj4tji`, the contact form
taken off Netlify Forms onto central ingest.

July and August are operational, not visual: `/health`, a smoke suite,
enrolment in the fleet form-e2e probe, Turnstile on the contact form, then a
long dependency run (vite 8, typescript 6, prettier-plugin-svelte 4). The last
two commits are reusable CI v1.4.1 and #59, which capped Prismic srcset widths
and gave every image a real `sizes`.

**One thing the log implies wrongly.** This site only ever grew two Prismic
slices, `RichText` and `ContentWidthMedia`. Everything that looks like a slice
elsewhere in the fleet is a component under `src/lib/components/` here — it was
built before the shared slice library existed and was never retrofitted.

**State as of this entry.** `main` at `49d2fde`, tree clean, nothing in flight.
The README is stale in two checkable ways: it claims Vite 6 and Node 22, while
`package.json` is on Vite 8 and both `.nvmrc` and `netlify.toml` say Node 24.

## 2026-10-04 — Off Slice Machine, onto the Prismic CLI (reddoor-maintenance#1090)

Phase 4 of the fleet migration (reddoor-maintenance#1090), following the
espada port. Slice Machine is deprecated by Prismic since 2026-09-18; models
are now edited in the Type Builder and the generated files come from
`pnpm prismic:gen`. `prismic.config.json` replaces `slicemachine.config.json`,
which two files read: `src/lib/prismicio.js` and `vite.config.js`'s `fs.allow`.

**The types file moved, and the imports followed it.** The CLI writes
`prismicio-types.d.ts` at the project root, outside SvelteKit's `src/**`
include. Unlike espada, six files here import the types by relative path (both
slices, `ProjectImage.svelte`, and three gallery route files), so moving each
path up one level keeps the file in the program and no `app.d.ts` import is
needed. `svelte-check` was 0 errors / 10 warnings before and after. A probe
calling `getByUID("definitely_not_a_type", …)` failed with the seven-type
union, so the client is still typed rather than silently `any`.

**A stale model, found by regenerating.** The new types add
`FormRepliesDocument` and `FormRepliesDocumentDataRepliesItem`: the committed
Slice Machine types predated `customtypes/form_replies` (18 exported names
before, 20 after; the slice index's two entries are unchanged). The comment in
`src/lib/server/reply-copy.ts` said `form_replies` was absent from the union;
it no longer is, so the comment now says how a type gets into it. The cast it
explains is still needed for a `(type: string)` reader.

**No framing change was needed.** The site passes no `csp` to the central
config, has no `hooks.server`, and `netlify.toml` sets no headers. Measured
from `vite preview`: `/slice-simulator` (prerendered), `/`, `/about`,
`/gallery`, `/health` and `/contact` (both server-rendered) send neither
X-Frame-Options nor a CSP. Live on www.vineyardconstruction.com,
`/slice-simulator`, `/`, `/about` and `/health` send neither either. The same
grep found `x-frame-options` on google.com, so it can see the header.

**An instrument that answered for someone else.** The first preview
measurement showed CSP `frame-ancestors 'self'` and `X-Frame-Options:
SAMEORIGIN` on server-rendered routes, which nothing in this repo sets. The
port was already taken by another process: `--strictPort` made this site's
preview exit, and curl reached the other server. Re-run on a port that
answered nothing beforehand, with the preview's own log showing it listening.

**The codegen gate's local mutation needs a commit.** Deleting an entry from
`src/lib/slices/index.ts` in the working tree left the local gate GREEN,
because regenerating overwrote the hand edit back to HEAD's file. Committed
first (as it would be in a PR), the same mutation went RED. Model mutations
(a field added to the RichText slice, a field added to `project`) went RED
uncommitted, since the model itself stays changed.

The nightly drift sweep read this site's 9 models as matching Prismic at
`965fe9e`, the base of this change, so nothing was owed to Prismic first.

## 2026-10-04 — The slice simulator leaves every Prismic page's bundle (branch `fix/simulator-chunk-and-encoded-framing`)

Ported from reddoor-starter#168, following caltex-landing#70 and revogen#91; the reasoning and the fixes that failed are recorded in the starter. The two slices and five components import `PrismicImage` and `PrismicRichText` from the `@prismicio/svelte` barrel, and `/slice-simulator` imports `SliceSimulator` from the same barrel. The barrel statically re-exports the simulator, so Rolldown put `@prismicio/simulator` into a chunk shared with the public pages, and six of them preloaded it. `scripts/prismic-barrel.ts` declares that one re-export-only module side-effect-free, and Rolldown then binds each import to its own module.

Measured from the build manifest as each node's static-import closure, gzipped, before → after: home 43,680 → 37,260, `[uid]` 31,927 → 23,729, `about` 46,115 → 38,765, `contact` 53,897 → 46,551, `gallery` 39,038 → 31,686 and `gallery/[uid]` 39,434 → 35,550. Before, all six reached the simulator chunk. After, only `/slice-simulator` does (34,148 → 34,770), and it carries the code in its own node. The root layout (43,825 → 43,823) never reached it. Rebuilds of the same tree move these numbers by a few bytes, because chunk hashes are part of the files.

There is no framing change. The site has no `hooks.server` and sets no X-Frame-Options or CSP anywhere, and `vite preview` showed neither header on any path before or after, including `/slice%2Dsimulator`.

The proof is `tests/smoke/slice-simulator.spec.ts`, which reads the build manifest from disk. On `main` it failed the bundle check (1 of 3). On this branch it passes 3 of 3. With the plugin removed from `vite.config.js` and the site rebuilt, the bundle check fails again. The plugin is imported without an extension because `svelte-check` runs `checkJs` here.

## 2026-10-12 — The home page clears image-alt and color-contrast (#77, issue #76)

The `fleet-lighthouse` nightly scored the home page 0.88 accessibility on 10-09, 10-10 and 10-11, the lowest in the fleet. Reproduced through the nightly's own `lighthouseAudit` deployed path against production at 02:45Z: 0.88 in 3 of 3 runs, with the same three nodes every time.

**image-alt.** The first Instagram tile's Prismic image (`Screenshot2025-07-01at4.04.38PM.png`) has `alt: null`, and `PrismicImage` renders no `alt` attribute at all when the field's alt is empty and no `fallbackAlt` is given. `withFallbackAlt` in `src/lib/image-alt.ts` fills a missing or blank alt on a filled image, leaves an empty image field alone, and throws on an empty fallback so it cannot be used to mark an image decorative. `PrismicImage`'s own `fallbackAlt` only accepts `""`, which is why the fallback goes in through the field. The Instagram grid and the testimonial images, the only Prismic images on `/`, both use it; a testimonial image published without alt would otherwise fail `/`, and through the smoke spec every unrelated PR. The real description of the failing tile ("Vintage teal-and-white pickup truck with the Vineyard Custom Homes logo on its door, parked outside a home under construction") is staged in the Prismic release "Accessibility: alt text for the home page Instagram tile (P1-43)", for the operator to publish. The item is P1-44 in reddoor-maintenance: another session took P1-43 for MSOT while this was in flight, and the Prismic connector cannot rename a release.

The fix does less for a screen-reader user than the score suggests. Each tile link carries `aria-label="vch instagram photo"`, which becomes the link's name and hides the alt, so the four links still announce identically. That label, the filename-like alts on the other tiles and testimonials ("bentley 42", "hg 3", "heuser 1"), failing hover contrast, light blue on white across the other pages, and two alt-less founder photos on `/about` are filed as #78, outside this change.

**color-contrast.** Both nodes are `text-light` (#7ba0c4) on white, 2.73:1 as axe reports it. The h1's "utmost care" is 36px on desktop and exactly 24px below 787px, large text at both, so it needs 3:1. It moves to a new `light-display` token, #7196b9: the brand blue mixed 7.5% toward the brand navy in OKLab, 3.10:1, ΔE_ok 3.3 from the original, just above the roughly 2 that can be told apart, and only barely distinguishable side by side. The name says it is for display sizes: at 3.10:1 it fails any text under 24px. The "01 / V" medallion text is 12px and needs 4.5:1. The smallest same-hue tone that reaches it, #547899, is ΔE_ok 13 away, a visible change, so it uses the existing navy (`text-dark`, 15.6:1) instead of inventing a tone. The ring and rule stay light blue. The same medallion sits on `/about`, `/contact`, `/gallery` and every project page, and review caught that changing only the home page's made the motif inconsistent, so the three on white changed too. The first widening also changed the project page's, which sits over the darkened hero media (`brightness-80 bg-dark` plus the darken gradient, white h1): navy there would have been navy on near-navy. Its light blue reads 5.69:1 against the `bg-dark` fallback and stays, so the motif is light blue on dark and navy on white. `--color-light` itself is unchanged: it is 5.69:1 on the navy testimonial cards, and darkening it would have lowered that.

**The instrument.** `tests/smoke/home-a11y.spec.ts` runs axe's `image-alt` and `color-contrast` rules on `/` at 1280 and 390, with `ignoreLength` so one-character text is checked (axe otherwise files it as incomplete, which is why the "V" was never flagged), asserts every Instagram and testimonial image carries a non-empty alt, and pins the helper. It was red on `main`'s page and CSS, with the h1 span, both medallion labels and the tile named, and green on the branch. Review found two flaws in the first version. Its check that axe had passed the tiles could never fail, because it compared a page-wide count with four. And `AxeBuilder#options` replaces the builder's whole option object, so calling it after `withRules` dropped `runOnly`: the scan ran every axe rule under a title naming two. Options now come first, and the spec asserts that exactly those two rules ran. Mutations against the final version:

| Mutation                                             | Result                                           |
| ---------------------------------------------------- | ------------------------------------------------ |
| Helper returns the field unchanged                   | red: the helper test and both page tests         |
| Grid call site passes `insta.image` straight through | red: both page tests (image-alt)                 |
| "utmost care" back to `text-light`                   | red: `h1 > span`                                 |
| Medallion text back to `text-light`                  | red: both labels                                 |
| Only the "V" back to `text-light`                    | red: the "V" label                               |
| `--color-light-display` back to #7ba0c4              | red: `.text-light-display`                       |
| `withFallbackAlt(insta.image, "")`                   | red: the helper throws, the page does not render |
| `fallbackAlt=""` on a tile (marks it decorative)     | red: the empty-alt assertion                     |
| `alt=""` on the testimonial image                    | red: the empty-alt assertion                     |
| `.options()` after `.withRules()`                    | red: the scan ran every rule, not two            |
| No `ignoreLength`, and the "V" back to `text-light`  | red: the "V" reported as skipped short text      |

Limits: once the release is published, the grid call-site mutation goes green, because the content then supplies the alt. The testimonial call site is never shown to matter: all three testimonial images carry alts today, so dropping its fallback leaves the suite green. Nothing tests the medallions on the other pages. Dropping `ignoreLength` alone also stays green, correctly: axe sets a one-character text aside only when it fails, and the navy "V" passes; the spec asserts that nothing is set aside, which goes red once the "V" fails too.

Review ran two rounds of three lenses. Round 1 found the medallion inconsistency and the test flaws above. Round 2 found the regression round 1 had made on the project page, so under the fleet's two-dirty-rounds rule the PR went to the operator rather than a third round.

The first mutation run was invalid. Its control restored `main`'s files with `git checkout <sha> -- <paths>`, which also writes the index, so each later mutation's `git checkout -- .` restored the control instead of the branch and every row read the same. Restoring from `HEAD` fixed it.

Measured with the nightly's code path: accessibility 1.00 in 3 of 3 runs on a local `vite build` + `vite preview`, and 1.00 in 3 of 3 on the PR's deploy preview at `8f327b5` (image-alt and color-contrast 1 in every run; its SEO 0.69 is the preview's noindex). The playwright pinned here wants `chromium_headless_shell-1243`, which a cloud container does not have; a local config pointing `launchOptions.executablePath` at `$CHROME_PATH` ran the suite without `playwright install`.

Staging a Prismic release fires the site's "Prismic" Netlify build hook: production rebuilt at 02:54Z and 03:48Z, when the release was created and written, without any change to published content. Publishing the release will rebuild the prerendered home page in the same way.

## 2026-10-20 — SvelteKit 3 and adapter-netlify 7, on `@reddoorla/maintenance` 0.109's `createKitConfig` (`claude/kit3-adapter7`, into `main`)

Renovate's #93 (kit 3) and #92 (adapter-netlify 7) could only land together, because adapter 7 peers kit `^3`, and each was red alone. This replaces both. P1-53 moved eight fleet repos on 10-19 and held this one behind P1-64, whose `@types/node` fix (#94) is what made a fresh lockfile type-check again. This is the factory-shaped port, done the way caltex-landing's was: `svelte.config.js` became `sveltekit.config.js` calling `createKitConfig` with the same adapter options and the same refusal of `VITE_REDDOOR_GATE_FIXTURES` on Netlify, `vite.config.js` hands it to `sveltekit(kitConfig)`, and `eslint.config.js` imports it. `@reddoorla/maintenance` went from `^0.95.1` to `^0.109.1`, the first line whose peer range admits kit 3. Of what this site imports, only `configs/svelte` (the new factory) and `configs/playwright-a11y` changed shape; `forms` changed only in central-ingest code the site never runs, and `createIngestAction` is byte-identical.

The lockfile moved exactly what the bump asks for: kit 2.70.3 → 3.1.0, adapter 6.0.4 → 7.0.1, maintenance 0.95.1 → 0.109.1, svelte 5.57.0 → 5.57.2 (kit 3.1 peers `^5.57.1`), cookie 0.7.2 → 2.0.1, plus adapter 6's esbuild 0.25 and toml parser and kit 2's `@types/cookie`, `kleur` and `set-cookie-parser` gone, and `@netlify/types` and `devalue` in. `@types/node` stays 24.19.2. The `"cookie@<0.7.0": ^0.7.2` floor in `pnpm-workspace.yaml` is gone: its comment said kit still declared `cookie ^0.6.0`, and kit 3 declares `^2.0.1`. Unlike caltex's form of the floor (`"@sveltejs/kit>cookie"`), this one could not have pinned kit 3 back, because it only matched versions below 0.7, so removing it changes no resolved version; it went because its reason is gone.

What kit 3 would have broken silently. The contact form's action and `/health` read `FORMS_INGEST_URL` and `FORMS_INGEST_TOKEN` through `$env/dynamic/private`, and `TurnstileWidget` read `PUBLIC_TURNSTILE_SITE_KEY` through `$env/dynamic/public`. Under kit 3 those objects are a view of `src/env.ts`'s declared list, so with no `src/env.ts` the form would have answered every visitor "This form is temporarily unavailable" while Netlify had both variables set. The starter's `src/env.ts` declares exactly these three, and all three readers now import `$app/env/*`. The `preview` matcher moved from `src/params/preview.js` (a boolean) into `src/params.ts` (the segment or `undefined`). The root layout renders a local `PrismicPreview` copied from reddoor-starter#188, because `@prismicio/svelte` 2 calls `goto` with options kit 3 rejects. The layout was already on `$app/state`. `/dev`'s guard moved to `$app/env` and `error(404, "Not found")`, `/health` answers through `Response.json`, `tsconfig.json` extends `$app/tsconfig` with its own `include`, and the simulator smoke spec reads kit 3's `.svelte-kit/generated/build/` path.

There was no origin plumbing to port. Nothing set `prerender.origin`; canonical, og:url, JSON-LD and the sitemap all build from the layout's and the sitemap's `SITE_URL` constant, never `page.url`. A production build with `URL` set prerendered the same 12 HTML and XML files before and after, and none names `sveltekit-prerender`.

Measured on `vite preview` of the kit 3 build. With the three variables set, `/health` gave `{"ok":true,"prismic":"ok","forms":{"ingestUrl":true,"ingestToken":true,"turnstile":true,"testMode":true}}`, and a `testMode=true` POST to `/contact` answered 200 after the action forwarded it to a local stub at `FORMS_INGEST_URL` with `x-forms-token` set to the configured token. With all three unset (`env -u`, since this container exports the ingest pair itself), `/health` gave all three `false` and the same POST answered 500 "temporarily unavailable", with nothing reaching the stub. No real lead was posted.

The gate is `tests/kit-config.spec.ts`, caltex-landing's Playwright port of the starter's `kit-config.test.ts`, committed first and red on the kit 2 tree (it imports `src/env.ts`, which did not exist). On the migrated tree the whole Playwright suite ran 30 of 30: the 19 smoke tests CI already ran plus the gate's 11. The brief's three mutations each went red: `FORMS_INGEST_TOKEN` removed from `src/env.ts` failed the gate's "declares every variable" test; a restored `svelte.config.js` stopped `pnpm check` and the gate's webServer with `config_file_unsupported`; a `$app/stores` import in the layout failed the gate's "imports nothing from $app/stores" test and one `svelte-check` error. `svelte-check` reports 0 errors and 10 warnings, the same as `main`. The build adds kit 3's `config_option_deprecated_alias` warning, expected until the fleet's `#lib` follow-up.

The pinned Playwright still wants `chromium_headless_shell-1243`, which the cloud container lacks; this run pointed 1243 at the installed 1248 instead of downloading.

Review round 1 ran three lenses. The runtime lens found nothing. It built `main` and this branch side by side, exercised 20 routes, the form, Turnstile, the preview flow and the Netlify function handlers directly, and saw no difference a visitor would notice. The completeness lens found minors only.

The gate lens found one major. The origin test simulated Netlify with `URL` and the deploy URLs but not `NETLIFY` or `CONTEXT`, so a `paths.origin` guarded on either passed it. This config already branches on `process.env.NETLIFY`, so that is a realistic way to bring back the 403 the test exists for. The test now sets `NETLIFY=true` and runs once per deploy context (production, deploy-preview, branch-deploy). With the guard on `NETLIFY` all three fail, and with it on `CONTEXT === "production"` the production one fails.

Folded in with it:

- The env scan now counts `env?.NAME` and `export { … } from "$app/env/*"`, and the instrument's own control test proves it sees both.
- `walk` skips `.test.js` too.
- `"reddoor": { "absentFixtures": ["/dev/animate-in"] }` puts the CI a11y audit back to `pass`. This site never had that fixture, and maintenance 0.109 reports a missing fixture as `warn` where 0.95 counted its 404 page, as on caltex-landing#83.
- Two overstatements are corrected. An undeclared env read is caught by `svelte-check` in `.ts` and `.svelte` files and is silent only in `.js` files and at runtime. The lockfile also dropped kit 2's `@types/cookie`, `kleur` and `set-cookie-parser`.

The rest is filed as #97: the gate still waits on the dev webServer, three rarer env spellings are still unscanned, and the README is stale.

Round 2 ran one reviewer across all three lenses and found no major. The `NETLIFY` and `CONTEXT` guards each fail their own context. A guard placed only in `vite.config.js` still fails through `kitOptions`. `loadConfigFromFile` re-evaluates the config on every call, so nothing passes on a cached copy. A corrected belief, correcting this entry's round 1 paragraph: `svelte-check` does flag an undeclared read in a `.js` file, because `checkJs` is on. Nothing is silent in any checked file, and the gate's job is to hold the line when `pnpm check` is skipped. The minors are folded in: a backtick dynamic import of `$app/env/*` and a bare `export * from "@prismicio/svelte/kit"` now fail, each with a control line. Two more go to #97: a guard on a Netlify variable the gate does not set (`DEPLOY_ID`, `BUILD_ID`) still passes, and a dynamic `import("@prismicio/svelte/kit")` is not scanned.

## 2026-10-27 — Ending a preview is asserted in a browser, not read from source (#103)

The fleet test audit (`reddoorla/reddoor-workspace` `audits/2026-10-26-fleet-test-audit/report.md`, batch D) found two tests here that break the template's test rule. Neither held a real catch that the change loses, so both changes stand; the audit's mutants for this site were all Playwright, which `mutate.mjs` cannot drive, so the proof below was run by hand.

`tests/kit-config.spec.ts` "ends a Prismic preview through the local PrismicPreview" read `PrismicPreview.svelte` as text for `reset: false` and the absence of `noScroll|keepFocus|invalidateAll`. That was the only guard against reddoor-starter#188, ending a preview throwing the editor to the top of the page, and it restated the implementation. Its three source lines are gone, and a new `tests/smoke/prismic-toolbar.spec.ts` test does the job in a browser: it sets the `io.prismic.preview` cookie, opens `/preview/about`, scrolls to 400, checks through the DevTools protocol that `window` has a `prismicPreviewEnd` listener, dispatches the event once, and asserts the path becomes `/about` with `scrollY` still 400.

The test as the audit wrote it was vacuous, and only running it showed that. It waited on `toHaveURL(/\/about$/)`, which `/preview/about` already matches, so the retry loop passed on the first try without any navigation, and the test then failed on the plain path check against a production bundle ("Expected: /about, Received: /preview/about"). The wait is now a predicate on `url.pathname === "/about"`. Proved against `PrismicPreview.svelte` mutants on the dev server: dropping `reset: false` goes red with `scrollY` 0 against 400; dropping `endingPreview = true` goes red with the URL stuck on `/preview/about` (beforeNavigate sends the editor back, which the source check could never see); adding `noScroll: true` goes red the same way, because kit 3 throws `goto_options_removed` in dev. The `reset: false` mutant was also built (`vite build`, 7 m 36 s here, mostly prerender) and goes red against the production bundle, 0 against 400; the unmutated bundle passes. What neither the old check nor the new test sees: `invalidateAll` in place of `refreshAll` (kit 3.1 maps it and only warns), and `refreshAll` dropped entirely.

"a normal visit loads no Prismic toolbar" lost its fixed 3 s sleep: it now waits for `html[data-hydrated]`, a marker the root layout sets in `onMount`, and also asserts no `static.cdn.prismic.io` script tag is in the DOM, which catches a toolbar tag added but not yet fetched. The first version waited on `networkidle` instead, and review showed that was an unbounded wait on the wrong thing: on the dev server CI uses, `/@imagetools/<hash>` requests take 11.8 to 25.8 s each (vite-imagetools encodes on every request), so the page never went idle inside the 30 s test timeout here. `waitUntil: "load"` has the same flaw, because `load` waits on every image, so all three tests now navigate to `domcontentloaded` and wait for the marker, which is positive evidence that the layout code that would mount `PrismicPreview` has run (a child's `onMount` runs before the layout's). Six repeats of the file on the dev server: 18 of 18 passed. The toolbar mounted for every visitor goes red, both server-rendered (`{#if true}`) and mounted only in the browser; a toolbar injected from a timer after hydration would pass, and catching that would need the fixed wait the gate bans.

The preview-end test first retried the event every second until the URL changed, and review 2 showed the retry was the flake it was meant to absorb: each dispatch starts a new `goto`, which supersedes the one in flight, so a `/about` load slower than the 1 s window never landed (a probe logged 9 dispatches and 9 `__data.json` requests, none finished). The listener is attached before the hydration marker appears, since a child's `onMount` runs first, so one dispatch is enough; the test now proves the listener is there instead of assuming it, dispatches once and waits on the URL under the test's own timeout. Single-dispatch loads here took 0.2 to 9.3 s, and a probe at a fixed 20 s cap still missed one slow Prismic answer, which is why the wait has no cap of its own. With `/about`'s data delayed 2.5 s it passes 3 of 3, and the file passed 18 of 18 over six repeats on the dev server and 5 of 5 with `pages.spec.ts` on a production build. `tests/smoke/routes.ts` now names `html[data-hydrated]` as the home page's hydration marker instead of the server-rendered `footer`, which proved paint, not hydration.

A trap for the next agent working in a worktree with a symlinked `node_modules`: kit 3 writes its tsconfig into `node_modules/$app/tsconfig.json` with `rootDirs: ["../..", …]`, and TypeScript resolves that through the link to the main clone, so `svelte-check` in the worktree reports 18 false `./$types` errors. With `node_modules` as a real directory of links and `$app` copied, it reports 0.

## 2026-10-27 — The slice simulator takes a children snippet, so Renovate's @prismicio/svelte 3 PR could land (#102, `afc70a7`)

Renovate's `@prismicio/svelte` 2.x → 3.0.0 major (published that morning) failed `ci / ci` on one line of `svelte-check`: `'$$_rotalumiSecilS0.$$slot_def' is of type 'unknown'` at `<SliceSimulator let:slices>` in `src/routes/slice-simulator/+page.svelte`. In v3, `SliceSimulator` is a Svelte 5 component that takes `children: Snippet<[{ slices }]>`. In v2 it was a legacy `<slot {slices} />`. The fix is the snippet form, `{#snippet children({ slices })}`. It could not land ahead of the bump: on v2 the same snippet fails `svelte-check` with `Binding element 'slices' implicitly has an 'any' type`. So it rode as a commit on Renovate's own branch, and the PR merged into `main`. This repo has no unit suite of its own (only `test:smoke`), so the local evidence was `pnpm check` (1 error → 0, its 10 existing warnings unchanged) and `pnpm build`.

This was a migration to a major, so it went to the operator as reddoor-workspace `decisions/2026-10-27-1336-p1-80-prismic-svelte-3-major.md`. He chose "Take v3 + queue starters". The same change for `reddoor-starter` and `reddoor-starter-blux` is queued as its own task, so later sites stop getting the same red v3 PR.

Not proven: no test renders `/slice-simulator` inside Prismic's builder. The evidence that it works on v3 is the type check, the build, and a review that read v3's component (it renders `children?.({ slices })` inside its root, and with no simulator message yet it shows only the empty white overlay).

Backlog: P1-80.

## 2026-11-01 — ContentWidthMedia two-col offers 3:4 and 2:3, and the left column stops growing on a phone (branch `claude/vineyard-aspect-ratios`)

Tim asked on 10-30 for two more ratios on the two-col `image aspect` select, from an editor screenshot holding two portrait photos from traditional-elegance (1920×2560 is 3:4, 1706×2560 is 2:3). The select lives only on the `twoCol` variation; `single` has no aspect field and is unchanged. The live Prismic model matched `model.json` exactly before the change (`get_shared_slice`: options `["9:16","1:1"]`, default `9:16`), so the PR's model delta is only the two options, and CI delivers it on merge to `main`.

The component's two-way ternary (9:16, else square) became a lookup of full class strings, so Tailwind still sees every class. 9:16 and 1:1 keep their 4:3 phone fallback. 3:4 and 2:3 keep their portrait box on a phone too: at 390px, 2:3 is 359×538, while 9:16 would be 638 tall, which is presumably why 4:3 existed. An unrecognised value still renders square, as before.

**Defect found while testing, live today:** below md the left column had no `overflow-hidden`, so as a flex-column item its automatic minimum height was the image's own height, and a portrait photo pushed it past `aspect-[4/3]`. Measured on vineyardconstruction.com/gallery/traditional-elegance at 390px: left boxes at 0.749, 0.666 and 0.563 (each photo's own shape) against right boxes at 1.333 every time. The right column always had `overflow-hidden`, which is why only half the pair was wrong and nobody noticed. The left column now has it too. On a phone, every existing left column holding a portrait photo becomes 4:3 like its partner.

The test is `tests/smoke/content-width-media.spec.ts` over a new guarded fixture, `/dev/content-width-media` (the slice once per option, with Tim's two photos). It checks each box's width/height at 1280 and 390, `object-fit: cover`, and that the image fills its box. It passed 2 of 2. The first phone run failed on the live defect above (0.750 where 4:3 was expected), which is how the defect was found. A mutant wiring 2:3 to the 3:4 box failed it (0.75 against 0.667). Locally the repo's pinned Playwright 1.64 has no browser in the cloud container, so it ran through an uncommitted config pointing at the preinstalled Chromium.

Usage: not readable

## 2026-11-01 — A `build-gallery` skill lays out a project gallery from photos, tested by rebuilding Nantucket Farm (`claude/build-gallery-skill`)

Tim asked on 10-30 for "a folder of finished photos" to become a gallery page on its own: front-door hero, rooms kept together, varied single and two-col slices, every photo tagged with the project and a room, and alt text. This adds `.claude/skills/build-gallery/`: `SKILL.md`, the procedure, and `rules.md`, the layout, tag and alt-text rules, written for Tim to edit. It uses only the Prismic connector (and the Dropbox connector), with no script, because the operator asked how Tim would run it: he uses claude.ai, not Claude Code or GitHub. The same folder, zipped, is a claude.ai skill. A self-serve page comes later and can run on Tim's own Claude plan as a claude.ai artifact (the `sample` and `mcp` capabilities), with no API key. The operator's four answers, and the two follow-ups that got there, are in reddoor-workspace `decisions/2026-11-01-1639-vineyard-gallery-automation-shape.md`.

**Beliefs corrected on contact.** A gallery page is the `project` type; `gallery` is only the index. The hero is the `hero_image` field above the slices, so "start with the front door" fills a field, not a first slice. Tim's own Nantucket Farm page breaks two of his written rules: its hero is the great room, not the exterior, and it puts 7 landscape halves into 9:16 slots, which keeps 42% of a 4:3 photo's width. The brief's "never crop a landscape into a portrait slot" would have forbidden his kind of page, so the operator chose to copy his habit. The library tags projects by client surname (`Bentley`, 59 assets), not project name, and asset tags cap at 20 characters ("Transitional Minimalist" is 23), so the skill reuses the surname. The live model already had 3:4 and 2:3 (#106 merged at 8:47am PT, minutes after this branch was cut), so portrait pairs use 3:4.

**The test.** Nantucket Farm's 49 distinct photos were shuffled with a fixed seed, relabelled, looked at and laid out by the rules. The result is a new `project` document, `nantucket-farm-draft`, tagged `hide` so it would not prerender even if published, in the release [Gallery draft: Nantucket Farm rebuild (test, 11-01)](https://vineyard-custom-homes.prismic.io/builder/upcoming/audvYBEAAFSGl_72). Nothing was published. It has 32 slices (16 singles, 16 two cols), with every photo once and no run of three. The 16 aspects read back in order, and a missing-alt query returned nothing. The same query on the six published projects returned five of them, Nantucket Farm included, so it does catch a missing alt, and most live galleries have none. The media library tags are live, outside the release: `Bentley` on all 49 and a room tag on 37. Three of the room tags are new: `fireplace`, `entry` and `front door`.

**Abandoned, and why.** The side-by-side could not use the site itself: `VINEYARD_PRISMIC` reaches only `master`, not a release. Both pages were drawn by a harness that copies the slice's sizes. The connector's `search_assets` previews arrive as links, not images, so in a claude.ai chat the dependable path is photos attached to the chat. The skill stops rather than writing alt text for a photo it cannot see.

The rules the draft bent, Tim's departures from his own rules, and the questions for Monday are in reddoor-workspace `reports/2026-11-01-vineyard-gallery-test/report.md`, with the side-by-side images.

Usage: not readable

## 2026-11-01 — build-gallery reads photos from the library or Dropbox in a claude.ai chat, since the connector cannot take an attachment (branch `claude/gallery-skill-claude-ai`)

Preparing the skill zip for Tim to try in claude.ai turned up one dependency a chat cannot meet. The skill's "most reliable" route, photos attached to the chat and then uploaded with `upload_asset`, cannot work there. The Prismic connector's `upload_asset` and `upload_assets` take only a public URL that Prismic fetches itself. Their `file` parameter is marked ChatGPT-only, and the tool text says local files and pasted images won't work. A chat attachment therefore never reaches the media library through the connector. Seeing a photo and storing it are now two separate steps. Claude sees a photo only when it is attached to the chat (20 images a message in claude.ai, per Anthropic's vision docs). The photo reaches the library either because Tim has already dragged it into Prismic's Media Library with the client-surname tag (his habit today; the skill then matches attachments to assets by file name) or from a Dropbox folder, via a single-use `download_link` handed to `upload_assets`. A photo that is attached but in neither place stops the run with that ask.

**Beliefs corrected on contact.** The previous entry's "in a claude.ai chat the dependable path is photos attached to the chat" was half right: attachments are how Claude sees a photo, but not how a photo reaches Prismic. The skill had also told Tim to upload it under "Settings, Capabilities, Skills". Anthropic's help centre now puts uploads under Customize, Skills ("+", "Create skill", "Upload a skill"), with code execution on under Settings, Capabilities. The zip must hold the `build-gallery/` folder at its top level; a bare `SKILL.md` at the root is not recognised. The description was cut from 401 to 168 characters, because one Anthropic guide gives claude.ai a 200-character cap while the spec allows 1,024.

**Not verified.** Nobody ran the skill in a claude.ai chat. This container has no claude.ai session, so the attachment-name match (`/mnt/user-data/uploads` with code execution) is untested. So is the help centre's "Up to 20 files per chat", which may be a cap per chat rather than per message; if it is per chat, a 49-photo project will not fit in one chat. `skills-ref validate` was not run, because installing it was refused here; the frontmatter was checked against the spec by hand.

The skill's opening line also named the site as `vineyardcustomhomes.com`. That domain serves a parked-domain page (`window.location.href="/lander"`, 114 bytes, read 11:15am PT). The site is `www.vineyardconstruction.com`, where `/api/preview` answers 307 to `/preview/` and `/gallery/nantucket-farm` answers 200.

A 3-lens review by an Opus subagent found no blocker and two majors, both folded in. First, the connector's upload tools tell the model to put attached files on a temp host such as tmpfiles.org ("don't ask the user"). A chat holding Tim's photos could have published a client's home at a public URL to get round the stop, so "What it never does" now forbids any other host. Second, the Dropbox route had no rule for retries. `upload_assets` may keep storing items after a call times out, and each `download_link` works once, so a retry with fresh links could put ten duplicates in the library. Links are now requested 10 at a time just before each call, and a retry searches by file name first. The minors are folded in too: matching by exact file name only, because `search_assets` also returns near matches; a search by file name before calling a photo missing; a stop when the chat refuses more attachments; the claude.ai section naming the library or Dropbox step; and Step 5's image count, which was off by one because the hero sits in two fields.

A second review round found two more majors, folded in. First, a Dropbox upload without `filename` is named from the single-use link, so every later search by file name, the duplicate guard included, would miss it; the skill now passes the Dropbox name. Second, in Claude Code nothing is attached, so the Dropbox route would have had to write alt text before seeing the photo; there it now uploads without alt text and looks at the photo from the asset URL. Step 5's hero count now agrees with Step 3 and rule 8: the hero is in no slice. A claim that `update_asset_tags` might replace tags was checked against its schema (separate `add` and `remove` lists) and dropped.

A third round found one more major: in Claude Code, where nothing is attached, both routes would have asked about every photo as unmatched. Claude Code now takes the whole tagged set or folder and sees each photo from its asset URL. The minors were folded in too. Photos the Dropbox route finds already in the library now get their tags. Links are asked for by `id:` with a 900-second expiry, and a failed link call is split to find the bad entry. "Both tags" now reads "project tag and room tag, if any", in `rules.md` as well, which had said every photo gets two tags while also giving bedrooms none.

A fourth round found one more major: in Claude Code, a photo uploaded from Dropbox is uploaded before it has been seen, so it had no room tag, and the after-pass tagged only photos already in the library. It now uploads with the project tag only and gets its room tag after it is seen. Three minors were folded in as well. Claude Code still searches by file name before uploading. A tagged asset or folder image that was not attached is listed and asked about, never dropped. "What it needs" says attachments are for claude.ai only.

A fifth round found one more major: `list_folder` reads subfolders and pages its results, so in Claude Code "every image in the folder" would have pulled in a `Web/` or `Low-res/` copy as second uploads, and a long folder could lose photos. The Dropbox route now keeps only the folder's own image files, reads to the end of the cursor, and in Claude Code confirms the set before uploading. That was five rounds in a row with something above minor, the operator's stop. He chose (11:40am PT) to fold everything in and review a sixth time. The minors were folded in too. A retry waits a minute before searching, because a timed-out call may still be storing its files. The can't-see stop now has a Claude Code form. The `/mnt/user-data/uploads` file-name fallback covers both routes. One correction to the first paragraph of this entry: the description was cut from 431 characters (measured at `24c4638`), not 401. The 401 was never measured.

The sixth round found one more major, and this one was on Tim's own route. A search by file name runs outside the project tag (before calling a photo missing, before a Dropbox upload, and in Claude Code), and camera names like `IMG_0412.jpg` repeat between shoots. A new client's photo could therefore match an old client's asset: it would never be uploaded, the old asset would pick up the new client's tags, and the draft would show the wrong house. A name match outside the tag now counts only if the asset carries no other project's tag and its width × height match. Otherwise the photo counts as not in the library, and the other asset is never touched. The minors were folded in as well. An item marked `failed` is retried directly, while a timed-out call is searched twice before anything is re-uploaded. Claude Code opens a 1600-pixel imgix resize, not the original. The operator chose (12:39pm PT) to fold this in and review a seventh time.

The seventh round broke the sixth round's rule, twice. One camera gives every photo the same width × height, so an old untagged `IMG_0412.jpg` from another house passed the size check. And in Claude Code, `list_folder` gives no width or height to compare. The last three rounds' majors all came from the skill guessing that two files were the same photo. So the rule is now not to guess: a file-name match outside the project tag is listed with the asset's link and asked about, and until the answer is yes, the photo counts as not in the library. This removed logic rather than adding it. The minors were folded in too. `list_folder` now passes `recursive: false`; its schema says leaving it out reads the whole tree and leaves `path_display` empty. An upload that comes back with a `tagsError` gets its tags in the after-pass. The operator chose (12:42pm PT) this change plus an eighth review round.

The first three PT times in this entry were written an hour late, as 12:15pm, 12:40pm and 1:39pm. Daylight saving time ended at 2am on 11-01, so 19:15Z is 11:15am PST. The container's `TZ=America/Los_Angeles date` showed the error, and the times were corrected on this branch before it merged.

The eighth round found two more majors, both real. First, the project tag is the client's surname, so a repeat client's earlier house shares it, and a repeated camera name inside the tag would have put the old house's photo on the new page. Second, listing `/mnt/user-data/uploads` gives file names but not which attached picture is which. Same-camera photos are all one size, so pairing names to pictures by order would have put alt text and tags on the wrong photos. On the Dropbox route the wrong alt text is fixed at upload, and no tool can change it afterwards. Both were fixed as asks, not new logic. The skill asks whether the client has an earlier project, and treats matches under the tag as outside ones if so. It never pairs names by order or size, and asks Tim for the names instead. Two minors went in the same way: it stops after a second timeout, and a photo that already has a room tag is not given another. The operator chose (12:54pm PT) to land after this without a ninth round. Eight rounds had each found a new way a file-name match could be wrong, and Tim's first real run is the better test now.

Usage: not readable from this repo; the workspace journal entry for this session carries it.

## 2026-11-01 — /contact's divider no longer makes phones scroll sideways; an overflow spec in the gate (P1-90, #108)

The P1-90 fleet census (reddoorla/reddoor-maintenance#1876) listed Vineyard as sharing one overflowing element with Reddoor and CalTex: a centred `div.absolute.top-1/2.left-1/2`, 729px wide here, plus an `img.absolute.bottom-0.right-0` and the footer's name span cut on every route. Only part of that was true. The div and the img sit inside `ScreenWidthMedia`'s `w-screen overflow-clip` section, so they are clipped and widen nothing; the census's culprit walk listed the outermost element past the edge without asking whether an ancestor clips it. Hiding elements one at a time until `scrollWidth` dropped found the only real source: the `/contact` divider SVG, a fixed `width="486"`, which made the page 403px wide at 320 and 438px at 390 (#88's numbers exactly). It now takes `max-w-full h-auto`, so it narrows with its column; at 486px and up it is unchanged. Below that the whole drawing scales, so on a 320px phone its 1px rule draws at about 0.6px.

**Belief corrected:** the "cut" footer span was never visible. It is in the footer's `sr-only` `<address>`, a 1px clipped box whose `nowrap` lines run to 852px in layout. `checkVisibility()` does not account for clipping, so the census counted it on every route.

The new `tests/smoke/mobile-overflow.spec.ts` is ported from medical-solutions-of-texas#100: five routes at 320/390/768/820/1024px, failing on `scrollWidth > clientWidth` or visible text straddling the right edge. It skips text that an ancestor clips to nothing on an axis it clips. Review found the first version checked either axis, so a 0px-tall box clipping only x would have hidden a visible cut; that injected case now fails 5 of 5 at 320. It also asserts each route answers 2xx, so an unpublished project cannot pass as its error page. Mutations, each run twice: the SVG reverted, 2 red (`/contact` at 320 and 390); the sr-only skip removed, 25 red; a visible cut clipped at the screen edge (footer `overflow-x: clip`, copyright nowrap at 40px), 15 red on the cut check alone. A weaker first version of that last one stayed green because the copyright line is narrower than 320px. The mutation was too weak; the spec was not blind.

Locally, the repo's Playwright 1.64 found no browser in the cloud container; a symlink from its expected headless-shell path to the preinstalled 1.63 build ran it. CI installs its own.

Usage: recorded in the workspace journal entry for this session.
