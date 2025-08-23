#!/usr/bin/env tsx
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Define replacements
const replacements = [
  // Collection name replacements in COLLECTIONS object
  { from: /COLLECTIONS\.USER_TEAMS/g, to: 'COLLECTIONS.FANTASY_TEAMS' },
  { from: /COLLECTIONS\.USERS/g, to: 'COLLECTIONS.CLIENTS' },
  { from: /COLLECTIONS\.TEAMS(?![_])/g, to: 'COLLECTIONS.SCHOOLS' },
  { from: /COLLECTIONS\.MOCK_DRAFT_PICKS/g, to: 'COLLECTIONS.DRAFT_EVENTS' },
  { from: /COLLECTIONS\.MOCK_DRAFT_PARTICIPANTS/g, to: 'COLLECTIONS.DRAFT_EVENTS' },
  { from: /COLLECTIONS\.AUCTION_BIDS/g, to: 'COLLECTIONS.BIDS' },
  { from: /COLLECTIONS\.AUCTION_SESSIONS/g, to: 'COLLECTIONS.DRAFTS' },
  { from: /COLLECTIONS\.SCORES/g, to: 'COLLECTIONS.MATCHUPS' },
  { from: /COLLECTIONS\.TEAM_BUDGETS/g, to: 'COLLECTIONS.FANTASY_TEAMS' },
  { from: /COLLECTIONS\.PLAYER_PROJECTIONS/g, to: 'COLLECTIONS.PROJECTIONS' },
  { from: /COLLECTIONS\.PROJECTIONS_WEEKLY/g, to: 'COLLECTIONS.PROJECTIONS' },
  { from: /COLLECTIONS\.PROJECTIONS_YEARLY/g, to: 'COLLECTIONS.PROJECTIONS' },
  { from: /COLLECTIONS\.USER_CUSTOM_PROJECTIONS/g, to: 'COLLECTIONS.PROJECTIONS' },
  { from: /COLLECTIONS\.PROJECTION_RUNS/g, to: 'COLLECTIONS.MODEL_RUNS' },
  
  // String literal replacements
  { from: /'user_teams'/g, to: "'fantasy_teams'" },
  { from: /"user_teams"/g, to: '"fantasy_teams"' },
  { from: /'users'/g, to: "'clients'" },
  { from: /"users"/g, to: '"clients"' },
  { from: /'teams'/g, to: "'schools'" },
  { from: /"teams"/g, to: '"schools"' },
  { from: /'mock_draft_picks'/g, to: "'draft_events'" },
  { from: /"mock_draft_picks"/g, to: '"draft_events"' },
  { from: /'mock_draft_participants'/g, to: "'draft_events'" },
  { from: /"mock_draft_participants"/g, to: '"draft_events"' },
  
  // Field name replacements
  { from: /rosterId/g, to: 'fantasy_team_id' },
  { from: /userId(?!:)/g, to: 'client_id' },
  { from: /teamId(?!:)/g, to: 'fantasy_team_id' },
];

// Directories to process
const directories = ['app', 'lib', 'components'];

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

function processFile(filePath: string) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  
  for (const { from, to } of replacements) {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      modified = true;
      content = newContent;
    }
  }
  
  if (modified) {
    writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
    return 1;
  }
  
  return 0;
}

function processDirectory(dir: string): number {
  let count = 0;
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      count += processDirectory(fullPath);
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      count += processFile(fullPath);
    }
  }
  
  return count;
}

function main() {
  console.log('Updating collection references to new schema...\n');
  
  let totalUpdated = 0;
  
  for (const dir of directories) {
    console.log(`Processing ${dir}/...`);
    const count = processDirectory(dir);
    totalUpdated += count;
  }
  
  console.log(`\n✅ Updated ${totalUpdated} files`);
}

main();
