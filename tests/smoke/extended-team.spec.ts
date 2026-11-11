import { test, expect, type Locator } from "@playwright/test";

// A project's "The extended team" credits. /dev/extended-team renders the
// component once with two credits, one, none, and one blank row.
const ROUTE = "/dev/extended-team";

test.beforeEach(async ({ page }) => {
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
});

// The block's children in document order, as tags: heading, arrow, rule, entry.
async function sequence(block: Locator) {
  return block.evaluate((el) =>
    [...el.children].map((child) => {
      if (child.hasAttribute("data-team-arrow")) return "arrow";
      if (child.hasAttribute("data-team-rule")) return "rule";
      if (child.hasAttribute("data-team-entry")) return "entry";
      return `heading:${child.textContent?.trim()}`;
    }),
  );
}

// Each entry's name sits above its label: the name's box ends before the
// label's begins.
async function nameAboveLabel(entry: Locator) {
  const name = await entry.locator("[data-team-name]").boundingBox();
  const label = await entry.locator("[data-team-label]").boundingBox();
  return name!.y + name!.height <= label!.y + 0.5;
}

test("two credits: heading, arrow, the two entries with one rule between them", async ({
  page,
}) => {
  const block = page.locator('[data-case="two"] [data-extended-team]');
  await expect(block).toHaveCount(1);
  expect(await sequence(block)).toEqual([
    "heading:The extended team",
    "arrow",
    "entry",
    "rule",
    "entry",
  ]);

  const entries = block.locator("[data-team-entry]");
  await expect(entries.nth(0).locator("[data-team-name]")).toHaveText("Phil Norman Design Group");
  await expect(entries.nth(0).locator("[data-team-label]")).toHaveText("Interior Design");
  await expect(entries.nth(1).locator("[data-team-name]")).toHaveText("Bob Thompson");
  await expect(entries.nth(1).locator("[data-team-label]")).toHaveText("Architect");
  for (const i of [0, 1]) expect(await nameAboveLabel(entries.nth(i))).toBe(true);

  // Name dark, label light, as the old Design / Architect labels were.
  const color = (l: Locator) => l.evaluate((el) => getComputedStyle(el).color);
  expect(await color(block.locator("h3").first())).toBe("rgb(123, 160, 196)");
  expect(await color(entries.nth(0).locator("[data-team-name]"))).toBe("rgb(0, 38, 62)");
  expect(await color(entries.nth(0).locator("[data-team-label]"))).toBe("rgb(123, 160, 196)");

  // The rule: 23px wide (Figma), 1px tall, light blue, centred under the entries.
  const rule = block.locator("[data-team-rule]");
  const box = (await rule.boundingBox())!;
  expect(box.width).toBeCloseTo(23, 0);
  expect(box.height).toBeCloseTo(1, 0);
  expect(await rule.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
    "rgb(123, 160, 196)",
  );
  // Figma spaces every child 25px from the next.
  const boxes = await block.evaluate((el) =>
    [...el.children].map((child) => {
      const r = child.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    }),
  );
  for (let i = 1; i < boxes.length; i++) {
    expect(boxes[i].top - boxes[i - 1].bottom, `gap before child ${i}`).toBeCloseTo(25, 0);
  }

  const blockBox = (await block.boundingBox())!;
  expect(box.x + box.width / 2).toBeCloseTo(blockBox.x + blockBox.width / 2, 0);
});

test("one credit: heading, arrow and the entry, no rule", async ({ page }) => {
  const block = page.locator('[data-case="one"] [data-extended-team]');
  await expect(block).toHaveCount(1);
  expect(await sequence(block)).toEqual(["heading:The extended team", "arrow", "entry"]);
  const entry = block.locator("[data-team-entry]");
  await expect(entry.locator("[data-team-name]")).toHaveText("Branch & Board");
  await expect(entry.locator("[data-team-label]")).toHaveText("Design");
  expect(await nameAboveLabel(entry)).toBe(true);
});

for (const key of ["none", "blank"]) {
  test(`no credits (${key}): no block, no heading, no arrow`, async ({ page }) => {
    const section = page.locator(`[data-case="${key}"]`);
    await expect(section).toHaveCount(1);
    await expect(section.locator("[data-extended-team]")).toHaveCount(0);
    await expect(section.getByText("The extended team")).toHaveCount(0);
    await expect(section.locator("svg")).toHaveCount(0);
  });
}
