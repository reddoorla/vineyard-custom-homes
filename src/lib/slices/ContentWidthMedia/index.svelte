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

  // The single's box, by its own `image aspect`. 16:9 keeps the 4:3 phone
  // fallback the single has always had, and is what an empty or unknown value
  // gets, so every page written before the field existed renders unchanged.
  // 4:3, 3:2 and 1:1 hold their shape at every width. Full class strings, so
  // Tailwind's scanner sees every one.
  const singleAspects: Record<string, string> = {
    "16:9": "aspect-[4/3] md:aspect-video",
    "4:3": "aspect-[4/3]",
    "3:2": "aspect-[3/2]",
    "1:1": "aspect-square",
  };
  // `none` sizes the box to the photo's own shape, from Prismic's `dimensions`,
  // so nothing is cropped. A video has no shape Prismic knows, so `none` with a
  // Vimeo id, or a photo without usable dimensions, falls back to 16:9. The
  // background video itself is unchanged: 16:9 at the box's full height, so in
  // every box at least as tall as 16:9 it covers the box and its sides are cropped.
  const single = $derived.by(() => {
    if (slice.variation !== "default") return { box: "", style: undefined };
    const { image_aspect, image, vimeo_id } = slice.primary;
    const { width = 0, height = 0 } = image?.dimensions ?? {};
    if (image_aspect === "none" && !vimeo_id && width > 0 && height > 0)
      return { box: "", style: `aspect-ratio: ${width} / ${height}` };
    const key = image_aspect && Object.hasOwn(singleAspects, image_aspect) ? image_aspect : "16:9";
    return { box: singleAspects[key], style: undefined };
  });
</script>

<ContentWidth class="mt-9 flex flex-col md:flex-row relative overflow-hidden">
  {#if slice.variation === "default"}
    <div class="{single.box} w-full overflow-hidden" style={single.style}>
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
