#!/usr/bin/env node

/**
 * Migration Script: Convert S3 URLs to CloudFront URLs in Database
 * 
 * This script updates all image URLs in the database from direct S3 URLs
 * to CloudFront CDN URLs for better performance.
 * 
 * Usage: node scripts/migrate-urls-to-cloudfront.js [--dry-run]
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL || 'https://d22rebqllszdz8.cloudfront.net';
const S3_BUCKET_URL = 'https://floriwish-media-bucket.s3.ap-south-1.amazonaws.com';

// Check for dry-run mode
const isDryRun = process.argv.includes('--dry-run');

console.log('🔄 CloudFront URL Migration Script');
console.log('═══════════════════════════════════════════════════════\n');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No changes will be made\n');
} else {
  console.log('⚠️  LIVE MODE - Database will be updated\n');
}

console.log(`S3 Bucket URL: ${S3_BUCKET_URL}`);
console.log(`CloudFront URL: ${CLOUDFRONT_URL}\n`);

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

// Convert S3 URL to CloudFront URL
function convertUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  if (url.includes(S3_BUCKET_URL)) {
    return url.replace(S3_BUCKET_URL, CLOUDFRONT_URL);
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
    let urlsConverted = 0;
    
    for (const doc of documents) {
      let hasChanges = false;
      const updates = {};
      
      // Check each URL field
      for (const field of urlFields) {
        const value = getNestedValue(doc, field);
        
        if (value) {
          if (Array.isArray(value)) {
            // Handle array of URLs or objects with URLs
            const converted = value.map(item => {
              if (typeof item === 'string') {
                const newUrl = convertUrl(item);
                if (newUrl !== item) {
                  urlsConverted++;
                  hasChanges = true;
                }
                return newUrl;
              } else if (item && item.url) {
                const newUrl = convertUrl(item.url);
                if (newUrl !== item.url) {
                  urlsConverted++;
                  hasChanges = true;
                  return { ...item, url: newUrl };
                }
              }
              return item;
            });
            
            if (hasChanges) {
              setNestedValue(updates, field, converted);
            }
          } else if (typeof value === 'string') {
            // Handle single URL string
            const newUrl = convertUrl(value);
            if (newUrl !== value) {
              urlsConverted++;
              hasChanges = true;
              setNestedValue(updates, field, newUrl);
            }
          } else if (value.url) {
            // Handle object with url property
            const newUrl = convertUrl(value.url);
            if (newUrl !== value.url) {
              urlsConverted++;
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
    
    console.log(`   ✅ Updated ${updatedCount} documents`);
    console.log(`   🔗 Converted ${urlsConverted} URLs`);
    
    return { documents: documents.length, updated: updatedCount, urls: urlsConverted };
  } catch (error) {
    console.error(`   ❌ Error processing ${collectionName}:`, error.message);
    return { documents: 0, updated: 0, urls: 0 };
  }
}

// Helper: Get nested object value
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper: Set nested object value
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Main migration function
async function migrate() {
  await connectDB();
  
  const stats = {
    totalDocuments: 0,
    totalUpdated: 0,
    totalUrls: 0
  };
  
  // Define collections and their URL fields to update
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
  console.log('📊 Migration Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total documents scanned: ${stats.totalDocuments}`);
  console.log(`Total documents updated: ${stats.totalUpdated}`);
  console.log(`Total URLs converted: ${stats.totalUrls}`);
  
  if (isDryRun) {
    console.log('\n🔍 This was a DRY RUN - no changes were made');
    console.log('   Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Migration completed successfully!');
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
  
  await mongoose.connection.close();
  console.log('✅ Database connection closed\n');
}

// Run migration
migrate().catch(error => {
  console.error('\n❌ Migration failed at top level:');
  console.error(error);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
