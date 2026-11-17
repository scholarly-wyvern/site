// Makes the photo-printing images for every recipe card.
//
// Photo printing services and kiosks print image files, not web pages, so
// after Eleventy builds the site, this opens each recipe in a hidden
// browser, photographs both sides of its card and saves them as
// card-front.jpg and card-back.jpg (1800×1200 px: 10×15 cm at 300 dpi).
//
// It also checks that each card's text fits. If a recipe is too long for
// the card even at the smallest text size, it says so.
//
// Needs Google Chrome, which GitHub's publishing computers already have.
// Where Chrome isn't installed, it skips the images with a warning, so the
// rest of the site still builds.

import { createServer } from "node:http";
import { readFile, readdir, access } from "node:fs/promises";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const SITE = "_site";
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const PHOTO_WIDTH = 1800; // px: 6 in × 300 dpi

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

// A tiny web server for the built site, so pages load as they would online
function serve() {
  const server = createServer(async (req, res) => {
    let path = join(SITE, decodeURIComponent(req.url.split("?")[0]));
    if (path.endsWith("/")) path = join(path, "index.html");
    let body;
    try {
      body = await readFile(path);
    } catch {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

async function main() {
  if (!(await exists(CHROME))) {
    console.warn(`[cards] Chrome not found at ${CHROME}: skipping card images (set CHROME_PATH to change).`);
    return;
  }

  const recipesDir = join(SITE, "recipes");
  const slugs = [];
  for (const entry of await readdir(recipesDir, { withFileTypes: true })) {
    if (entry.isDirectory() && (await readFile(join(recipesDir, entry.name, "index.html"), "utf8")).includes("data-recipe-card")) {
      slugs.push(entry.name);
    }
  }

  const server = await serve();
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: CHROME });
  const problems = [];

  try {
    for (const slug of slugs) {
      // Scale so the 152.4 mm (6 in) card comes out exactly 1800 px wide
      const cardCssWidth = (152.4 / 25.4) * 96;
      const page = await browser.newPage({ deviceScaleFactor: PHOTO_WIDTH / cardCssWidth });
      await page.goto(`${base}/recipes/${slug}/`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => document.body.classList.add("printing-card"));
      const tooLong = await page.evaluate(() => window.fitRecipeCard());
      if (tooLong.length) problems.push(`${slug}: card ${tooLong.join(" and ")} too long, even at the smallest text size`);

      for (const side of ["front", "back"]) {
        await page.locator(`[data-card-face="${side}"]`).screenshot({
          path: join(recipesDir, slug, `card-${side}.jpg`), type: "jpeg", quality: 92,
        });
      }
      await page.close();
      console.log(`[cards] ${slug}: card-front.jpg, card-back.jpg`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (problems.length) {
    console.warn("[cards] These cards need shortening (or splitting onto two cards):\n  - " + problems.join("\n  - "));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
