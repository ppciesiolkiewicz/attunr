import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const icons = [
  // Full "attunr" text icons
  {
    html: path.join(__dirname, "generate-icons.html"),
    outputs: [
      { name: "web-app-manifest-512x512.png", size: 512 },
      { name: "web-app-manifest-192x192.png", size: 192 },
      { name: "apple-touch-icon.png", size: 180 },
    ],
  },
  // Single "a" favicon icons
  {
    html: path.join(__dirname, "generate-favicon.html"),
    outputs: [
      { name: "favicon-96x96.png", size: 96 },
      { name: "favicon-48.png", size: 48 },
      { name: "favicon-32.png", size: 32 },
    ],
  },
];

async function main() {
  const browser = await chromium.launch();

  for (const { html, outputs } of icons) {
    for (const { name, size } of outputs) {
      const page = await browser.newPage({
        viewport: { width: size + 40, height: size + 40 },
        deviceScaleFactor: 1,
      });
      await page.goto(`file://${html}`);
      await page.evaluate(() => document.fonts.ready);

      await page.evaluate((s) => {
        document.getElementById("icon").style.setProperty("--size", `${s}px`);
      }, size);

      await page.locator("#icon").screenshot({
        path: path.join(publicDir, name),
        omitBackground: true,
      });

      console.log(`Generated ${name} (${size}x${size})`);
      await page.close();
    }
  }

  await browser.close();

  // Generate favicon.ico from the 48px and 32px PNGs
  try {
    execSync(
      `convert ${path.join(publicDir, "favicon-32.png")} ${path.join(publicDir, "favicon-48.png")} ${path.join(publicDir, "favicon.ico")}`,
    );
    console.log("Generated favicon.ico");
  } catch {
    console.warn(
      "Skipped favicon.ico generation (ImageMagick not installed). Install with: brew install imagemagick",
    );
  }

  // Clean up intermediate files
  for (const tmp of ["favicon-48.png", "favicon-32.png"]) {
    try {
      (await import("fs")).unlinkSync(path.join(publicDir, tmp));
    } catch {}
  }
}

main().catch(console.error);
