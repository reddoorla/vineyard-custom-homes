<script lang="ts">
  import { run } from "svelte/legacy";

  import { onMount } from "svelte";
  import { useSwipe } from "svelte-gestures";
  import placeholder from "../../assets/images/background_placeholder.svg";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";
  import type { SwipeCustomEvent } from "svelte-gestures";

  import chevronLeft from "$lib/assets/icons/chevron-left.svg";
  import chevronRight from "$lib/assets/icons/chevron-right.svg";

  let {
    imageArray = [placeholder, placeholder, placeholder, placeholder],
    altText = "background image",
    class: passedClasses = "",
  } = $props();

  const _SLIDER_TRANSITION_FUNCTION = "cubic-bezier(.5,0,0,1)";
  const SLIDER_TRANSITION_LENGTH_IN_MS = 2000;
  const SLIDER_INTERVAL_IN_MS = 5000;

  let sliderIndex = $state(imageArray.length - 1);

  let isSlideAnimated = $state(true);

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
    sliderIndex++;
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => slideRight(), SLIDER_INTERVAL_IN_MS);
    if (sliderIndex == imageArray.length) resetSliderToStart();

    console.log(sliderIndex);
  };
  const slideLeft = () => {
    sliderIndex--;
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => slideLeft(), SLIDER_INTERVAL_IN_MS);
    if (sliderIndex < 0) resetSliderToEnd();
  };

  const _setSliderIndex = (index: number) => {
    sliderIndex = index;
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => slideLeft(), SLIDER_INTERVAL_IN_MS);
  };

  let sliderInterval: ReturnType<typeof setTimeout>;

  const handleSwipe = (e: SwipeCustomEvent) => {
    if (e.detail.direction === "left") slideRight();

    if (e.detail.direction === "right") slideLeft();
  };

  let progressPosistion = $state(0);
  let progressWrapForwardPosition = $state(-100);
  let progressWrapBackwardPosition = $state(imageArray.length * 100);

  run(() => {
    progressPosistion = sliderIndex * 100;
    if (sliderIndex == imageArray.length) progressWrapForwardPosition = 0;
    else progressWrapForwardPosition = 100;

    if (sliderIndex == -1) progressWrapBackwardPosition = imageArray.length * 100 - 100;
    else progressWrapBackwardPosition = imageArray.length * 100;

    console.log(sliderIndex);
  });

  onMount(() => {
    sliderInterval = setInterval(() => slideLeft(), SLIDER_INTERVAL_IN_MS);
    return () => clearInterval(sliderInterval);
  });

  const tripledImages = imageArray.concat(imageArray).concat(imageArray);
</script>

<section class="pb-32 {passedClasses}">
  <div
    {...useSwipe(handleSwipe, () => ({ timeframe: 300, minSwipeDistance: 60 }))}
    class="h-[320px] py-2 relative"
  >
    <div
      class="h-full flex flex-row flex-nowrap {isSlideAnimated
        ? 'transition-transform duration-[2000ms]'
        : ''}"
      style="width:{352 *
        tripledImages.length}px; margin-left:calc(50vw - 176px); transform:translateX({-(
        sliderIndex + imageArray.length
      ) * 352}px); "
    >
      {#each tripledImages as _image, i (i)}
        <div class="w-[360px] h-full mx-4">
          <img src="" alt={altText} class="h-full object-cover -z-10" />
        </div>
      {/each}
    </div>
    <div class="absolute flex justify-center w-full bottom-0 left-0">
      <ContentWidth class="h-full relative w-full">
        <div
          class="h-2 w-5/6 m-auto bg-light rounded-full relative overflow-hidden translate-y-[16px]"
        >
          <div
            class="h-full rounded-full absolute top-0 right-0 bg-dark {isSlideAnimated
              ? 'transition-transform duration-[2000ms]'
              : ''}"
            style="width:{(1 / imageArray.length) *
              100}%; transform:translateX({-progressPosistion}%);"
          ></div>
          <div
            class="h-full rounded-full absolute top-0 right-0 bg-dark {isSlideAnimated
              ? 'transition-transform duration-[2000ms]'
              : ''}"
            style="width:{(1 / imageArray.length) *
              100}%; transform:translateX({progressWrapForwardPosition}%);"
          ></div>
          <div
            class="h-full rounded-full absolute top-0 right-0 bg-dark {isSlideAnimated
              ? 'transition-transform duration-[2000ms]'
              : ''}"
            style="width:{(1 / imageArray.length) *
              100}%; transform:translateX({-progressWrapBackwardPosition}%);"
          ></div>
        </div>

        <button
          onclick={slideLeft}
          class="absolute -left-2 h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle justify-center cursor-pointer transition-all duration-500 hover:bg-[#424B5A] hover:border-[#424B5A] active:bg-black bump"
        >
          <img alt="chevron-left" src={chevronLeft} class="-translate-x-[1px]" />
        </button>
        <button
          onclick={slideRight}
          class="absolute -right-2 -translate-y-[0.7px] h-6 w-6 rounded-full border-[#C2D1D9] border-2 p-1 flex align-middle cursor-pointer transition-all duration-500 justify-center hover:bg-[#424B5A] hover:border-[#424B5A] active:bg-black bump"
        >
          <img alt="chevron-right" src={chevronRight} class="translate-x-[1px]" />
        </button>
      </ContentWidth>
    </div>
  </div>
</section>
