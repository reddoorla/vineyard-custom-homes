<script lang="ts">
  import { useSwipe, type SwipeCustomEvent } from "svelte-gestures";
  import { PrismicImage } from "@prismicio/svelte";
  import type { ImageField } from "@prismicio/client";
  import { onMount } from "svelte";
  import placeholder from "$lib/assets/images/background_placeholder.svg";
  import { ArrowLeft, ArrowRight } from "@lucide/svelte";

  let imageArray: (ImageField | string)[] = $state([placeholder, placeholder, placeholder]);
  let tripledImages: (ImageField | string)[] = $state([]);

  let sliderIndex = $state(0);
  let isSlideAnimated = $state(true);
  const SLIDER_TRANSITION_LENGTH_IN_MS = 2000;

  const resetSliderToStart = () => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(() => (sliderIndex = 0), SLIDER_TRANSITION_LENGTH_IN_MS + 20);
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const resetSliderToEnd = () => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(() => (sliderIndex = imageArray.length - 1), SLIDER_TRANSITION_LENGTH_IN_MS + 20);
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const slideRight = () => {
    sliderIndex--;
    if (sliderIndex < 0) resetSliderToEnd();
    console.log("Current slide index:", sliderIndex);
  };

  const slideLeft = () => {
    sliderIndex++;
    if (sliderIndex >= imageArray.length) resetSliderToStart();
    console.log("Current slide index:", sliderIndex);
  };

  const handleSwipe = (e: SwipeCustomEvent) => {
    if (e.detail.direction === "left") slideLeft();
    if (e.detail.direction === "right") slideRight();
  };

  let { images = [] } = $props();

  onMount(() => {
    if (images.length > 0) imageArray = images;

    tripledImages = [...imageArray, ...imageArray, ...imageArray];
  });
</script>

<div
  class="w-full h-full overflow-hidden relative"
  {...useSwipe(handleSwipe, () => ({ timeframe: 300, minSwipeDistance: 60 }))}
>
  {#if tripledImages.length > 0}
    <div
      style="width: {tripledImages.length * 100}%; transform:translateX({(-sliderIndex /
        tripledImages.length -
        1 / 3) *
        100}%);"
      class="flex flex-row justify-between flex-nowrap h-full w-full overflow-hidden
		{isSlideAnimated ? 'transition-transform duration-[2000ms]' : ''}"
    >
      {#each tripledImages as image, i (i)}
        <div style="width: {100 / tripledImages.length}%;" class="h-full relative overflow-hidden">
          {#if typeof image === "string"}
            <img
              src={image}
              class="min-h-full min-w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
              alt="slideshow item"
            />
          {:else}
            <PrismicImage
              field={image}
              class="min-h-full min-w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
            />
          {/if}
        </div>
      {/each}
    </div>

    <div class="flex flex-row justify-between items-center absolute bottom-6 left-6 gap-12">
      <button class="bump" onclick={slideRight} aria-label="slide right">
        <ArrowLeft class="size-[2em] text-dark shadow-sm" strokeWidth={1.75} />
      </button>
      <button class="bump" onclick={slideLeft} aria-label="slide left">
        <ArrowRight class="size-[2em] text-dark shadow-sm" strokeWidth={1.75} />
      </button>
    </div>
  {:else}
    <div class="w-full h-full flex items-center justify-center">
      <p>No images available</p>
    </div>
  {/if}
</div>
