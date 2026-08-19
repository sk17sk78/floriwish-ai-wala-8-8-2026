const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const url = 'https://d22rebqllszdz8.cloudfront.net/sample-images/ace31640a51e4dcf.webp';
const rootDir = path.resolve(__dirname, '..');

const download = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      return reject(new Error(`Failed to download image, status code: ${res.statusCode}`));
    }
    const data = [];
    res.on('data', chunk => data.push(chunk));
    res.on('end', () => resolve(Buffer.concat(data)));
  }).on('error', reject);
});

async function run() {
  console.log('Downloading image from:', url);
  const buffer = await download(url);
  console.log('Downloaded image buffer size:', buffer.length);

  // Save source webp
  fs.writeFileSync(path.join(rootDir, 'public/favicon-source.webp'), buffer);

  // 1. app/icon.png (with transparency preserved)
  await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(rootDir, 'app/icon.png'));
  console.log('Generated app/icon.png');

  // 2. public/apple-touch-icon.png (with transparency preserved)
  await sharp(buffer)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(path.join(rootDir, 'public/apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png');

  // 3. public/favicon.ico (32x32 transparent PNG format)
  const png32 = await sharp(buffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(rootDir, 'public/favicon.ico'), png32);
  console.log('Generated public/favicon.ico');

  // 4. public/icons sizes (all with alpha transparency)
  const sizes = [16, 32, 72, 96, 120, 128, 144, 152, 180, 192, 384, 512];
  for (const size of sizes) {
    await sharp(buffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(rootDir, `public/icons/icon-${size}x${size}.png`));
    console.log(`Generated public/icons/icon-${size}x${size}.png`);
  }

  // Maskable icons
  await sharp(buffer)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(rootDir, 'public/icons/icon-maskable-192x192.png'));
  await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(rootDir, 'public/icons/icon-maskable-512x512.png'));

  console.log('All transparent icons generated successfully!');
}

run().catch(err => {
  console.error('Error generating transparent icons:', err);
  process.exit(1);
});
