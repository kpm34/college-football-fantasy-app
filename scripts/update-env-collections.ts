#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'

// Correct collection mappings based on live Appwrite schema
const CORRECT_COLLECTION_MAPPINGS = {
  // Core collections
  NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG: 'activity_log',
  NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS: 'Auctions',
  NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS: 'Bids',
  NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS: 'College Players',
  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS: 'Draft Picks',  // This is the actual collection
  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_EVENTS: 'draft_events',
  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_STATES: 'Draft States',
  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS: 'drafts',
  NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES: 'Games',
  NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES: 'Leagues',
  NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS: 'Lineups',
  NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS: 'Matchups',
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS: 'Player Stats',
  NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS: 'AP Rankings',
  NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTER_SLOTS: 'roster_slots',
  NEXT_PUBLIC_APPWRITE_COLLECTION_SCHOOLS: 'schools',
  NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS: 'fantasy_teams',
  NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS: 'Transactions',
  NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS: 'projections',
  NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_RUNS: 'model_runs',
  NEXT_PUBLIC_APPWRITE_COLLECTION_CLIENTS: 'clients',
  NEXT_PUBLIC_APPWRITE_COLLECTION_INVITES: 'invites',
  NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUE_MEMBERSHIPS: 'league_memberships',
  
  // Mascot/Job collections
  NEXT_PUBLIC_APPWRITE_COLLECTION_MASCOT_JOBS: 'Mascot Jobs',
  NEXT_PUBLIC_APPWRITE_COLLECTION_MASCOT_PRESETS: 'Mascot Presets',
  NEXT_PUBLIC_APPWRITE_COLLECTION_MASCOT_DOWNLOAD_TASKS: 'Mascot Download Tasks',
  NEXT_PUBLIC_APPWRITE_COLLECTION_MESHY_JOBS: 'meshy_jobs',
  
  // Model collections
  NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_VERSIONS: 'Model Versions',
  NEXT_PUBLIC_APPWRITE_COLLECTION_DATABASE_MIGRATIONS: 'Database Migrations',
  
  // Deprecated/Aliased (keep for backwards compatibility)
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS: 'College Players', // Alias
  NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS: 'roster_slots', // Alias
  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS: 'roster_slots', // Alias
  NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS: 'schools', // Alias
}

function updateEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file does not exist`)
    return
  }

  console.log(`\nUpdating ${filePath}...`)
  let content = fs.readFileSync(filePath, 'utf-8')
  let hasChanges = false

  // Update each collection mapping
  for (const [key, value] of Object.entries(CORRECT_COLLECTION_MAPPINGS)) {
    const regex = new RegExp(`^${key}=.*$`, 'gm')
    const newLine = `${key}="${value}"`
    
    if (regex.test(content)) {
      const oldLine = content.match(regex)?.[0]
      if (oldLine && oldLine !== newLine) {
        content = content.replace(regex, newLine)
        console.log(`  Updated: ${key}="${value}"`)
        hasChanges = true
      }
    } else {
      // Add if missing
      content += `\n${newLine}`
      console.log(`  Added: ${key}="${value}"`)
      hasChanges = true
    }
  }

  // Remove deprecated entries that don't exist in schema
  const deprecatedKeys = [
    'NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS_WEEKLY',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS_YEARLY',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_USER_CUSTOM_PROJECTIONS'
  ]

  for (const key of deprecatedKeys) {
    const regex = new RegExp(`^${key}=.*$\n?`, 'gm')
    if (regex.test(content)) {
      content = content.replace(regex, '')
      console.log(`  Removed deprecated: ${key}`)
      hasChanges = true
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content)
    console.log(`✅ Updated ${filePath}`)
  } else {
    console.log(`✅ No changes needed for ${filePath}`)
  }
}

// Update all .env files
const envFiles = [
  '.env.local',
  '.env.example',
  '.env.template.generated',
  '.env.production.backup'
]

console.log('Updating .env files with correct collection names from live schema...\n')

for (const file of envFiles) {
  const filePath = path.join(process.cwd(), file)
  updateEnvFile(filePath)
}

console.log('\n✅ All .env files have been updated with correct collection names!')
console.log('\nNote: The following collections exist but are not referenced in env vars:')
console.log('  - Database Migrations')
console.log('  - Model Versions')
console.log('  - meshy_jobs')

console.log('\nRemember to restart your dev server for changes to take effect!')
