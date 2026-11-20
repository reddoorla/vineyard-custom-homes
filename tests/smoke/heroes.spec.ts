import { test, expect, type Page } from "@playwright/test";

// The gallery, home and About heroes take their still and their video from Prismic
// (Tim, 2026-11-20 10:08am PT, Discord #vineyard-website: "I just want a
// different placeholder image"). An empty field keeps today's bundled still
// and built-in video. /dev/heroes renders the real page components with the
// hero fields empty or filled.

const prismicHost = "https://images.prismic.io/vineyard-custom-homes/";

// Every ScreenWidthMedia hero on the page, in document order.
const heroes = (page: Page) => page.locator("section:has(> div.aspect-video)");

async function open(
  page: Page,
  which: string,
  fill: "empty" | "filled" | "link" | "no-alt" | "missing",
) {
  await page.goto(`/dev/heroes?page=${which}&case=${fill}`, { waitUntil: "load" });
  // The Vimeo iframe mounts only after an interaction (VimeoGate).
  await expect(async () => {
    await page.keyboard.press("Shift");
    await expect(page.locator('iframe[src*="player.vimeo.com"]').first()).toBeAttached({
      timeout: 2000,
    });
  }).toPass({ timeout: 20_000 });
}

async function still(page: Page, index: number) {
  const img = heroes(page).nth(index).locator("img").first();
  return {
    src: (await img.getAttribute("src")) ?? "",
    srcset: (await img.getAttribute("srcset")) ?? "",
    alt: await img.getAttribute("alt"),
  };
}

async function video(page: Page, index: number) {
  const src = await heroes(page).nth(index).locator("iframe").getAttribute("src");
  return new URL(src ?? "").pathname;
}

test("About with no About document keeps its built-in hero", async ({ page }) => {
  await open(page, "about", "missing");
  const img = await still(page, 0);
  expect(img.src).not.toContain("images.prismic.io");
  expect(img.src).not.toBe("");
  expect(img.alt).toBe("background image");
  expect(await video(page, 0)).toBe("/video/1082670713");
});

// [page, hero index, built-in Vimeo id, filled Vimeo id, filled alt]
const cases = [
  ["gallery", 0, "1092190178", "111111111", "Tim's gallery still"],
  ["home", 0, "1092191048", "111111111", "Tim's gallery still"],
  ["home", 1, "1092190178", "222222222", "Tim's second still"],
  ["about", 0, "1082670713", "111111111", "Tim's gallery still"],
] as const;

for (const [which, index, builtIn, filledId, filledAlt] of cases) {
  // Hero 2 on home is `vimeo_id_for_video`, given a player link in the fixture.
  const linkId = which === "home" && index === 1 ? "444444444" : "333333333";
  test.describe(`${which} hero ${index + 1}`, () => {
    test("an empty field keeps the bundled still and the built-in video", async ({ page }) => {
      await open(page, which, "empty");
      await expect(heroes(page)).toHaveCount(which === "home" ? 2 : 1);
      const img = await still(page, index);
      expect(img.src).not.toContain("images.prismic.io");
      expect(img.src).not.toBe("");
      expect(img.alt).toBe("background image");
      expect(await video(page, index)).toBe(`/video/${builtIn}`);
    });

    test("a still with no alt text gets the fallback alt, and keeps today's video", async ({
      page,
    }) => {
      await open(page, which, "no-alt");
      const img = await still(page, index);
      expect(img.src.startsWith(prismicHost)).toBe(true);
      expect(img.alt).toBe("background image");
      expect(await video(page, index)).toBe(`/video/${builtIn}`);
    });

    test("a pasted Vimeo link gives its number", async ({ page }) => {
      await open(page, which, "link");
      expect(await video(page, index)).toBe(`/video/${linkId}`);
    });

    test("a filled field shows the editor's still and video", async ({ page }) => {
      await open(page, which, "filled");
      const img = await still(page, index);
      expect(img.src.startsWith(prismicHost)).toBe(true);
      // Through the imgix widths, capped at the 1920px original.
      const widths = img.srcset.split(",").map((c) => c.trim().split(/\s+/)[1]);
      expect(widths).toEqual(["640w", "828w", "1200w", "1920w"]);
      expect(img.alt).toBe(filledAlt);
      expect(await video(page, index)).toBe(`/video/${filledId}`);
    });
  });
}
