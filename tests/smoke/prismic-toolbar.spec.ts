import { test, expect, type Page } from "@playwright/test";

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
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(3000);
  expect(requests).toEqual([]);
  expect((await context.cookies()).filter((c) => c.name.startsWith("io.prismic"))).toEqual([]);
});

test("a preview session still loads the Prismic toolbar", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "io.prismic.preview", value: "{}", url: baseURL! }]);
  const requests = watchToolbar(page);
  await page.goto("/preview", { waitUntil: "load" });
  await expect.poll(() => requests.length, { timeout: 15_000 }).toBeGreaterThan(0);
});
