import { test, expect } from "@playwright/test";
import { parseVimeo, playerVimeoIds, vimeoShapes } from "../../src/lib/vimeoShapes";

// The oEmbed lookup behind a player's shape, with fetch stubbed: no browser,
// and no dependence on Vimeo answering the CI runner.

const slice = (
  variation: string,
  primary: Record<string, unknown>,
  type = "content_width_media",
) => ({
  slice_type: type,
  variation,
  primary,
});

test("only ContentWidthMedia slices ticked as players are looked up", () => {
  expect(
    playerVimeoIds([
      slice("default", { vimeo_id: " 111 ", show_as_player: true }),
      slice("twoCol", { vimeo_id_one: "222", vimeo_id_two: "333/abc", show_as_player: true }),
      slice("default", { vimeo_id: "444", show_as_player: false }),
      slice("default", { vimeo_id: "555" }),
      slice("default", { vimeo_id: "", show_as_player: true }),
      slice("default", { vimeo_id: "666", show_as_player: true }, "rich_text"),
      slice("default", { vimeo_id: "111", show_as_player: true }),
    ]),
  ).toEqual(["111", "222", "333/abc"]);
});

test("an id field splits into the id and an unlisted video's hash", () => {
  expect(parseVimeo(" 1245606043 ")).toEqual({ key: "1245606043", id: "1245606043", hash: "" });
  expect(parseVimeo("1245606043/ab12")).toEqual({
    key: "1245606043/ab12",
    id: "1245606043",
    hash: "ab12",
  });
  expect(parseVimeo(null)).toEqual({ key: "", id: "", hash: "" });
});

test("a shape comes back for each video oEmbed answers, and a miss is left out with a warning", async () => {
  const asked: string[] = [];
  const fetch = (async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    asked.push(url.searchParams.get("url")!);
    const video = url.searchParams.get("url")!.replace("https://vimeo.com/", "");
    if (video === "1") return Response.json({ width: 1080, height: 1920, title: "Promo" });
    if (video === "2/ab") return Response.json({ width: 1920, height: 1080 });
    if (video === "3") return new Response("", { status: 403 });
    if (video === "4") throw new Error("timed out");
    if (video === "5") return Response.json({ width: 0, height: "x" });
    return new Response("", { status: 404 });
  }) as typeof globalThis.fetch;
  const warn = console.warn;
  const warned: string[] = [];
  console.warn = (msg: string) => warned.push(msg);
  try {
    const shapes = await vimeoShapes(
      ["1", "2/ab", "3", "4", "5"].map((vimeo_id) =>
        slice("default", { vimeo_id, show_as_player: true }),
      ),
      fetch,
    );
    expect(shapes).toEqual({
      "1": { width: 1080, height: 1920, title: "Promo" },
      "2/ab": { width: 1920, height: 1080, title: "" },
    });
  } finally {
    console.warn = warn;
  }
  expect(asked).toEqual([1, "2/ab", 3, 4, 5].map((v) => `https://vimeo.com/${v}`));
  expect(warned).toHaveLength(3);
  expect(warned.join("\n")).toMatch(/Vimeo 3 \(HTTP 403\)/);
  expect(warned.join("\n")).toMatch(/Vimeo 4 \(timed out\)/);
});

test("no player on a page means no oEmbed request at all", async () => {
  let calls = 0;
  const fetch = (async () => {
    calls++;
    return new Response("");
  }) as unknown as typeof globalThis.fetch;
  expect(await vimeoShapes([slice("default", { vimeo_id: "1" })], fetch)).toEqual({});
  expect(calls).toBe(0);
});
