<script lang="ts">
  import logo from "$lib/assets/icons/logos/vch_logo.png";
  import { fade } from "svelte/transition";

  import ContentWidth from "./ContentWidth/ContentWidth.svelte";
  import { beforeNavigate } from "$app/navigation";
  import { Menu } from "@lucide/svelte";

  let showMenu = $state(false);
  let triggerButton: HTMLButtonElement | undefined = $state();

  const closeMenu = () => {
    showMenu = false;
    triggerButton?.focus();
  };

  beforeNavigate(() => (showMenu = false));

  // While the overlay is open: focus the first item, keep Tab within the
  // overlay, and close on Escape. Cleans up its listener on unmount.
  function trapFocus(node: HTMLElement) {
    const focusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));

    focusable()[0]?.focus();

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeydown);
    return {
      destroy() {
        node.removeEventListener("keydown", onKeydown);
      },
    };
  }
</script>

{#if showMenu}
  <div
    id="mobile-menu"
    class="fixed top-0 left-0 w-screen h-screen bg-dark flex flex-col items-center justify-center gap-9 z-30 text-white"
    transition:fade
    use:trapFocus
  >
    <nav class=" absolute z-10 top-0 left-0 w-screen">
      <ContentWidth
        class="flex flex-row justify-between items-center border-b-1 py-5 border-white relative"
      >
        <a href="/" class=""
          ><img
            src={logo}
            class="h-6 md:h-9 w-auto hover:opacity-80 transition-opacity"
            alt="home"
          /></a
        >

        <button onclick={closeMenu} aria-label="close menu" class="z-40 pr-2"
          ><Menu
            class="size-[2em] text-white hover:text-light active:transition-none active:text-dark transition-colors duration-500"
            strokeWidth={2}
          /></button
        >

        <div class="w-[0.75px] h-2.5 bg-white absolute left-0 -bottom-[5px]"></div>
        <div class="w-[0.75px] h-2.5 bg-white absolute right-0 -bottom-[5px]"></div>
      </ContentWidth>
    </nav>
    <a href="/gallery" class="hover:text-light transition duration-300 ease-fast-slow">OUR WORK</a>
    <a href="/contact" class="hover:text-light transition duration-300 ease-fast-slow">INQUIRE</a>
    <a href="/about" class="hover:text-light transition duration-300 ease-fast-slow">ABOUT US</a>
  </div>
{/if}

<nav class=" absolute z-10 top-0 left-0 w-screen">
  <ContentWidth
    class="flex flex-row justify-between items-center border-b-1 py-5 border-white relative"
  >
    <a href="/" class=""
      ><img
        src={logo}
        class="h-6 md:h-9 w-auto hover:opacity-80 transition-opacity"
        alt="home"
      /></a
    >
    <div class=" justify-end gap-9 text-white hidden md:flex">
      <a href="/gallery" class="hover:text-light transition duration-300 ease-fast-slow">OUR WORK</a
      >
      <a href="/contact" class="hover:text-light transition duration-300 ease-fast-slow">INQUIRE</a>
      <a href="/about" class="hover:text-light transition duration-300 ease-fast-slow">ABOUT US</a>
    </div>
    <button
      bind:this={triggerButton}
      onclick={() => (showMenu = !showMenu)}
      aria-label="open menu"
      aria-expanded={showMenu}
      aria-controls="mobile-menu"
      class="z-40 pr-2 block md:hidden"
      ><Menu
        class="size-[2em] text-white hover:text-light active:transition-none active:text-dark transition-colors duration-500"
        strokeWidth={2}
      /></button
    >

    <div class="w-[0.75px] h-2.5 bg-white absolute left-0 -bottom-[5px]"></div>
    <div class="w-[0.75px] h-2.5 bg-white absolute right-0 -bottom-[5px]"></div>
  </ContentWidth>
</nav>
