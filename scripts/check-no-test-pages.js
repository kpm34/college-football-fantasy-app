#!/usr/bin/env node

/**
 * Build-time check to prevent test pages from being committed to production
 * This script ensures no test pages or debug routes exist in the app directory
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '../app');

function findTestPages(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Check for test directories
      if (item.toLowerCase().includes('test')) {
        results.push({
          type: 'directory',
          path: itemPath.replace(__dirname, '..'),
          name: item
        });
      } else {
        findTestPages(itemPath, results);
      }
    } else if (stat.isFile() && item.includes('test')) {
      // Check for test files
      results.push({
        type: 'file',
        path: itemPath.replace(__dirname, '..'),
        name: item
      });
    }
  }
  
  return results;
}

function main() {
  console.log('🔍 Checking for test pages and debug routes...');
  
  const testItems = findTestPages(APP_DIR);
  
  if (testItems.length > 0) {
    console.error('❌ Test pages/routes found in production build:');
    testItems.forEach(item => {
      console.error(`  ${item.type}: ${item.path}`);
    });
    console.error('\nTest pages must not be deployed to production.');
    console.error('Please remove these files before building.');
    process.exit(1);
  }
  
  console.log('✅ No test pages found. Build can proceed.');
}

if (require.main === module) {
  main();
}

module.exports = { findTestPages };