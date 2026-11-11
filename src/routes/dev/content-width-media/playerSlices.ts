// ContentWidthMedia slices with the "show as player" toggle, on and off, for
// /dev/content-width-media. 1245606043 is the client's vertical (1080×1920)
// press promo Tim asked about on 2026-11-10; 76979871 is a public 16:9 Vimeo
// video. Their shapes are fixed here, as oEmbed reported them on 2026-11-10,
// so the layout test never depends on Vimeo answering the CI runner;
// tests/smoke/vimeo-shapes.spec.ts tests the oEmbed lookup itself.
// "missed" is an id with no shape, as when oEmbed fails at build time.
// tests/smoke/content-width-media-player.spec.ts measures them.
import type { ContentWidthMediaSlice } from "../../../../prismicio-types";
import type { VimeoShapes } from "$lib/vimeoShapes";

const vertical = "1245606043";
const landscape = "76979871";
const missed = "1245606043/notarealhash";

export const playerShapes: VimeoShapes = {
  [vertical]: { width: 1080, height: 1920, title: "VCH - Gempler groundbreaking" },
  [landscape]: { width: 1920, height: 1080, title: "The New Vimeo Player" },
};

const poster = {
  id: "z15ZHSHcA_3LaUJX",
  url: "https://images.prismic.io/vineyard-custom-homes/z15ZHSHcA_3LaUJX_VCH_VanderBoom00010.JPG?auto=format,compress",
  alt: "",
  copyright: null,
  dimensions: { width: 2560, height: 1706 },
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
};
const portrait = {
  ...poster,
  id: "Ape0eYzPlzscvCfj",
  url: "https://images.prismic.io/vineyard-custom-homes/Ape0eYzPlzscvCfj_VCH_VanderBoom00007.JPG?auto=format,compress",
  alt: "Groundbreaking at the Gempler site",
  dimensions: { width: 1920, height: 2560 },
};
const empty = { url: null, alt: null, copyright: null, dimensions: null, id: null, edit: null };

const single = (key: string, vimeo_id: string, show_as_player: boolean, image: unknown = empty) =>
  ({
    id: `content_width_media$player-${key}`,
    slice_type: "content_width_media",
    slice_label: null,
    variation: "default",
    version: "initial",
    primary: { image, vimeo_id, image_aspect: "16:9", show_as_player },
    items: [],
  }) as unknown as ContentWidthMediaSlice;

const twoCol = (key: string, show_as_player: boolean, image: unknown = empty) =>
  ({
    id: `content_width_media$player-${key}`,
    slice_type: "content_width_media",
    slice_label: null,
    variation: "twoCol",
    version: "initial",
    primary: {
      image_one: image,
      vimeo_id_one: vertical,
      image_two: image,
      vimeo_id_two: vertical,
      image_aspect: "9:16",
      show_as_player,
    },
    items: [],
  }) as unknown as ContentWidthMediaSlice;

// Two col with the toggle on and a Vimeo id in one column only: the other
// column is a photo, and takes the player's box (#131). `image aspect` is 1:1,
// so a photo column left in its old box would be square beside a 9:16 player.
const mixed = (key: string, videoFirst: boolean, show_as_player = true) => {
  const video = { image: empty, vimeo_id: vertical };
  const photo = { image: poster, vimeo_id: "" };
  const [one, two] = videoFirst ? [video, photo] : [photo, video];
  return {
    id: `content_width_media$player-${key}`,
    slice_type: "content_width_media",
    slice_label: null,
    variation: "twoCol",
    version: "initial",
    primary: {
      image_one: one.image,
      vimeo_id_one: one.vimeo_id,
      image_two: two.image,
      vimeo_id_two: two.vimeo_id,
      image_aspect: "1:1",
      show_as_player,
    },
    items: [],
  } as unknown as ContentWidthMediaSlice;
};

// Two col with the toggle on and no Vimeo id at all: two photos in the
// editor's `image aspect` box, exactly as with the toggle off.
const photosOnly = {
  id: "content_width_media$player-two-photos",
  slice_type: "content_width_media",
  slice_label: null,
  variation: "twoCol",
  version: "initial",
  primary: {
    image_one: poster,
    vimeo_id_one: null,
    image_two: portrait,
    vimeo_id_two: "",
    image_aspect: "1:1",
    show_as_player: true,
  },
  items: [],
} as unknown as ContentWidthMediaSlice;

export const playerSlices = [
  // On: the vertical promo alone, two to a row, and a landscape alone (so a
  // box that ignores the video's shape fails one way or the other).
  single("single", vertical, true),
  twoCol("two", true),
  single("landscape", landscape, true, poster),
  // On, with no oEmbed shape: the poster's shape (3:4), else 16:9.
  single("missed-poster", missed, true, portrait),
  single("missed-bare", missed, true),
  // Off, explicitly: must render the muted background loop, exactly as before.
  single("single-off", vertical, false, poster),
  twoCol("two-off", false, poster),
  // On, two col, a player beside a photo (either side), and photos only.
  mixed("mixed", true),
  mixed("mixed-right", false),
  photosOnly,
  // Off, the same mix: the id column is the background loop and the photo
  // column keeps its `image aspect` box, exactly as before.
  mixed("mixed-off", true, false),
  mixed("mixed-right-off", false, false),
];

export const playerKey = (slice: ContentWidthMediaSlice) =>
  slice.id.replace("content_width_media$player-", "");
