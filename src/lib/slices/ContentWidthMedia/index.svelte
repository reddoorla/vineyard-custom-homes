<script lang="ts">
  import VimeoGate from "$lib/components/VimeoGate.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { PrismicImage } from "@prismicio/svelte";
  import type { ContentWidthMediaSlice } from "../../../../prismicio-types";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  let { slice }: { slice: ContentWidthMediaSlice } = $props();

  // Each column's box, and its background video's, by the editor's `image aspect`.
  // Full class strings, so Tailwind's scanner sees every one. 9:16 and 1:1 fall
  // back to 4:3 below md, as they always have; 3:4 and 2:3 are mild enough to
  // keep their portrait crop on a phone (2:3 on a 390px screen is 537px tall).
  const aspects = {
    "9:16": { box: "aspect-[4/3] md:aspect-[9/16]", video: "aspect-[9/16]" },
    "1:1": { box: "aspect-[4/3] md:aspect-square", video: "aspect-square" },
    "3:4": { box: "aspect-[3/4]", video: "aspect-[3/4]" },
    "2:3": { box: "aspect-[2/3]", video: "aspect-[2/3]" },
  } as const;
  // Anything unrecognised renders square, as the old 9:16-or-square ternary did.
  const aspect = $derived(
    (slice.variation === "twoCol" && aspects[slice.primary.image_aspect]) || aspects["1:1"],
  );
</script>

<ContentWidth class="mt-9 flex flex-col md:flex-row relative overflow-hidden">
  {#if slice.variation === "default"}
    <div class="aspect-[4/3] md:aspect-video w-full overflow-hidden">
      <PrismicImage
        field={slice.primary.image}
        widths={cappedWidths(slice.primary.image)}
        sizes="92vw"
        class="w-full h-full object-cover"
      />
      {#if slice.primary.vimeo_id}
        <VimeoGate>
          <iframe
            title="background video"
            src={`https://player.vimeo.com/video/${slice.primary.vimeo_id}?background=1&muted=1&loop=1&autoplay=1&dnt=1`}
            class="absolute top-1/2 left-1/2 -translate-1/2 h-full aspect-video"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </VimeoGate>
      {/if}
    </div>
  {/if}
  {#if slice.variation === "twoCol"}
    <div class="{aspect.box} mt-9 md:mt-0 md:w-1/2 md:pr-4.5 relative overflow-hidden">
      <PrismicImage
        field={slice.primary.image_one}
        widths={cappedWidths(slice.primary.image_one)}
        sizes="(min-width: 768px) 46vw, 92vw"
        loading="lazy"
        class="w-full h-full object-cover"
      />
      {#if slice.primary.vimeo_id_one}
        <VimeoGate>
          <iframe
            title="background video"
            src={`https://player.vimeo.com/video/${slice.primary.vimeo_id_one}?background=1&muted=1&loop=1&autoplay=1&dnt=1`}
            class="absolute top-1/2 left-1/2 -translate-1/2 w-full {aspect.video}"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </VimeoGate>
      {/if}
    </div>
    <div class="{aspect.box} mt-9 md:mt-0 md:w-1/2 md:pl-4.5 relative overflow-hidden">
      <PrismicImage
        field={slice.primary.image_two}
        widths={cappedWidths(slice.primary.image_two)}
        sizes="(min-width: 768px) 46vw, 92vw"
        loading="lazy"
        class="w-full h-full object-cover"
      />
      {#if slice.primary.vimeo_id_two}
        <VimeoGate>
          <iframe
            title="background video"
            src={`https://player.vimeo.com/video/${slice.primary.vimeo_id_two}?background=1&muted=1&loop=1&autoplay=1&dnt=1`}
            class="absolute top-1/2 left-1/2 -translate-1/2 w-full {aspect.video}"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </VimeoGate>
      {/if}
      <div class="absolute h-full w-0 md:w-5 bg-white top-0 -left-0.5"></div>
    </div>
  {/if}
</ContentWidth>
