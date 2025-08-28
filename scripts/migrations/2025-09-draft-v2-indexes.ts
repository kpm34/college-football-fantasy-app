#!/usr/bin/env tsx
/**
 * Migration: Ensure indexes & attributes required by Draft Engine v2.
 * - Adds unique indexes to draft_picks
 * - Back-fills `phase` and `pickTimeSeconds` on existing leagues
 */

import { Client, Databases } from 'node-appwrite'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '')

const databases = new Databases(client)
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy'
const DRAFT_PICKS = 'draft_picks'
const LEAGUES = 'leagues'

async function ensureUniqueIndex(collectionId: string, key: string, attributes: string[]) {
  try {
    const { indexes } = await databases.listIndexes(DATABASE_ID, collectionId)
    if (indexes.find((i: any) => i.key === key)) {
      console.log(`✔︎ Index ${key} already exists`)
      return
    }
    console.log(`Creating index ${key} on ${collectionId} …`)
    await databases.createIndex(DATABASE_ID, collectionId, key, 'unique', attributes)
    console.log('  → created')
  } catch (err) {
    console.error('Failed to ensure index', key, err)
    process.exit(1)
  }
}

async function backfillLeagueFields() {
  const { documents, total } = await databases.listDocuments(DATABASE_ID, LEAGUES, [
    // no filters – small collection
  ])
  console.log(`Checking ${total} league documents`)
  for (const doc of documents) {
    const update: any = {}
    if (!doc.phase) update.phase = 'scheduled'
    if (doc.pickTimeSeconds == null && doc.clockSeconds != null) update.pickTimeSeconds = doc.clockSeconds
    if (Object.keys(update).length) {
      await databases.updateDocument(DATABASE_ID, LEAGUES, doc.$id, update)
      console.log(`  → patched league ${doc.$id}`)
    }
  }
}

async function main() {
  console.log('🏈 Draft v2 migration start')
  await ensureUniqueIndex(DRAFT_PICKS, 'unique_league_pick', ['leagueId', 'pick'])
  await ensureUniqueIndex(DRAFT_PICKS, 'unique_league_player', ['leagueId', 'playerId'])
  await backfillLeagueFields()
  console.log('✅ Migration complete')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
