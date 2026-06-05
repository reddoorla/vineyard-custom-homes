<script lang="ts">
  import { PrismicRichText } from "@prismicio/svelte";
  import type { RichTextSlice } from "../../../prismicio-types";

  let { slice }: { slice: RichTextSlice } = $props();
</script>

<section class="container p-2 md:p-8">
  <PrismicRichText field={slice.primary.content} />
</section>

<style>
  .container {
    max-width: 600px;
    margin: 6em auto;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif,
      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
</style>
