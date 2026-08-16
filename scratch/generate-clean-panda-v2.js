const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function generateCleanPanda() {
  const inputPath = path.join(process.cwd(), "public", "images", "404-original.jpg");
  const outputPathPng = path.join(process.cwd(), "public", "images", "floriwish-404-panda.png");
  const outputPathWebp = path.join(process.cwd(), "public", "images", "floriwish-404-panda.webp");

  // In 404-original.jpg (768x1024):
  // Let's crop from top: 345 to height: 510, width: 768, left: 0
  // Top 345 is safely below the text "The page you're looking for..." which ends at y=330.
  const extracted = await sharp(inputPath)
    .extract({
      left: 0,
      top: 345,
      width: 768,
      height: 510
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = extracted;
  const width = info.width;
  const height = info.height;

  // Make background transparent
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Top 10 rows: wipe out any stray pixel
      if (y < 10) {
        data[idx + 3] = 0;
        continue;
      }

      // If background color (near #f7f7f7 / white / light gray)
      if (r >= 235 && g >= 235 && b >= 235) {
        const minVal = Math.min(r, g, b);
        if (minVal >= 244) {
          data[idx + 3] = 0; // 100% Transparent background
        } else {
          data[idx + 3] = Math.round(((244 - minVal) / 9) * 255);
        }
      }
    }
  }

  // Save clean PNG
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png({ quality: 100 })
    .toFile(outputPathPng);

  // Also overwrite 404-panda.png
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png({ quality: 100 })
    .toFile(path.join(process.cwd(), "public", "images", "404-panda.png"));

  // Save clean WebP
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .webp({ quality: 95 })
    .toFile(outputPathWebp);

  console.log("✅ Created brand new floriwish-404-panda.png with ZERO text!");
}

generateCleanPanda().catch(console.error);
