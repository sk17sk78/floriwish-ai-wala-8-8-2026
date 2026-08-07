#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Performance Analysis Report\n');

// Check for common performance issues
const performanceIssues = [];

// 1. Check for debug logging
function checkDebugLogging() {
  const files = ['hooks/useCart.tsx', 'hooks/useAppState/useAppState.tsx'];
  
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const debugMatches = content.match(/fetch\('http:\/\/127\.0\.0\.1:7242/g);
      
      if (debugMatches) {
        performanceIssues.push(`❌ Debug logging found in ${file}: ${debugMatches.length} calls`);
      } else {
        console.log(`✅ No debug logging in ${file}`);
      }
    }
  });
}

// 2. Check for React.memo usage
function checkReactMemo() {
  const componentDirs = [
    'components/(frontend)/global/_Templates/Tiles',
    'components/(frontend)/components',
    'components/(frontend)/category'
  ];
  
  let memoizedComponents = 0;
  let totalComponents = 0;
  
  componentDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath, { recursive: true })
        .filter(file => file.endsWith('.tsx') && !file.includes('test'));
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          totalComponents++;
          
          if (content.includes('memo(') || content.includes('React.memo')) {
            memoizedComponents++;
          }
        }
      });
    }
  });
  
  const memoPercentage = totalComponents > 0 ? (memoizedComponents / totalComponents * 100).toFixed(1) : 0;
  
  if (memoPercentage < 50) {
    performanceIssues.push(`⚠️  Only ${memoPercentage}% of components use React.memo (${memoizedComponents}/${totalComponents})`);
  } else {
    console.log(`✅ ${memoPercentage}% of components use React.memo (${memoizedComponents}/${totalComponents})`);
  }
}

// 3. Check for useCallback/useMemo usage
function checkHookOptimizations() {
  const hookFiles = [
    'hooks/useCart.tsx',
    'hooks/useAppState/useAppState.tsx',
    'hooks/useSearch/useSearch.tsx',
    'hooks/useCustomerProfile.tsx'
  ];
  
  hookFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const useCallbackCount = (content.match(/useCallback/g) || []).length;
      const useMemoCount = (content.match(/useMemo/g) || []).length;
      const functionCount = (content.match(/const \w+ = \(/g) || []).length;
      
      if (useCallbackCount === 0 && functionCount > 3) {
        performanceIssues.push(`⚠️  ${file} has ${functionCount} functions but no useCallback`);
      } else {
        console.log(`✅ ${file} uses ${useCallbackCount} useCallback, ${useMemoCount} useMemo`);
      }
    }
  });
}

// 4. Check bundle size indicators
function checkBundleSize() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    const heavyPackages = [
      'moment', 'lodash', 'axios', 'jquery', 'bootstrap'
    ];
    
    const foundHeavyPackages = dependencies.filter(dep => 
      heavyPackages.some(heavy => dep.includes(heavy))
    );
    
    if (foundHeavyPackages.length > 0) {
      performanceIssues.push(`⚠️  Heavy packages detected: ${foundHeavyPackages.join(', ')}`);
    } else {
      console.log('✅ No heavy packages detected');
    }
  }
}

// 5. Check for performance monitoring
function checkPerformanceMonitoring() {
  const perfHookPath = path.join(__dirname, '..', 'hooks/usePerformanceOptimizer.ts');
  const perfMonitorPath = path.join(__dirname, '..', 'hooks/usePerformanceMonitor.ts');
  
  if (fs.existsSync(perfHookPath) || fs.existsSync(perfMonitorPath)) {
    console.log('✅ Performance monitoring hooks available');
  } else {
    performanceIssues.push('⚠️  No performance monitoring hooks found');
  }
}

// Run all checks
checkDebugLogging();
checkReactMemo();
checkHookOptimizations();
checkBundleSize();
checkPerformanceMonitoring();

// Summary
console.log('\n📊 Performance Summary:');
if (performanceIssues.length === 0) {
  console.log('🎉 All performance checks passed!');
} else {
  console.log(`❌ Found ${performanceIssues.length} performance issues:\n`);
  performanceIssues.forEach(issue => console.log(`  ${issue}`));
  
  console.log('\n💡 Recommendations:');
  console.log('  1. Remove all debug logging calls');
  console.log('  2. Add React.memo to frequently re-rendering components');
  console.log('  3. Use useCallback for event handlers');
  console.log('  4. Use useMemo for expensive calculations');
  console.log('  5. Implement request deduplication');
  console.log('  6. Add performance monitoring');
}

console.log('\n🚀 To start your optimized app:');
console.log('  npm run dev');