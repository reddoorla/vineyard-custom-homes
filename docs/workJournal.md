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

**color-contrast.** Both nodes are `text-light` (#7ba0c4) on white, 2.73:1 as axe reports it. The h1's "utmost care" is 36px on desktop and exactly 24px below 787px, large text at both, so it needs 3:1. It moves to a new `light-display` token, #7196b9: the brand blue mixed 7.5% toward the brand navy in OKLab, 3.10:1, ΔE_ok 3.3 from the original, just above the roughly 2 that can be told apart, and only barely distinguishable side by side. The name says it is for display sizes: at 3.10:1 it fails any text under 24px. The "01 / V" medallion text is 12px and needs 4.5:1. The smallest same-hue tone that reaches it, #547899, is ΔE_ok 13 away, a visible change, so it uses the existing navy (`text-dark`, 15.6:1) instead of inventing a tone. The ring and rule stay light blue. The same medallion sits on `/about`, `/contact`, `/gallery` and every project page, and review caught that changing only the home page's made the motif inconsistent, so all five changed. `--color-light` itself is unchanged: it is 5.69:1 on the navy testimonial cards, and darkening it would have lowered that.

**The instrument.** `tests/smoke/home-a11y.spec.ts` runs axe's `image-alt` and `color-contrast` rules on `/` at 1280 and 390, with `ignoreLength` so one-character text is checked (axe otherwise files it as incomplete, which is why the "V" was never flagged), asserts every Instagram and testimonial image carries a non-empty alt, and pins the helper. It was red on `main`'s page and CSS, with the h1 span, both medallion labels and the tile named, and green on the branch. The first version's check that axe had passed the tiles could never fail: it compared a page-wide count with four. Mutations against the final version:

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

One limit: once the release is published, the grid call-site mutation goes green, because the content then supplies the alt. Nothing tests the medallions on the other four pages.

The first mutation run was invalid. Its control restored `main`'s files with `git checkout <sha> -- <paths>`, which also writes the index, so each later mutation's `git checkout -- .` restored the control instead of the branch and every row read the same. Restoring from `HEAD` fixed it.

Measured on a local `vite build` + `vite preview` with the nightly's code path: accessibility 1.00 in 3 of 3 runs. The playwright pinned here wants `chromium_headless_shell-1243`, which a cloud container does not have; a local config pointing `launchOptions.executablePath` at `$CHROME_PATH` ran the suite without `playwright install`.

Staging a Prismic release fires the site's "Prismic" Netlify build hook: production rebuilt at 02:54Z and 03:48Z, when the release was created and written, without any change to published content. Publishing the release will rebuild the prerendered home page in the same way.
