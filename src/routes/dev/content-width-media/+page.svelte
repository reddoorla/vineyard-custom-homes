<script lang="ts">
  // ContentWidthMedia's two-col variation once per `image aspect` option, with
  // the two portrait photos Tim used when he asked for 3:4 and 2:3 (1920×2560
  // and 1706×2560, from the traditional-elegance project). Behind the /dev
  // guard; tests/smoke/content-width-media.spec.ts measures it.
  import ContentWidthMedia from "$lib/slices/ContentWidthMedia/index.svelte";
  import type { ContentWidthMediaSlice } from "../../../../prismicio-types";

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
</main>
