#!/usr/bin/env ts-node

/**
 * Script to check file versions and detect potential reversions
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const CRITICAL_FILES = [
  'app/league/[leagueId]/locker-room/page.tsx',
  'app/draft/mock/page.tsx',
  'app/league/[leagueId]/page.tsx',
  'components/Navbar.tsx',
  'app/api/leagues/search/route.ts',
  'app/api/draft/players/route.ts'
];

function getFileHash(filePath: string): string {
  try {
    const result = execSync(`git hash-object ${filePath}`, { encoding: 'utf-8' });
    return result.trim();
  } catch {
    return 'file-not-found';
  }
}

function getLastCommitHash(filePath: string): string {
  try {
    const result = execSync(`git log -1 --format=%H -- ${filePath}`, { encoding: 'utf-8' });
    return result.trim();
  } catch {
    return 'no-commits';
  }
}

function getLastCommitDate(filePath: string): string {
  try {
    const result = execSync(`git log -1 --format=%cd --date=relative -- ${filePath}`, { encoding: 'utf-8' });
    return result.trim();
  } catch {
    return 'unknown';
  }
}

function checkFiles() {
  console.log('🔍 Checking critical file versions...\n');
  
  const results: any[] = [];
  
  CRITICAL_FILES.forEach(file => {
    const currentHash = getFileHash(file);
    const lastCommit = getLastCommitHash(file);
    const lastCommitDate = getLastCommitDate(file);
    
    // Check if file has uncommitted changes
    let status = 'clean';
    try {
      execSync(`git diff --quiet HEAD -- ${file}`);
    } catch {
      status = 'modified';
    }
    
    results.push({
      file: file.split('/').slice(-2).join('/'),
      status,
      lastChanged: lastCommitDate,
      hash: currentHash.substring(0, 7)
    });
  });
  
  // Display results
  console.table(results);
  
  // Check for potential issues
  const modifiedFiles = results.filter(r => r.status === 'modified');
  if (modifiedFiles.length > 0) {
    console.log('\n⚠️  Warning: The following files have uncommitted changes:');
    modifiedFiles.forEach(f => console.log(`   - ${f.file}`));
    console.log('\nConsider committing these changes to prevent version conflicts.');
  }
  
  // Save snapshot
  const snapshot = {
    timestamp: new Date().toISOString(),
    files: results
  };
  
  fs.writeFileSync(
    path.join(__dirname, '.file-versions.json'),
    JSON.stringify(snapshot, null, 2)
  );
  
  console.log('\n✅ File version snapshot saved to scripts/.file-versions.json');
}

// Run the check
checkFiles();
