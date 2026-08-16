const sharp = require("sharp");
const path = require("path");

async function createTransparentPanda() {
  const inputPath = path.join(process.cwd(), "public", "images", "404-original.jpg");
  const outputPath = path.join(process.cwd(), "public", "images", "404-panda.png");
  const outputWebp = path.join(process.cwd(), "public", "images", "404-panda.webp");

  // Extract region: x: 80, y: 340, w: 608, h: 480
  const extracted = await sharp(inputPath)
    .extract({
      left: 80,
      top: 340,
      width: 608,
      height: 480
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = extracted;
  const len = data.length;

  // Process alpha: if color is close to #f7f7f7 / #ffffff at the border, make it transparent
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // If near white / #f7f7f7
    if (r > 240 && g > 240 && b > 240) {
      // Calculate how close to 255
      const minVal = Math.min(r, g, b);
      if (minVal >= 248) {
        data[i + 3] = 0; // Fully transparent
      } else {
        // Smooth transition
        data[i + 3] = Math.round((248 - minVal) / 8 * 255);
      }
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .toFile(outputPath);

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .webp({ quality: 95 })
    .toFile(outputWebp);

  console.log("✅ Transparent 404 Panda created successfully!");
}

createTransparentPanda().catch(console.error);
