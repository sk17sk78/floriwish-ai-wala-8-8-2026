#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

console.log('🚀 Starting development server...\n');

// Function to kill process on port 3000
function killPort3000() {
  return new Promise((resolve) => {
    if (os.platform() === 'win32') {
      // Windows
      exec('netstat -ano | findstr :3000', (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          const pids = new Set();
          
          lines.forEach(line => {
            if (line.includes('LISTENING')) {
              const parts = line.trim().split(/\s+/);
              const pid = parts[parts.length - 1];
              if (pid && pid !== '0') {
                pids.add(pid);
              }
            }
          });
          
          if (pids.size > 0) {
            console.log(`📋 Found processes using port 3000: ${Array.from(pids).join(', ')}`);
            
            const killPromises = Array.from(pids).map(pid => {
              return new Promise((killResolve) => {
                exec(`taskkill /PID ${pid} /F`, (killError, killStdout) => {
                  if (killError) {
                    console.log(`⚠️  Could not kill process ${pid}: ${killError.message}`);
                  } else {
                    console.log(`✅ Killed process ${pid}`);
                  }
                  killResolve();
                });
              });
            });
            
            Promise.all(killPromises).then(() => {
              console.log('🔄 Waiting 2 seconds for port to be released...\n');
              setTimeout(resolve, 2000);
            });
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    } else {
      // macOS/Linux
      exec('lsof -ti:3000', (error, stdout) => {
        if (stdout) {
          const pids = stdout.trim().split('\n').filter(pid => pid);
          if (pids.length > 0) {
            console.log(`📋 Found processes using port 3000: ${pids.join(', ')}`);
            exec(`kill -9 ${pids.join(' ')}`, (killError) => {
              if (killError) {
                console.log(`⚠️  Could not kill processes: ${killError.message}`);
              } else {
                console.log(`✅ Killed processes: ${pids.join(', ')}`);
              }
              console.log('🔄 Waiting 2 seconds for port to be released...\n');
              setTimeout(resolve, 2000);
            });
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    }
  });
}

// Function to start the dev server
function startDevServer() {
  console.log('🌟 Starting Next.js development server...\n');
  
  const devProcess = exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error starting dev server: ${error.message}`);
      return;
    }
  });
  
  devProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  devProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  devProcess.on('close', (code) => {
    console.log(`\n📊 Dev server exited with code ${code}`);
  });
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down dev server...');
    devProcess.kill('SIGINT');
    process.exit(0);
  });
}

// Main execution
async function main() {
  try {
    await killPort3000();
    startDevServer();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();