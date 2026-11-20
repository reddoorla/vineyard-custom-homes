<script lang="ts">
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
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

  const TRANSITION_DURATION = 1400; // the out-fade, then the in-fade, 700ms each

  // How long a card stays fully readable before it starts to fade out (Tim,
  // 2026-11-20: "slow down this slide show ... so people can read the
  // testimonials"). Read at about 200 words a minute, so the 90-word partner
  // quote holds ~27s; a short quote still holds MIN_HOLD_MS. The time between
  // advances is this plus TRANSITION_DURATION, because a card is only legible
  // once its in-fade finishes. It was a flat 5000ms interval before, which left
  // a card readable for ~3.6s whatever its length.
  const WORDS_PER_MINUTE = 200;
  const MIN_HOLD_MS = 8000;
  const wordCount = (text: string | null): number => {
    const trimmed = text?.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  };
  const holdFor = (t: Testimonial | undefined): number =>
    Math.max(
      MIN_HOLD_MS,
      Math.round((wordCount(t?.testimonial ?? null) * 60000) / WORDS_PER_MINUTE),
    );

  let { testimonials = [] }: Props = $props();

  // Autoplay stops while someone is reading: a mouse or a hovering pen over
  // the slider, or keyboard focus inside it. Touch has no hover, so a tap only
  // "hovers" while the finger is down and pausing on it would do nothing
  // useful. Mouse focus from clicking a dot does not pause (only :focus-visible
  // does), or the slider would stay paused until the visitor clicked elsewhere.
  // Reduced motion turns autoplay off, as reddoor-website's shared Slideshow
  // (the Rubrik Zero Labs case study on reddoorla.com) does; the dots and a
  // swipe still move between cards.
  let hovered = $state(false);
  let keyboardFocused = $state(false);
  let reduceMotion = $state(false);
  $effect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotion = mq.matches;
    const on = () => (reduceMotion = mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  });
  const paused = $derived(!isAutoPlaying || hovered || keyboardFocused || reduceMotion);

  const onPointerEnter = (e: PointerEvent): void => {
    if (e.pointerType !== "touch") hovered = true;
  };
  const onPointerLeave = (e: PointerEvent): void => {
    if (e.pointerType !== "touch") hovered = false;
  };
  const onFocusIn = (e: FocusEvent): void => {
    keyboardFocused = e.target instanceof Element && e.target.matches(":focus-visible");
  };
  const onFocusOut = (e: FocusEvent): void => {
    const container = e.currentTarget as Element;
    if (!(e.relatedTarget instanceof Node && container.contains(e.relatedTarget))) {
      keyboardFocused = false;
    }
  };

  // One timer per shown card. Re-runs whenever the card changes (autoplay, a
  // dot, a swipe) or the slider pauses or resumes, so every change restarts the
  // full hold for the card now showing — a reader who moves the mouse away gets
  // the whole card again, not the remainder.
  $effect(() => {
    const count = testimonialArray.length;
    if (paused || count < 2) return;
    const index = currentIndex;
    const timer = setTimeout(
      () => (currentIndex = (index + 1) % count),
      TRANSITION_DURATION + holdFor(testimonialArray[index]),
    );
    return () => clearTimeout(timer);
  });

  const goToSlide = (index: number): void => {
    currentIndex = index;
  };

  const _toggleAutoplay = (): void => {
    isAutoPlaying = !isAutoPlaying;
  };

  onMount(() => {
    if (testimonials.length > 0) {
      testimonialArray = testimonials;
    }
  });

  const handleSwipe = (e: SwipeCustomEvent): void => {
    if (e.detail.direction === "left") currentIndex = (currentIndex + 1) % testimonialArray.length;
    if (e.detail.direction === "right") {
      currentIndex = currentIndex - 1;
      if (currentIndex < 0) currentIndex = testimonialArray.length - 1;
    }
  };
</script>

<ContentWidth>
  <div
    class="w-full h-full relative bg-white"
    role="group"
    aria-roledescription="carousel"
    aria-label="Testimonials from our partners"
    onpointerenter={onPointerEnter}
    onpointerleave={onPointerLeave}
    onfocusin={onFocusIn}
    onfocusout={onFocusOut}
  >
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
