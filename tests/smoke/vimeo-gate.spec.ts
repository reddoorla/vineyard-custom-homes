import { test, expect, type Page } from "@playwright/test";

const vimeoFrame = 'iframe[src*="player.vimeo.com"]';

function watchVimeo(page: Page) {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("player.vimeo.com")) requests.push(r.url());
  });
  return requests;
}

async function loadIdle(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(3000);
}

async function expectMountsAfter(page: Page, engage: () => Promise<void>) {
  await expect(async () => {
    await engage();
    await expect(page.locator(vimeoFrame).first()).toBeAttached({ timeout: 3000 });
  }).toPass({ timeout: 30_000 });
}

test("an unattended load requests no Vimeo player", async ({ page, context }) => {
  const requests = watchVimeo(page);
  await loadIdle(page);
  await expect(page.locator(vimeoFrame)).toHaveCount(0);
  expect(requests).toEqual([]);
  expect((await context.cookies()).filter((c) => c.name === "__cf_bm")).toEqual([]);
});

test("a key press mounts the Vimeo player", async ({ page }) => {
  await loadIdle(page);
  await expectMountsAfter(page, () => page.keyboard.press("Shift"));
});

test("a pointer press mounts the Vimeo player", async ({ page }) => {
  await loadIdle(page);
  await expectMountsAfter(page, async () => {
    await page.mouse.down();
    await page.mouse.up();
  });
});

test("a wheel turn mounts the Vimeo player", async ({ page }) => {
  await loadIdle(page);
  await expectMountsAfter(page, () => page.mouse.wheel(0, 40));
});

test("a mouse move mounts the Vimeo player", async ({ page }) => {
  await loadIdle(page);
  let x = 10;
  await expectMountsAfter(page, () => page.mouse.move((x += 7), 40));
});

test.describe("touch", () => {
  test.use({ hasTouch: true });
  test("a tap mounts the Vimeo player", async ({ page }) => {
    await loadIdle(page);
    await expectMountsAfter(page, () => page.touchscreen.tap(5, 5));
  });
});
