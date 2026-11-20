<script lang="ts">
  import VimeoGate from "$lib/components/VimeoGate.svelte";
  import placeholder from "../../assets/images/background_placeholder.svg";
  import { PrismicImage } from "@prismicio/svelte";
  import { isFilled, type ImageField } from "@prismicio/client";
  import Img from "@zerodevx/svelte-img";
  import { cappedWidths } from "@reddoorla/maintenance/images";
  import { withFallbackAlt } from "$lib/image-alt";
  let {
    src = "",
    field = undefined as ImageField | undefined,
    altText = "background image",
    placeholderSide = "right",
    vimeoId = "",
    darken = false,
    backdrop = false,
    percentHeight = 80,
    // Above the fold: fetch a Prismic still first. A hero lower down passes
    // false, so its still loads lazily instead of competing with the LCP.
    priority = true,
    class: passedClasses = "",
    children = undefined,
  } = $props();
  let viewportHeight: number = $state(1024);
  let viewportWidth: number = $state(768);
</script>

<svelte:window bind:innerHeight={viewportHeight} bind:innerWidth={viewportWidth} />

<section
  class="w-screen overflow-clip {backdrop ? 'fixed -z-10 top-0 left-0' : 'relative'}"
  style="height: {percentHeight}lvh"
>
  <div
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-video"
    style={((viewportHeight * percentHeight) / 100) * 16 > viewportWidth * 9
      ? `height: ${percentHeight}lvh; min-width: 100%`
      : `width: 100vw; min-height: ${percentHeight}lvh`}
  >
    <!-- A filled Prismic image wins. An empty one falls back to the bundled
         `src`, so a hero nobody has given an image looks as it did before. -->
    {#if isFilled.image(field)}
      <PrismicImage
        field={withFallbackAlt(field, altText)}
        widths={cappedWidths(field)}
        sizes="100vw"
        fetchpriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
        class="absolute bottom-0 h-full w-full object-cover -z-10 {passedClasses}"
      />
    {:else if typeof src === "string" && src}
      <img
        {src}
        alt={altText}
        class="absolute bottom-0 {placeholderSide}-0 h-full w-full object-cover {passedClasses} -z-10
{src === placeholder ? 'lg:w-[45%] md:h-auto' : ''}"
      />
    {:else if src}
      <Img
        {src}
        alt={altText}
        class="absolute bottom-0 {placeholderSide}-0 h-full w-full object-cover {passedClasses} -z-10
{src === placeholder ? 'lg:w-[45%] md:h-auto' : ''}"
      />
    {/if}
    {#if vimeoId}
      <VimeoGate>
        <iframe
          title="background video"
          src={`https://player.vimeo.com/video/${vimeoId}?background=1&muted=1&loop=1&autoplay=1&dnt=1`}
          class="aspect-video absolute contrast-[1.15] -z-10"
          style={((viewportHeight * percentHeight) / 100) * 16 > viewportWidth * 9
            ? `height: ${percentHeight}lvh; min-width: 100%`
            : `width: 100vw; min-height: ${percentHeight}lvh`}
          frameborder="0"
          allowfullscreen
        ></iframe>
      </VimeoGate>
    {/if}
    {#if darken}
      <div
        class="bg-darken-gradient pointer-events-none absolute w-full h-full top-0 left-0 -z-10"
      ></div>
    {/if}
  </div>
  {@render children?.()}
</section>

<style>
  .bg-darken-gradient {
    background:
      linear-gradient(0deg, rgba(0, 38, 62, 0.5) 0%, rgba(0, 38, 62, 0.5) 100%),
      linear-gradient(180deg, rgba(0, 38, 62, 0.75) -3.96%, rgba(0, 38, 62, 0) 49.92%);
  }
</style>
