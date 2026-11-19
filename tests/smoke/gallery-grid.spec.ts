import { test, expect, type Page } from "@playwright/test";

// The main gallery's ten slots (Tim, 2026-11-19 1:29pm PT, "So that I will
// have 10 spots for projects"), in the rows of his mockup: 1 full width;
// 2 tall over 3 beside 4 over 5; 6 wide | 7 tall; 8 full width; 9 tall | 10
// wide. An empty slot renders nothing and a row left with one tile centres it.
// /dev/gallery-grid renders the cases; every tile links to /gallery/slot-<n>.
const ROUTE = "/dev/gallery-grid";

type Box = { x: number; y: number; width: number; height: number };

/** Each rendered tile's box in one case, keyed by slot number. */
async function tiles(page: Page, key: string) {
  const section = page.locator(`[data-case="${key}"]`);
  const boxes = await section.locator('a[href^="/gallery/slot-"]').evaluateAll((as) =>
    as.map((a) => {
      const r = a.getBoundingClientRect();
      const n = Number(a.getAttribute("href")!.replace("/gallery/slot-", ""));
      return [n, { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }] as const;
    }),
  );
  const grid = await section.locator(":scope > div").evaluate((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const left = r.x + parseFloat(s.paddingLeft);
    return { left, width: r.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight) };
  });
  return { slots: new Map<number, Box>(boxes), grid };
}

const centre = (b: Box) => b.x + b.width / 2;

const allCases = ["all", "live", "lone-seven", "lone-nine", "lone-ten"];

test.beforeEach(async ({ page }) => {
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
});

test.describe("desktop, 1440px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("all ten filled: the mockup's rows, shapes and order", async ({ page }) => {
    const { slots: s, grid } = await tiles(page, "all");
    expect([...s.keys()].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const get = (n: number) => s.get(n)!;

    // Full width: 1 and 8 span the grid.
    for (const n of [1, 8]) {
      expect(get(n).width, `slot ${n} width`).toBeCloseTo(grid.width, 0);
      expect(get(n).x, `slot ${n} left`).toBeCloseTo(grid.left, 0);
    }
    // Rows top to bottom: 1, then 2|4, then 6|7, then 8, then 9|10.
    expect(get(2).y).toBeGreaterThan(get(1).y + get(1).height);
    expect(get(6).y).toBeGreaterThan(get(5).y + get(5).height - 1);
    expect(get(8).y).toBeGreaterThan(get(6).y + get(6).height);
    expect(get(9).y).toBeGreaterThan(get(8).y + get(8).height);

    // The two mirrored pairs: tall beside wide, sharing a top and a height.
    for (const [tall, wide, tallFirst] of [
      [7, 6, false],
      [9, 10, true],
    ] as const) {
      const t = get(tall);
      const w = get(wide);
      expect(t.height, `slot ${tall} has a height`).toBeGreaterThan(100);
      expect(t.height, `slot ${tall} is tall`).toBeGreaterThan(t.width);
      expect(w.width, `slot ${wide} is wider than ${tall}`).toBeGreaterThan(t.width);
      expect(t.y).toBeCloseTo(w.y, 0);
      expect(t.height).toBeCloseTo(w.height, 0);
      if (tallFirst) expect(t.x + t.width).toBeLessThan(w.x);
      else expect(w.x + w.width).toBeLessThan(t.x);
      // Together they span the grid, as rows 2-3 do.
      const left = Math.min(t.x, w.x);
      const right = Math.max(t.x + t.width, w.x + w.width);
      expect(left).toBeCloseTo(grid.left, 0);
      expect(right - left).toBeCloseTo(grid.width, 0);
    }
  });

  test("the live gallery (slots 1-6): six tiles, slot 6 where it was", async ({ page }) => {
    const { slots: s, grid } = await tiles(page, "live");
    expect([...s.keys()].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
    // Unchanged from the live page before this change: slot 6's column keeps
    // its 36px right gutter when 7 is empty, so the tile sits 18px left of
    // centre (measured on the live gallery 2026-11-19: x 323, width 759).
    const six = s.get(6)!;
    expect(six.width).toBeCloseTo(grid.width * 0.6 - 36, 0);
    expect(centre(six)).toBeCloseTo(grid.left + grid.width / 2 - 18, 0);
  });

  for (const [key, lone] of [
    ["lone-seven", 7],
    ["lone-nine", 9],
    ["lone-ten", 10],
  ] as const) {
    test(`${key}: slot ${lone} alone in its row is centred and has a size`, async ({ page }) => {
      const { slots: s, grid } = await tiles(page, key);
      const b = s.get(lone)!;
      expect(b.height).toBeGreaterThan(100);
      expect(b.width).toBeGreaterThan(100);
      expect(centre(b)).toBeCloseTo(grid.left + grid.width / 2, -1);
      if (lone !== 10) expect(b.height, `slot ${lone} stays tall`).toBeGreaterThan(b.width);
    });
  }
});

test.describe("phone, 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("all ten stack in slot order at full width, tall tiles tall", async ({ page }) => {
    const { slots: s, grid } = await tiles(page, "all");
    let previousBottom = -Infinity;
    for (let n = 1; n <= 10; n++) {
      const b = s.get(n)!;
      expect(b.width, `slot ${n} width`).toBeCloseTo(grid.width, 0);
      expect(b.y, `slot ${n} below slot ${n - 1}`).toBeGreaterThan(previousBottom);
      previousBottom = b.y + b.height;
      if ([2, 7, 9].includes(n)) expect(b.height, `slot ${n} tall`).toBeGreaterThan(b.width);
      else expect(b.width, `slot ${n} landscape`).toBeGreaterThan(b.height);
    }
  });
});

test("no case at either width renders an empty or zero-size tile", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const key of allCases) {
      const { slots: s } = await tiles(page, key);
      for (const [n, b] of s) {
        expect(b.width * b.height, `${key} slot ${n} at ${width}px`).toBeGreaterThan(10000);
      }
    }
  }
});
