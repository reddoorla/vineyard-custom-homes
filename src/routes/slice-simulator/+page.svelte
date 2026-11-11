<script>
  import { SliceSimulator } from "@prismicio/svelte";
  import SimulatorSlices from "./SimulatorSlices.svelte";
</script>

<SliceSimulator>
  {#snippet children({ slices })}
    <SimulatorSlices {slices} />
  {/snippet}
</SliceSimulator>
