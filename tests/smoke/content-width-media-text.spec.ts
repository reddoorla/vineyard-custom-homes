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

/**
 * The text column's place in its row: the column the editor filled (0 or 1),
 * half the row and in order on a desktop, stacked in order 36px apart on a
 * phone, with the column's own gutter, the text block left in it, at most
 * 520px wide and in the site's dark blue. And the fixture's photo, still
 * filled behind the text, is not shown.
 */
async function textColumn(page: Page, key: string, column: 0 | 1, desktop: boolean) {
  const row = section(page, key);
  await expect(row.locator(`img[src*="z15ZHSHcA_3LaUJX"]`), `${key}: no photo`).toHaveCount(0);
  const g = await row.locator(":scope > div").evaluate((rowEl) => {
    const rect = (el: Element) => el.getBoundingClientRect();
    const cols = [...rowEl.querySelectorAll(":scope > div")];
    const cell = rowEl.querySelector("[data-text-cell]")!;
    const inner = cell.firstElementChild!;
    const cs = getComputedStyle(cell);
    return {
      row: rect(rowEl).toJSON(),
      cols: cols.map((c) => rect(c).toJSON()),
      index: cols.indexOf(cell),
      cell: rect(cell).toJSON(),
      inner: rect(inner).toJSON(),
      padLeft: parseFloat(cs.paddingLeft),
      padRight: parseFloat(cs.paddingRight),
      marginTop: parseFloat(cs.marginTop),
      color: getComputedStyle(inner.querySelector("p")!).color,
    };
  });
  expect(g.cols.length, key).toBe(2);
  expect(g.index, `${key}: the text is column ${column + 1}`).toBe(column);
  expect(g.inner.width, `${key}: measure`).toBeLessThanOrEqual(520);
  expect(g.color, `${key}: text-dark`).toBe("rgb(0, 38, 62)");
  expect(
    Math.abs(g.inner.left - (g.cell.left + g.padLeft)),
    `${key}: text block left`,
  ).toBeLessThan(1);
  if (desktop) {
    expect(Math.abs(g.cell.width - g.row.width / 2), `${key}: half the row`).toBeLessThan(1);
    expect(g.cols[1].left, `${key}: columns in order`).toBeGreaterThanOrEqual(g.cols[0].right - 1);
    expect(
      Math.abs(g.cols[1].right - g.row.right),
      `${key}: column two at the right edge`,
    ).toBeLessThan(1);
    // The gutter: 18px on the side facing the other column.
    expect([g.padLeft, g.padRight], `${key}: gutter`).toEqual(column === 0 ? [0, 18] : [18, 0]);
  } else {
    expect(g.cols[1].top, `${key}: stacked in order`).toBeGreaterThanOrEqual(g.cols[0].bottom);
    expect(g.marginTop, `${key}: 36px above`).toBe(36);
  }
}

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
    await textColumn(page, "text-left", 0, viewport === "desktop");
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
    await textColumn(page, "text-right-off", 1, viewport === "desktop");
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
  // Blank blocks only (two empty paragraphs; one space) are empty too.
  expect(await markup(page, "text-blank")).toBe(await markup(page, "mixed-right"));
});

for (const [viewport, size] of [
  ["desktop", { width: 1280, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test(`text over a Vimeo id makes no player, so the photo beside it keeps its box, at ${viewport} width`, async ({
    page,
  }) => {
    // Column one: text over the 9:16 id, toggle on. Column two: a photo.
    await page.setViewportSize(size);
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
    const row = section(page, "text-over-video");
    await expect(row.locator("[data-text-cell]")).toHaveCount(1);
    await expect(row.locator("iframe, [data-player], [data-player-photo]")).toHaveCount(0);
    const expected = viewport === "desktop" ? 1 : 4 / 3;
    const ratio = await row
      .locator(":scope > div > div")
      .nth(1)
      .evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.width / r.height;
      });
    expect(Math.abs(ratio / expected - 1)).toBeLessThan(0.01);
  });
}
