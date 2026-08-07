/**
 * MongoDB Backup Utility for FloriWish
 * Exports all collections to MongoDB Extended JSON format and packages them in a ZIP archive.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Color helpers for beautiful CLI output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Convert MongoDB types (ObjectId, Date) to Standard Extended JSON format
function serializeDoc(val) {
  if (val === null || val === undefined) return val;
  
  if (typeof val === 'object') {
    // Check for MongoDB ObjectId
    if (val._bsontype === 'ObjectID' || val.constructor?.name === 'ObjectId' || val.constructor?.name === 'ObjectID') {
      return { $oid: val.toString() };
    }
    // Check for Date
    if (val instanceof Date || val.constructor?.name === 'Date') {
      return { $date: val.toISOString() };
    }
    // Check for Array
    if (Array.isArray(val)) {
      return val.map(serializeDoc);
    }
    // Check for standard object
    const copy = {};
    for (const key of Object.keys(val)) {
      copy[key] = serializeDoc(val[key]);
    }
    return copy;
  }
  return val;
}

async function runBackup() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'Flowrish';

  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.green}           FLORIWISH MONGODB BACKUP SYSTEM          ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  if (!uri) {
    console.error(`${colors.red}Error: MONGODB_URI is not defined in your .env file!${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}[1/5]${colors.reset} Connecting to database...`);
  console.log(`      Host: ${colors.yellow}${uri.split('@')[1] || uri.split('//')[1]?.split('/')[0]}${colors.reset}`);
  console.log(`      Database: ${colors.yellow}${dbName}${colors.reset}\n`);

  try {
    await mongoose.connect(uri, { dbName });
    console.log(`${colors.green}✔ Connected successfully to MongoDB.${colors.reset}\n`);

    const db = mongoose.connection.db;
    const collectionsInfo = await db.listCollections().toArray();
    const collectionNames = collectionsInfo.map(col => col.name).sort();

    if (collectionNames.length === 0) {
      console.log(`${colors.yellow}⚠ No collections found in the database.${colors.reset}`);
      await mongoose.disconnect();
      return;
    }

    // Prepare backup folder structure
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDirName = `mongodb_backup_${dbName}_${timestamp}`;
    const baseBackupDir = path.join(__dirname, '..', 'backups');
    const tempBackupDir = path.join(baseBackupDir, backupDirName);
    const jsonDir = path.join(tempBackupDir, 'json');

    console.log(`${colors.blue}[2/5]${colors.reset} Initializing backup folder structure...`);
    fs.mkdirSync(jsonDir, { recursive: true });
    console.log(`      Path: ${colors.yellow}${tempBackupDir}${colors.reset}\n`);

    console.log(`${colors.blue}[3/5]${colors.reset} Exporting collections to Extended JSON...`);
    
    const collectionsMetadata = [];
    let totalDocsExported = 0;

    for (const colName of collectionNames) {
      process.stdout.write(`      - Exporting ${colors.cyan}${colName}${colors.reset}... `);
      
      const collection = db.collection(colName);
      const docs = await collection.find({}).toArray();
      const serializedDocs = docs.map(serializeDoc);
      
      const fileName = `${colName}.json`;
      const filePath = path.join(jsonDir, fileName);
      
      // Write beautifully formatted JSON
      fs.writeFileSync(filePath, JSON.stringify(serializedDocs, null, 2), 'utf8');
      const stats = fs.statSync(filePath);
      
      console.log(`${colors.green}Done${colors.reset} (${docs.length} docs, ${formatSize(stats.size)})`);
      
      collectionsMetadata.push({
        name: colName,
        count: docs.length,
        size: stats.size,
        sizeFormatted: formatSize(stats.size),
        file: `json/${fileName}`
      });

      totalDocsExported += docs.length;
    }

    // Write a beautiful metadata.json report
    const metadata = {
      backupDate: new Date().toISOString(),
      databaseName: dbName,
      totalCollections: collectionNames.length,
      totalDocuments: totalDocsExported,
      collections: collectionsMetadata
    };
    
    fs.writeFileSync(
      path.join(tempBackupDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf8'
    );
    console.log(`\n${colors.green}✔ All collections exported successfully.${colors.reset}\n`);

    // Compression step
    console.log(`${colors.blue}[4/5]${colors.reset} Packaging and compressing backup archive...`);
    const zipFileName = `${backupDirName}.zip`;
    const zipFilePath = path.join(baseBackupDir, zipFileName);

    // Use PowerShell's built-in Compress-Archive since we are on Windows
    const powershellCmd = `powershell -Command "Compress-Archive -Path '${tempBackupDir}' -DestinationPath '${zipFilePath}' -Force"`;

    await new Promise((resolve, reject) => {
      exec(powershellCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`${colors.red}Zip Compression Error: ${error.message}${colors.reset}`);
          reject(error);
          return;
        }
        resolve();
      });
    });

    const zipStats = fs.statSync(zipFilePath);
    console.log(`${colors.green}✔ Created compressed ZIP archive successfully.${colors.reset}`);
    console.log(`      Archive: ${colors.yellow}${zipFilePath}${colors.reset}`);
    console.log(`      Size: ${colors.yellow}${formatSize(zipStats.size)}${colors.reset}\n`);

    // Clean up temporary files
    console.log(`${colors.blue}[5/5]${colors.reset} Cleaning up temporary files...`);
    fs.rmSync(tempBackupDir, { recursive: true, force: true });
    console.log(`${colors.green}✔ Cleanup complete.${colors.reset}\n`);

    // Print final report summary
    console.log(`${colors.bright}${colors.green}====================================================${colors.reset}`);
    console.log(`${colors.bright}${colors.green}           BACKUP COMPLETED SUCCESSFULLY!           ${colors.reset}`);
    console.log(`${colors.bright}${colors.green}====================================================${colors.reset}`);
    console.log(`  Database Name:     ${colors.cyan}${dbName}${colors.reset}`);
    console.log(`  Collections:       ${colors.cyan}${collectionNames.length}${colors.reset}`);
    console.log(`  Total Documents:   ${colors.cyan}${totalDocsExported}${colors.reset}`);
    console.log(`  Backup File Path:  ${colors.bright}${colors.yellow}${zipFilePath}${colors.reset}`);
    console.log(`  File Size:         ${colors.cyan}${formatSize(zipStats.size)}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}====================================================${colors.reset}`);
    console.log(`\n${colors.bright}${colors.magenta}Tip: You can send the ZIP file to the client directly.${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}To restore this backup in the future, we have documented how to use mongoimport or a restore script.${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}An error occurred during backup execution:${colors.reset}`, error);
  } finally {
    await mongoose.disconnect();
  }
}

runBackup();
