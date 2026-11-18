import { test, expect, type Page } from "@playwright/test";

// ContentWidthMedia two col's "text one" / "text two" (2026-11-18): a filled
// text field replaces that column's image and video with the text, so a
// written context can sit beside a video. Empty or absent, the column is
// exactly what it was. /dev/content-width-media renders the cases from
// src/routes/dev/content-width-media/playerSlices.ts (`textSlices`).
const ROUTE = "/dev/content-width-media";
const section = (page: Page, key: string) => page.locator(`[data-player-case="${key}"]`);

/** The section's markup, minus Svelte's hydration comments. */
const markup = (page: Page, key: string) =>
  section(page, key).evaluate((el) => el.innerHTML.replace(/<!--[^]*?-->/g, ""));

for (const [viewport, size] of [
  ["desktop", { width: 1280, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test(`text instead of the photo, beside a player, at ${viewport} width`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
    const row = section(page, "text-left");

    // Column one is the text, not the photo still filled behind it.
    const cell = row.locator("[data-text-cell]");
    await expect(cell).toHaveCount(1);
    await expect(cell.locator("h3")).toHaveText("A Christmas miracle");
    await expect(cell.locator("p")).toContainText("Josiah is donating his time");
    // The fixture's photo (z15ZHSHcA_3LaUJX) is filled in column one; the
    // player in column two has no poster.
    await expect(row.locator("img")).toHaveCount(0);
    await expect(row.locator("[data-player-photo]")).toHaveCount(0);

    // Column two is still the 9:16 player.
    const frame = row.locator("iframe");
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute("src", /player\.vimeo\.com\/video\/1245606043\?dnt=1$/);
    const player = await frame.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, width: r.width, height: r.height };
    });
    expect(Math.abs(player.width / player.height / (1080 / 1920) - 1)).toBeLessThan(0.01);

    const text = await cell.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const inner = el.firstElementChild!.getBoundingClientRect();
      return {
        top: r.top,
        bottom: r.bottom,
        right: r.right,
        innerTop: inner.top,
        innerBottom: inner.bottom,
        align: getComputedStyle(el.querySelector("p")!).textAlign,
      };
    });
    expect(text.align).not.toBe("center");
    if (viewport === "desktop") {
      // Beside the video, as tall as it, with the text in its middle.
      expect(text.right).toBeLessThanOrEqual(player.left);
      expect(Math.abs(text.top - player.top)).toBeLessThan(1);
      expect(Math.abs(text.bottom - player.bottom)).toBeLessThan(1);
      const above = text.innerTop - text.top;
      const below = text.bottom - text.innerBottom;
      expect(above, "the text is not top-pinned").toBeGreaterThan(50);
      expect(Math.abs(above - below), "the text is vertically centred").toBeLessThan(2);
    } else {
      // Stacked: the text first, then the video.
      expect(player.top).toBeGreaterThanOrEqual(text.bottom);
    }
  });

  test(`text in column two beside a background loop keeps the image aspect box, at ${viewport} width`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
    const row = section(page, "text-right-off");
    await expect(row.locator("[data-text-cell] h3")).toHaveText("A Christmas miracle");
    await expect(row.locator("[data-player], [data-player-photo]")).toHaveCount(0);
    // Column one: the poster in its 1:1 box (4:3 below md), as before.
    const expected = viewport === "desktop" ? 1 : 4 / 3;
    const ratio = await row
      .locator(":scope > div > div")
      .first()
      .evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.width / r.height;
      });
    expect(Math.abs(ratio / expected - 1)).toBeLessThan(0.01);
  });
}

test("an empty text field leaves the row exactly as it was", async ({ page }) => {
  // `text-empty` is `mixed-right` (a photo beside the 9:16 player) plus
  // text_one `[]` and text_two one blank paragraph, as the API returns the
  // fields on Tim's existing row once the model has them.
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
  await expect(section(page, "text-empty").locator("[data-text-cell]")).toHaveCount(0);
  await expect(section(page, "text-empty").locator("[data-player-photo] img")).toHaveCount(1);
  expect(await markup(page, "text-empty")).toBe(await markup(page, "mixed-right"));
});
