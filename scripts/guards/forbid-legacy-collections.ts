#!/usr/bin/env tsx

/**
 * Build Guard: Forbid Legacy Collection References
 * Prevents deployment of code using deprecated collection names or import patterns
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = join(__dirname, '../..');
const SEARCH_DIRS = ['app', 'components', 'lib', 'hooks', 'core'];

// Forbidden patterns that should never exist in production
const FORBIDDEN_PATTERNS = [
  // Legacy collection names (should use COLLECTIONS object)
  {
    pattern: /['"`]rosters['"`]/g,
    message: 'Use COLLECTIONS.userTeams instead of hardcoded "rosters"',
    severity: 'error'
  },
  {
    pattern: /['"`]draft_picks['"`]/g,
    message: 'Use COLLECTIONS.draftPicks instead of hardcoded "draft_picks"',
    severity: 'error'
  },
  {
    pattern: /['"`]player_stats['"`]/g,
    message: 'Use COLLECTIONS.playerStats instead of hardcoded "player_stats"',
    severity: 'error'
  },
  
  // Deprecated import patterns
  {
    pattern: /from.*['"`].*\/appwrite-client-fix['"`]/g,
    message: 'Use centralized appwrite client from @/lib/appwrite',
    severity: 'error'
  },
  {
    pattern: /from.*['"`].*\/lib\/api['"`]/g,
    message: 'Legacy API client deprecated, use fetch directly or appwrite SDK',
    severity: 'error'
  },
  
  // Direct Appwrite client instantiation (should use centralized)
  {
    pattern: /new Client\(\)/g,
    message: 'Use centralized client from @/lib/appwrite instead of new Client()',
    severity: 'warning'
  },
  
  // Test-related patterns that shouldn't be in production
  {
    pattern: /\.only\(|\.skip\(/g,
    message: 'Remove .only() or .skip() from test files before deployment',
    severity: 'error'
  }
];

// Files that are allowed to use legacy patterns
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
  '.js',
  'forbid-legacy-collections.ts' // This file itself
];

interface Violation {
  file: string;
  line: number;
  pattern: string;
  message: string;
  severity: 'error' | 'warning';
}

function isAllowedLegacyFile(filePath: string): boolean {
  return ALLOWED_LEGACY_FILES.some(allowed => filePath.includes(allowed));
}

function scanFile(filePath: string): Violation[] {
  if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return [];
  if (isAllowedLegacyFile(filePath)) return [];
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations: Violation[] = [];
    
    FORBIDDEN_PATTERNS.forEach(({ pattern, message, severity }) => {
      lines.forEach((line, index) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            violations.push({
              file: filePath.replace(ROOT_DIR, '.'),
              line: index + 1,
              pattern: match,
              message,
              severity
            });
          });
        }
      });
    });
    
    return violations;
  } catch (error) {
    console.warn(`Warning: Could not scan ${filePath}: ${error}`);
    return [];
  }
}

function findFiles(dir: string, extensions = ['.ts', '.tsx', '.js', '.jsx']): string[] {
  const files: string[] = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const itemPath = join(dir, item);
      const stat = statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...findFiles(itemPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(itemPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error}`);
  }
  
  return files;
}

function main() {
  console.log('🔍 Scanning for legacy collection references...');
  
  const allViolations: Violation[] = [];
  
  SEARCH_DIRS.forEach(dirName => {
    const dirPath = join(ROOT_DIR, dirName);
    const files = findFiles(dirPath);
    
    files.forEach(file => {
      const violations = scanFile(file);
      allViolations.push(...violations);
    });
  });
  
  // Separate errors and warnings
  const errors = allViolations.filter(v => v.severity === 'error');
  const warnings = allViolations.filter(v => v.severity === 'warning');
  
  // Show warnings (don't fail build)
  if (warnings.length > 0) {
    console.warn('\n⚠️  Legacy pattern warnings:');
    warnings.forEach(violation => {
      console.warn(`  ${violation.file}:${violation.line}`);
      console.warn(`    Pattern: ${violation.pattern}`);
      console.warn(`    Fix: ${violation.message}`);
      console.warn('');
    });
  }
  
  // Show errors (fail build)
  if (errors.length > 0) {
    console.error('\n❌ Legacy collection violations found:');
    console.error(`Found ${errors.length} forbidden patterns that must be fixed:\n`);
    
    errors.forEach(violation => {
      console.error(`  File: ${violation.file}:${violation.line}`);
      console.error(`  Pattern: ${violation.pattern}`);
      console.error(`  Fix: ${violation.message}`);
      console.error('');
    });
    
    console.error('These patterns are forbidden in production builds.');
    console.error('Please update your code to use centralized configurations.');
    process.exit(1);
  }
  
  console.log(`✅ Legacy collection check passed (${warnings.length} warnings)`);
}

if (require.main === module) {
  main();
}

export { scanFile, findFiles, FORBIDDEN_PATTERNS };