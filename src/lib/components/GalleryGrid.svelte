<script lang="ts">
  // The main gallery's ten project tiles, in the rows of Tim's mockup
  // (2026-11-19, Figma "Gallery Ideas" frame 4402:2):
  //   1 full width
  //   2 tall + 3 below it | 4 and 5 beside them
  //   6 wide | 7 tall
  //   8 full width
  //   9 tall | 10 wide
  // `slots[i]` is slot i + 1, null when the editor left it empty or picked a
  // hidden project. An empty slot renders nothing, and a row with no tile
  // renders nothing, so the 36px gap between rows holds. In the 6 | 7 and
  // 9 | 10 rows a tile left alone is centred; slot 6 alone keeps its 36px
  // right gutter, so it sits 18px left of centre, as it did before slots 8-10.
  // In rows 2-5 a column with no tile keeps its place on a desktop, as it
  // always has, and is dropped on a phone so it leaves no gap; slot 5 fills
  // the left column's height only when that column has a tile, and keeps 4:3
  // otherwise, since h-full of nothing is zero.
  import type { ProjectDocument } from "../../../prismicio-types";
  import ProjectImage from "$lib/components/ProjectImage.svelte";

  let { slots }: { slots: (ProjectDocument | null)[] } = $props();

  const slot = (n: number) => slots[n - 1] ?? null;
  const leftColumn = $derived(Boolean(slot(2) || slot(3)));
  const rightColumn = $derived(Boolean(slot(4) || slot(5)));
</script>

<ProjectImage class="aspect-[4/3] md:aspect-video" project={slot(1)} />
{#if leftColumn || rightColumn}
  <div class="w-full flex flex-col md:flex-row gap-9 md:gap-0">
    <div class="{leftColumn ? 'flex' : 'hidden md:flex'} flex-col md:pr-9 md:w-2/5 gap-9">
      <ProjectImage class="aspect-[3/4]" isVertical={true} project={slot(2)} />
      <ProjectImage class="aspect-[4/3]" project={slot(3)} />
    </div>
    <div class="{rightColumn ? 'flex' : 'hidden md:flex'} flex-col md:w-3/5 gap-9">
      <ProjectImage class="aspect-[4/3] md:aspect-square" project={slot(4)} />
      <ProjectImage
        class="aspect-[4/3] {leftColumn ? 'md:aspect-auto md:h-full' : ''}"
        project={slot(5)}
      />
    </div>
  </div>
{/if}
<!-- A tall tile takes its partner's height on a desktop; alone it keeps 3:4,
     since h-full of a row with nothing else in it is zero. -->
{#if slot(6) || slot(7)}
  <div class="w-full flex flex-col md:flex-row gap-9 md:gap-0 justify-center">
    {#if slot(6)}
      <div class="flex flex-col md:pr-9 md:w-3/5 gap-9">
        <ProjectImage class="aspect-[4/3] md:aspect-square" project={slot(6)} />
      </div>
    {/if}
    {#if slot(7)}
      <div class="flex flex-col md:w-2/5 gap-9">
        <ProjectImage
          class="aspect-[3/4] {slot(6) ? 'md:aspect-auto md:h-full' : ''}"
          isVertical={true}
          project={slot(7)}
        />
      </div>
    {/if}
  </div>
{/if}
<ProjectImage class="aspect-[4/3] md:aspect-video" project={slot(8)} />
{#if slot(9) || slot(10)}
  <div class="w-full flex flex-col md:flex-row gap-9 md:gap-0 justify-center">
    {#if slot(9)}
      <div class="flex flex-col md:w-2/5 gap-9 {slot(10) ? 'md:pr-9' : ''}">
        <ProjectImage
          class="aspect-[3/4] {slot(10) ? 'md:aspect-auto md:h-full' : ''}"
          isVertical={true}
          project={slot(9)}
        />
      </div>
    {/if}
    {#if slot(10)}
      <div class="flex flex-col md:w-3/5 gap-9">
        <ProjectImage class="aspect-[4/3] md:aspect-square" project={slot(10)} />
      </div>
    {/if}
  </div>
{/if}
