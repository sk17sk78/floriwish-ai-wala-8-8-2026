const sharp = require("sharp");
const path = require("path");

async function checkBg() {
  const inputPath = path.join(process.cwd(), "public", "images", "404-original.jpg");
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  // check top left pixel (0,0)
  const r = data[0], g = data[1], b = data[2];
  console.log("Top-left pixel RGB:", r, g, b, `hex: #${r.toString(16)}${g.toString(16)}${b.toString(16)}`);
}

checkBg();
