<script lang="ts">
  // The real gallery and home page components, rendered with their hero
  // fields empty (?case=empty) or filled (?case=filled), so a test can see the
  // fallback and the field each win. Pick the page with ?page=gallery|home.
  // Tim asked for his own still before the gallery video (2026-11-20, Discord
  // #vineyard-website, 10:08am PT: "I just want a different placeholder image").
  // Behind the /dev guard; tests/smoke/heroes.spec.ts measures it.
  import { page } from "$app/state";
  import GalleryPage from "../../[[preview=preview]]/gallery/+page.svelte";
  import HomePage from "../../[[preview=preview]]/+page.svelte";

  const photo = (id: string, file: string, alt: string) => ({
    id,
    url: `https://images.prismic.io/vineyard-custom-homes/${id}_${file}?auto=format,compress`,
    alt,
    copyright: null,
    dimensions: { width: 1920, height: 1080 },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  });

  const filled = page.url.searchParams.get("case") === "filled";
  const which = page.url.searchParams.get("page");

  const heroes = filled
    ? {
        hero_image: photo("aJy9gqTt2nPbaSdq", "Haggettv4.0_7-Photo.jpg", "Tim's gallery still"),
        hero_vimeo_id: "111111111",
        second_hero_image: photo("aJy9gqTt2nPbaSdr", "Second.jpg", "Tim's second still"),
        vimeo_id_for_video: "222222222",
      }
    : { hero_image: {}, hero_vimeo_id: null, second_hero_image: {}, vimeo_id_for_video: null };

  const data = {
    page: { data: { ...heroes, title: "Fixture" } },
    projects: [],
    instagram: { data: { feature: [] } },
    ownerTestimonials: { data: { testimonials: [] } },
    contractorTestimonials: { data: { testimonials: [] } },
  } as never;
</script>

{#if which === "gallery"}
  <GalleryPage {data} />
{:else if which === "home"}
  <HomePage {data} />
{/if}
