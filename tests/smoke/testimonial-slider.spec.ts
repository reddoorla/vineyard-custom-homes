import { test, expect, type Page } from "@playwright/test";

// The /about "FROM OUR PARTNERS" slider (Tim, 2026-11-20: "slow down this slide
// show ... so people can read the testimonials"). /dev/testimonial-slider
// renders it with a 90-word card, a 10-word card and a 50-word card, and the
// page runs on Playwright's fake clock so every hold is measured, not waited.
//
// Between advances: the 1400ms cross-fade plus the hold, which is the card's
// words at 200 a minute with an 8000ms floor.
//   90 words -> 1400 + 27000 = 28400ms
//   10 words -> 1400 +  8000 =  9400ms (floor)
//   50 words -> 1400 + 15000 = 16400ms (not asserted; card 3 only marks time)
const ROUTE = "/dev/testimonial-slider";

// The shared config emulates reduced motion fleet-wide
// (@reddoorla/maintenance/configs/playwright-a11y, `contextOptions`), and this
// slider does not autoplay under it, so every timing test here opts back into
// motion. The reduced-motion test at the bottom sets it explicitly rather than
// inheriting it, so it still means something if the shared default changes.
test.use({ contextOptions: { reducedMotion: "no-preference" } });
const LONG = 28_400;
const SHORT = 9_400;
// The clock is paused, so holds are exact; the margin only keeps each check
// clear of the instant a timer fires.
const MARGIN = 500;
const START = new Date("2026-11-20T16:00:00Z").getTime();
// A full cycle is 28.4 + 9.4 + 16.4 = 54.2s, so an unpaused slider is back on
// card 1 at e.g. 60s or 120s: a pause is measured where it would otherwise be
// on card 3 (37.8s to 54.2s), never at a multiple of the cycle.

const slider = (page: Page) => page.locator('[aria-roledescription="carousel"]');
const dot = (page: Page, i: number) => page.getByRole("button", { name: `Go to testimonial ${i}` });

// The current card is the one whose dot is filled dark.
async function expectCurrent(page: Page, i: number) {
  await expect(dot(page, i)).toHaveClass(/\bbg-dark\b/);
}

async function open(page: Page) {
  // install() alone leaves the fake clock ticking at real speed, and every
  // expect().toHave… below retries for seconds of real time: long enough for a
  // wrong slider to cycle back to the card the test expects (a mutation
  // survived exactly that way). Pausing before the page loads makes runFor the
  // only thing that moves time, from the moment the slider's timer starts.
  await page.clock.install({ time: START });
  await page.clock.pauseAt(START + 1_000);
  await page.goto(ROUTE);
  await expect(page.locator("main[data-hydrated]")).toHaveCount(1);
  await expect(page.getByText("Ninety Words")).toBeVisible();
  await expectCurrent(page, 1);
}

test("a 90-word card holds ~27s of reading time, a 10-word card the 8s floor", async ({ page }) => {
  await open(page);

  await page.clock.runFor(LONG - MARGIN);
  await expectCurrent(page, 1);
  await page.clock.runFor(2 * MARGIN);
  await expectCurrent(page, 2);

  // Card 2 began MARGIN ago; its hold is measured from there.
  await page.clock.runFor(SHORT - 2 * MARGIN);
  await expectCurrent(page, 2);
  await page.clock.runFor(2 * MARGIN);
  await expectCurrent(page, 3);
});

test("a mouse over the slider holds the card; leaving gives it a full hold again", async ({
  page,
}) => {
  await open(page);

  await page.clock.runFor(20_000);
  await slider(page).hover();
  await page.clock.runFor(30_000); // 50s: card 3, unpaused
  await expectCurrent(page, 1);

  await page.mouse.move(0, 0);
  await page.clock.runFor(LONG - MARGIN);
  await expectCurrent(page, 1);
  await page.clock.runFor(2 * MARGIN);
  await expectCurrent(page, 2);
});

test("keyboard focus inside the slider holds the card until focus leaves", async ({ page }) => {
  await open(page);

  // Tab until a dot has keyboard focus.
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await dot(page, 1).evaluate((el) => el === document.activeElement)) break;
  }
  await expect(dot(page, 1)).toBeFocused();
  await page.clock.runFor(40_000); // card 3, unpaused
  await expectCurrent(page, 1);

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.clock.runFor(LONG + MARGIN);
  await expectCurrent(page, 2);
});

test("a touch pointer does not pause it: touch has no hover", async ({ page }) => {
  await open(page);

  await slider(page).dispatchEvent("pointerenter", { pointerType: "touch" });
  await page.clock.runFor(LONG + MARGIN);
  await expectCurrent(page, 2);
});

test("a dot jumps to its card and starts that card's full hold", async ({ page }) => {
  await open(page);

  await page.clock.runFor(20_000);
  await dot(page, 2).click();
  await page.mouse.move(0, 0);
  await expectCurrent(page, 2);
  await page.clock.runFor(SHORT - MARGIN);
  await expectCurrent(page, 2);
  await page.clock.runFor(2 * MARGIN);
  await expectCurrent(page, 3);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("does not autoplay", async ({ page }) => {
    await open(page);
    await page.clock.runFor(40_000); // card 3, if it autoplayed
    await expectCurrent(page, 1);
  });
});
