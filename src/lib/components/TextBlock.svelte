<script lang="ts">
  // Editor-written rich text in the homepage's "Legacy of Craftsmanship"
  // look, which Tim asked for as the default (#vineyard-website, 2026-11-18
  // 1:34pm PT: "the paragraph from the homepage ... All the text should be
  // centered-aligned"): that block's own classes (`items-center gap-8
  // text-center`, `h2` uppercase, `text-dark`) and its 640px measure, with
  // the site's global `p` / `h1`-`h6` from app.css. Italic is how an editor
  // colours words: it renders upright in the light blue (the operator to Tim,
  // 1:43pm PT: "italic wil be light"), as the homepage's h1 sets "utmost care"
  // in `text-light-display`. Used by the RichText
  // slice and by ContentWidthMedia two col's text column.
  import { PrismicRichText } from "@prismicio/svelte";
  import type { RichTextField } from "@prismicio/client";

  let { field }: { field: RichTextField } = $props();
</script>

<div
  class="mx-auto w-full max-w-[640px] flex flex-col items-center gap-8 text-center text-dark [&_h2]:uppercase [&_em]:not-italic [&_em]:text-light-display"
  data-text-block
>
  <PrismicRichText {field} />
</div>
