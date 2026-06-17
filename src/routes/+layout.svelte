<script lang="ts">
  import { PrismicPreview } from "@prismicio/svelte/kit";
  import { page } from "$app/state";
  import { repositoryName } from "$lib/prismicio";
  import "../app.css";
  import LandscapeModal from "$lib/components/LandscapeModal.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import Footer from "$lib/components/Footer.svelte";

  let { children, data } = $props();

  const SITE_NAME = "Vineyard Custom Homes";
  const SITE_URL = "https://www.vineyardconstruction.com";
  const DEFAULT_TITLE = `${SITE_NAME} | Custom Home Builder in Eagle, ID & the Treasure Valley`;
  const DEFAULT_DESCRIPTION =
    "Vineyard Custom Homes is a custom home builder in Eagle, Idaho, crafting luxury custom homes across the Treasure Valley with meticulous care and attention to detail.";
  const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

  // Distinct, keyword-aware titles for the core static routes (used only when the CMS has none)
  const ROUTE_TITLES: Record<string, string> = {
    "/about": `About | ${SITE_NAME} — Custom Home Builder in Eagle, ID`,
    "/contact": `Contact | ${SITE_NAME} — Custom Home Builder in Eagle, ID`,
    "/gallery": `Our Work | Custom Homes in Eagle & the Treasure Valley — ${SITE_NAME}`,
  };

  const pageTitle = $derived.by(() => {
    const mt = page.data.meta_title;
    const t = page.data.title;
    if (page.url.pathname === "/") {
      // Homepage: use the keyword-rich default unless a genuinely custom meta_title is set
      if (mt && !/^vineyard custom homes\.?$/i.test(mt.trim())) return mt;
      return DEFAULT_TITLE;
    }
    if (mt) return mt;
    if (t) return t.toLowerCase().includes("vineyard") ? t : `${t} | ${SITE_NAME}`;
    return ROUTE_TITLES[page.url.pathname] || DEFAULT_TITLE;
  });
  const description = $derived(page.data.meta_description || DEFAULT_DESCRIPTION);
  const ogImage = $derived(page.data.meta_image || DEFAULT_OG_IMAGE);
  const canonical = $derived(`${SITE_URL}${page.url.pathname === "/" ? "" : page.url.pathname}`);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    additionalType: "https://schema.org/GeneralContractor",
    name: SITE_NAME,
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE,
    logo: `${SITE_URL}/web-app-manifest-512x512.png`,
    telephone: "+1-208-724-4034",
    address: {
      "@type": "PostalAddress",
      streetAddress: "12 N. Echohawk Lane, No. 102",
      addressLocality: "Eagle",
      addressRegion: "ID",
      postalCode: "83616",
      addressCountry: "US",
    },
    areaServed: ["Eagle, ID", "Boise, ID", "Meridian, ID", "Treasure Valley"],
    sameAs: ["https://www.instagram.com/vineyardcustomhomes/"],
  };
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />
  <link rel="canonical" href={canonical} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</${"script"}>`}
</svelte:head>

<main style="overscroll-behavior: auto contain;">
  <Nav />

  {@render children?.()}

  <Footer />
</main>
<LandscapeModal />
{#if data.isPreviewSession}
  <PrismicPreview {repositoryName} />
{/if}
