const sharp = require("sharp");
const https = require("https");
const fs = require("fs");
const path = require("path");

const SOURCE_URL = "https://d22rebqllszdz8.cloudfront.net/sample-images/de9556f933054604.webp";
const TEMP_SRC = "scratch/source_favicon_latest.webp";

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log("Downloading from", SOURCE_URL);
  await download(SOURCE_URL, TEMP_SRC);
  console.log("Downloaded source image.");

  const { data, info } = await sharp(TEMP_SRC)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const cx = width / 2;
  const cy = height / 2;

  // 1. Filter out the red outer circle (radius > 385px from center) and replace with pure white #ffffff
  const cleanBuffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx3 = (y * width + x) * channels;
      const idx4 = (y * width + x) * 4;
      const r = data[idx3], g = data[idx3 + 1], b = data[idx3 + 2];
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      if (dist > 380) {
        // Outside the red ring -> pure white
        cleanBuffer[idx4] = 255;
        cleanBuffer[idx4 + 1] = 255;
        cleanBuffer[idx4 + 2] = 255;
        cleanBuffer[idx4 + 3] = 255;
      } else {
        cleanBuffer[idx4] = r;
        cleanBuffer[idx4 + 1] = g;
        cleanBuffer[idx4 + 2] = b;
        cleanBuffer[idx4 + 3] = 255;
      }
    }
  }

  // 2. Find exact bounding box of the inner logo content (non-white pixels)
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = cleanBuffer[idx], g = cleanBuffer[idx + 1], b = cleanBuffer[idx + 2];
      // Non-white pixel
      if (r < 235 || g < 235 || b < 235) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log("Logo bbox:", { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY });

  // Add clean symmetrical padding around the logo
  const pad = 40;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, (maxX - minX) + pad * 2);
  const cropH = Math.min(height - cropY, (maxY - minY) + pad * 2);

  const croppedPng = await sharp(cleanBuffer, { raw: { width, height, channels: 4 } })
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .png()
    .toBuffer();

  // Create a square master canvas with pure white background
  const masterSize = Math.max(cropW, cropH) + 60;
  const masterPng = await sharp({
    create: {
      width: masterSize,
      height: masterSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{ input: croppedPng, gravity: "center" }])
  .png()
  .toBuffer();

  console.log("Master icon created, size:", masterSize, "x", masterSize);

  // 3. Generate all sizes and outputs
  const SIZES = [16, 32, 48, 72, 96, 120, 128, 144, 152, 180, 192, 256, 384, 512];
  const ICONS_DIR = path.join(__dirname, "../public/icons");
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  for (const s of SIZES) {
    const dest = path.join(ICONS_DIR, `icon-${s}x${s}.png`);
    await sharp(masterPng)
      .resize(s, s, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(dest);
    console.log("Wrote", dest);
  }

  // app/icon.png (Used by Next.js metadata)
  await sharp(masterPng)
    .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, "../app/icon.png"));
  console.log("Wrote app/icon.png");

  // public/apple-touch-icon.png
  await sharp(masterPng)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, "../public/apple-touch-icon.png"));
  console.log("Wrote public/apple-touch-icon.png");

  // public/favicon.ico
  await sharp(masterPng)
    .resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, "../public/favicon.ico"));
  console.log("Wrote public/favicon.ico");

  console.log("ALL ICONS SUCCESSFULLY GENERATED WITHOUT RED LINES ON CLEAN WHITE BACKGROUND!");
}

run().catch(console.error);
