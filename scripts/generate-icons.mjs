import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "generate-icons.html");
const publicDir = path.join(__dirname, "..", "public");

const sizes = [
  { name: "web-app-manifest-512x512.png", size: 512 },
  { name: "web-app-manifest-192x192.png", size: 192 },
];

async function main() {
  const browser = await chromium.launch();

  for (const { name, size } of sizes) {
    const page = await browser.newPage({
      viewport: { width: size + 40, height: size + 40 },
      deviceScaleFactor: 1,
    });
    await page.goto(`file://${htmlPath}`);

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

  await browser.close();
}

main().catch(console.error);
