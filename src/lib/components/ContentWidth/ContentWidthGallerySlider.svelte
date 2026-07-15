<script lang="ts">
  import { useSwipe } from "svelte-gestures";
  import placeholder from "../../assets/images/background_placeholder.svg";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";
  import chevronLeft from "$lib/assets/icons/chevron-left.svg";
  import chevronRight from "$lib/assets/icons/chevron-right.svg";
  import type { SwipeCustomEvent } from "svelte-gestures";

  let {
    imageArray = [placeholder, placeholder, placeholder, placeholder],
    altText = "background image",
    class: passedClasses = "",
  } = $props();

  const _SLIDER_TRANSITION_FUNCTION = "cubic-bezier(.5,0,0,1)";
  const SLIDER_TRANSITION_LENGTH_IN_MS = 2000;
  const _SLIDER_INTERVAL_IN_MS = 5000;

  let viewportWidth: number = $state(1024);

  let sliderIndex = $state(0);

  let isSlideAnimated = $state(true);

  const _resetSliderToStart = () => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(() => (sliderIndex = 0), SLIDER_TRANSITION_LENGTH_IN_MS + 20);
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const _resetSliderToEnd = () => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(() => (sliderIndex = imageArray.length - 1), SLIDER_TRANSITION_LENGTH_IN_MS + 20);
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const slideRight = () => {
    sliderIndex++;
    //clearInterval(sliderInterval);
    //sliderInterval = setInterval(()=>slideRight(), SLIDER_INTERVAL_IN_MS);
    //if(sliderIndex==imageArray.length)
    //resetSliderToStart();
  };
  const slideLeft = () => {
    sliderIndex--;
    //clearInterval(sliderInterval);
    //sliderInterval = setInterval(()=>slideLeft(), SLIDER_INTERVAL_IN_MS);
  };

  const _setSliderIndex = (index: number) => {
    sliderIndex = index;
    //clearInterval(sliderInterval);
    //sliderInterval = setInterval(()=>slideLeft(), SLIDER_INTERVAL_IN_MS);
  };

  let _sliderInterval: ReturnType<typeof setTimeout>;

  const handleSwipe = (e: SwipeCustomEvent) => {
    if (e.detail.direction === "left") slideRight();

    if (e.detail.direction === "right") slideLeft();
  };

  const tripledImages = $derived(imageArray.concat(imageArray).concat(imageArray));
</script>

<svelte:window bind:innerWidth={viewportWidth} />

<section class="pb-32 {passedClasses}">
  <div
    {...useSwipe(handleSwipe, () => ({ timeframe: 300, minSwipeDistance: 60 }))}
    class="h-[320px] py-2 relative"
  >
    <div
      class="overflow-hidden w-screen mt-20 lg:mt-0"
      style="margin-left:{viewportWidth > 1340 ? viewportWidth - 1220 / 2 : viewportWidth * 0.04};"
    >
      <div
        class="h-full flex flex-row flex-nowrap {isSlideAnimated
          ? 'transition-transform duration-[2000ms]'
          : ''}"
        style="width:{352 * tripledImages.length}px; margin-left:{viewportWidth > 1340
          ? viewportWidth - 1220 / 2
          : viewportWidth * 0.04}; transform:translateX({-(sliderIndex + imageArray.length) *
          352}px); "
      >
        {#each tripledImages as _image, i (i)}
          <div class="w-[360px] h-full mx-4">
            <img alt={altText} class="h-full object-cover -z-10" />
          </div>
        {/each}
      </div>
    </div>
    <div
      class="absolute flex justify-center w-32 lg:w-full top-16 left-1/2 -translate-left-1/2 lg:bottom-1/2 lg:-left-16"
    >
      <ContentWidth class="h-full relative w-full">
        <button
          onclick={slideLeft}
          class="absolute left-0 lg:top-auto lg:-left-2 h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle justify-center cursor-pointer transition-all duration-500 hover:bg-[#424B5A] hover:border-[#424B5A] active:bg-black bump {sliderIndex ===
          0
            ? 'opacity-20 pointer-events-none'
            : ''}"
        >
          <img alt="chevron-left" src={chevronLeft} class="-translate-x-[1px]" />
        </button>
        <button
          onclick={slideRight}
          class="absolute right-0 lg:right-auto lg:-left-2 lg:top-12 -translate-y-[0.7px] h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle cursor-pointer transition-all duration-500 justify-center hover:bg-[#424B5A] hover:border-[#424B5A] active:bg-black bump {sliderIndex ===
          imageArray.length - 1
            ? 'opacity-20 pointer-events-none'
            : ''}"
        >
          <img alt="chevron-right" src={chevronRight} class="translate-x-[1px]" />
        </button>
      </ContentWidth>
    </div>
  </div>
</section>
