<script lang="ts">
  // The RichText slice with an h2 and a paragraph, as the homepage's "Legacy
  // of Craftsmanship" block has them, for tests/smoke/text-block.spec.ts.
  // Behind the /dev guard.
  import RichText from "$lib/slices/RichText/index.svelte";
  import type { RichTextSlice } from "../../../../prismicio-types";

  const slice = {
    id: "rich_text$fixture",
    slice_type: "rich_text",
    slice_label: null,
    variation: "default",
    version: "initial",
    primary: {
      content: [
        // "process" in italics: the light blue, upright.
        {
          type: "heading2",
          text: "Construction process",
          spans: [{ start: 13, end: 20, type: "em" }],
        },
        {
          type: "paragraph",
          text: "Another contractor left this family with nothing. Josiah is donating his time to build their dream home, and this is how it is going.",
          spans: [],
        },
      ],
    },
    items: [],
  } as unknown as RichTextSlice;
</script>

<svelte:head>
  <title>RichText — fixture</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main data-rich-text-fixture>
  <RichText {slice} />
</main>
