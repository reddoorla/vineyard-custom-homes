<script lang="ts">
  import { SliceZone } from "@prismicio/svelte";

  let { data } = $props();
</script>

<SliceZone slices={data.page.data.slices} />
