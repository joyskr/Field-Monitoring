/**
 * Generates PWA icons (192x192 and 512x512 PNG) from public/icons/icon.svg
 * Run once: node scripts/generate-icons.mjs
 * Requires: npm install --save-dev sharp
 */

import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "icons", "icon.svg");
const svgBuffer = readFileSync(svgPath);

const sizes = [192, 512];

for (const size of sizes) {
  const out = join(root, "public", "icons", `icon-${size}.png`);
  await sharp(svgBuffer).resize(size, size).png().toFile(out);
  console.log(`✓ Generated ${out}`);
}
