#!/usr/bin/env tsx
/**
 * Script to update all snake_case database field references to camelCase
 * Run this after updating the Appwrite database schema to camelCase
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Mapping of old snake_case to new camelCase
const fieldMappings: Record<string, string> = {
  // league_memberships
  'authUserId': 'authUserId',
  'displayName': 'displayName',
  'leagueId': 'leagueId',
  'joinedAt': 'joinedAt',
  
  // fantasy_teams
  'ownerAuthUserId': 'ownerAuthUserId',
  'teamName': 'teamName',
  
  // leagues
  'commissionerAuthUserId': 'commissionerAuthUserId',
  'draftDate': 'draftDate',
  'maxTeams': 'maxTeams',
  'pickTimeSeconds': 'pickTimeSeconds',
  'isPublic': 'isPublic',
  'gameMode': 'gameMode',
  'selectedConference': 'selectedConference',
  'seasonStartWeek': 'seasonStartWeek',
  'playoffTeams': 'playoffTeams',
  'playoffStartWeek': 'playoffStartWeek',
  'scoringRules': 'scoringRules',
  'waiverType': 'waiverType',
  'waiverBudget': 'waiverBudget',
  
  // clients
  'avatarUrl': 'avatarUrl',
  'createdAt': 'createdAt',
  'lastLogin': 'lastLogin',
  
  // invites
  'invitedByAuthUserId': 'invitedByAuthUserId',
  'acceptedAt': 'acceptedAt',
  'expiresAt': 'expiresAt',
  'inviteCode': 'inviteCode',
  
  // Common fields across collections
  'clientId': 'clientId',
  'ownerClientId': 'ownerClientId',
  'fantasyTeamId': 'fantasyTeamId',
  'rosterId': 'rosterId',
};

async function updateFile(filePath: string): Promise<number> {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let changeCount = 0;
  
  // Update Query.equal, Query.notEqual, etc.
  for (const [oldField, newField] of Object.entries(fieldMappings)) {
    const queryPatterns = [
      // Query methods with quotes
      new RegExp(`Query\\.(equal|notEqual|lessThan|lessThanEqual|greaterThan|greaterThanEqual|contains|search|orderAsc|orderDesc)\\(['"]${oldField}['"]`, 'g'),
      // Direct object property access
      new RegExp(`\\.${oldField}([^a-zA-Z0-9_])`, 'g'),
      // Object destructuring
      new RegExp(`\\b${oldField}:`, 'g'),
      // String literals in arrays or objects
      new RegExp(`['"]${oldField}['"]`, 'g'),
    ];
    
    for (const pattern of queryPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        changeCount += matches.length;
        if (pattern.source.includes('Query')) {
          content = content.replace(pattern, `Query.$1('${newField}'`);
        } else if (pattern.source.includes('\\.')) {
          content = content.replace(pattern, `.${newField}$1`);
        } else if (pattern.source.includes(':')) {
          content = content.replace(pattern, `${newField}:`);
        } else {
          content = content.replace(pattern, `'${newField}'`);
        }
      }
    }
  }
  
  // Save if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} (${changeCount} changes)`);
    return changeCount;
  }
  
  return 0;
}

async function main() {
  console.log('🔄 Updating snake_case to camelCase...\n');
  
  // Find all TypeScript/JavaScript files in app directory
  const files = await glob('app/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
  });
  
  let totalFiles = 0;
  let totalChanges = 0;
  
  for (const file of files) {
    const changes = await updateFile(file);
    if (changes > 0) {
      totalFiles++;
      totalChanges += changes;
    }
  }
  
  console.log(`\n✨ Complete! Updated ${totalFiles} files with ${totalChanges} total changes.`);
  console.log('\n⚠️  Remember to:');
  console.log('1. Review the changes carefully');
  console.log('2. Run tests to ensure everything works');
  console.log('3. Update any environment variables if needed');
  console.log('4. Deploy the changes');
}

main().catch(console.error);
