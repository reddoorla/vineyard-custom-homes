<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
  import Select from "svelte-select";
  import dropdownArrow from "$lib/assets/icons/dropdown-arrow-light.svg";

  let { items, value = $bindable(""), placeholder = "", class: passedClasses = "" } = $props();

  let selectHover = $state(false);
</script>

<div
  class="max-w-[720px] w-full mx-auto cursor-pointer relative {passedClasses}"
  role="separator"
  onmouseover={() => (selectHover = true)}
  onfocus={() => (selectHover = true)}
  onmouseout={() => (selectHover = false)}
  onblur={() => (selectHover = false)}
>
  <Select {items} bind:value {placeholder} searchable={false} class="svelte-select" />
  <div
    class="absolute h-full aspect-square right-0 top-0 flex items-center justify-center pointer-events-none"
  >
    <img
      src={dropdownArrow}
      alt="decorative dropdown arrow"
      aria-hidden="true"
      class:opacity-55={selectHover}
      class=" transition-all pointer-events-none"
    />
  </div>
</div>
