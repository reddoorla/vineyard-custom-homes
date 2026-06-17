<script lang="ts">
  import { isFilled } from "@prismicio/client";
  import type { ProjectDocument } from "../../prismicio-types";
  import { PrismicImage } from "@prismicio/svelte";

  interface ProjectImageProps {
    project?: ProjectDocument | null;
    isVertical?: boolean;
    class?: string;
  }

  let isHovered = $state(false);

  let { project, class: passedClasses = "", isVertical = false }: ProjectImageProps = $props();
</script>

{#if project}
  <a
    class="{passedClasses} w-full transition-opacity duration-500 hover:opacity-95 active:brightness-50 relative overflow-hidden"
    href={"/gallery/" + project.uid}
    onmouseover={() => (isHovered = true)}
    onmouseout={() => (isHovered = false)}
    onfocus={() => (isHovered = true)}
    onblur={() => (isHovered = false)}
  >
    <PrismicImage
      field={isFilled.image(project.data.preview_image)
        ? project.data.preview_image
        : project.data.hero_image}
      class="h-full w-full object-cover absolute top-0 left-0 transition duration-1000 {isHovered
        ? 'scale-105'
        : ''}"
    />
    {#if project.data.hero_vimeo_id || project.data.preview_vimeo}
      <iframe
        title="background video"
        src={`https://player.vimeo.com/video/${project.data.preview_vimeo || project.data.hero_vimeo_id}?background=1&muted=1&loop=1&autoplay=1&dnt=1`}
        class="absolute top-1/2 left-1/2 -translate-1/2 pointer-events-none object-cover {isVertical
          ? 'w-[120%] aspect-[9/16]'
          : 'w-[120%] h-[120%]'}"
        frameborder="0"
        allowfullscreen
      ></iframe>
    {/if}
    <div
      class="w-full h-full absolute top-0 left-0 bg-dark opacity-15 hover:opacity-0 transition-opacity duration-500"
    ></div>
    <h3 class="text-white text-center w-full absolute bottom-9 pointer-events-none">
      {project.data.preview_title || project.data.title}
    </h3>
  </a>
{/if}
