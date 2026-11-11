<script lang="ts">
  // The project page's credits block once per case: two credits (the pair in
  // Tim's screenshot), one, rows missing a name or a label, none, and a group whose rows have neither a name
  // nor a label: nulls (a row the editor added and never filled), missing
  // keys, and a whitespace-only name. Behind the /dev guard;
  // tests/smoke/extended-team.spec.ts measures it.
  import ExtendedTeam from "$lib/components/ExtendedTeam.svelte";

  const cases = {
    two: [
      { name: "Phil Norman Design Group", label: "Interior Design" },
      { name: "Bob Thompson", label: "Architect" },
    ],
    one: [{ name: "Branch & Board", label: "Design" }],
    // A row with only a label, a whitespace name, or only a name.
    partial: [
      { name: null, label: "Architect" },
      { name: " ", label: "Landscape Design" },
      { name: "Bob Thompson", label: null },
    ],
    none: [],
    blank: [{ name: null, label: null }, {}, { name: " ", label: "" }],
  };
</script>

<main>
  {#each Object.entries(cases) as [key, team] (key)}
    <section class="py-16 flex flex-col items-center" data-case={key}>
      <ExtendedTeam {team} />
    </section>
  {/each}
</main>
