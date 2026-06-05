import { createClient } from "$lib/prismicio";

import type { ProjectDocument } from "../../../prismicio-types.js";

export async function load({ fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getSingle("gallery");

  const projects = await client.getAllByType("project");

  const filteredProjects: ProjectDocument<string>[] = [];

  projects.forEach((project) => {
    if (!project.tags.includes("hide")) filteredProjects.push(project);
  });

  return {
    page,
    projects: filteredProjects,
    title: page.data.title,
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image.url,
  };
}

export function entries() {
  return [{}];
}
