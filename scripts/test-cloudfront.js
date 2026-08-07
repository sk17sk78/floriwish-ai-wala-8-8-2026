#!/usr/bin/env node

/**
 * CloudFront Configuration Test Script
 * 
 * This script validates your CloudFront setup and helps diagnose issues.
 */

require('dotenv').config();

const { CloudFrontClient, GetDistributionCommand } = require('@aws-sdk/client-cloudfront');

console.log('🔍 Testing CloudFront Configuration...\n');

// Check environment variables
console.log('Step 1: Checking environment variables...');
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const distributionId = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID;
const enabled = process.env.ENABLE_CLOUDFRONT_INVALIDATION;

console.log(`  AWS_REGION: ${region ? '✅ Set' : '❌ Missing'}`);
console.log(`  AWS_ACCESS_KEY_ID: ${accessKeyId ? '✅ Set' : '❌ Missing'}`);
console.log(`  AWS_SECRET_ACCESS_KEY: ${secretAccessKey ? '✅ Set' : '❌ Missing'}`);
console.log(`  AWS_CLOUDFRONT_DISTRIBUTION_ID: ${distributionId || '❌ Missing'}`);
console.log(`  ENABLE_CLOUDFRONT_INVALIDATION: ${enabled || 'false (default)'}\n`);

// Check if CloudFront is enabled
if (enabled !== 'true') {
  console.log('ℹ️  CloudFront invalidation is DISABLED');
  console.log('   To enable, set ENABLE_CLOUDFRONT_INVALIDATION=true in .env\n');
  process.exit(0);
}

// Validate required variables
if (!region || !accessKeyId || !secretAccessKey) {
  console.log('❌ Missing required AWS credentials');
  console.log('   Please set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY\n');
  process.exit(1);
}

if (!distributionId) {
  console.log('❌ Missing AWS_CLOUDFRONT_DISTRIBUTION_ID');
  console.log('   Please set your CloudFront distribution ID in .env\n');
  process.exit(1);
}

// Validate distribution ID format
console.log('Step 2: Validating distribution ID format...');
if (!/^E[A-Z0-9]+$/i.test(distributionId)) {
  console.log(`❌ Invalid distribution ID format: ${distributionId}`);
  console.log('   Distribution IDs should start with "E" followed by alphanumeric characters');
  console.log('   Example: E3GZ7EXE92VRTW\n');
  process.exit(1);
}
console.log(`✅ Distribution ID format is valid: ${distributionId}\n`);

// Test CloudFront connection
console.log('Step 3: Testing CloudFront connection...');

const client = new CloudFrontClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

async function testConnection() {
  try {
    const command = new GetDistributionCommand({
      Id: distributionId
    });

    const response = await client.send(command);
    
    console.log('✅ Successfully connected to CloudFront!');
    console.log(`   Distribution Status: ${response.Distribution.Status}`);
    console.log(`   Domain Name: ${response.Distribution.DomainName}`);
    console.log(`   Enabled: ${response.Distribution.DistributionConfig.Enabled}`);
    
    if (response.Distribution.Status !== 'Deployed') {
      console.log('\n⚠️  WARNING: Distribution is not fully deployed yet');
      console.log('   Wait for deployment to complete before using invalidation');
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ CloudFront is properly configured!');
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.log('❌ CloudFront connection failed\n');
    
    if (error.name === 'NoSuchDistribution') {
      console.log('Error: Distribution does not exist');
      console.log(`  Distribution ID: ${distributionId}`);
      console.log('\nPossible causes:');
      console.log('  1. Distribution ID is incorrect');
      console.log('  2. Distribution was deleted');
      console.log('  3. Distribution is in a different AWS account');
      console.log('\nSolutions:');
      console.log('  1. Verify distribution ID in AWS Console');
      console.log('  2. Check you\'re using the correct AWS account');
      console.log('  3. Set ENABLE_CLOUDFRONT_INVALIDATION=false to disable\n');
      
    } else if (error.name === 'AccessDenied') {
      console.log('Error: Access denied');
      console.log('\nYour IAM user needs these permissions:');
      console.log('  - cloudfront:GetDistribution');
      console.log('  - cloudfront:CreateInvalidation');
      console.log('\nAdd this IAM policy to your user:');
      console.log(JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Allow",
          "Action": [
            "cloudfront:GetDistribution",
            "cloudfront:CreateInvalidation",
            "cloudfront:GetInvalidation"
          ],
          "Resource": `arn:aws:cloudfront::*:distribution/${distributionId}`
        }]
      }, null, 2));
      console.log();
      
    } else if (error.name === 'InvalidClientTokenId') {
      console.log('Error: Invalid AWS credentials');
      console.log('  Check your AWS_ACCESS_KEY_ID\n');
      
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('Error: Invalid AWS secret key');
      console.log('  Check your AWS_SECRET_ACCESS_KEY\n');
      
    } else {
      console.log(`Error: ${error.name || 'Unknown'}`);
      console.log(`Message: ${error.message}\n`);
    }
    
    process.exit(1);
  }
}

testConnection();
