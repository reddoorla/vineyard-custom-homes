# Vineyard Custom Homes

Marketing site for [Vineyard Custom Homes](https://www.vineyardconstruction.com), a custom home
builder in Eagle, Idaho. Built with SvelteKit 5, Prismic CMS, and Tailwind CSS v4, deployed to
Netlify.

## Stack

- **SvelteKit 5** (runes) + **Vite 6**
- **Prismic** CMS via `@prismicio/client` / `@prismicio/svelte` (Slice Machine for content modeling)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Netlify** (`@sveltejs/adapter-netlify`)
- **pnpm** (`packageManager` is pinned — use pnpm, not npm/yarn)
- Tooling/config synced from **`@reddoorla/maintenance`** (eslint, prettier, lighthouse, playwright-a11y)

## Prerequisites

- Node 22 (matches `netlify.toml` and CI)
- pnpm (`corepack enable` or install globally)

## Getting started

```bash
pnpm install
pnpm dev        # vite dev + Slice Machine, concurrently
```

- App: http://localhost:5173
- Slice Machine: http://localhost:9999

The Prismic repository name (`vineyard-custom-homes`) is set in `slicemachine.config.json` and used by
`src/lib/prismicio.js`. It can be overridden locally with the `VITE_PRISMIC_ENVIRONMENT` env var.

## Scripts

| Command        | What it does                                             |
| -------------- | -------------------------------------------------------- |
| `pnpm dev`     | Dev server + Slice Machine                               |
| `pnpm build`   | Production build (prerenders pages from Prismic content) |
| `pnpm preview` | Preview the production build locally                     |
| `pnpm check`   | `svelte-kit sync` + `svelte-check` (type/Svelte checks)  |
| `pnpm lint`    | Prettier check + ESLint                                  |
| `pnpm format`  | Prettier write                                           |

## Project structure

- `src/routes/[[preview=preview]]/` — public pages (home, `[uid]`, about, contact, gallery, gallery `[uid]`). The optional `[[preview=preview]]` segment enables Prismic preview routing.
- `src/routes/sitemap.xml/` — dynamically generated sitemap (curated, honors the `hide` project tag).
- `src/routes/dev/a11y-fixtures/` — stable a11y target for lhci/axe; `noindex`, not linked publicly.
- `src/lib/slices/` — Prismic slices (`RichText`, `ContentWidthMedia`) rendered via `SliceZone`.
- `src/lib/components/` — UI components (Nav, Footer, sliders, forms, animation helpers).

## Content & previews

Content is authored in Prismic. Document `url`s resolve via the route resolver in
`src/lib/prismicio.js`. Preview/edit routing is wired through `@prismicio/svelte/kit`
(`src/routes/api/preview/` + the `[[preview=preview]]` param).

## CI / deploy

- **CI** (`.github/workflows/ci.yml`): prettier → eslint → `svelte-check` → `pnpm build` →
  Playwright a11y audit (`reddoor-maint audit --only a11y --fail-on-violations`).
- **Renovate** (`.github/workflows/renovate.yml`, `renovate.json`): auto-merges patch/minor on a
  Monday schedule; majors are held for manual review.
- **Deploy**: Netlify builds `pnpm build` and publishes `build/` (see `netlify.toml`).
