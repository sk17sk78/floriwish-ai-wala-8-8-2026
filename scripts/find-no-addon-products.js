require('dotenv').config();
const mongoose = require('mongoose');

async function findProductsWithoutAddons() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define a minimal schema for Content
    const ContentSchema = new mongoose.Schema({
      name: String,
      slug: String,
      type: String,
      addons: Array,
      isActive: Boolean
    });

    const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

    const products = await Content.find({
      type: 'product',
      isActive: true,
      $or: [
        { addons: { $exists: false } },
        { addons: { $size: 0 } },
        { addons: null }
      ]
    }).select('name slug');

    console.log(`\n📦 Found ${products.length} products without add-ons:\n`);
    
    if (products.length === 0) {
      console.log('All active products have add-ons.');
    } else {
      products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   URL: /product/${p.slug}`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findProductsWithoutAddons();
