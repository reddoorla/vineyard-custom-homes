// The shape and title of each Vimeo video a ContentWidthMedia slice shows as a
// player, so its box can take the video's own aspect ratio (a 9:16 promo is
// not cropped into a landscape box) and its iframe a real accessible name.
//
// Read from Vimeo's oEmbed endpoint on the server, while the page is
// prerendered, so a visitor's browser makes no extra request for it.
// `width=1920` asks for the largest size, so the rounded height is within a
// pixel of the true ratio (1080×1920 for 1245606043; with no width it answers
// 240×426, 0.16% off).
//
// Only player slices are looked up: a background video's box is the editor's
// `image aspect`, as it always was. A video oEmbed cannot see (private,
// deleted, domain-locked, or Vimeo refusing the build machine) is missing from
// the map, with a warning in the build log; its player then takes the poster
// photo's shape, or 16:9 with no poster (ContentWidthMedia's `player`).

export type VimeoShape = { width: number; height: number; title: string };
export type VimeoShapes = Record<string, VimeoShape>;

type Slice = { slice_type: string; variation: string; primary: Record<string, unknown> };

/** A Vimeo id field's value, as `{ id, hash }`: an unlisted video is entered
 *  as `<id>/<hash>`, and the player needs the hash as `h=`. */
export function parseVimeo(raw: unknown): { key: string; id: string; hash: string } {
  const key = typeof raw === "string" ? raw.trim() : "";
  const [id = "", hash = ""] = key.split("/");
  return { key, id: id.trim(), hash: hash.trim() };
}

/** The Vimeo id fields of every ContentWidthMedia slice ticked "show as player". */
export function playerVimeoIds(slices: readonly Slice[]): string[] {
  const ids = new Set<string>();
  for (const slice of slices) {
    if (slice.slice_type !== "content_width_media" || slice.primary.show_as_player !== true)
      continue;
    const fields = slice.variation === "twoCol" ? ["vimeo_id_one", "vimeo_id_two"] : ["vimeo_id"];
    for (const field of fields) {
      const { key, id } = parseVimeo(slice.primary[field]);
      if (id) ids.add(key);
    }
  }
  return [...ids];
}

async function lookUp(key: string, fetch: typeof globalThis.fetch): Promise<VimeoShape | null> {
  const { id, hash } = parseVimeo(key);
  const url =
    "https://vimeo.com/api/oembed.json?width=1920&url=" +
    encodeURIComponent(`https://vimeo.com/${id}${hash ? `/${hash}` : ""}`);
  let why: string;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const { width, height, title } = (await res.json()) as Record<string, unknown>;
      if (typeof width === "number" && typeof height === "number" && width > 0 && height > 0)
        return { width, height, title: typeof title === "string" ? title : "" };
      why = "no usable width and height";
    } else why = `HTTP ${res.status}`;
  } catch (err) {
    why = err instanceof Error ? err.message : String(err);
  }
  console.warn(
    `vimeoShapes: no oEmbed shape for Vimeo ${key} (${why}); its player takes the poster's shape, or 16:9`,
  );
  return null;
}

/** Each player video's shape and title, keyed by its trimmed id field value. */
export async function vimeoShapes(
  slices: readonly Slice[],
  fetch: typeof globalThis.fetch,
): Promise<VimeoShapes> {
  const keys = playerVimeoIds(slices);
  const found = await Promise.all(keys.map((key) => lookUp(key, fetch)));
  const shapes: VimeoShapes = {};
  keys.forEach((key, i) => {
    const shape = found[i];
    if (shape) shapes[key] = shape;
  });
  return shapes;
}
