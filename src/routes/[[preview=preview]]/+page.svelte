<script lang="ts">
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthMedia.svelte";
  import vchMark from "$lib/assets/icons/vch-mark-lightsvg.svg";
  import vchVideoThumb from "$lib/assets/images/riverThumb.jpg?as=run";
  import catThumb from "$lib/assets/images/homethumb.jpg?as=run";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import TestimonialSlider from "$lib/components/FullWidth/TestimonialSlider.svelte";
  import ScreenWidthMedia from "$lib/components/ScreenWidth/ScreenWidthMedia.svelte";

  import { PrismicImage, PrismicLink } from "@prismicio/svelte";

  let { data } = $props();

  let viewpoortWidth = $state(1024);

  const instaImages = $derived(data.instagram.data.feature);
  const ownerTestimonials = $derived(data.ownerTestimonials.data);
</script>

<svelte:window bind:innerWidth={viewpoortWidth} />

<ScreenWidthMedia darken vimeoId="1092191048" src={vchVideoThumb}>
  <div class="w-full h-full flex items-center justify-center">
    <img src={vchMark} class="w-24 z-10" alt="vch logomark" />
  </div>
</ScreenWidthMedia>

<section class="py-32">
  <ContentWidth>
    <h1 class="text-dark uppercase text-center max-w-[900px]">
      Building custom homes in the Treasure Valley with the <span class="text-light"
        >utmost care</span
      > and attention to detail
    </h1>
    <div class="flex flex-col items-center justify-center mt-16">
      <div class="h-0 w-3 border-light border-b-[1px] -translate-x-[0.5px]"></div>
      <div class="h-20 w-0 border-r-1 -translate-x-[0.5px] border-light"></div>
      <div
        class="w-16 h-16 rounded-full border-1 border-light relative flex flex-col items-center justify-center gap-[3px]"
      >
        <div class="label text-light translate-x-[0.5px]">01</div>
        <div class="h-[0.5px] w-full bg-light"></div>
        <div class="label text-light translate-x-[0.5px]">V</div>
      </div>
    </div>
    <p class="text-center max-w-screen-sm text-dark mt-16">
      With founders who grew up around job sites and craftsmen, we learned the value of doing things
      the right way—not the easy way. We approach every home as if we were building it for our own
      family.
    </p>
    <div class="flex flex-col md:flex-row items-center gap-20 mt-16">
      <DefaultButton href="/contact">LET'S CONNECT</DefaultButton>
      <DefaultButton href="/about">Tell Me More</DefaultButton>
    </div>
  </ContentWidth>
</section>
<ScreenWidthImage vimeoId={data.page.data.vimeo_id_for_video || "1092190178"} src={catThumb}>
  <DefaultButton
    href="/gallery"
    class="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 text-center bg-white/90"
    bump={false}>VIEW OUR WORK</DefaultButton
  >
</ScreenWidthImage>
<section class="py-32">
  <ContentWidth>
    <div class="flex flex-col items-center gap-16 mx-auto w-full lg:w-[640px]">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-1.5 w-full" viewBox="0 0 486 6" fill="none">
        <path
          d="M0 3L5 5.88675V0.113249L0 3ZM486 3L481 0.113249V5.88675L486 3ZM4.5 3.5H481.5V2.5H4.5V3.5Z"
          fill="#7BA0C4"
        />
      </svg>
      <div class="flex flex-col items-center gap-8 text-center">
        <h2 class="text-dark uppercase">Legacy of Craftsmanship</h2>
        <p class="text-dark">
          With generations of building experience behind us, we know that the best homes are built
          from a deep understanding of the craft. Every line, joint, and finish is executed with
          precision—because quality should never be a question.
        </p>
      </div>
      <div class="flex flex-col items-center gap-8 text-center">
        <h2 class="text-dark uppercase">Relationships First, Always</h2>
        <p class="text-dark">
          Great homes start with great relationships. We take the time to understand your vision,
          communicate clearly, and guide you through every step. Our clients become
          collaborators—and often, friends—because trust is the foundation we build on.
        </p>
      </div>
      <div class="flex flex-col items-center gap-8 text-center">
        <h2 class="text-dark uppercase">Details Make the Difference</h2>
        <p class="text-dark">
          From intricate woodwork to custom layouts, we embrace complexity and deliver solutions
          that are both beautiful and lasting. We love rising to the challenge that other builders
          would avoid. It’s in those details that your home becomes truly yours.
        </p>
      </div>
      <DefaultButton href="/about">TELL ME MORE</DefaultButton>
    </div>
  </ContentWidth>
</section>
<section class="py-32 w-screen overflow-hidden">
  <TestimonialSlider testimonials={ownerTestimonials.testimonials} />
</section>
<section class="py-32">
  <ContentWidth>
    <a href="https://www.instagram.com/vineyardcustomhomes/" target="_blank" aria-label="instagram"
      ><svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        class="size-[2em] text-dark scale-150 hover:text-light transition"
        ><path
          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        /></svg
      ></a
    >
    <h3 class="text-dark mt-12">VIEW OUR CURRENT PROJECTS</h3>
    <div class="w-full flex flex-row justify-center items-center flex-wrap gap-6 mt-6">
      {#each instaImages as insta, i (i)}
        <PrismicLink
          field={insta.url}
          class="w-full md:w-1/3 xl:w-1/5 aspect-square hover:opacity-80 transition-opacity"
          aria-label="vch instagram photo"
        >
          <PrismicImage field={insta.image} class="w-full h-full object-cover" />
        </PrismicLink>
      {/each}
    </div>
  </ContentWidth>
</section>
