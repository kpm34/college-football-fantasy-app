#!/usr/bin/env node

/**
 * CI Guard: Collection Name Consistency Check
 * Ensures all collection references use the centralized configuration
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '../app');
const COMPONENTS_DIR = path.join(__dirname, '../components');
const LIB_DIR = path.join(__dirname, '../lib');
const HOOKS_DIR = path.join(__dirname, '../hooks');

// Critical patterns that should not exist in production
const CRITICAL_PATTERNS = [
  // Old import patterns (should use centralized config)
  /from.*['"`].*\/appwrite-client-fix['"`]/g,
  /from.*['"`].*\/lib\/api['"`]/g,
];

// Warning patterns (logged but don't fail build)
const WARNING_PATTERNS = [
  // Direct hardcoded collection names (should use COLLECTIONS object)
  /['"`]rosters['"`]/g,
  /['"`]college_players['"`]/g,
  /['"`]draft_picks['"`]/g,
  /['"`]player_stats['"`]/g,
  
  // Direct Appwrite client usage outside designated files
  /new Client\(\)/g,
];

// Allowed files that can use legacy patterns
const ALLOWED_LEGACY_FILES = [
  'lib/appwrite.ts',
  'lib/appwrite-server.ts', 
  'core/config/environment.ts',
  'scripts/',
  'docs/',
  'tests/',
  'schema/',
  'migration-script.js',
  'appwrite-functions/',
  'js/',
];

function isAllowedLegacyFile(filePath) {
  return ALLOWED_LEGACY_FILES.some(allowed => filePath.includes(allowed));
}

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) return { critical: [], warnings: [] };
  if (isAllowedLegacyFile(filePath)) return { critical: [], warnings: [] };
  
  const content = fs.readFileSync(filePath, 'utf8');
  const critical = [];
  const warnings = [];
  
  CRITICAL_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        critical.push({
          file: filePath.replace(__dirname, '..'),
          pattern: match,
          type: 'critical',
          patternIndex: index
        });
      });
    }
  });
  
  WARNING_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        warnings.push({
          file: filePath.replace(__dirname, '..'),
          pattern: match,
          type: 'warning',
          patternIndex: index
        });
      });
    }
  });
  
  return { critical, warnings };
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  if (!fs.existsSync(dir)) return [];
  
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findFiles(itemPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(itemPath);
    }
  }
  
  return files;
}

function main() {
  console.log('🔍 Checking collection name consistency...');
  
  const allCritical = [];
  const allWarnings = [];
  const directories = [APP_DIR, COMPONENTS_DIR, LIB_DIR, HOOKS_DIR];
  
  directories.forEach(dir => {
    const files = findFiles(dir);
    files.forEach(file => {
      const result = checkFile(file);
      allCritical.push(...result.critical);
      allWarnings.push(...result.warnings);
    });
  });
  
  // Show warnings but don't fail build
  if (allWarnings.length > 0) {
    console.warn('⚠️  Collection consistency warnings found:');
    console.warn(`Found ${allWarnings.length} hardcoded collection references.`);
    console.warn('Consider refactoring to use centralized COLLECTIONS object.');
    console.warn('');
  }
  
  // Fail build on critical violations
  if (allCritical.length > 0) {
    console.error('❌ Critical collection consistency violations found:');
    console.error('');
    
    allCritical.forEach(violation => {
      console.error(`  File: ${violation.file}`);
      console.error(`  Issue: ${violation.pattern}`);
      console.error(`  Fix: Use centralized imports`);
      console.error('');
    });
    
    console.error('Deprecated imports must be removed before deployment.');
    process.exit(1);
  }
  
  console.log('✅ No critical collection violations found.');
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, findFiles };