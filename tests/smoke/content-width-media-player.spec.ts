import { test, expect, type Page } from "@playwright/test";

// ContentWidthMedia's "show as player" toggle. On: a Vimeo player with
// controls and sound (no background, autoplay, loop or mute), in a box of the
// video's own shape, alone or two to a row. Off: the muted background loop,
// exactly as before. /dev/content-width-media renders the cases from
// src/routes/dev/content-width-media/playerSlices.ts.
const ROUTE = "/dev/content-width-media";
const VERTICAL = 1080 / 1920; // Vimeo 1245606043, as oEmbed reports it
const LANDSCAPE = 16 / 9; // Vimeo 76979871
const BACKGROUND_FLAGS = ["background=1", "muted=1", "loop=1", "autoplay=1"];

async function engage(page: Page) {
  // VimeoGate mounts the background iframes on the first input after hydration.
  let x = 10;
  await expect(async () => {
    await page.mouse.move((x += 7), 40);
    await expect(page.locator(`[data-player-case="single-off"] iframe`)).toBeAttached({
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
  // A player is content, not decoration: it is there before any input (a
  // screen reader's swipe may never send one), and lazy instead.
  await page.goto(ROUTE, { waitUntil: "load" });
  await expect(frames(page, "single-off")).toHaveCount(0);
  for (const key of ["single", "two", "landscape", "missed-poster", "missed-bare"]) {
    await expect(frames(page, key), key).toHaveCount(key === "two" ? 2 : 1);
    for (const frame of await frames(page, key).all())
      await expect(frame, key).toHaveAttribute("loading", "lazy");
  }
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
  // An unlisted video's `<id>/<hash>` becomes the id and `h=`; with no oEmbed
  // title, the frame is named by the poster's alt text.
  const [missed] = await srcParams(page, "missed-poster");
  expect(missed.pathname).toBe("/video/1245606043");
  expect(missed.searchParams.get("h")).toBe("notarealhash");
  await expect(frames(page, "missed-poster")).toHaveAttribute(
    "title",
    "Groundbreaking at the Gempler site",
  );
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

    for (const [key, ratio] of [
      ["single", VERTICAL],
      ["two", VERTICAL],
      ["landscape", LANDSCAPE],
      // No oEmbed shape: the poster's (1920×2560), else 16:9.
      ["missed-poster", 1920 / 2560],
      ["missed-bare", 16 / 9],
    ] as const) {
      await expect(frames(page, key), key).toHaveCount(key === "two" ? 2 : 1);
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

// Two col, toggle on, a Vimeo id in one column only (#131): the photo column
// takes the player's box, so the row's two boxes match, and the photo is
// cropped to it, not stretched. Toggle on with no id at all is untouched: two
// photos in the editor's `image aspect` box (1:1 here; 4:3 below md).
for (const [viewport, size] of [
  ["desktop", { width: 1280, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test(`a photo beside a player takes the player's box, at ${viewport} width`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });

    for (const key of ["mixed", "mixed-right"]) {
      await expect(frames(page, key), key).toHaveCount(1);
      const [player] = await boxes(page, key);
      const img = page.locator(`[data-player-case="${key}"] img`);
      await expect(img, key).toHaveCount(1);
      const photo = await img.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          width: r.width,
          height: r.height,
          fit: getComputedStyle(el).objectFit,
          fills: Math.abs(r.height - el.parentElement!.clientHeight) < 1,
        };
      });
      const label = `${key} at ${viewport}: photo ${photo.width.toFixed(1)}×${photo.height.toFixed(1)}, player ${player.width.toFixed(1)}×${player.height.toFixed(1)}`;
      expect
        .soft(Math.abs(photo.height / player.height - 1), `${label}: height`)
        .toBeLessThan(0.01);
      expect
        .soft(
          Math.abs(photo.width / photo.height / (player.width / player.height) - 1),
          `${label}: ratio`,
        )
        .toBeLessThan(0.01);
      expect(photo.fit, label).toBe("cover");
      expect(photo.fills, `${label}: image fills its box`).toBe(true);
    }
  });

  test(`toggle on with no Vimeo id keeps the image aspect box, at ${viewport} width`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
    const section = page.locator(`[data-player-case="two-photos"]`);
    await expect(section.locator("iframe, [data-player]")).toHaveCount(0);
    const imgs = section.locator("img");
    await expect(imgs).toHaveCount(2);
    const expected = viewport === "desktop" ? 1 : 4 / 3;
    for (const box of await imgs.evaluateAll((els) =>
      els.map((el) => {
        const r = el.parentElement!.getBoundingClientRect();
        return { ratio: r.width / r.height, width: r.width };
      }),
    )) {
      expect(box.ratio, `two-photos at ${viewport}`).toBeCloseTo(expected, 2);
      if (viewport === "desktop") expect(box.width).toBeLessThan(size.width / 2);
    }
  });
}
