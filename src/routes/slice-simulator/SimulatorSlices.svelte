<script lang="ts">
  // The simulator's slices, with the shapes of any Vimeo video shown as a
  // player (#130). The gallery page looks these up on the server while it is
  // prerendered; the simulator renders in the browser from slices Prismic
  // posts in, so it asks Vimeo's oEmbed from here (it answers CORS with `*`).
  // Until the answer comes, or if it never does, a player takes its poster's
  // shape, or 16:9, exactly as on a page whose build-time lookup missed.
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
  // slice zone on every keystroke) asks Vimeo nothing new. Debounced, and the
  // previous lookup aborted, so typing an id asks once, for the finished id,
  // not for every partial one.
  const ids = $derived(playerVimeoIds(sliceList).join("\n"));
  $effect(() => {
    if (!ids) return;
    const abort = new AbortController();
    // One signal for both the caller's (oEmbed's 8s timeout) and ours, by
    // listeners rather than AbortSignal.any, which older Safari lacks.
    const signalled: typeof fetch = (input, init) => {
      const both = new AbortController();
      for (const signal of [abort.signal, init?.signal])
        signal?.addEventListener("abort", () => both.abort(signal.reason), { once: true });
      return fetch(input, { ...init, signal: both.signal });
    };
    const timer = setTimeout(() => {
      vimeoShapes(sliceList, signalled).then((found) => {
        if (!abort.signal.aborted) vimeo = found;
      });
    }, 300);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  });
</script>

<SliceZone {slices} {components} context={{ vimeo }} />
