<script lang="ts">
  import vchMark from "$lib/assets/icons/vch-mark-lightsvg.svg";
  import vchVideoThumb from "$lib/assets/images/glade_still.png?as=run";

  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";

  import ContactForm from "$lib/components/FullWidth/ContactForm.svelte";
  import ScreenWidthMedia from "$lib/components/ScreenWidth/ScreenWidthMedia.svelte";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let viewpoortWidth = $state(1024);
</script>

<svelte:window bind:innerWidth={viewpoortWidth} />

<ScreenWidthMedia darken vimeoId="1082715167" src={vchVideoThumb}>
  <div class="w-full h-full flex items-center justify-center">
    <img src={vchMark} class="w-24 z-10" alt="vch logomark" />
  </div>
</ScreenWidthMedia>

<section class="py-32">
  <ContentWidth>
    <div class="flex flex-col items-center justify-center mt-16">
      <div
        class="w-16 h-16 rounded-full border-1 border-light relative flex flex-col items-center justify-center gap-[3px]"
      >
        <div class="label text-light translate-x-[0.5px]">V</div>
        <div class="h-[0.5px] w-full bg-light"></div>
        <div class="label text-light translate-x-[0.5px]">03</div>
      </div>
      <div class="h-20 w-0 border-r-1 -translate-x-[0.5px] border-light"></div>
      <div class="h-0 w-3 border-light border-b-[1px] -translate-x-[0.5px]"></div>
    </div>
    <h1 class="text-dark uppercase text-center max-w-[900px] mt-16">GET IN TOUCH</h1>

    <p class="text-center max-w-screen-sm text-dark mt-16">
      We would love to partner with you on your custom home. We look forward to hearing from you in
      whatever communication style suits you.
    </p>

    <div class="flex flex-col items-center gap-16 mx-auto w-full lg:w-[520px] mt-32">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="486"
        height="6"
        viewBox="0 0 486 6"
        fill="none"
      >
        <path
          d="M0 3L5 5.88675V0.113249L0 3ZM486 3L481 0.113249V5.88675L486 3ZM4.5 3.5H481.5V2.5H4.5V3.5Z"
          fill="#7BA0C4"
        />
      </svg>
      <div class="flex flex-col items-center gap-4 text-center">
        <h3 class="text-light">CALL</h3>
        <p class="text-dark">
          208.724.4034 <br /> to speak directly with Josiah, one of our owners.
        </p>
      </div>
      <div class="flex flex-col items-center gap-4 text-center">
        <h3 class="text-light">ADDRESS</h3>
        <p class="text-dark">12 N. Echohawk Lane, no. 102 <br /> Eagle ID 83616</p>
      </div>
      <div class="flex flex-col items-center gap-4 text-center">
        <h3 class="text-light">EMAIL</h3>
      </div>
    </div>

    <ContactForm {form} formTs={data.formTs} />
  </ContentWidth>
</section>
