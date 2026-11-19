<script lang="ts">
  // The main gallery's ten slots, once per case: all ten filled (Tim's mockup,
  // 2026-11-19), the live gallery on that day (slots 1-6; 7 holds a hidden
  // project, 8-10 are new and empty), and each two-tile row left with one
  // tile, or with none. Behind the /dev guard; tests/smoke/gallery-grid.spec.ts measures it.
  import GalleryGrid from "$lib/components/GalleryGrid.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import type { ProjectDocument } from "../../../../prismicio-types";

  const image = {
    id: "aJy9gqTt2nPbaSdq",
    url: "https://images.prismic.io/vineyard-custom-homes/aJy9gqTt2nPbaSdq_Haggettv4.0_7-Photo.jpg?auto=format,compress",
    alt: null,
    copyright: null,
    dimensions: { width: 1920, height: 1080 },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  };

  // A project whose uid is `slot-<n>`, so the test finds each tile by href.
  const project = (n: number) =>
    ({
      id: `slot-${n}`,
      uid: `slot-${n}`,
      type: "project",
      tags: [],
      data: { title: `Slot ${n}`, preview_title: `Slot ${n}`, preview_image: image },
    }) as unknown as ProjectDocument;

  const only = (...filled: number[]) =>
    Array.from({ length: 10 }, (_, i) => (filled.includes(i + 1) ? project(i + 1) : null));

  const all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const cases = {
    all: only(...all),
    live: only(1, 2, 3, 4, 5, 6),
    "lone-seven": only(...all.filter((n) => n !== 6)),
    "lone-nine": only(...all.filter((n) => n !== 10)),
    "lone-ten": only(...all.filter((n) => n !== 9)),
    // Both tiles of each pair empty: rows 3 and 5 render nothing.
    "pairs-empty": only(1, 2, 3, 4, 5, 8),
    // Rows 2-5 empty, as when all four of their projects are hidden.
    "middle-empty": only(1, 6, 7, 8, 9, 10),
    // Rows 2-5 partly empty: only slot 5; no left column; no right column;
    // only slot 2, the grid's one tile.
    "five-alone": only(1, 5, 6, 8),
    "left-empty": only(1, 4, 5, 6),
    "right-empty": only(1, 2, 3, 6),
    "two-alone": only(2),
    // One slot of rows 2-5 empty or hidden: the rest keep their places, as
    // on the live page (the missing tile's space stays blank).
    "two-empty": only(1, 3, 4, 5, 6),
    "five-empty": only(1, 2, 3, 4, 6),
  };
</script>

<main>
  {#each Object.entries(cases) as [key, slots] (key)}
    <section class="py-16" data-case={key}>
      <ContentWidth class="flex flex-col gap-9">
        <GalleryGrid {slots} />
      </ContentWidth>
    </section>
  {/each}
</main>
