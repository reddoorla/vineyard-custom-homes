import { test, expect, type Page } from "@playwright/test";

// The two-col ContentWidthMedia boxes take the editor's `image aspect`.
// /dev/content-width-media renders the slice once per option.
const ROUTE = "/dev/content-width-media";

// [width / height of each column box] by option, at md and up and below md.
// 9:16 and 1:1 fall back to 4:3 on a phone; 3:4 and 2:3 stay portrait.
const expected: Record<string, { desktop: number; phone: number }> = {
  "9:16": { desktop: 9 / 16, phone: 4 / 3 },
  "1:1": { desktop: 1, phone: 4 / 3 },
  "3:4": { desktop: 3 / 4, phone: 3 / 4 },
  "2:3": { desktop: 2 / 3, phone: 2 / 3 },
};

async function columns(page: Page, aspect: string) {
  const images = page.locator(`section[data-aspect="${aspect}"] img`);
  await expect(images).toHaveCount(2);
  return Promise.all(
    [0, 1].map((i) =>
      images.nth(i).evaluate((img) => {
        const box = img.parentElement!.getBoundingClientRect();
        return {
          ratio: box.width / box.height,
          width: box.width,
          fit: getComputedStyle(img).objectFit,
          fills: Math.abs(img.getBoundingClientRect().height - img.parentElement!.clientHeight) < 1,
        };
      }),
    ),
  );
}

for (const [viewport, size] of [
  ["desktop", { width: 1280, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test(`two-col boxes take each image aspect at ${viewport} width, cropped not stretched`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
    for (const [aspect, ratios] of Object.entries(expected)) {
      for (const column of await columns(page, aspect)) {
        expect(column.ratio, `${aspect} at ${viewport}`).toBeCloseTo(ratios[viewport], 2);
        expect(column.fit, `${aspect} at ${viewport}`).toBe("cover");
        expect(column.fills, `${aspect} at ${viewport}: image fills its box`).toBe(true);
        if (viewport === "desktop") expect(column.width).toBeLessThan(size.width / 2);
      }
    }
  });
}
