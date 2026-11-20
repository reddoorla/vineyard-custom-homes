<script lang="ts">
  // The /about "FROM OUR PARTNERS" slider with cards of known length: a 90-word
  // quote (the length of Mike Yanyk's, the card in Tim's 2026-11-20 screenshot),
  // a 10-word one that falls back to the floor, and a 50-word one. Behind the
  // /dev guard; tests/smoke/testimonial-slider.spec.ts drives it on a fake clock.
  import { onMount } from "svelte";
  import ContractorTestimonialSlider from "$lib/components/FullWidth/ContractorTestimonialSlider.svelte";

  // The spec advances a fake clock, which only means something once the
  // slider's timer exists, i.e. after hydration. SSR already shows the text.
  let hydrated = $state(false);
  onMount(() => (hydrated = true));

  const words = (n: number, word: string) => Array.from({ length: n }, () => word).join(" ");
  const testimonials = [
    {
      testimonial: words(90, "long"),
      attribution: "Ninety Words",
      attribution_subheader: "EAGLE, ID",
    },
    {
      testimonial: words(10, "short"),
      attribution: "Ten Words",
      attribution_subheader: "BOISE, ID",
    },
    {
      testimonial: words(50, "middle"),
      attribution: "Fifty Words",
      attribution_subheader: "MERIDIAN, ID",
    },
  ];
</script>

<main class="py-16" data-hydrated={hydrated || undefined}>
  <ContractorTestimonialSlider {testimonials} />
</main>
