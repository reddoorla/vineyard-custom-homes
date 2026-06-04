import { createClient } from "$lib/prismicio";

export async function load({ fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const ownerTestimonials = await client.getSingle("testimonials");

  const contractorTestimonials = await client.getSingle("contractorTestimonials");

  return {
    ownerTestimonials,
    contractorTestimonials,
  };
}

export function entries() {
  return [{}];
}
