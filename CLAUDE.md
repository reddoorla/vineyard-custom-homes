# CLAUDE.md

The marketing site for Vineyard Custom Homes, a custom home builder in Eagle,
Idaho — SvelteKit 5 (runes) on Prismic, Tailwind v4, pnpm, deployed to Netlify.
Pages live in `src/routes/[[preview=preview]]/` (home, `about`, `contact`,
`gallery` + `gallery/[uid]`, and a `[uid]` catch-all); the optional
`[[preview=preview]]` segment is Prismic preview routing, not a real path.

There is no `pnpm verify` here. CI runs prettier → eslint → `svelte-check` →
`pnpm build` → the axe audit, so `pnpm lint && pnpm check && pnpm build` is the
closest local equivalent; `pnpm test:smoke` is separate. `README.md` is the
reference for setup, and it is stale on two points — it says Vite 6 and Node
22, while `package.json` is on Vite 8 and `.nvmrc` / `netlify.toml` say Node 24.

Two things that surprise people:

- **Only two Prismic slices exist** (`RichText`, `ContentWidthMedia`). Most of
  the page furniture is components under `src/lib/components/`, because this
  site predates the fleet's shared slice library. Don't go looking for slices
  that aren't there.
- **`customtypes/**` and `src/lib/slices/**/model.json` are delivered to
  Prismic by CI on merge to `main`** (`.github/workflows/prismic-models.yml`).
  Its branch filters are load-bearing and the file itself says so — it is
  managed by `@reddoorla/maintenance`, so change it there, not here.

## The work journal

**Every working session appends a dated entry to `docs/workJournal.md`** — what
was done and **why**, newest at the bottom, never corrected in place. Write it
as the last act of the session, not the first act of the next one.

The journal is the history of executing the build. Code says what the system
does now; the journal says what it used to do, what it cost to change, and
which beliefs turned out to be wrong. Nearly everything expensive to rediscover
lives there and nowhere else.

An entry is headed with the date, a short title, and where it landed:

```markdown
## 2026-09-04 — Both runway stages render their final frame without JS (#51, `ce46ae0`)
```

Then prose — not a bullet list of file names, which the diff already tells you.
What to put in, in rough order of value:

- **Why, over what.** The reason a thing was done survives; the diff does not
  need restating.
- **Measured numbers, exactly.** "The comp's open mask is 2696×2352 on an 860px
  band — 2.735× the band's height, so a 390×664 phone needs ~534%" is worth
  keeping. "Fixed the hero on mobile" is not.
- **Defects, named.** What broke, what it looked like, and what made it
  invisible until it wasn't.
- **What was tried and abandoned**, and what it would take to revive it. A dead
  end nobody wrote down gets walked twice.
- **Beliefs corrected on contact.** The design assumption that turned out false
  is usually the most valuable line in the entry.
- **Honest accounting.** If a win came from somewhere other than the change
  that claimed it, say so — that is exactly what someone will otherwise
  over-invest in next.

**History is never edited to be right.** An entry that stops being true is not
rewritten; a later entry corrects it, and says which one it corrects. The
journal is a record of what was believed at the time, and that record is most
useful precisely where it was wrong. Fixing the past in place destroys the only
evidence of how the mistake was made.

If a session produced nothing worth an entry, that is itself worth one line.
