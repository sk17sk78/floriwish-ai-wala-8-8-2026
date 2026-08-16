const sharp = require("sharp");
const path = require("path");

async function verifyPandaTop() {
  const inputPath = path.join(process.cwd(), "public", "images", "404-panda.png");
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;

  console.log("Image dimensions:", info.width, "x", info.height);

  let visibleInTop25 = 0;
  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 20) {
        visibleInTop25++;
      }
    }
  }

  console.log("Visible pixels in top 25 rows:", visibleInTop25);
  // Scan row by row where ears actually start
  for (let y = 0; y < 60; y += 5) {
    let count = 0;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 20) count++;
    }
    console.log(`Row y=${y}: ${count} visible pixels`);
  }
}

verifyPandaTop();
