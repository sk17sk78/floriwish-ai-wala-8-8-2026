const sharp = require("sharp");
const path = require("path");

async function cleanPandaImage() {
  const inputPath = path.join(process.cwd(), "public", "images", "404-original.jpg");
  const outputPathPng = path.join(process.cwd(), "public", "images", "404-panda.png");
  const outputPathWebp = path.join(process.cwd(), "public", "images", "404-panda.webp");

  // In 404-original.jpg (768x1024):
  // Let's crop from top: 335 down to 855 (height: 520, width: 768, left: 0)
  // Let's inspect the raw pixels
  const extracted = await sharp(inputPath)
    .extract({
      left: 0,
      top: 335,
      width: 768,
      height: 520
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = extracted;
  const width = info.width;
  const height = info.height;

  // 1. Any pixels in the top 20px (y < 20) where text remnants might exist,
  // check if it's text (gray/dark text on off-white background) outside the panda's ears.
  // The panda's ears are roughly between x=230 and x=530, and y > 15 (relative to 335).
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // If y < 20 (i.e. original y < 355), if it's text outside the top of the ear, make it transparent
      if (y < 16) {
        data[idx + 3] = 0; // completely wipe out top 16px to ensure zero text remnants
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

  console.log("✅ Clean panda (ZERO text artifacts) created successfully!");
}

cleanPandaImage().catch(console.error);
