<script lang="ts">
  import { fade } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";
  import type { ImageField } from "@prismicio/client";
  import { useSwipe, type SwipeCustomEvent } from "svelte-gestures";

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
    autoplayDelay?: number; // in milliseconds
  }

  // Placeholder data with proper typing
  let testimonialArray: Testimonial[] = $state([
    {
      testimonial:
        '"I wanted to share how awesome it\'s been working with you. I keep getting such great feedback from others around the job site and also the neighbors that you and the subs are doing an unbelievable job!"',
      attribution: "Blake H.",
      attribution_subheader: "EAGLE, ID",
      title: "FROM OUR PARTNERS",
    },
    {
      testimonial:
        '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse tincidunt sagittis eros. Quisque quis euismod lorem."',
      attribution: "Author Name",
      attribution_subheader: "CITY, ST",
      title: "FROM OUR PARTNERS",
    },
    {
      testimonial:
        '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse tincidunt sagittis eros. Quisque quis euismod lorem."',
      attribution: "Author Name",
      attribution_subheader: "CITY, ST",
      title: "FROM OUR PARTNERS",
    },
  ]);

  let currentIndex = $state<number>(0);
  let isAutoPlaying = $state<boolean>(true);
  let autoplayInterval: ReturnType<typeof setInterval> | null = null;

  const AUTOPLAY_DELAY = 5000; // 5 seconds
  const TRANSITION_DURATION = 1400; // 0.5 seconds

  // Props with proper typing
  let { testimonials = [], autoplayDelay = AUTOPLAY_DELAY }: Props = $props();

  const startAutoplay = (): void => {
    if (autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
      if (isAutoPlaying) {
        currentIndex = (currentIndex + 1) % testimonialArray.length;
      }
    }, autoplayDelay);
  };

  const stopAutoplay = (): void => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  };

  const goToSlide = (index: number): void => {
    currentIndex = index;
    // Restart autoplay after manual interaction
    if (isAutoPlaying) {
      startAutoplay();
    }
  };

  const _toggleAutoplay = (): void => {
    isAutoPlaying = !isAutoPlaying;
    if (isAutoPlaying) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
  };

  onMount(() => {
    if (testimonials.length > 0) {
      testimonialArray = testimonials;
    }
    startAutoplay();
  });

  onDestroy(() => {
    stopAutoplay();
  });

  const handleSwipe = (e: SwipeCustomEvent): void => {
    startAutoplay();
    if (e.detail.direction === "left") currentIndex = (currentIndex + 1) % testimonialArray.length;
    if (e.detail.direction === "right") {
      currentIndex = currentIndex - 1;
      if (currentIndex < 0) currentIndex = testimonialArray.length - 1;
    }
  };
</script>

<ContentWidth>
  <div class="w-full h-full relative bg-white">
    <div class="mb-12 text-center">
      <h3 class="text-sm lg:text-base tracking-[0.2em] text-light font-light uppercase">
        FROM OUR PARTNERS
      </h3>
    </div>
    {#if testimonialArray.length > 0}
      <div
        class="h-129 md:h-92 relative overflow-hidden"
        {...useSwipe(handleSwipe, () => ({
          timeframe: 300,
          minSwipeDistance: 100,
          touchAction: "pan-y",
        }))}
      >
        {#each testimonialArray as testimonial, i (i)}
          {#if i === currentIndex}
            <div
              class="absolute inset-0 flex flex-col justify-center items-center text-center px-8 lg:px-16"
              in:fade={{ duration: TRANSITION_DURATION / 2, delay: TRANSITION_DURATION / 2 }}
              out:fade={{ duration: TRANSITION_DURATION / 2 }}
            >
              <!-- Title -->

              <!-- Testimonial Text -->
              <div class="max-w-4xl mb-8">
                <p class="text-2xl lg:text-4xl xl:text-5xl leading-relaxed text-dark font-light">
                  {testimonial.testimonial}
                </p>
              </div>

              <!-- Attribution -->
              <div class="text-center">
                <h4 class="text-xl lg:text-2xl text-light font-medium mb-2">
                  {testimonial.attribution}
                </h4>
                <div class="text-sm lg:text-base tracking-[0.1em] text-light uppercase">
                  {testimonial.attribution_subheader}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Dot Navigation -->
      <div class="flex justify-center items-center gap-3 py-8">
        {#each testimonialArray as _, i (i)}
          <button
            class="w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 {i ===
            currentIndex
              ? 'bg-dark'
              : 'bg-light/75 hover:bg-light'}"
            onclick={() => goToSlide(i)}
            aria-label={`Go to testimonial ${i + 1}`}
          ></button>
        {/each}
      </div>

      <!-- Optional: Autoplay Toggle Button (for development/testing) -->
      <!-- Uncomment if you want users to be able to pause autoplay -->
      <!--
			<button
				class="absolute top-4 right-4 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
				onclick={toggleAutoplay}
			>
				{isAutoPlaying ? 'Pause' : 'Play'}
			</button>
			-->
    {:else}
      <div class="w-full h-full flex items-center justify-center">
        <p class="text-gray-500">No testimonials available</p>
      </div>
    {/if}
  </div>
</ContentWidth>

<style>
  /* Custom fade transition styles if needed */
  :global(.testimonial-fade) {
    transition: opacity 0.5s ease-in-out;
  }
</style>
