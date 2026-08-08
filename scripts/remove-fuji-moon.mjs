import sharp from "sharp";
import fs from "fs";

const input = "public/images/fuji-night.jpg";
const backup = "public/images/fuji-night-original.jpg";
const tmp = "public/images/fuji-night-tmp.jpg";

if (!fs.existsSync(backup)) {
  fs.copyFileSync(input, backup);
}

const source = backup;
const meta = await sharp(source).metadata();
const w = meta.width;
const h = meta.height;
const cx = Math.round(0.2186 * w);
const cy = Math.round(0.4251 * h);
const r = Math.round(0.155 * w);

const sampleLeft = Math.max(0, cx - r - 30);
const sampleTop = Math.max(0, cy - 20);
const sample = await sharp(source)
  .extract({ left: sampleLeft, top: sampleTop, width: 20, height: 20 })
  .resize(1, 1)
  .raw()
  .toBuffer();

const [sr, sg, sb] = sample;
const sky = `rgb(${sr},${sg},${sb})`;
const radius = Math.round(r * 1.4);

const svg = Buffer.from(`
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${sky}" stop-opacity="1"/>
      <stop offset="58%" stop-color="${sky}" stop-opacity="0.97"/>
      <stop offset="100%" stop-color="${sky}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="url(#g)"/>
</svg>`);

await sharp(source)
  .composite([{ input: svg, top: 0, left: 0 }])
  .jpeg({ quality: 92 })
  .toFile(tmp);

fs.renameSync(tmp, input);
console.log("patched moon out", { w, h, cx, cy, r, sky });
