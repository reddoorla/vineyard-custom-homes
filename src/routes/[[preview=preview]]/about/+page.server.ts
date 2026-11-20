import { NotFoundError } from "@prismicio/client";

import { createClient } from "$lib/prismicio";

export async function load({ fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  // The About singleton holds only the hero's still and video. Until an editor
  // creates and publishes it, the page keeps its built-in hero.
  const page = await client.getSingle("about").catch((err) => {
    if (err instanceof NotFoundError) return null;
    throw err;
  });

  const ownerTestimonials = await client.getSingle("testimonials");

  const contractorTestimonials = await client.getSingle("contractorTestimonials");

  return {
    page,
    ownerTestimonials,
    contractorTestimonials,
  };
}

export function entries() {
  return [{}];
}
