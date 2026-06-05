<script lang="ts">
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

  // Reveal once when the element scrolls into view. IntersectionObserver is
  // passive (no scroll-handler jank) and stops observing after the first reveal.
  $effect(() => {
    if (!el) return;
    const node = el;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const rect = node.getBoundingClientRect();
          transitionDelay = transitionDelayMax * (rect.left / window.innerWidth);
          isInView = true;
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
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
