import { createClient } from "$lib/prismicio";
import { isFilled } from "@prismicio/client";
import { error } from "@sveltejs/kit";
import type { ProjectDocument } from "../../../../prismicio-types";

export async function load({ params, fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("project", params.uid).catch(() => {
    throw error(404, "Project not found");
  });

  let recOne;
  let recTwo;

  if (isFilled.contentRelationship(page.data.related_one))
    recOne = await client.getByUID("project", page.data.related_one.uid || "");

  if (isFilled.contentRelationship(page.data.related_two))
    recTwo = await client.getByUID("project", page.data.related_two.uid || "");

  return {
    page,
    recOne,
    recTwo,
    title: page.data.title,
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image.url,
  };
}

export async function entries() {
  const client = createClient();

  const pages = await client.getAllByType("project");

  const filteredPages: ProjectDocument<string>[] = [];

  pages.forEach((page) => {
    if (!page.tags.includes("hide")) filteredPages.push(page);
  });

  return filteredPages.map((page) => {
    return { uid: page.uid };
  });
}
