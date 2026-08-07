
const mongoose = require('mongoose');
require('dotenv').config();

// Define a minimal schema for testing
const TopicSchema = new mongoose.Schema({}, { strict: false });
const Topic = mongoose.models.Topic || mongoose.model('Topic', TopicSchema, 'topics');

async function checkTopics() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const topics = await Topic.find({});
        console.log(`Found ${topics.length} topics`);

        for (const topic of topics) {
            console.log(`Topic: ${topic.name}`);
            if (topic.media && topic.media.quickLinks) {
                console.log('Quick Links:');
                topic.media.quickLinks.forEach(img => {
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

checkTopics();
