#!/usr/bin/env node

/**
 * ROLLBACK Script: Convert CloudFront URLs back to S3 URLs
 * 
 * This script reverses the CloudFront migration and restores S3 URLs
 * 
 * Usage: node scripts/rollback-cloudfront-urls.js [--dry-run]
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDFRONT_URL = 'https://d22rebqllszdz8.cloudfront.net';
const S3_BUCKET_URL = 'https://floriwish-media-bucket.s3.ap-south-1.amazonaws.com';

// Check for dry-run mode
const isDryRun = process.argv.includes('--dry-run');

console.log('🔄 CloudFront URL ROLLBACK Script');
console.log('═══════════════════════════════════════════════════════\n');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No changes will be made\n');
} else {
  console.log('⚠️  LIVE MODE - URLs will be reverted to S3\n');
}

console.log(`CloudFront URL: ${CLOUDFRONT_URL}`);
console.log(`S3 Bucket URL: ${S3_BUCKET_URL}\n`);

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Convert CloudFront URL back to S3 URL
function revertUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  if (url.includes(CLOUDFRONT_URL)) {
    return url.replace(CLOUDFRONT_URL, S3_BUCKET_URL);
  }
  
  return url;
}

// Update URLs in a collection
async function updateCollection(collectionName, urlFields) {
  console.log(`\n📦 Processing collection: ${collectionName}`);
  console.log('─────────────────────────────────────────────────────');
  
  try {
    const collection = mongoose.connection.collection(collectionName);
    const documents = await collection.find({}).toArray();
    
    console.log(`   Found ${documents.length} documents`);
    
    let updatedCount = 0;
    let urlsReverted = 0;
    
    for (const doc of documents) {
      let hasChanges = false;
      const updates = {};
      
      // Check each URL field
      for (const field of urlFields) {
        const value = getNestedValue(doc, field);
        
        if (value) {
          if (Array.isArray(value)) {
            const reverted = value.map(item => {
              if (typeof item === 'string') {
                const newUrl = revertUrl(item);
                if (newUrl !== item) {
                  urlsReverted++;
                  hasChanges = true;
                }
                return newUrl;
              } else if (item && item.url) {
                const newUrl = revertUrl(item.url);
                if (newUrl !== item.url) {
                  urlsReverted++;
                  hasChanges = true;
                  return { ...item, url: newUrl };
                }
              }
              return item;
            });
            
            if (hasChanges) {
              setNestedValue(updates, field, reverted);
            }
          } else if (typeof value === 'string') {
            const newUrl = revertUrl(value);
            if (newUrl !== value) {
              urlsReverted++;
              hasChanges = true;
              setNestedValue(updates, field, newUrl);
            }
          } else if (value.url) {
            const newUrl = revertUrl(value.url);
            if (newUrl !== value.url) {
              urlsReverted++;
              hasChanges = true;
              setNestedValue(updates, `${field}.url`, newUrl);
            }
          }
        }
      }
      
      // Update document if changes found
      if (hasChanges && !isDryRun) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: updates }
        );
        updatedCount++;
      } else if (hasChanges && isDryRun) {
        updatedCount++;
      }
    }
    
    console.log(`   ✅ Reverted ${updatedCount} documents`);
    console.log(`   🔗 Reverted ${urlsReverted} URLs back to S3`);
    
    return { documents: documents.length, updated: updatedCount, urls: urlsReverted };
  } catch (error) {
    console.error(`   ❌ Error processing ${collectionName}:`, error.message);
    return { documents: 0, updated: 0, urls: 0 };
  }
}

// Helper functions
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Main rollback function
async function rollback() {
  await connectDB();
  
  const stats = {
    totalDocuments: 0,
    totalUpdated: 0,
    totalUrls: 0
  };
  
  // Define collections and their URL fields
  const collections = [
    {
      name: 'images',
      fields: ['url']
    },
    {
      name: 'contents',
      fields: ['media.primary.url', 'media.gallery', 'media.review']
    },
    {
      name: 'contentcategories',
      fields: ['media.icon.url', 'media.banner.url']
    },
    {
      name: 'blogarticles',
      fields: ['media.thumbnail.url', 'media.banner.url']
    },
    {
      name: 'dynamicpages',
      fields: ['media.banner.url']
    },
    {
      name: 'customizationimages',
      fields: ['url']
    }
  ];
  
  // Process each collection
  for (const { name, fields } of collections) {
    const result = await updateCollection(name, fields);
    stats.totalDocuments += result.documents;
    stats.totalUpdated += result.updated;
    stats.totalUrls += result.urls;
  }
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 Rollback Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total documents scanned: ${stats.totalDocuments}`);
  console.log(`Total documents reverted: ${stats.totalUpdated}`);
  console.log(`Total URLs reverted to S3: ${stats.totalUrls}`);
  
  if (isDryRun) {
    console.log('\n🔍 This was a DRY RUN - no changes were made');
    console.log('   Run without --dry-run to apply rollback');
  } else {
    console.log('\n✅ Rollback completed successfully!');
    console.log('   All URLs have been reverted to S3');
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
  
  await mongoose.connection.close();
  console.log('✅ Database connection closed\n');
}

// Run rollback
rollback().catch(error => {
  console.error('\n❌ Rollback failed:', error);
  process.exit(1);
});
