import { createClient } from "$lib/prismicio";

const SITE_URL = "https://www.vineyardconstruction.com";

const STATIC_ROUTES = ["/", "/about", "/contact", "/gallery"];

export const prerender = true;

export async function GET({ fetch }) {
  const client = createClient({ fetch });

  const [pages, projects] = await Promise.all([
    client.getAllByType("page"),
    client.getAllByType("project"),
  ]);

  const urls = new Set<string>(STATIC_ROUTES);

  for (const page of pages) {
    if (page.uid === "home") continue;
    urls.add(`/${page.uid}`);
  }

  for (const project of projects) {
    if (project.tags.includes("hide")) continue;
    urls.add(`/gallery/${project.uid}`);
  }

  const lastmodByUrl = new Map<string, string>();
  for (const doc of [...pages, ...projects]) {
    const path =
      doc.type === "project" ? `/gallery/${doc.uid}` : doc.uid === "home" ? "/" : `/${doc.uid}`;
    if (doc.last_publication_date) {
      lastmodByUrl.set(path, doc.last_publication_date.split("T")[0]);
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls]
  .map((path) => {
    const loc = `${SITE_URL}${path === "/" ? "" : path}`;
    const lastmod = lastmodByUrl.get(path);
    const priority = path === "/" ? "1.0" : path.startsWith("/gallery/") ? "0.7" : "0.8";
    return `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
