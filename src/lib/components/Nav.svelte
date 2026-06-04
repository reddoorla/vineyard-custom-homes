<script lang="ts">
  import logo from "$lib/assets/icons/logos/vch_logo.png";
  import { fade } from "svelte/transition";

  import ContentWidth from "./ContentWidth/ContentWidth.svelte";
  import { beforeNavigate } from "$app/navigation";

  let showMenu = $state(false);

  beforeNavigate(() => (showMenu = false));
</script>

{#if showMenu}
  <div
    class="fixed top-0 left-0 w-screen h-screen bg-dark flex flex-col items-center justify-center gap-9 z-30 text-white"
    transition:fade
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

        <button onclick={() => (showMenu = !showMenu)} aria-label="toggle menu" class="z-40 pr-2"
          ><i
            class="fa-solid fa-sharp fa-bars fa-2xl text-white hover:text-light active:transition-none active:text-dark transition-colors duration-500"
          ></i></button
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
      onclick={() => (showMenu = !showMenu)}
      aria-label="toggle menu"
      class="z-40 pr-2 block md:hidden"
      ><i
        class="fa-solid fa-sharp fa-bars fa-2xl text-white hover:text-light active:transition-none active:text-dark transition-colors duration-500"
      ></i></button
    >

    <div class="w-[0.75px] h-2.5 bg-white absolute left-0 -bottom-[5px]"></div>
    <div class="w-[0.75px] h-2.5 bg-white absolute right-0 -bottom-[5px]"></div>
  </ContentWidth>
</nav>
