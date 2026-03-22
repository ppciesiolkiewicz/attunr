import { chromium } from "playwright";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import sharp from "sharp";

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

  // Generate favicon.ico (ICO format: BMP header + raw pixel data)
  const icoSizes = [48, 32];
  const images = [];
  for (const s of icoSizes) {
    const buf = await sharp(path.join(publicDir, `favicon-${s}.png`))
      .resize(s, s)
      .raw()
      .toBuffer();
    images.push({ size: s, data: buf });
  }

  // Build ICO file
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = images.length;
  const bmpHeaders = images.map(({ size }) => 40 + size * size * 4);
  let offset = headerSize + dirEntrySize * numImages;

  const parts = [];
  // ICO header
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(numImages, 4);
  parts.push(header);

  // Directory entries
  const bmpDataBuffers = [];
  for (let i = 0; i < numImages; i++) {
    const { size, data } = images[i];
    const bmpSize = bmpHeaders[i];
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size < 256 ? size : 0, 0);
    entry.writeUInt8(size < 256 ? size : 0, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(bmpSize, 8); // data size
    entry.writeUInt32LE(offset, 12); // offset
    parts.push(entry);
    offset += bmpSize;

    // BMP info header (BITMAPINFOHEADER) + pixel data (bottom-up, BGRA)
    const bmpHeader = Buffer.alloc(40);
    bmpHeader.writeUInt32LE(40, 0); // header size
    bmpHeader.writeInt32LE(size, 4); // width
    bmpHeader.writeInt32LE(size * 2, 8); // height (doubled for ICO)
    bmpHeader.writeUInt16LE(1, 12); // planes
    bmpHeader.writeUInt16LE(32, 14); // bpp
    bmpHeader.writeUInt32LE(0, 20); // image size (can be 0)

    // Convert RGBA top-down to BGRA bottom-up
    const pixels = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcIdx = (y * size + x) * 4;
        const dstIdx = ((size - 1 - y) * size + x) * 4;
        pixels[dstIdx + 0] = data[srcIdx + 2]; // B
        pixels[dstIdx + 1] = data[srcIdx + 1]; // G
        pixels[dstIdx + 2] = data[srcIdx + 0]; // R
        pixels[dstIdx + 3] = data[srcIdx + 3]; // A
      }
    }

    bmpDataBuffers.push(Buffer.concat([bmpHeader, pixels]));
  }

  parts.push(...bmpDataBuffers);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), Buffer.concat(parts));
  console.log("Generated favicon.ico");

  // Clean up intermediate files
  for (const tmp of ["favicon-48.png", "favicon-32.png"]) {
    fs.unlinkSync(path.join(publicDir, tmp));
  }
}

main().catch(console.error);
