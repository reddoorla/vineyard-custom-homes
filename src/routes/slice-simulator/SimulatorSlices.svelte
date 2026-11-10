<script lang="ts">
  // The simulator's slices, with the shapes of any Vimeo video shown as a
  // player (#130). The gallery page looks these up on the server while it is
  // prerendered; the simulator renders in the browser from slices Prismic
  // posts in, so it asks Vimeo's oEmbed from here (it answers CORS with `*`).
  // Until the answer comes, or if it never does, a player takes its poster's
  // shape, or 16:9, exactly as on a page whose build-time lookup missed.
  import { untrack } from "svelte";
  import { SliceZone } from "@prismicio/svelte";
  import { components } from "$lib/slices";
  import type { SliceZone as SliceZoneField } from "@prismicio/client";
  import { vimeoShapes, playerVimeoIds, type VimeoShapes } from "$lib/vimeoShapes";

  let { slices }: { slices: SliceZoneField } = $props();
  // vimeoShapes reads only ContentWidthMedia slices, which always carry a
  // variation; the simulator's type also admits legacy slices without one.
  const sliceList = $derived(slices as unknown as Parameters<typeof vimeoShapes>[0]);

  let vimeo: VimeoShapes = $state({});
  // Keyed by the ids, so an edit to any other field (Prismic posts the whole
  // slice zone on every keystroke) asks Vimeo nothing new.
  const ids = $derived(playerVimeoIds(sliceList).join("\n"));
  $effect(() => {
    if (!ids) return;
    let stale = false;
    untrack(() => vimeoShapes(sliceList, fetch)).then((found) => {
      if (!stale) vimeo = found;
    });
    return () => {
      stale = true;
    };
  });
</script>

<SliceZone {slices} {components} context={{ vimeo }} />
