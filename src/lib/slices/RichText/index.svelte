<script lang="ts">
  import TextBlock from "$lib/components/TextBlock.svelte";
  import type { RichTextSlice } from "../../../../prismicio-types";

  let { slice }: { slice: RichTextSlice } = $props();
</script>

<!-- The homepage's paragraph look, centred (Tim, 2026-11-18; the operator chose
     to restyle this slice too, workspace decisions/2026-11-18-2144-…). It was a
     600px block in a system font stack, black and left-aligned. The 6em
     vertical margin and the side padding are kept. -->
<section class="my-[6em] p-2 md:p-8">
  <TextBlock field={slice.primary.content} />
</section>
