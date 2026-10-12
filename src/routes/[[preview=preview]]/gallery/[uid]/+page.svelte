<script lang="ts">
  import { SliceZone } from "@prismicio/svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import RichTextSlice from "$lib/slices/RichText/index.svelte";
  import ContentWidthMediaSlice from "$lib/slices/ContentWidthMedia/index.svelte";
  import ProjectImage from "$lib/components/ProjectImage.svelte";
  import ScreenWidthMedia from "$lib/components/ScreenWidth/ScreenWidthMedia.svelte";

  const components = {
    rich_text: RichTextSlice,
    content_width_media: ContentWidthMediaSlice,
  };

  let { data } = $props();

  const content = $derived(data.page.data);
</script>

{#key data}
  <ScreenWidthMedia
    class="brightness-80 bg-dark"
    vimeoId={content.hero_vimeo_id || ""}
    field={content.hero_image}
    darken
    percentHeight={66}
  >
    <div class="w-full h-full flex flex-col items-center justify-center gap-9">
      <h1 class="text-white z-10 uppercase">{content.title}</h1>
      <div class="flex flex-col items-center justify-center mt-24 md:mt-0">
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
    </div>
  </ScreenWidthMedia>

  <section class="py-32">
    <ContentWidth class="gap-9 flex flex-col items-center">
      <h3 class="text-light text-center">
        Design
        <br />
        <span class="text-dark">{content.design}</span>
      </h3>
      <svg xmlns="http://www.w3.org/2000/svg" width="7" height="60" viewBox="0 0 7 60" fill="none">
        <path
          d="M3.5 60L6.38675 55L0.613251 55L3.5 60ZM3.5 0L3 2.18557e-08L3 55.5L3.5 55.5L4 55.5L4 -2.18557e-08L3.5 0Z"
          fill="#7BA0C4"
        />
      </svg>
      <h3 class="text-light text-center">
        Architect
        <br />
        <span class="text-dark">{content.architect}</span>
      </h3>
      <div>
        <h1 class="text-dark uppercase text-center max-w-[900px] mt-32">{content.testimonial}</h1>
        <h3 class="text-dark mt-16 text-center">{content.testimonial_attribution}</h3>
      </div>
    </ContentWidth>
  </section>

  <SliceZone slices={data.page.data.slices} {components} />

  <section class="py-32">
    <ContentWidth>
      {#if data.recOne && data.recTwo}
        <h2 class="text-dark">RELATED PROJECTS</h2>
        <div class="mt-9 flex flex-col md:flex-row w-full">
          <div class="w-full md:w-1/2 md:pr-4.5 aspect-[4/3] relative">
            <ProjectImage class="aspect-[4/3] w-full flex" project={data.recOne} />
          </div>
          <div class="w-full md:w-1/2 md:pl-4.5 relative aspect-[4/3] mt-9 md:mt-0">
            <ProjectImage class="aspect-[4/3] w-full flex" project={data.recTwo} />
          </div>
        </div>
      {/if}
      <a
        href="/gallery"
        class="flex flex-row gap-4 text-light hover:text-dark transition-colors duration-300 items-center justify-center mt-16"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="rotate-180 bump"
          width="20"
          height="20"
          viewBox="0 0 40 40"
          fill="none"
        >
          <circle
            cx="20"
            cy="20"
            r="19.375"
            fill="white"
            stroke="currentColor"
            stroke-width="1.25"
          />
          <path
            d="M28.5714 20.0337L22.3214 16.4253V23.6421L28.5714 20.0337ZM0 20.6587H22.9464V19.4087H0V20.6587Z"
            fill="currentColor"
          />
        </svg>
        <h3 class="bump">BACK TO PROJECTS</h3>
      </a>
    </ContentWidth>
  </section>
{/key}
