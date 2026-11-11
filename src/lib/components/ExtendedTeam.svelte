<script lang="ts">
  // A project's credits: "The extended team", a down-arrow, then each entry as
  // its name (dark) over its label (light), with a short rule between entries.
  // Nothing at all when no entry has a name or a label: Prismic hands back a
  // group the editor never filled as an empty list or as items whose fields
  // are all null, and either means no credits.
  import { isFilled, type KeyTextField } from "@prismicio/client";

  type Entry = { name: KeyTextField; label: KeyTextField };

  let { team }: { team: Entry[] | null | undefined } = $props();

  const entries = $derived(
    (team ?? []).filter((entry) => isFilled.keyText(entry.name) || isFilled.keyText(entry.label)),
  );
</script>

{#if entries.length > 0}
  <div class="flex flex-col items-center gap-9" data-extended-team>
    <h3 class="text-light text-center">The extended team</h3>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="7"
      height="60"
      viewBox="0 0 7 60"
      fill="none"
      aria-hidden="true"
      data-team-arrow
    >
      <path
        d="M3.5 60L6.38675 55L0.613251 55L3.5 60ZM3.5 0L3 2.18557e-08L3 55.5L3.5 55.5L4 55.5L4 -2.18557e-08L3.5 0Z"
        fill="#7BA0C4"
      />
    </svg>
    {#each entries as entry, i (i)}
      {#if i > 0}
        <div class="w-[45px] h-px bg-light" aria-hidden="true" data-team-rule></div>
      {/if}
      <h3 class="text-center" data-team-entry>
        <span class="text-dark" data-team-name>{entry.name}</span>
        <br />
        <span class="text-light" data-team-label>{entry.label}</span>
      </h3>
    {/each}
  </div>
{/if}
