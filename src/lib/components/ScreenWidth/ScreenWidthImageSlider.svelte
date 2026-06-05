<script lang="ts">
  import { onMount } from "svelte";
  import { swipe } from "svelte-gestures";
  import type { SwipeCustomEvent } from "svelte-gestures";
  import placeholder from "../../assets/images/background_placeholder.svg";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";
  import chevronLeft from "$lib/assets/icons/chevron-left.svg";
  import chevronRight from "$lib/assets/icons/chevron-right.svg";

  interface Props {
    imageArray?: string[];
    altText?: string;
    dotFloat?: string;
    hasArrows?: boolean;
    children?: import("svelte").Snippet;
  }

  let {
    imageArray = [placeholder, placeholder, placeholder, placeholder],
    altText = "background image",
    dotFloat = "left",
    hasArrows = false,
    children,
  }: Props = $props();

  const SLIDER_TRANSITION_LENGTH_IN_MS = 2000;
  const SLIDER_INTERVAL_IN_MS = 5000;

  let sliderIndex = $state(0);

  let isSlideAnimated = $state(true);
  let _nextSlideIndex = 1;
  let _previousSlideIndex = imageArray.length - 1;

  let getNextSlideIndex = () => {
    if (sliderIndex == imageArray.length - 1) {
      _nextSlideIndex = 0;
      return;
    }
    if (sliderIndex == imageArray.length) {
      _nextSlideIndex = 1;
      return;
    }
    if (sliderIndex < -1) {
      _nextSlideIndex = imageArray.length + (sliderIndex + 1);
      return;
    }
    _nextSlideIndex = sliderIndex + 1;
  };

  let getPreviousSlideIndex = () => {
    if (sliderIndex < 1 && sliderIndex > 0 - imageArray.length) {
      _previousSlideIndex = imageArray.length + (sliderIndex - 1);
      return;
    }
    if (sliderIndex == 0 - imageArray.length) {
      _previousSlideIndex = imageArray.length - 1;
      return;
    }

    _previousSlideIndex = sliderIndex - 1;
  };

  const resetSlider = () => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(
      () => (sliderIndex = sliderIndex % imageArray.length),
      SLIDER_TRANSITION_LENGTH_IN_MS + 20,
    );
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const slideLeft = () => {
    sliderIndex++;
    getNextSlideIndex();
    getPreviousSlideIndex();
    if (sliderIndex % imageArray.length == 0 && sliderIndex !== 0) resetSlider();

    console.log(sliderIndex);
  };
  const slideRight = () => {
    sliderIndex--;
    getNextSlideIndex();
    getPreviousSlideIndex();
    if (sliderIndex % imageArray.length == 0 && sliderIndex !== 0) resetSlider();

    console.log(sliderIndex);
  };

  const setSliderIndex = (index: number) => {
    sliderIndex = index;
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => slideLeft(), SLIDER_INTERVAL_IN_MS);
  };

  let sliderInterval: ReturnType<typeof setTimeout>;

  const handleSwipe = (e: SwipeCustomEvent) => {
    if (e.detail.direction === "left") slideLeft();

    if (e.detail.direction === "right") slideRight();
  };

  onMount(() => {
    sliderInterval = setInterval(() => slideLeft(), SLIDER_INTERVAL_IN_MS);
    return () => clearInterval(sliderInterval);
  });

  const tripledImages = imageArray.concat(imageArray).concat(imageArray);
</script>

<section>
  <div
    use:swipe={() => ({ timeframe: 300, minSwipeDistance: 60 })}
    onswipe={handleSwipe}
    class="h-[160vw] sm:h-[90vw] xl:h-[60vw] lg:max-h-screen relative overflow-hidden"
  >
    <div
      class="h-full flex flex-row flex-nowrap {isSlideAnimated
        ? 'transition-transform duration-[2000ms]'
        : ''}"
      style="width:{100 * tripledImages.length}vw; transform:translateX({-(
        sliderIndex + imageArray.length
      ) * 100}vw); "
    >
      {#each tripledImages as image, i (i)}
        <div class="w-screen">
          <img src={image} alt={altText} class=" h-full w-full object-cover -z-10" />
        </div>
      {/each}
    </div>
    <div class="absolute flex justify-center w-full h-full top-0 left-0">
      <ContentWidth class="h-full relative w-full">
        {@render children?.()}
        <div
          class="absolute h-10 flex align-middle justify-start {dotFloat === 'left'
            ? 'left-[4%]  xl:left-8'
            : ''} {dotFloat === 'left'
            ? 'left-[4%]  xl:left-8 translate-x-[2px]'
            : ''} {dotFloat === 'right'
            ? 'right-[4%]  xl:right-8 -translate-x-[2px]'
            : ''} {dotFloat === 'center' ? 'left-1/2 -translate-x-1/2' : ''}  bottom-10"
        >
          {#each imageArray as _image, i (i)}
            <button
              class="h-[10px] w-[10px] border-2 rounded-full transition-colors duration-1000 cursor-pointer active:-translate-y-[0.5px] hover:opacity-60 mr-4
								{(sliderIndex % imageArray.length >= 0 && sliderIndex % imageArray.length === i) ||
              (sliderIndex % imageArray.length <= 0 &&
                imageArray.length + (sliderIndex % imageArray.length) === i)
                ? 'bg-dark border-dark'
                : 'border-light'}"
              onclick={() => setSliderIndex(i)}
              aria-label="image {i} of {imageArray.length}"
              aria-hidden="true"
            ></button>
          {/each}
        </div>
      </ContentWidth>
      {#if hasArrows}
        <button onclick={slideRight} class="absolute top-1/2 -translate-y-1/2 left-6"
          ><img src={chevronLeft} alt="left" class="w-3 md:w-4" /></button
        >
        <button onclick={slideLeft} class="absolute top-1/2 -translate-y-1/2 right-6"
          ><img src={chevronRight} alt="right" class="w-3 md:w-4" /></button
        >
      {/if}
    </div>
  </div>
</section>
