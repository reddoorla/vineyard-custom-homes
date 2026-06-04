<script lang="ts">
  import Select from "svelte-select";
  import dropdownArrow from "$lib/assests/icons/dropdown-arrow-light.svg";

  let { activeFilters = $bindable([""]), filters = [""] } = $props();

  let selectHover = $state(false);
</script>

<div
  class="max-w-[720px] w-full mx-auto cursor-pointer relative"
  role="separator"
  onmouseover={() => (selectHover = true)}
  onfocus={() => (selectHover = true)}
  onmouseout={() => (selectHover = false)}
  onblur={() => (selectHover = false)}
>
  <Select
    items={filters}
    bind:value={activeFilters}
    placeholder="Type of Project"
    multiple={true}
    searchable={false}
    class="svelte-select"
  />
  <div
    class="absolute h-full aspect-square right-0 top-0 flex items-center justify-center pointer-events-none"
  >
    <img
      src={dropdownArrow}
      alt="decorative dropdown arrow"
      aria-hidden={true}
      class:opacity-55={selectHover}
      class=" transition-all pointer-events-none"
    />
  </div>
</div>
