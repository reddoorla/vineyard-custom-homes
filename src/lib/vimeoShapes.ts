// The shape and title of each Vimeo video a ContentWidthMedia slice shows as a
// player, so its box can take the video's own aspect ratio (a 9:16 promo is
// not cropped into a landscape box) and its iframe a real accessible name.
//
// Read from Vimeo's oEmbed endpoint on the server, while the page is
// prerendered, so a visitor's browser asks vimeo.com for nothing before the
// VimeoGate engagement gate lets the player in. `width=1920` asks for the
// largest size, so the rounded height is within a pixel of the true ratio
// (1080×1920 for 1245606043; with no width it answers 240×426, 0.16% off).
//
// Only player slices are looked up: a background video's box is the editor's
// `image aspect`, as it always was. A video oEmbed cannot see (private, deleted,
// domain-locked, or Vimeo unreachable) is simply missing from the map, and its
// player falls back to 16:9.

export type VimeoShape = { width: number; height: number; title: string };
export type VimeoShapes = Record<string, VimeoShape>;

type Slice = { slice_type: string; variation: string; primary: Record<string, unknown> };

const idOf = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** The Vimeo ids of every ContentWidthMedia slice ticked "show as player". */
export function playerVimeoIds(slices: readonly Slice[]): string[] {
  const ids = new Set<string>();
  for (const slice of slices) {
    if (slice.slice_type !== "content_width_media" || slice.primary.show_as_player !== true)
      continue;
    const fields = slice.variation === "twoCol" ? ["vimeo_id_one", "vimeo_id_two"] : ["vimeo_id"];
    for (const field of fields) {
      const id = idOf(slice.primary[field]);
      if (id) ids.add(id);
    }
  }
  return [...ids];
}

async function lookUp(id: string, fetch: typeof globalThis.fetch): Promise<VimeoShape | null> {
  const url =
    "https://vimeo.com/api/oembed.json?width=1920&url=" +
    encodeURIComponent(`https://vimeo.com/${id}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const { width, height, title } = (await res.json()) as Record<string, unknown>;
    if (typeof width !== "number" || typeof height !== "number" || width <= 0 || height <= 0)
      return null;
    return { width, height, title: typeof title === "string" ? title : "" };
  } catch {
    return null;
  }
}

/** Each player video's shape and title, keyed by its trimmed Vimeo id. */
export async function vimeoShapes(
  slices: readonly Slice[],
  fetch: typeof globalThis.fetch,
): Promise<VimeoShapes> {
  const ids = playerVimeoIds(slices);
  const found = await Promise.all(ids.map((id) => lookUp(id, fetch)));
  const shapes: VimeoShapes = {};
  ids.forEach((id, i) => {
    const shape = found[i];
    if (shape) shapes[id] = shape;
  });
  return shapes;
}
