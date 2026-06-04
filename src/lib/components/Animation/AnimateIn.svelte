<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  let isInView = $state(false);
  let el: HTMLElement | undefined = $state();
  let transitionDelay = $state(0);

  let {
    style = "",
    transitionDelayMax = 400,
    transitionDuration = 2400,
    class: passedClasses = "",
    children,
  } = $props();

  const checkViewport = () => {
    if (window && el) {
      let rect = el.getBoundingClientRect();
      isInView = rect.bottom <= window.innerHeight + rect.height;
      transitionDelay = transitionDelayMax * (rect.left / window.innerWidth);
    }
  };
  let checking: ReturnType<typeof setTimeout>;

  onMount(() => {
    checkViewport();

    checking = setInterval(() => {
      checkViewport();
    }, 4000);

    window.addEventListener("scroll", checkViewport);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", checkViewport);

      if (checking) clearInterval(checking);
    }
  });
</script>

<div
  bind:this={el}
  class="transition ease-fast-slow {passedClasses} {isInView
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-[50%]'}"
  style="transition-delay:{transitionDelay}ms; transition-duration:{transitionDuration}ms; {style}"
>
  {@render children?.()}
</div>
