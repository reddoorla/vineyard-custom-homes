<script lang="ts" module>
  const events = ["pointerdown", "pointermove", "wheel", "keydown", "touchstart"] as const;

  let engaged = $state(false);
  let armed = false;

  function arm() {
    if (armed) return;
    armed = true;
    const engage = () => {
      engaged = true;
      for (const ev of events) window.removeEventListener(ev, engage);
    };
    for (const ev of events) window.addEventListener(ev, engage, { passive: true });
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    arm();
  });
</script>

{#if engaged}
  {@render children()}
{/if}
