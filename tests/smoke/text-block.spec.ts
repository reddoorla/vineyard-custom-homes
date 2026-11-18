import { test, expect, type Page, type Locator } from "@playwright/test";

// Editor-written text (the RichText slice, and ContentWidthMedia two col's
// text column) looks like the homepage's "Legacy of Craftsmanship" block, as
// Tim asked on 2026-11-18 1:34pm PT: the same heading and paragraph type,
// colour and 32px gap, centred, in a block at most 640px wide and centred in
// its column. Measured against the homepage itself, so a change to either
// side shows up here.
const PROPS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "textAlign",
  "color",
] as const;

async function look(heading: Locator, paragraph: Locator) {
  const styles = async (el: Locator) =>
    el.evaluate(
      (node, props) => {
        const cs = getComputedStyle(node);
        return Object.fromEntries(props.map((p) => [p, cs[p as keyof CSSStyleDeclaration]]));
      },
      [...PROPS],
    );
  const h = await heading.boundingBox();
  const p = await paragraph.boundingBox();
  return {
    heading: await styles(heading),
    paragraph: await styles(paragraph),
    gap: Math.round(p!.y - (h!.y + h!.height)),
  };
}

/** The block, and the content box it sits in: centred in it, ≤640px, and filling it up to 640. */
async function centred(page: Page, block: Locator, label: string) {
  const g = await block.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const parent = el.parentElement!;
    const pr = parent.getBoundingClientRect();
    const cs = getComputedStyle(parent);
    const left = pr.left + parseFloat(cs.paddingLeft);
    const right = pr.right - parseFloat(cs.paddingRight);
    return {
      left: r.left,
      right: r.right,
      width: r.width,
      inner: right - left,
      mid: (left + right) / 2,
    };
  });
  expect(g.width, `${label}: ≤640`).toBeLessThanOrEqual(640.5);
  expect(g.width, `${label}: fills up to 640`).toBeGreaterThan(Math.min(640, g.inner) - 1);
  expect(Math.abs((g.left + g.right) / 2 - g.mid), `${label}: centred`).toBeLessThan(1);
}

for (const [viewport, size] of [
  ["1280", { width: 1280, height: 900 }],
  ["1600", { width: 1600, height: 900 }],
  ["390", { width: 390, height: 844 }],
] as const) {
  test(`editor text takes the homepage paragraph's look, at ${viewport}px`, async ({ page }) => {
    await page.setViewportSize(size);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const homeHeading = page.locator("h2", { hasText: "Legacy of Craftsmanship" });
    const home = await look(homeHeading, homeHeading.locator("xpath=following-sibling::p[1]"));
    expect(home.heading.textAlign).toBe("center");

    await page.goto("/dev/rich-text", { waitUntil: "domcontentloaded" });
    const rt = page.locator("[data-rich-text-fixture] [data-text-block]");
    expect(await look(rt.locator("h2"), rt.locator("p")), "RichText slice").toEqual(home);
    await centred(page, rt, "RichText slice");

    await page.goto("/dev/content-width-media", { waitUntil: "domcontentloaded" });
    const cell = page.locator('[data-player-case="text-left"] [data-text-block]');
    expect(await look(cell.locator("h2"), cell.locator("p")), "two col text").toEqual(home);
    await centred(page, cell, "two col text");
  });
}
