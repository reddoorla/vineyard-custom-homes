<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
  let {
    trigger,
    style = "",
    transitionDuration = 2000,
    class: passedClasses = "",
    children,
  } = $props();
</script>

<div
  class="transition ease-fast-slow {passedClasses} {!$trigger
    ? 'opacity-100 translate-y-0 delay-1000'
    : 'opacity-0 translate-y-[50%]'}"
  style="transition-duration:{transitionDuration}ms; {style}"
>
  {@render children?.()}
</div>
