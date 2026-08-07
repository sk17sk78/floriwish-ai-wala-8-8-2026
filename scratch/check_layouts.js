
const mongoose = require('mongoose');
require('dotenv').config();

// Define a minimal schema for testing
const HomepageLayoutSchema = new mongoose.Schema({}, { strict: false });
const HomepageLayout = mongoose.models.HomepageLayout || mongoose.model('HomepageLayout', HomepageLayoutSchema, 'homepagelayouts');

async function checkLayouts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const layouts = await HomepageLayout.find({ type: 'category' });
        console.log(`Found ${layouts.length} category layouts`);

        for (const layout of layouts) {
            console.log(`Layout Title: ${layout.title}`);
            if (layout.layout && layout.layout.category && layout.layout.category.images) {
                console.log('Images:');
                layout.layout.category.images.forEach(img => {
                    console.log(`  - Label: ${img.label}, Path: ${img.path}, ImageId: ${img.image}`);
                });
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkLayouts();
