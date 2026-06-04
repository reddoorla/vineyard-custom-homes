<script>
  import { PrismicRichText } from "@prismicio/svelte";

  export let slice;
</script>

<section class="container p-2 md:p8">
  <PrismicRichText field={slice.primary.content} />
</section>

<style>
  .container {
    max-width: 600px;
    margin: 6em auto;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif,
      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
</style>
