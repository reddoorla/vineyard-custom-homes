<script lang="ts">
  import vchMark from "$lib/assets/icons/vch-mark-lightsvg.svg";
  import vchVideoThumb from "$lib/assets/images/homethumb.jpg?as=run";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { isFilled } from "@prismicio/client";
  import type { ProjectDocument } from "../../../prismicio-types.js";
  import ProjectImage from "$lib/components/ProjectImage.svelte";
  import ScreenWidthMedia from "$lib/components/ScreenWidth/ScreenWidthMedia.svelte";

  let { data } = $props();

  let viewpoortWidth = $state(1024);

  const content = $derived(data.page.data);

  const projects: ProjectDocument[] = $derived(data.projects);

  const setProjectFromId = (id: string | undefined): ProjectDocument | null => {
    if (typeof id === "undefined") return null;
    return projects.find((proj) => proj.id === id) ?? null;
  };

  const projectOne: ProjectDocument | null = $derived(
    isFilled.contentRelationship(content.project_one)
      ? setProjectFromId(content.project_one.id)
      : null,
  );
  const projectTwo: ProjectDocument | null = $derived(
    isFilled.contentRelationship(content.project_two)
      ? setProjectFromId(content.project_two.id)
      : null,
  );
  const projectThree: ProjectDocument | null = $derived(
    isFilled.contentRelationship(content.project_three)
      ? setProjectFromId(content.project_three.id)
      : null,
  );
  const projectFour: ProjectDocument | null = $derived(
    isFilled.contentRelationship(content.project_four)
      ? setProjectFromId(content.project_four.id)
      : null,
  );
  const projectFive: ProjectDocument | null = $derived(
    isFilled.contentRelationship(content.project_five)
      ? setProjectFromId(content.project_five.id)
      : null,
  );
  const projectSix: ProjectDocument | null = $derived(
    isFilled.contentRelationship(content.project_six)
      ? setProjectFromId(content.project_six.id)
      : null,
  );
  const projectSeven: ProjectDocument | null = $derived(
    isFilled.contentRelationship(content.project_seven)
      ? setProjectFromId(content.project_seven.id)
      : null,
  );
</script>

<svelte:window bind:innerWidth={viewpoortWidth} />

<ScreenWidthMedia darken vimeoId="1092190178" src={vchVideoThumb}>
  <div class="w-full h-full flex items-center justify-center">
    <img src={vchMark} class="w-24 z-10" alt="vch logomark" />
  </div>
</ScreenWidthMedia>

<section class="py-32">
  <ContentWidth>
    <h1 class="text-dark uppercase text-center max-w-[900px]">{content.testimonial}</h1>
    <h3 class="text-dark mt-16">{content.testimonial_attribution}</h3>
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
  </ContentWidth>
</section>
<section class="pb-32">
  <ContentWidth class="flex flex-col gap-9">
    <ProjectImage class="aspect-[4/3] md:aspect-video" project={projectOne} />
    <div class="w-full flex flex-col md:flex-row gap-9 md:gap-0">
      <div class="flex flex-col md:pr-9 md:w-2/5 gap-9">
        <ProjectImage class="aspect-[3/4]" isVertical={true} project={projectTwo} />
        <ProjectImage class="aspect-[4/3]" project={projectThree} />
      </div>
      <div class="flex flex-col md:w-3/5 gap-9">
        <ProjectImage class="aspect-[4/3] md:aspect-square" project={projectFour} />
        <ProjectImage class="aspect-[4/3] md:aspect-auto md:h-full" project={projectFive} />
      </div>
    </div>
    <div class="w-full flex flex-col md:flex-row gap-9 md:gap-0 items-center justify-center">
      <div class="flex flex-col md:pr-9 md:w-3/5 gap-9">
        <ProjectImage class="aspect-[4/3] md:aspect-square" project={projectSix} />
      </div>
      {#if projectSeven}
        <div class="flex flex-col md:w-2/5 gap-9">
          <ProjectImage
            class="aspect-[4/3] md:aspect-auto md:h-full"
            isVertical={true}
            project={projectSeven}
          />
        </div>
      {/if}
    </div>
  </ContentWidth>
</section>
