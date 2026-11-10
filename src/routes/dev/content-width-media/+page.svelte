<script lang="ts">
  // ContentWidthMedia's two-col variation once per `image aspect` option, with
  // the two portrait photos Tim used when he asked for 3:4 and 2:3 (1920×2560
  // and 1706×2560, from the traditional-elegance project), then the single once
  // per its own `image aspect` option, with a landscape photo, plus `none` with
  // the portrait, `none` with a Vimeo id and an old single with no field at all.
  // Last, the "show as player" cases from ./playerSlices.
  // Behind the /dev guard; tests/smoke/content-width-media.spec.ts measures it.
  import ContentWidthMedia from "$lib/slices/ContentWidthMedia/index.svelte";
  import type { ContentWidthMediaSlice } from "../../../../prismicio-types";
  import { playerSlices, playerKey, playerShapes } from "./playerSlices";

  const photo = (id: string, file: string, width: number, height: number) => {
    const url = `https://images.prismic.io/vineyard-custom-homes/${id}_${file}?auto=format,compress`;
    return {
      id,
      url,
      alt: "",
      copyright: null,
      dimensions: { width, height },
      edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
    };
  };
  const one = photo("Ape0eYzPlzscvCfj", "VCH_VanderBoom00007.JPG", 1920, 2560);
  const two = photo("9c8psxUhiJf6JfiK", "VCH_VanderBoom00004.JPG", 1706, 2560);

  const aspects = ["9:16", "1:1", "3:4", "2:3"] as const;
  const slices = aspects.map(
    (image_aspect, i) =>
      ({
        id: `content_width_media$fixture-${i}`,
        slice_type: "content_width_media",
        slice_label: null,
        variation: "twoCol",
        version: "initial",
        primary: {
          image_one: one,
          vimeo_id_one: null,
          image_two: two,
          vimeo_id_two: null,
          image_aspect,
        },
        items: [],
      }) as unknown as Extract<ContentWidthMediaSlice, { variation: "twoCol" }>,
  );

  // A landscape (2560×1706, 3:2) from the same project, for the single; for
  // `none`, also a 3000×1776 one (1.689, near no option) from nantucket-farm,
  // the portrait above, and a photo with no usable dimensions.
  const wide = photo("z15ZHSHcA_3LaUJX", "VCH_VanderBoom00010.JPG", 2560, 1706);
  const odd = photo("aMxjf2GNHVfTPYPT", "VCH_Bentley_DSC00994.jpg", 3000, 1776);
  // PrismicImage itself throws on null dimensions, so "no usable shape" is 0×0.
  const shapeless = { ...wide, dimensions: { width: 0, height: 0 } };
  const video = "76979871";
  // `image_aspect` absent means a single written before the field existed;
  // null, "" and an unknown value are what the API can hand back for one.
  const singleCases: {
    key: string;
    image_aspect?: string | null;
    image: unknown;
    vimeo_id?: string;
  }[] = [
    { key: "16:9", image_aspect: "16:9", image: wide },
    { key: "4:3", image_aspect: "4:3", image: wide },
    { key: "3:2", image_aspect: "3:2", image: wide },
    { key: "1:1", image_aspect: "1:1", image: wide },
    { key: "none", image_aspect: "none", image: odd },
    { key: "none-portrait", image_aspect: "none", image: one },
    { key: "none-shapeless", image_aspect: "none", image: shapeless },
    { key: "none-video", image_aspect: "none", image: wide, vimeo_id: video },
    { key: "16:9-video", image_aspect: "16:9", image: wide, vimeo_id: video },
    { key: "4:3-video", image_aspect: "4:3", image: wide, vimeo_id: video },
    { key: "1:1-video", image_aspect: "1:1", image: wide, vimeo_id: video },
    { key: "unset", image: wide },
    { key: "null", image_aspect: null, image: wide },
    { key: "empty", image_aspect: "", image: wide },
    { key: "unknown", image_aspect: "21:9", image: wide },
  ];
  const singles = singleCases.map(
    ({ key, image, vimeo_id, ...rest }) =>
      ({
        id: `content_width_media$single-${key}`,
        slice_type: "content_width_media",
        slice_label: null,
        variation: "default",
        version: "initial",
        primary: { image, vimeo_id: vimeo_id ?? null, ...rest },
        items: [],
      }) as unknown as Extract<ContentWidthMediaSlice, { variation: "default" }>,
  );
  const singleKey = (slice: (typeof singles)[number]) =>
    slice.id.replace("content_width_media$single-", "");
</script>

<svelte:head>
  <title>ContentWidthMedia aspects — fixture</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="pb-9">
  {#each slices as slice (slice.id)}
    <section
      data-aspect={slice.primary.image_aspect}
      aria-label="two col at {slice.primary.image_aspect}"
    >
      <ContentWidthMedia {slice} />
    </section>
  {/each}
  {#each singles as slice (slice.id)}
    <section data-single={singleKey(slice)} aria-label="single at {singleKey(slice)}">
      <ContentWidthMedia {slice} />
    </section>
  {/each}
  {#each playerSlices as slice (slice.id)}
    <section data-player-case={playerKey(slice)} aria-label="player case {playerKey(slice)}">
      <ContentWidthMedia {slice} context={{ vimeo: playerShapes }} />
    </section>
  {/each}
</main>
