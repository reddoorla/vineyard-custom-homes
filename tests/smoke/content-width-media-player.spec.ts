import { test, expect, type Page } from "@playwright/test";

// ContentWidthMedia's "show as player" toggle. On: a Vimeo player with
// controls and sound (no background, autoplay, loop or mute), in a box of the
// video's own shape, alone or two to a row. Off: the muted background loop,
// exactly as before. /dev/content-width-media renders the cases from
// src/routes/dev/content-width-media/playerSlices.ts.
const ROUTE = "/dev/content-width-media";
const VERTICAL = 1080 / 1920; // Vimeo 1245606043, read through oEmbed
const LANDSCAPE = 16 / 9; // Vimeo 76979871
const BACKGROUND_FLAGS = ["background=1", "muted=1", "loop=1", "autoplay=1"];

async function engage(page: Page) {
  // VimeoGate mounts every iframe on the first input after hydration.
  let x = 10;
  await expect(async () => {
    await page.mouse.move((x += 7), 40);
    await expect(page.locator(`[data-player-case="single"] iframe`)).toBeAttached({
      timeout: 2000,
    });
  }).toPass({ timeout: 30_000 });
}

const frames = (page: Page, key: string) => page.locator(`[data-player-case="${key}"] iframe`);

async function srcParams(page: Page, key: string) {
  const srcs = await frames(page, key).evaluateAll((els) =>
    els.map((el) => (el as HTMLIFrameElement).src),
  );
  return srcs.map((src) => new URL(src));
}

/** Each iframe's box (the iframe fills it), and the viewport's size. */
async function boxes(page: Page, key: string) {
  return frames(page, key).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      const top = r.top + scrollY;
      return { width: r.width, height: r.height, top, bottom: top + r.height, left: r.left };
    }),
  );
}

test("a player's embed has controls and sound: no background, autoplay, loop or mute", async ({
  page,
}) => {
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
  await engage(page);
  for (const key of ["single", "two", "landscape"]) {
    const urls = await srcParams(page, key);
    expect(urls.length, key).toBe(key === "two" ? 2 : 1);
    for (const url of urls) {
      expect(url.origin, key).toBe("https://player.vimeo.com");
      for (const flag of BACKGROUND_FLAGS) {
        const [name] = flag.split("=");
        expect(url.searchParams.has(name), `${key}: no ${name}`).toBe(false);
      }
      expect(url.searchParams.get("dnt"), key).toBe("1");
    }
    for (const frame of await frames(page, key).all()) {
      await expect(frame, key).toHaveAttribute("allow", /fullscreen/);
      // Named by the video's own Vimeo title, not "background video".
      await expect(frame, key).not.toHaveAttribute("title", "background video");
      await expect(frame, key).not.toHaveAttribute("aria-hidden", "true");
    }
  }
});

test("with the toggle off, the embed is the muted background loop, as before", async ({ page }) => {
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
  await engage(page);
  for (const key of ["single-off", "two-off"]) {
    const urls = await srcParams(page, key);
    expect(urls.length, key).toBe(key === "two-off" ? 2 : 1);
    for (const url of urls) {
      for (const flag of BACKGROUND_FLAGS) expect(url.href, `${key}: ${flag}`).toContain(flag);
    }
    await expect(frames(page, key).first()).toHaveAttribute("title", "background video");
  }
  // And every older fixture on the page (no toggle at all) is unchanged too.
  const old = await page
    .locator("section[data-single] iframe, section[data-aspect] iframe")
    .evaluateAll((els) => els.map((el) => (el as HTMLIFrameElement).src));
  expect(old.length).toBeGreaterThan(0);
  for (const src of old) for (const flag of BACKGROUND_FLAGS) expect(src).toContain(flag);
});

for (const [viewport, size] of [
  ["desktop", { width: 1280, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test(`a player keeps its video's own shape, alone and two to a row, at ${viewport} width`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
    await engage(page);

    for (const [key, ratio] of [
      ["single", VERTICAL],
      ["two", VERTICAL],
      ["landscape", LANDSCAPE],
    ] as const) {
      for (const box of await boxes(page, key)) {
        expect
          .soft(
            Math.abs(box.width / box.height / ratio - 1),
            `${key} at ${viewport}: ${(box.width / box.height).toFixed(4)} against ${ratio.toFixed(4)}`,
          )
          .toBeLessThan(0.01);
        // Never taller than the screen, so its controls are in reach.
        expect(box.height, `${key} at ${viewport}: fits the screen`).toBeLessThanOrEqual(
          size.height,
        );
      }
    }

    const [one, two] = await boxes(page, "two");
    if (viewport === "desktop") {
      // Side by side: same row, the second to the right of the first.
      expect(Math.abs(one.top - two.top), "two in a row").toBeLessThan(1);
      expect(two.left, "second column right of the first").toBeGreaterThan(one.left + one.width);
    } else {
      // Stacked: the second below the first.
      expect(two.top, "stacked on a phone").toBeGreaterThanOrEqual(one.bottom);
    }
  });
}
