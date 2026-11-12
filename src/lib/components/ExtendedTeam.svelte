<script lang="ts">
  // A project's credits: "The extended team", a down-arrow, then each entry as
  // its name (dark) over its label (light), with a short rule between entries.
  // Spacing (25px) and the 23×1 rule are from Tim's Figma frame (VCH-Website,
  // node 4401:58), which overrides the "about 45px" of the written brief.
  // Nothing at all when no entry has a name or a label: Prismic hands back a
  // group the editor never filled as an empty list or as items whose fields
  // are all null or missing, and any of those means no credits.
  import { isFilled, type KeyTextField } from "@prismicio/client";

  type Entry = { name?: KeyTextField; label?: KeyTextField };

  let { team }: { team: Entry[] | null | undefined } = $props();

  // A name or label of only whitespace (a stray paste) counts as empty.
  const filled = (field: KeyTextField | undefined) => isFilled.keyText(field?.trim());
  const entries = $derived(
    (team ?? []).filter((entry) => filled(entry.name) || filled(entry.label)),
  );
</script>

{#if entries.length > 0}
  <div class="flex flex-col items-center gap-[25px]" data-extended-team>
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
        <div class="w-[23px] h-px bg-light" aria-hidden="true" data-team-rule></div>
      {/if}
      <h3 class="text-center" data-team-entry>
        <!-- Each line only when it has text: an empty span still holds a line
             open (the global span rule makes it inline-block), so a row with
             only a label would sit under a blank line. -->
        {#if filled(entry.name)}
          <span class="text-dark" data-team-name>{entry.name}</span>
        {/if}
        {#if filled(entry.name) && filled(entry.label)}
          <br />
        {/if}
        {#if filled(entry.label)}
          <span class="text-light" data-team-label>{entry.label}</span>
        {/if}
      </h3>
    {/each}
  </div>
{/if}
