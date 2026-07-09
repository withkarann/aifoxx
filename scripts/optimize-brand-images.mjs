// Generates the small committed brand assets from the local source logo.
// Run manually when the brand logo changes: `node scripts/optimize-brand-images.mjs`.
// Not part of the production build.
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
// Prefer the high-res local source; fall back to the shipped icon.
let source;
try {
  source = readFileSync(resolve(root, ".scratch/brand-src/aifoxx-source.png"));
} catch {
  source = readFileSync(resolve(root, "public/aifoxx.png"));
}

// 1) App/hero/apple-touch icon: 256x256, transparent, compressed.
await sharp(source)
  .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ quality: 90, compressionLevel: 9, palette: true })
  .toFile(resolve(root, "public/aifoxx.png"));

// 2) Social card: 1200x630, logo centered on the brand background.
const BG = { r: 10, g: 10, b: 12, alpha: 1 }; // near-black brand background
const logo = await sharp(source)
  .resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: BG } })
  .composite([{ input: logo, gravity: "centre" }])
  .png({ quality: 90, compressionLevel: 9 })
  .toFile(resolve(root, "public/og.png"));

console.log("brand images written: public/aifoxx.png, public/og.png");
