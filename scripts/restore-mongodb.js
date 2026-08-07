/**
 * MongoDB Restore Utility for FloriWish
 * Unpacks a backup ZIP archive, parses Extended JSON documents, and restores collections into MongoDB.
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

// Convert Standard Extended JSON format back to MongoDB Types (ObjectId, Date)
function deserializeDoc(val) {
  if (val === null || val === undefined) return val;
  
  if (typeof val === 'object') {
    // Restore MongoDB ObjectId
    if (val.$oid) {
      return new mongoose.Types.ObjectId(val.$oid);
    }
    // Restore Date
    if (val.$date) {
      return new Date(val.$date);
    }
    // Process Arrays recursively
    if (Array.isArray(val)) {
      return val.map(deserializeDoc);
    }
    // Process Objects recursively
    const copy = {};
    for (const key of Object.keys(val)) {
      copy[key] = deserializeDoc(val[key]);
    }
    return copy;
  }
  return val;
}

async function runRestore() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'Flowrish';

  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}           FLORIWISH MONGODB RESTORE SYSTEM         ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  if (!uri) {
    console.error(`${colors.red}Error: MONGODB_URI is not defined in your .env file!${colors.reset}`);
    process.exit(1);
  }

  // Find all zip archives in the backups folder
  const backupsDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupsDir)) {
    console.error(`${colors.red}Error: Backups directory does not exist! Run backup script first.${colors.reset}`);
    process.exit(1);
  }

  const files = fs.readdirSync(backupsDir);
  const zipFiles = files.filter(f => f.endsWith('.zip')).sort().reverse();

  if (zipFiles.length === 0) {
    console.error(`${colors.red}Error: No backup ZIP files found in ${backupsDir}!${colors.reset}`);
    process.exit(1);
  }

  // Select the latest backup zip by default
  const selectedZip = zipFiles[0];
  const zipFilePath = path.join(backupsDir, selectedZip);

  console.log(`${colors.blue}[1/5]${colors.reset} Target Database details:`);
  console.log(`      Host: ${colors.yellow}${uri.split('@')[1] || uri.split('//')[1]?.split('/')[0]}${colors.reset}`);
  console.log(`      Database: ${colors.yellow}${dbName}${colors.reset}`);
  console.log(`      Archive: ${colors.green}${selectedZip}${colors.reset}\n`);

  // Create a temporary extraction directory
  const tempExtractDirName = `restore_temp_${Date.now()}`;
  const tempExtractPath = path.join(backupsDir, tempExtractDirName);

  try {
    // Unpack ZIP
    console.log(`${colors.blue}[2/5]${colors.reset} Extracting ZIP archive...`);
    fs.mkdirSync(tempExtractPath, { recursive: true });
    
    // PowerShell Expand-Archive
    const powershellCmd = `powershell -Command "Expand-Archive -Path '${zipFilePath}' -DestinationPath '${tempExtractPath}' -Force"`;
    
    await new Promise((resolve, reject) => {
      exec(powershellCmd, (error) => {
        if (error) {
          console.error(`${colors.red}Extraction Error: ${error.message}${colors.reset}`);
          reject(error);
          return;
        }
        resolve();
      });
    });
    console.log(`${colors.green}✔ Archive extracted successfully.${colors.reset}\n`);

    // The extraction might put the contents in a nested folder representing the ZIP name
    let dataRootPath = tempExtractPath;
    const contents = fs.readdirSync(tempExtractPath);
    if (contents.length === 1 && fs.statSync(path.join(tempExtractPath, contents[0])).isDirectory()) {
      dataRootPath = path.join(tempExtractPath, contents[0]);
    }

    // Read metadata
    const metadataPath = path.join(dataRootPath, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error("Invalid backup: metadata.json is missing in the archive!");
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    console.log(`${colors.blue}[3/5]${colors.reset} Verifying backup metadata...`);
    console.log(`      Original Database:   ${colors.yellow}${metadata.databaseName}${colors.reset}`);
    console.log(`      Backup Date:         ${colors.yellow}${metadata.backupDate}${colors.reset}`);
    console.log(`      Total Collections:   ${colors.yellow}${metadata.totalCollections}${colors.reset}`);
    console.log(`      Total Documents:     ${colors.yellow}${metadata.totalDocuments}${colors.reset}\n`);

    // Connect to database
    console.log(`${colors.blue}[4/5]${colors.reset} Connecting to target MongoDB...`);
    await mongoose.connect(uri, { dbName });
    console.log(`${colors.green}✔ Connected successfully.${colors.reset}\n`);
    const db = mongoose.connection.db;

    console.log(`${colors.blue}[5/5]${colors.reset} Restoring collections...`);
    
    for (const col of metadata.collections) {
      const filePath = path.join(dataRootPath, col.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`      ${colors.yellow}⚠ Warning: File for collection ${col.name} not found at ${filePath}. Skipping.${colors.reset}`);
        continue;
      }

      process.stdout.write(`      - Restoring ${colors.cyan}${col.name}${colors.reset} (${col.count} docs)... `);

      const fileData = fs.readFileSync(filePath, 'utf8');
      const serializedDocs = JSON.parse(fileData);
      
      // Deserialize to true MongoDB types (ObjectId, Date, etc.)
      const docs = serializedDocs.map(deserializeDoc);

      // Drops the existing collection to avoid duplication
      await db.collection(col.name).deleteMany({});

      if (docs.length > 0) {
        await db.collection(col.name).insertMany(docs);
      }

      console.log(`${colors.green}Done${colors.reset}`);
    }

    console.log(`\n${colors.bright}${colors.green}====================================================${colors.reset}`);
    console.log(`${colors.bright}${colors.green}          DATABASE RESTORED SUCCESSFULLY!           ${colors.reset}`);
    console.log(`${colors.bright}${colors.green}====================================================${colors.reset}`);
    console.log(`  Database Name:  ${colors.cyan}${dbName}${colors.reset}`);
    console.log(`  Collections:    ${colors.cyan}${metadata.collections.length}${colors.reset}`);
    console.log(`  Total Docs:     ${colors.cyan}${metadata.totalDocuments}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}====================================================${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}An error occurred during restore execution:${colors.reset}`, error);
  } finally {
    // Cleanup extraction folder
    if (fs.existsSync(tempExtractPath)) {
      try {
        fs.rmSync(tempExtractPath, { recursive: true, force: true });
      } catch (err) {
        // ignore cleanup error
      }
    }
    await mongoose.disconnect();
  }
}

runRestore();
