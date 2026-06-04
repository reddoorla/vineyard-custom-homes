<script lang="ts">
  import { swipe, type SwipeCustomEvent } from "svelte-gestures";
  import { onMount } from "svelte";
  import featuredPlaceholder from "$lib/assets/images/background_placeholder.svg";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";
  import { PrismicImage } from "@prismicio/svelte";
  import type { ImageField } from "@prismicio/client";

  // Define the testimonial interface
  interface Testimonial {
    testimonial: string | null;
    image?: ImageField | string;
    attribution: string | null;
    attribution_subheader: string | null;
    title?: string;
  }

  // Props interface
  interface Props {
    testimonials?: Testimonial[];
  }

  let _viewportWidth = $state<number>(1024);

  // Placeholder data with proper typing
  let testimonialArray: Testimonial[] = [
    {
      testimonial:
        '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse tincidunt sagittis eros. Quisque quis euismod lorem."',
      image: featuredPlaceholder,
      attribution: "Author Name",
      attribution_subheader: "CITY, ST",
    },
    {
      testimonial:
        '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse tincidunt sagittis eros. Quisque quis euismod lorem."',
      attribution: "Author Name",
      attribution_subheader: "CITY, ST",
    },
    {
      testimonial:
        '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse tincidunt sagittis eros. Quisque quis euismod lorem."',
      image: featuredPlaceholder,
      attribution: "Author Name",
      attribution_subheader: "CITY, ST",
    },
  ];

  let tripledTestimonials = $state<Testimonial[]>([]);
  let sliderIndex = $state<number>(0);
  let isSlideAnimated = $state<boolean>(true);

  const SLIDER_TRANSITION_LENGTH_IN_MS: number = 2000;

  const resetSliderToStart = (): void => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(() => (sliderIndex = 0), SLIDER_TRANSITION_LENGTH_IN_MS + 20);
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const resetSliderToEnd = (): void => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(
      () => (sliderIndex = testimonialArray.length - 1),
      SLIDER_TRANSITION_LENGTH_IN_MS + 20,
    );
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const slideRight = (): void => {
    sliderIndex--;
    if (sliderIndex < 0) resetSliderToEnd();
    console.log("Current slide index:", sliderIndex);
  };

  const slideLeft = (): void => {
    sliderIndex++;
    if (sliderIndex >= testimonialArray.length) resetSliderToStart();
    console.log("Current slide index:", sliderIndex);
  };

  const handleSwipe = (e: SwipeCustomEvent): void => {
    if (e.detail.direction === "left") slideLeft();
    if (e.detail.direction === "right") slideRight();
  };

  // Props with proper typing
  let { testimonials = [] }: Props = $props();

  onMount(() => {
    if (testimonials.length > 0) {
      testimonialArray = testimonials;
    }
    tripledTestimonials = [...testimonialArray, ...testimonialArray, ...testimonialArray];
  });
</script>

<ContentWidth>
  <div
    class="w-full h-full overflow-hidden relative"
    use:swipe={() => ({ timeframe: 300, minSwipeDistance: 100, touchAction: "pan-y" })}
    onswipe={handleSwipe}
  >
    {#if tripledTestimonials.length > 0}
      <div
        style="width: {tripledTestimonials.length * 100}%; transform:translateX({(-sliderIndex /
          tripledTestimonials.length -
          1 / 3) *
          100}%);"
        class="flex flex-row justify-between flex-nowrap h-[95lvh] lg:h-[70lvh] overflow-hidden
				{isSlideAnimated ? 'transition-transform duration-[2000ms]' : ''}"
      >
        {#each tripledTestimonials as testimonial, i (i)}
          <div
            style="width: {100 / tripledTestimonials.length}%;"
            class="h-full relative overflow-hidden bg-dark flex flex-col-reverse justify-end gap-12 lg:flex-row p-0"
          >
            <div
              class="w-full lg:h-full flex flex-col justify-center gap-6 lg:gap-12 px-8 pb-8 lg:p-12"
            >
              <h3 class="text-light uppercase">{testimonial.title || "From Our Clients"}</h3>
              <p class="text-white text-xs max-w-[520px]">{testimonial.testimonial}</p>
              <div class="flex gap-9 items-center">
                <div class="flex flex-col">
                  <h4 class="text-light">{testimonial.attribution}</h4>
                  <div class="label text-light">{testimonial.attribution_subheader}</div>
                </div>
              </div>
            </div>
            {#if typeof testimonial.image !== "string" && testimonial.image?.url}
              <PrismicImage
                field={testimonial.image}
                class="h-2/5 lg:h-full w-full lg:w-[320px] xl:w-[560px] object-cover"
              />
            {:else if typeof testimonial.image === "string"}
              <img
                src={testimonial.image}
                alt="Profile Placeholder"
                class="h-2/5 lg:h-full w-full md:w-1/3 xl:w-[560px] object-cover"
              />
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="w-full h-full flex items-center justify-center">
        <p>No testimonials available</p>
      </div>
    {/if}
  </div>

  <button
    class="bump hidden lg:block absolute top-1/2 -translate-y-1/2 left-3 xl:-left-3 -translate-x-full"
    onclick={slideRight}
    aria-label="slide right"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle
        cx="20"
        cy="20"
        r="19.375"
        transform="matrix(-1 0 0 1 40 0)"
        fill="white"
        stroke="#7BA0C4"
        stroke-width="1.25"
      />
      <path
        d="M11.4286 20.0337L17.6786 16.4253V23.6421L11.4286 20.0337ZM40 20.6587H17.0536V19.4087H40V20.6587Z"
        fill="#7BA0C4"
      />
    </svg>
  </button>
  <button
    class="bump hidden lg:block absolute top-1/2 -translate-y-1/2 right-3 xl:-right-3 translate-x-full"
    onclick={slideLeft}
    aria-label="slide left"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19.375" fill="white" stroke="#7BA0C4" stroke-width="1.25" />
      <path
        d="M28.5714 20.0337L22.3214 16.4253V23.6421L28.5714 20.0337ZM0 20.6587H22.9464V19.4087H0V20.6587Z"
        fill="#7BA0C4"
      />
    </svg>
  </button>

  <div
    class="lg:hidden flex flex-row justify-between items-center absolute -bottom-8 translate-y-full left-0 gap-12"
  >
    <button class="bump" onclick={slideRight} aria-label="slide right">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
      >
        <circle
          cx="20"
          cy="20"
          r="19.375"
          transform="matrix(-1 0 0 1 40 0)"
          fill="white"
          stroke="#7BA0C4"
          stroke-width="1.25"
        />
        <path
          d="M11.4286 20.0337L17.6786 16.4253V23.6421L11.4286 20.0337ZM40 20.6587H17.0536V19.4087H40V20.6587Z"
          fill="#7BA0C4"
        />
      </svg>
    </button>
    <button class="bump" onclick={slideLeft} aria-label="slide left">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
      >
        <circle cx="20" cy="20" r="19.375" fill="white" stroke="#7BA0C4" stroke-width="1.25" />
        <path
          d="M28.5714 20.0337L22.3214 16.4253V23.6421L28.5714 20.0337ZM0 20.6587H22.9464V19.4087H0V20.6587Z"
          fill="#7BA0C4"
        />
      </svg>
    </button>
  </div>
</ContentWidth>
