<script lang="ts">
  import type { Snippet } from "svelte";
  interface ButtonProps {
    href?: string;
    onclick?: (event: MouseEvent) => void;
    class?: string;
    children?: Snippet;
    bump?: boolean;
    disabled?: boolean;
    [key: string]: unknown;
  }
  let {
    href = "",
    onclick = () => {},
    bump = true,
    disabled = false,
    class: passedClasses = "",
    children = undefined,
    ...rest
  }: ButtonProps = $props();

  // Guard the click handler too so a disabled button can't act (the native
  // `disabled` attribute already blocks mouse + keyboard submit at the browser).
  function handleClick(event: MouseEvent) {
    if (disabled) return;
    onclick(event);
  }

  const baseClasses =
    "border-1 border-solid border-dark px-10 pt-[14px] pb-[14px] h-fit hover:bg-light hover:text-white active:bg-dark transition";
</script>

<div class:bump>
  {#if href}
    <a {href} onclick={handleClick} class="{baseClasses} {passedClasses}" {...rest}>
      {@render children?.()}
    </a>
  {:else}
    <button
      {disabled}
      onclick={handleClick}
      class="{baseClasses} {passedClasses} disabled:opacity-60"
      {...rest}
    >
      {@render children?.()}
    </button>
  {/if}
</div>
