<script lang="ts">
  import AnimateIn from "../Animation/AnimateIn.svelte";
  let { animateIn = false, class: passedClasses = "", children = undefined } = $props();

  const baseClasses = "max-w-[1220px] xl:max-w-[1440px] xl:mx-auto mx-[4%] w-[92%]";
  const defaultLayouts = "flex flex-col items-center justify-center relative";
</script>

{#if animateIn}
  <AnimateIn>
    <div class="{baseClasses} {passedClasses || defaultLayouts}">
      {@render children?.()}
    </div>
  </AnimateIn>
{:else}
  <div class="{baseClasses} {passedClasses || defaultLayouts}">
    {@render children?.()}
  </div>
{/if}
