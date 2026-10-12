import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { ImageField } from "@prismicio/client";
import { withFallbackAlt } from "../../src/lib/image-alt";

const image = (alt: string | null) =>
  ({
    id: "x",
    url: "https://images.prismic.io/vineyard-custom-homes/x.jpg",
    alt,
    copyright: null,
    dimensions: { width: 960, height: 1056 },
    edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
  }) as ImageField;

test("withFallbackAlt keeps an image's own alt", () => {
  expect(withFallbackAlt(image("A pickup at a job site"), "fallback").alt).toBe(
    "A pickup at a job site",
  );
});

test("withFallbackAlt fills a missing or blank alt", () => {
  expect(withFallbackAlt(image(null), "fallback").alt).toBe("fallback");
  expect(withFallbackAlt(image("  "), "fallback").alt).toBe("fallback");
});

test("withFallbackAlt leaves an empty image field empty", () => {
  const empty = { alt: null, copyright: null, dimensions: null, id: null, url: null, edit: null };
  expect(withFallbackAlt(empty as unknown as ImageField, "fallback")).toBe(empty);
});

test("withFallbackAlt never makes an image decorative", () => {
  expect(() => withFallbackAlt(image(null), "")).toThrow();
  expect(() => withFallbackAlt(image(null), " ")).toThrow();
});

for (const width of [1280, 390]) {
  test(`the home page passes image-alt and color-contrast at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("section.overflow-hidden h3").first()).toBeAttached();
    const { violations } = await new AxeBuilder({ page })
      .withRules(["image-alt", "color-contrast"])
      .options({ checks: { "color-contrast": { options: { ignoreLength: true } } } })
      .analyze();
    expect(violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(" ")}`))).toEqual(
      [],
    );
    const contentAlts = await page
      .locator('a[aria-label="vch instagram photo"] img, section.overflow-hidden img')
      .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("alt")?.trim() ?? ""));
    expect(contentAlts.length).toBeGreaterThan(0);
    expect(contentAlts.filter((alt) => alt === "")).toEqual([]);
  });
}
