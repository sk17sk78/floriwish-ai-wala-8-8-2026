const sharp = require("sharp");
const path = require("path");

async function createFullPanda() {
  const inputPath = path.join(process.cwd(), "public", "images", "404-original.jpg");
  const outputPathPng = path.join(process.cwd(), "public", "images", "404-panda.png");
  const outputPathWebp = path.join(process.cwd(), "public", "images", "404-panda.webp");

  // Full panda region with generous margins:
  // Top: 270px (well above flower and ears)
  // Height: 580px (well below all petals)
  // Left: 0px (full width 768)
  const extracted = await sharp(inputPath)
    .extract({
      left: 0,
      top: 270,
      width: 768,
      height: 580
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = extracted;
  const len = data.length;

  // Make background transparent (pixels that are near #f7f7f7 / #ffffff)
  // But preserve the black panda, brown flower, and red petals with high fidelity
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is background (near #f7f7f7 or off-white)
    if (r >= 235 && g >= 235 && b >= 235) {
      const minVal = Math.min(r, g, b);
      if (minVal >= 246) {
        data[i + 3] = 0; // Fully transparent
      } else {
        // Smooth feathered alpha edge
        data[i + 3] = Math.round(((246 - minVal) / 11) * 255);
      }
    }
  }

  // Save PNG
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png({ quality: 100 })
    .toFile(outputPathPng);

  // Save WebP
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .webp({ quality: 95 })
    .toFile(outputPathWebp);

  console.log("✅ Fixed 404 Panda with full margins saved successfully!");
}

createFullPanda().catch(console.error);
