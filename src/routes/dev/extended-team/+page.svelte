<script lang="ts">
  // The project page's credits block once per case: two credits (the pair in
  // Tim's screenshot), one, none, and a group whose only item has neither a
  // name nor a label, which is what Prismic returns for a group the editor
  // added a row to and never filled. Behind the /dev guard;
  // tests/smoke/extended-team.spec.ts measures it.
  import ExtendedTeam from "$lib/components/ExtendedTeam.svelte";

  const cases = {
    two: [
      { name: "Phil Norman Design Group", label: "Interior Design" },
      { name: "Bob Thompson", label: "Architect" },
    ],
    one: [{ name: "Branch & Board", label: "Design" }],
    none: [],
    blank: [{ name: null, label: null }],
  };
</script>

<main>
  {#each Object.entries(cases) as [key, team] (key)}
    <section class="py-16 flex flex-col items-center" data-case={key}>
      <ExtendedTeam {team} />
    </section>
  {/each}
</main>
