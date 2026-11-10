import { vimeoShapes } from "$lib/vimeoShapes";
import { playerSlices } from "./playerSlices";

// The player fixtures' video shapes come from the same oEmbed lookup the
// gallery page uses, so the smoke test measures the real path, not a constant.
export async function load({ fetch }) {
  return { vimeo: await vimeoShapes(playerSlices, fetch) };
}
