<script lang="ts">
  import placeholder from "../../assets/images/background_placeholder.svg";
  import { PrismicImage } from "@prismicio/svelte";
  import Img from "@zerodevx/svelte-img";
  let {
    src = "",
    field = undefined,
    altText = "background image",
    placeholderSide = "right",
    vimeoId = "",
    darken = false,
    backdrop = false,
    percentHeight = 80,
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
    {#if !field && typeof src === "string"}
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
    {:else if field}
      <PrismicImage
        {field}
        class="absolute bottom-0 h-full w-full object-cover -z-10 {passedClasses}"
      />
    {/if}
    {#if vimeoId}
      <iframe
        title="background video"
        src={`https://player.vimeo.com/video/${vimeoId}?background=1&muted=1&loop=1&autoplay=1`}
        class="aspect-video absolute contrast-[1.15] -z-10"
        style={((viewportHeight * percentHeight) / 100) * 16 > viewportWidth * 9
          ? `height: ${percentHeight}lvh; min-width: 100%`
          : `width: 100vw; min-height: ${percentHeight}lvh`}
        frameborder="0"
        allowfullscreen
      ></iframe>
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
