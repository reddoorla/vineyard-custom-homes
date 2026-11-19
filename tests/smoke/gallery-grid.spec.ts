import { test, expect, type Page } from "@playwright/test";

// The main gallery's ten slots (Tim, 2026-11-19 1:29pm PT, "So that I will
// have 10 spots for projects"), in the rows of his mockup: 1 full width;
// 2 tall over 3 beside 4 over 5; 6 wide | 7 tall; 8 full width; 9 tall | 10
// wide. An empty slot renders nothing and a row left with one tile centres it.
// /dev/gallery-grid renders the cases; every tile links to /gallery/slot-<n>.
const ROUTE = "/dev/gallery-grid";

type Box = { x: number; y: number; width: number; height: number };

/**
 * Each rendered tile's box in one case, keyed by slot number, and the grid's
 * content box, all read in one pass so a reflow (a viewport change settling)
 * cannot fall between them.
 */
async function tiles(page: Page, key: string) {
  const { boxes, grid } = await page.locator(`[data-case="${key}"] > div`).evaluate((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const boxes = [...el.querySelectorAll('a[href^="/gallery/slot-"]')].map((a) => {
      const b = a.getBoundingClientRect();
      const n = Number(a.getAttribute("href")!.replace("/gallery/slot-", ""));
      return [n, { x: b.x, y: b.y + scrollY, width: b.width, height: b.height }] as const;
    });
    const grid = {
      left: r.x + parseFloat(s.paddingLeft),
      width: r.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight),
      top: r.y + scrollY + parseFloat(s.paddingTop),
      bottom: r.bottom + scrollY - parseFloat(s.paddingBottom),
    };
    return { boxes, grid };
  });
  return { slots: new Map<number, Box>(boxes), grid };
}

const centre = (b: Box) => b.x + b.width / 2;

const allCases = [
  "all",
  "live",
  "lone-seven",
  "lone-nine",
  "lone-ten",
  "pairs-empty",
  "middle-empty",
];

/**
 * The vertical gaps between the case's rows: tiles whose boxes overlap
 * vertically are one row (2-5 is one), and every row is 36px (gap-9) below
 * the one before. An empty row left in the markup shows as a wider gap.
 */
function rowGaps(slots: Map<number, Box>) {
  const boxes = [...slots.values()].sort((a, b) => a.y - b.y);
  const rows: { top: number; bottom: number }[] = [];
  for (const b of boxes) {
    const last = rows.at(-1);
    if (last && b.y < last.bottom - 0.5) last.bottom = Math.max(last.bottom, b.y + b.height);
    else rows.push({ top: b.y, bottom: b.y + b.height });
  }
  return rows.slice(1).map((r, i) => r.top - rows[i].bottom);
}

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
    // Rows 2-5, unchanged: 2 over 3 in a 2/5 column with a 36px gutter,
    // beside 4 over 5 in a 3/5 column.
    const colLeft = grid.width * 0.4 - 36;
    const colRight = grid.width * 0.6;
    for (const n of [2, 3]) {
      expect(get(n).x, `slot ${n} left`).toBeCloseTo(grid.left, 0);
      expect(get(n).width, `slot ${n} width`).toBeCloseTo(colLeft, 0);
    }
    for (const n of [4, 5]) {
      expect(get(n).x + get(n).width, `slot ${n} right`).toBeCloseTo(grid.left + grid.width, 0);
      expect(get(n).width, `slot ${n} width`).toBeCloseTo(colRight, 0);
    }
    expect(get(2).y).toBeCloseTo(get(4).y, 0);
    // The two columns end together: 3's bottom is 5's.
    expect(get(3).y + get(3).height).toBeCloseTo(get(5).y + get(5).height, 0);
    expect(get(3).y).toBeGreaterThan(get(2).y + get(2).height);
    expect(get(5).y).toBeGreaterThan(get(4).y + get(4).height);

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

  // Before this change slot 6 rendered 0x0 on a phone (staging, 2026-11-19):
  // its row's items-center shrank the column to its content, and every child
  // of a tile is absolutely positioned. Phone visitors did not see it.
  test("the live gallery: slot 6 shows, full width, below slot 5", async ({ page }) => {
    const { slots: s, grid } = await tiles(page, "live");
    const six = s.get(6)!;
    expect(six.width).toBeCloseTo(grid.width, 0);
    expect(six.width).toBeGreaterThan(six.height);
    expect(six.y).toBeGreaterThan(s.get(5)!.y + s.get(5)!.height);
  });

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

test("every case at either width keeps a 36px gap between rows, and none outside them", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const key of allCases) {
      const { slots: s, grid } = await tiles(page, key);
      for (const [i, gap] of rowGaps(s).entries()) {
        expect(gap, `${key} at ${width}px, gap after row ${i + 1}`).toBeCloseTo(36, 0);
      }
      // Nothing empty above the first row or below the last.
      const boxes = [...s.values()];
      const first = Math.min(...boxes.map((b) => b.y));
      const last = Math.max(...boxes.map((b) => b.y + b.height));
      expect(first, `${key} at ${width}px, grid top`).toBeCloseTo(grid.top, 0);
      expect(last, `${key} at ${width}px, grid bottom`).toBeCloseTo(grid.bottom, 0);
    }
  }
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
