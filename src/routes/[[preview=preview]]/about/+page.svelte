<script lang="ts">
  import vchMark from "$lib/assets/icons/vch-mark-lightsvg.svg";
  import vchVideoThumb from "$lib/assets/images/forest_still.png?as=run";
  import josiah from "$lib/assets/images/josiah.png?as=run";
  import brad from "$lib/assets/images/brad.jpg?as=run";
  import clipboard from "$lib/assets/icons/clipboard.svg";
  import pencil from "$lib/assets/icons/pencil.svg";
  import house from "$lib/assets/icons/house.svg";
  import key from "$lib/assets/icons/key.svg";

  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";

  import TestimonialSlider from "$lib/components/FullWidth/TestimonialSlider.svelte";
  import Img from "@zerodevx/svelte-img";

  import ScreenWidthMedia from "$lib/components/ScreenWidth/ScreenWidthMedia.svelte";
  import ContractorTestimonialSlider from "$lib/components/FullWidth/ContractorTestimonialSlider.svelte";

  let viewpoortWidth = $state(1024);

  let { data } = $props();

  const ownerTestimonials = $derived(data.ownerTestimonials.data);
  const contractorTestimonials = $derived(data.contractorTestimonials.data);
</script>

<svelte:window bind:innerWidth={viewpoortWidth} />

<ScreenWidthMedia darken vimeoId="1082670713" src={vchVideoThumb}>
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
        <div class="label text-light translate-x-[0.5px]">02</div>
      </div>
      <div class="h-20 w-0 border-r-1 -translate-x-[0.5px] border-light"></div>
      <div class="h-0 w-3 border-light border-b-[1px] -translate-x-[0.5px]"></div>
    </div>
    <h1 class="text-dark uppercase text-center max-w-[900px] mt-16">
      <span class="text-light">Our Mission</span> is to care for each building process as if it were our
      own
    </h1>

    <p class="text-center max-w-screen-sm text-dark mt-16">
      Always caring passionately about every piece of trim and hardware, we ensure our clients with
      the peace of mind they are in the best possible hands.
    </p>
  </ContentWidth>
</section>
<section class="py-32">
  <ContentWidth>
    <div class="flex flex-col items-center gap-16 mx-auto w-full lg:w-[520px]">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-1.5 w-full" viewBox="0 0 486 6" fill="none">
        <path
          d="M0 3L5 5.88675V0.113249L0 3ZM486 3L481 0.113249V5.88675L486 3ZM4.5 3.5H481.5V2.5H4.5V3.5Z"
          fill="#7BA0C4"
        />
      </svg>
      <div class="flex flex-col items-center gap-8 text-center">
        <h2 class="text-dark">FOUNDERS</h2>
        <p class="text-dark">
          Both founders come from a legacy of building, leadership, and craftsmenship, bringing
          experience that is beyond their years.
        </p>
      </div>
    </div>
    <div class="w-full flex flex-col lg:flex-row mt-16">
      <div class="w-full lg:w-1/2 lg:pr-8 flex flex-col gap-8">
        <Img src={josiah} class="w-full aspect-[4/3] object-cover" />
        <div>
          <h4 class="text-dark">Josiah Fredricksen</h4>
          <h3 class="text-light">CO-OWNER</h3>
        </div>
        <div>
          Josiah Fredriksen started his construction career at a very young age working with his
          father a boat builder/marine carpenter/furniture maker/cabinet builder/custom home finish
          carpenter in his shop and in the field. His career started in custom homes 20 years ago in
          Southern California along side some of the best builders in the game. His old school
          skills and knowledge is transformed into a well rounded modern day builder who is always
          learning in every aspect of the building industry. His passion is in the details and
          foreseeing minor problems before they become major issues that become costly items for his
          clients. His involvement will each build is 100% hands on deck with every budget,
          selection, decision and client meeting to guarantee Vineyards standards are met.
        </div>
      </div>
      <div class="w-full lg:w-1/2 lg:pl-8 flex flex-col gap-8 mt-12 md:mt-0">
        <Img src={brad} class="w-full aspect-[4/3] object-cover" />
        <div>
          <h4 class="text-dark">Brad Bentley</h4>
          <h3 class="text-light">CO-OWNER</h3>
        </div>
        <div>
          Building is in his blood. As a third-generation builder, he grew up watching his father
          and grandfather shape homes with their hands and a relentless commitment to doing things
          the right way. That early exposure to craftsmanship and integrity laid the foundation for
          everything that came next. Over the years, he went on to lead large corporations, gaining
          a deep understanding of how businesses operate at every level—from the ground up. But no
          matter the size or scale, one principle remained constant: success is built on strong
          relationships and hard work. Today, he brings that full-circle experience to every
          project. With one foot rooted in old-school values and the other in modern business
          acumen, he leads with a unique blend of hands-on expertise, strategic thinking, and a
          genuine care for people.
        </div>
      </div>
    </div>
  </ContentWidth>
</section>
<section class="py-16">
  <ContentWidth>
    <div class="flex flex-col items-center gap-16 mx-auto w-full lg:w-[640px]">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-1.5 w-full" viewBox="0 0 486 6" fill="none">
        <path
          d="M0 3L5 5.88675V0.113249L0 3ZM486 3L481 0.113249V5.88675L486 3ZM4.5 3.5H481.5V2.5H4.5V3.5Z"
          fill="#7BA0C4"
        />
      </svg>
      <div class="flex flex-col items-center gap-8 text-center">
        <h2 class="text-dark">OUR PROCESS</h2>
        <p class="text-dark">
          From helping find the right lot to handing you the keys, we partner with you through the
          entire process, ensuring that your custom home exceeds your expectations.
        </p>
      </div>
    </div>
    <div
      class="w-full flex flex-col items-center justify-center lg:flex-row mt-32 text-center gap-16"
    >
      <div class="w-[280px] flex flex-col gap-8">
        <img src={clipboard} class="h-12" alt="clipboard" />
        <h3 class="text-light uppercase">From Day One</h3>
        <div>
          We’ll help you find the right lot or provide expert pre-construction insight and budgeting
          if you already own one: setting your project up for success from day one.
        </div>
      </div>
      <div class="w-[280px] flex flex-col gap-8">
        <img src={key} class="h-12" alt="key" />
        <h3 class="text-light uppercase">The Right Team</h3>
        <div>
          We connect you with trusted architects, designers, and engineers who match your style,
          needs, and budget: bringing the right people to the table from the start.
        </div>
      </div>
    </div>
    <div
      class="w-full flex flex-col items-center justify-center lg:flex-row mt-16 text-center gap-16"
    >
      <div class="w-[280px] flex flex-col gap-8">
        <img src={house} class="h-12" alt="house" />
        <h3 class="text-light uppercase">Builder-Led</h3>
        <div>
          Your builder is hands-on and involved in every key decision, ensuring quality with clear
          transparent communication throughout the process.
        </div>
      </div>
      <div class="w-[280px] flex flex-col gap-8">
        <img src={pencil} class="h-12" alt="pencil" />
        <h3 class="text-light uppercase">Stay in the Loop</h3>
        <div>
          With weekly meetings and regular updates, you’re never left guessing. We keep you informed
          and confident from groundbreaking to move-in.
        </div>
      </div>
    </div>
  </ContentWidth>
</section>
<section class="py-16">
  <TestimonialSlider testimonials={ownerTestimonials.testimonials} />
</section>

<section class="py-32">
  <ContractorTestimonialSlider testimonials={contractorTestimonials.testimonials} />
</section>
