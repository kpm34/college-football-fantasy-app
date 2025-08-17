#!/usr/bin/env tsx

/**
 * Build Guard: Forbid Test Pages in Production
 * Prevents deployment of test pages, debug routes, and development-only code
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = join(__dirname, '../..');
const APP_DIR = join(ROOT_DIR, 'app');

interface TestItem {
  type: 'directory' | 'file';
  path: string;
  name: string;
  reason: string;
}

// Patterns that indicate test/debug content
const FORBIDDEN_PATTERNS = [
  // Directory names
  { pattern: /test/i, type: 'directory', reason: 'Test directories not allowed in production' },
  { pattern: /debug/i, type: 'directory', reason: 'Debug directories not allowed in production' },
  { pattern: /mock/i, type: 'directory', reason: 'Mock directories should be in development only' },
  
  // File names  
  { pattern: /test[-_.]/, type: 'file', reason: 'Test files not allowed in production routes' },
  { pattern: /debug[-_.]/, type: 'file', reason: 'Debug files not allowed in production routes' },
  { pattern: /\.test\.|\.spec\./, type: 'file', reason: 'Test spec files not allowed in app directory' },
  { pattern: /playground|demo/, type: 'file', reason: 'Demo/playground files not allowed in production' }
];

// Exceptions - allowed test-related items
const ALLOWED_EXCEPTIONS = [
  'test-variable-teams.ts', // Production utility script
  'mock-draft', // Production feature (not test code)
  'draft/mock', // Production mock draft feature
  'api/mock-draft', // Production mock draft API
  'components/test', // May contain test utilities used in production
];

function isAllowedException(itemPath: string): boolean {
  return ALLOWED_EXCEPTIONS.some(exception => itemPath.includes(exception));
}

function findForbiddenItems(dir: string, results: TestItem[] = [], depth = 0): TestItem[] {
  // Prevent infinite recursion
  if (depth > 10) return results;
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const itemPath = join(dir, item);
      const relativePath = itemPath.replace(ROOT_DIR, '.');
      
      // Skip allowed exceptions
      if (isAllowedException(relativePath)) continue;
      
      try {
        const stat = statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Check directory name against patterns
          FORBIDDEN_PATTERNS.forEach(({ pattern, type, reason }) => {
            if (type === 'directory' && pattern.test(item)) {
              results.push({
                type: 'directory',
                path: relativePath,
                name: item,
                reason
              });
            }
          });
          
          // Recursively check subdirectories (unless already flagged)
          const alreadyFlagged = results.some(r => r.path === relativePath);
          if (!alreadyFlagged && !item.startsWith('.') && item !== 'node_modules') {
            findForbiddenItems(itemPath, results, depth + 1);
          }
        } else if (stat.isFile()) {
          // Check file name against patterns
          FORBIDDEN_PATTERNS.forEach(({ pattern, type, reason }) => {
            if (type === 'file' && pattern.test(item)) {
              results.push({
                type: 'file',
                path: relativePath,
                name: item,
                reason
              });
            }
          });
        }
      } catch (statError) {
        console.warn(`Warning: Could not stat ${itemPath}: ${statError}`);
      }
    }
  } catch (readError) {
    console.warn(`Warning: Could not read directory ${dir}: ${readError}`);
  }
  
  return results;
}

function main() {
  console.log('🔍 Scanning for test pages and debug routes...');
  
  const forbiddenItems = findForbiddenItems(APP_DIR);
  
  if (forbiddenItems.length > 0) {
    console.error('\n❌ Test/debug content found in production build:');
    console.error(`Found ${forbiddenItems.length} forbidden items:\n`);
    
    forbiddenItems.forEach(item => {
      console.error(`  ${item.type.toUpperCase()}: ${item.path}`);
      console.error(`  Reason: ${item.reason}`);
      console.error('');
    });
    
    console.error('Test pages and debug routes must not be deployed to production.');
    console.error('Please remove these files/directories before building.');
    
    // Provide helpful commands
    console.error('\nTo remove test items:');
    forbiddenItems.forEach(item => {
      const cmd = item.type === 'directory' ? 'rm -rf' : 'rm';
      console.error(`  ${cmd} "${item.path}"`);
    });
    
    process.exit(1);
  }
  
  console.log('✅ No test pages or debug routes found. Build can proceed.');
}

if (require.main === module) {
  main();
}

export { findForbiddenItems, FORBIDDEN_PATTERNS };