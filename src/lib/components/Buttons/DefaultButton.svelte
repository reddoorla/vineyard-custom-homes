<script lang="ts">
  import type { Snippet } from "svelte";
  interface ButtonProps {
    href?: string;
    onclick?: (event: MouseEvent) => void;
    class?: string;
    children?: Snippet;
    bump?: boolean;
    [key: string]: unknown;
  }
  let {
    href = "",
    onclick = () => {},
    bump = true,
    class: passedClasses = "",
    children = undefined,
    ..._others
  }: ButtonProps = $props();

  const baseClasses =
    "border-1 border-solid border-dark px-10 pt-[14px] pb-[14px] h-fit hover:bg-light hover:text-white active:bg-dark transition";
</script>

<div class:bump>
  {#if href}
    <a {href} {onclick} class="{baseClasses} {passedClasses}">
      {@render children?.()}
    </a>
  {:else}
    <button {onclick} class="{baseClasses} {passedClasses}">
      {@render children?.()}
    </button>
  {/if}
</div>
