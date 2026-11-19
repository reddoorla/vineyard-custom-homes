<script lang="ts">
  // The main gallery's ten slots, once per case: all ten filled (Tim's mockup,
  // 2026-11-19), the live gallery on that day (slots 1-6; 7 holds a hidden
  // project, 8-10 are new and empty), and each two-tile row left with one
  // tile. Behind the /dev guard; tests/smoke/gallery-grid.spec.ts measures it.
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
