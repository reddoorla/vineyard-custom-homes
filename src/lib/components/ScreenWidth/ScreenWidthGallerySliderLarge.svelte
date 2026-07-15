<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
  import { onMount } from "svelte";
  import { useSwipe } from "svelte-gestures";
  import placeholder from "../../assets/images/image_placeholder.svg";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";
  import type { SwipeCustomEvent } from "svelte-gestures";

  let {
    itemArray = [
      {
        name: "Item 1",
        featuredText: "Dev + UX",
        href: "#",
        filters: ["Dev", "UX"],
      },
      {
        name: "Item 2",
      },
      {
        name: "Item 3",
        featuredText: "UX + UI",
        href: "#",
        featuredImage: placeholder,
        filters: ["UI", "UX"],
      },
    ],
    class: passedClasses = "",
  } = $props();

  const _SLIDER_TRANSITION_FUNCTION = "cubic-bezier(.5,0,0,1)";
  const SLIDER_TRANSITION_LENGTH_IN_MS = 2000;
  const SLIDER_INTERVAL_IN_MS = 5000;

  let sliderIndex = $state(0);
  let innerWidth: number = $state(1024);
  let imageWidth = $state(720);
  let isSlideAnimated = $state(true);

  $effect(() => {
    if (innerWidth > 1040) {
      imageWidth = 720;
    } else if (innerWidth > 768) {
      imageWidth = 480;
    } else {
      imageWidth = 320;
    }
  });

  const resetSliderToStart = () => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(() => (sliderIndex = 0), SLIDER_TRANSITION_LENGTH_IN_MS + 20);
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const resetSliderToEnd = () => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(() => (sliderIndex = itemArray.length - 1), SLIDER_TRANSITION_LENGTH_IN_MS + 20);
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const slideRight = () => {
    sliderIndex++;
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => slideRight(), SLIDER_INTERVAL_IN_MS);
    if (sliderIndex == itemArray.length) resetSliderToStart();
  };
  const slideLeft = () => {
    sliderIndex--;
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => slideLeft(), SLIDER_INTERVAL_IN_MS);
    if (sliderIndex < 0) resetSliderToEnd();
  };

  const setSliderIndex = (index: number) => {
    sliderIndex = index;
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => slideRight(), SLIDER_INTERVAL_IN_MS);
  };

  let sliderInterval: ReturnType<typeof setTimeout>;

  const handleSwipe = (e: SwipeCustomEvent) => {
    if (e.detail.direction === "left") slideRight();

    if (e.detail.direction === "right") slideLeft();
  };

  const _progressPosistion = $derived(sliderIndex * 100);
  const _progressWrapForwardPosition = $derived(sliderIndex === itemArray.length ? 0 : 100);
  const _progressWrapBackwardPosition = $derived(
    sliderIndex === -1 ? itemArray.length * 100 - 100 : itemArray.length * 100,
  );

  onMount(() => {
    sliderInterval = setInterval(() => slideRight(), SLIDER_INTERVAL_IN_MS);
    return () => clearInterval(sliderInterval);
  });

  const tripledItems = $derived(itemArray.concat(itemArray).concat(itemArray));
</script>

<svelte:window bind:innerWidth />

<section class="pb-32 {passedClasses}">
  <div
    {...useSwipe(handleSwipe, () => ({ timeframe: 300, minSwipeDistance: 60 }))}
    class="h-py-2 relative"
    style="height:{imageWidth * 0.95}px;"
  >
    <div
      class="h-full flex flex-row flex-nowrap {isSlideAnimated
        ? 'transition-transform duration-[2000ms]'
        : ''}"
      style="width:{(imageWidth - 8) *
        tripledItems.length}px; margin-left:calc(50vw - {(imageWidth - 8) /
        2}px); transform:translateX({-(sliderIndex + itemArray.length) * (imageWidth - 8)}px); "
    >
      {#each tripledItems as item, i (i)}
        {#if item.href}
          <a href={item?.href || "#"} class="h-full mx-4 relative" style="width:{imageWidth}px;">
            <img src={item?.featuredImage} alt={item.name} class="h-full object-cover -z-10" />
            <div
              class="absolute w-full aspect-[4/3] top-8 left-0 bg-dark opacity-0 hover:opacity-100 hover:bg-opacity-80 transition-opacity duration-500 flex justify-center items-center"
            >
              <h4 class="text-white">{item.name}</h4>
            </div>
          </a>
        {:else}
          <div class="h-full mx-4" style="width:{imageWidth}px">
            <img src={item?.featuredImage} alt={item.name} class="h-full object-cover -z-10" />
          </div>
        {/if}
      {/each}
    </div>
    <div class="absolute flex justify-center w-full bottom-0">
      <ContentWidth class="h-full relative w-full">
        <div class="h-10 flex align-middle justify-center bottom-10">
          {#each itemArray as _item, i (i)}
            <button
              class="h-[10px] w-[10px] border-2 rounded-full transition-colors duration-1000 cursor-pointer active:-translate-y-[0.5px] hover:opacity-60 mx-2 translate-x-2
                                    {(sliderIndex % itemArray.length >= 0 &&
                sliderIndex % itemArray.length === i) ||
              (sliderIndex % itemArray.length <= 0 &&
                itemArray.length + (sliderIndex % itemArray.length) === i)
                ? 'bg-dark border-dark'
                : 'border-light'}"
              onclick={() => setSliderIndex(i)}
              aria-label="image {i} of {itemArray.length}"
              aria-hidden="true"
            ></button>
          {/each}
        </div>
      </ContentWidth>
    </div>
  </div>
</section>
