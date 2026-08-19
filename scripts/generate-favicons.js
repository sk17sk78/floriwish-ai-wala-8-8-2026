const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
  const publicDir = path.join(__dirname, '..', 'public');
  const iconsDir = path.join(publicDir, 'icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgBuffer = fs.readFileSync(svgPath);

  const sizes = [
    16, 32, 48, 72, 96, 120, 128, 144, 152, 180, 192, 256, 384, 512
  ];

  console.log('Generating crisp PNG icons from SVG...');

  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon.png in public root
  const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(appleTouchPath);
  console.log('Generated apple-touch-icon.png');

  // Generate favicon.ico (32x32 standard PNG format inside ico or 32x32 png)
  const faviconIcoPath = path.join(publicDir, 'favicon.ico');
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFormat('png')
    .toFile(faviconIcoPath);
  console.log('Generated favicon.ico');

  // Maskable icons
  const maskable192 = path.join(iconsDir, 'icon-maskable-192x192.png');
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(maskable192);

  const maskable512 = path.join(iconsDir, 'icon-maskable-512x512.png');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(maskable512);

  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
