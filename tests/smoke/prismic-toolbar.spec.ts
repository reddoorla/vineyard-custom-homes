import { test, expect, type Page } from "@playwright/test";

// Chromium only (the shared config runs chromium): whether window has a listener
// for this event, read through the DevTools protocol.
async function windowListens(page: Page, type: string) {
  const cdp = await page.context().newCDPSession(page);
  try {
    const { result } = await cdp.send("Runtime.evaluate", { expression: "window" });
    const { listeners } = await cdp.send("DOMDebugger.getEventListeners", {
      objectId: result.objectId!,
    });
    return listeners.some((l) => l.type === type);
  } finally {
    await cdp.detach();
  }
}

function watchToolbar(page: Page) {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (/static\.cdn\.prismic\.io\/prismic\.js|prismic-toolbar/.test(r.url()))
      requests.push(r.url());
  });
  return requests;
}

test("a normal visit loads no Prismic toolbar", async ({ page, context }) => {
  const requests = watchToolbar(page);
  // Hydrated means the layout's client code, which mounts PrismicPreview for a
  // preview session, has run. Waiting for network idle instead waits on dev
  // image encoding and analytics, and "load" waits on every image, none of
  // which has anything to do with the toolbar.
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  expect(requests).toEqual([]);
  await expect(page.locator('script[src*="static.cdn.prismic.io"]')).toHaveCount(0);
  expect((await context.cookies()).filter((c) => c.name.startsWith("io.prismic"))).toEqual([]);
});

test("a preview session still loads the Prismic toolbar", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "io.prismic.preview", value: "{}", url: baseURL! }]);
  const requests = watchToolbar(page);
  await page.goto("/preview", { waitUntil: "domcontentloaded" });
  await expect.poll(() => requests.length, { timeout: 15_000 }).toBeGreaterThan(0);
});

test("ending a preview leaves /preview and keeps the scroll position", async ({
  page,
  context,
  baseURL,
}) => {
  // @prismicio/svelte 2.x ends a preview with goto({ invalidateAll, noScroll }),
  // which kit 3 rejects in dev and ignores in production: the page jumps to the
  // top. reddoor-starter#188.
  await context.addCookies([{ name: "io.prismic.preview", value: "{}", url: baseURL! }]);
  await page.goto("/preview/about", { waitUntil: "domcontentloaded" });
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  await page.evaluate(() => window.scrollTo(0, 400));
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(0);
  // Dispatch once: each dispatch starts a new goto, which supersedes the one in
  // flight, so retrying the event can keep a slow load from ever landing.
  // PrismicPreview's onMount runs before the layout's marker; the listener check
  // proves it rather than assuming it.
  expect(await windowListens(page, "prismicPreviewEnd"), "PrismicPreview listens").toBe(true);
  await page.evaluate(() =>
    window.dispatchEvent(new Event("prismicPreviewEnd", { cancelable: true })),
  );
  // No timeout of its own: /about's load calls Prismic on the dev server, which
  // took 0.2 to 9.3 s here, so the test's own timeout bounds the wait.
  await expect(page).toHaveURL((url) => url.pathname === "/about", { timeout: 0 });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before);
});
