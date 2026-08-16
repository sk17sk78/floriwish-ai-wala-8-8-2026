const sharp = require("sharp");
const path = require("path");

async function processImage() {
  const inputPath = path.join(process.cwd(), "public", "images", "404-original.jpg");
  const outputPath = path.join(process.cwd(), "public", "images", "404-panda.png");
  const outputWebp = path.join(process.cwd(), "public", "images", "404-panda.webp");

  // Metadata
  const meta = await sharp(inputPath).metadata();
  console.log("Original Image metadata:", meta.width, "x", meta.height);

  // The panda character with wilted rose and petals sits in the region roughly:
  // Top: 330px, Height: 500px, Left: 100px, Width: 568px
  await sharp(inputPath)
    .extract({
      left: 100,
      top: 330,
      width: 568,
      height: 500
    })
    .png()
    .toFile(outputPath);

  await sharp(inputPath)
    .extract({
      left: 100,
      top: 330,
      width: 568,
      height: 500
    })
    .webp({ quality: 90 })
    .toFile(outputWebp);

  console.log("✅ 404 Panda cropped successfully to:", outputPath, "and", outputWebp);
}

processImage().catch(console.error);
