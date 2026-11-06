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

// The single takes its own `image aspect`. 16:9, and a single written before
// the field existed, keep the 4:3 phone box they have always had; 4:3, 3:2 and
// 1:1 hold at every width; `none` takes the photo's own shape from Prismic's
// `dimensions` (2560×1706 landscape, 1920×2560 portrait), and falls back to
// 16:9 when the single carries a video.
const sixteenNine = { phone: 4 / 3, wide: 16 / 9 };
const singles: Record<string, { phone: number; wide: number }> = {
  "16:9": sixteenNine,
  unset: sixteenNine,
  "4:3": { phone: 4 / 3, wide: 4 / 3 },
  "3:2": { phone: 3 / 2, wide: 3 / 2 },
  "1:1": { phone: 1, wide: 1 },
  none: { phone: 2560 / 1706, wide: 2560 / 1706 },
  "none-portrait": { phone: 1920 / 2560, wide: 1920 / 2560 },
  "none-video": sixteenNine,
};

for (const width of [390, 1100, 1440]) {
  test(`single boxes take each image aspect at ${width}px, within 1%, cropped not stretched`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
    for (const [key, ratios] of Object.entries(singles)) {
      const img = page.locator(`section[data-single="${key}"] img`);
      await expect(img).toHaveCount(1);
      const box = await img.evaluate((el) => {
        const r = el.parentElement!.getBoundingClientRect();
        return {
          ratio: r.width / r.height,
          width: r.width,
          fit: getComputedStyle(el).objectFit,
          fills: Math.abs(el.getBoundingClientRect().height - el.parentElement!.clientHeight) < 1,
        };
      });
      const expected = width < 768 ? ratios.phone : ratios.wide;
      // Soft, so one run names every option whose box is wrong.
      expect
        .soft(
          Math.abs(box.ratio / expected - 1),
          `${key} at ${width}: ${box.ratio.toFixed(4)} against ${expected.toFixed(4)}`,
        )
        .toBeLessThan(0.01);
      expect(box.width, `${key} at ${width}: full content width`).toBeGreaterThan(width * 0.9);
      expect(box.fit, `${key} at ${width}`).toBe("cover");
      expect(box.fills, `${key} at ${width}: image fills its box`).toBe(true);
    }
  });
}
