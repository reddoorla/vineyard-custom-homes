import { test, expect } from "@playwright/test";

// The slice simulator (Prismic's page builder previews a slice in it) gives a
// ContentWidthMedia slice ticked "show as player" the video's own shape, as
// the gallery page does (#130). It used to render with no `context`, so a
// vertical promo showed in a 16:9 box.
//
// Prismic drives /slice-simulator from a parent page on *.prismic.io over
// postMessage. Here that parent is a stub served on a prismic.io origin (the
// simulator ignores messages from any other origin in a production build),
// speaking the same protocol as @prismicio/simulator's SimulatorClient:
// the frame says `ready`, the parent answers `connect` with a MessagePort,
// then sends `setSliceZone` over that port. Vimeo's oEmbed is stubbed too, so
// the test never depends on Vimeo answering the CI runner.
//
// The frame is served from a stub prismic.io host as well, proxied to the
// test server: Chromium's Local Network Access check refuses to let a public
// origin frame localhost (net::ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS).

const PARENT = "https://reddoor-test.prismic.io/simulator";
const SITE = "https://reddoor-test-site.prismic.io";
const VERTICAL = "1245606043"; // 1080×1920, the client's press promo

const parentHtml = (frameSrc: string) => `<!doctype html>
<html><body style="margin:0">
<iframe id="sim" src="${frameSrc}" style="border:0;width:1280px;height:900px"></iframe>
<script>
  const frame = document.getElementById("sim");
  let port = null;
  let n = 0;
  const pending = new Map();
  const request = (type, data) =>
    new Promise((resolve, reject) => {
      const requestID = "test-" + n++;
      pending.set(requestID, (msg) => ("error" in msg ? reject(msg) : resolve(msg)));
      port.postMessage({ requestID, type, data });
    });
  window.connected = new Promise((resolve) => {
    window.addEventListener("message", (event) => {
      if (event.source !== frame.contentWindow || event.data?.type !== "ready") return;
      const ready = event.data.requestID;
      const channel = new MessageChannel();
      port = channel.port1;
      port.onmessage = (e) => {
        const msg = e.data;
        if ("type" in msg) {
          port.postMessage({ requestID: msg.requestID, status: 200, msg: "ok", data: null });
          return;
        }
        const done = pending.get(msg.requestID);
        pending.delete(msg.requestID);
        done?.(msg);
      };
      pending.set("connect", () => {
        frame.contentWindow.postMessage({ requestID: ready, status: 200, msg: "ok", data: null }, "*");
        resolve();
      });
      frame.contentWindow.postMessage({ requestID: "connect", type: "connect", data: {} }, "*", [
        channel.port2,
      ]);
    });
  });
  window.setSlices = async (slices) => {
    await window.connected;
    return request("setSliceZone", slices);
  };
</script>
</body></html>`;

const empty = { url: null, alt: null, copyright: null, dimensions: null, id: null, edit: null };

test("the slice simulator gives a ticked player its video's own shape", async ({
  page,
  baseURL,
}) => {
  const oembed: string[] = [];
  await page.route("https://vimeo.com/api/oembed.json**", (route) => {
    oembed.push(route.request().url());
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ width: 1080, height: 1920, title: "VCH - Gempler groundbreaking" }),
    });
  });
  await page.route(PARENT, (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: parentHtml(`${SITE}/slice-simulator`),
    }),
  );
  await page.route(`${SITE}/**`, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: `${baseURL}${url.pathname}${url.search}` });
    return route.fulfill({ response });
  });

  await page.goto(PARENT);
  await page.evaluate(() => (window as unknown as { connected: Promise<void> }).connected);
  await page.evaluate(
    (slices) =>
      (window as unknown as { setSlices: (s: unknown) => Promise<unknown> }).setSlices(slices),
    [
      {
        id: "content_width_media$sim-player",
        slice_type: "content_width_media",
        slice_label: null,
        variation: "default",
        version: "initial",
        primary: { image: empty, vimeo_id: VERTICAL, image_aspect: "16:9", show_as_player: true },
        items: [],
      },
    ],
  );

  const sim = page.frameLocator("#sim");
  const box = sim.locator("[data-player]");
  await expect(box).toHaveCount(1);
  // The lookup ran in the browser, for this id.
  await expect.poll(() => oembed.length).toBeGreaterThan(0);
  expect(new URL(oembed[0]).searchParams.get("url")).toBe(`https://vimeo.com/${VERTICAL}`);
  // 9:16, not the 16:9 fallback: poll, since the shape arrives after the slice.
  await expect
    .poll(
      async () => {
        const r = await box.evaluate((el) => el.getBoundingClientRect());
        return Math.abs(r.width / r.height / (1080 / 1920) - 1);
      },
      { message: "the player box is 9:16 within 1%" },
    )
    .toBeLessThan(0.01);
  // The frame is named by the video's own title, which also comes from oEmbed.
  await expect(box.locator("iframe")).toHaveAttribute("title", "VCH - Gempler groundbreaking");
});
