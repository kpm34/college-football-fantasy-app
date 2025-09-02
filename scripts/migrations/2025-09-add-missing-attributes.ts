#!/usr/bin/env tsx

import 'dotenv/config'
import { Client, Databases } from 'node-appwrite'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const apiKey = process.env.APPWRITE_API_KEY
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy'

if (!apiKey) {
  console.error('APPWRITE_API_KEY required')
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey)
const db = new Databases(client)

async function ensureStringAttr(collectionId: string, key: string, required: boolean, size = 255) {
  try {
    await db.getAttribute(databaseId, collectionId, key)
  } catch {
    console.log(`➕ ${collectionId}: string ${key} (required=${required})`)
    await db.createStringAttribute(databaseId, collectionId, key, size, required)
    await new Promise((r) => setTimeout(r, 1000))
  }
}

async function ensureIntegerAttr(collectionId: string, key: string, required: boolean, min?: number, max?: number) {
  try {
    await db.getAttribute(databaseId, collectionId, key)
  } catch {
    console.log(`➕ ${collectionId}: integer ${key} (required=${required})`)
    await db.createIntegerAttribute(databaseId, collectionId, key, required, min, max)
    await new Promise((r) => setTimeout(r, 1000))
  }
}

async function ensureDatetimeAttr(collectionId: string, key: string, required: boolean) {
  try {
    await db.getAttribute(databaseId, collectionId, key)
  } catch {
    console.log(`➕ ${collectionId}: datetime ${key} (required=${required})`)
    await db.createDatetimeAttribute(databaseId, collectionId, key, required)
    await new Promise((r) => setTimeout(r, 1000))
  }
}

async function run() {
  // bids: leagueId, sessionId, userId, bidAmount
  await ensureStringAttr('bids', 'leagueId', true, 64)
  await ensureStringAttr('bids', 'sessionId', true, 64)
  await ensureStringAttr('bids', 'userId', true, 64)
  await ensureIntegerAttr('bids', 'bidAmount', true, 1)

  // matchups: homeRosterId, awayRosterId
  await ensureStringAttr('matchups', 'homeRosterId', true, 64)
  await ensureStringAttr('matchups', 'awayRosterId', true, 64)

  // model_runs: version
  await ensureIntegerAttr('model_runs', 'version', true, 1)

  // migrations: version, applied, checksum
  await ensureStringAttr('migrations', 'version', true, 100)
  await ensureDatetimeAttr('migrations', 'applied', true)
  await ensureStringAttr('migrations', 'checksum', true, 200)

  console.log('✅ Missing attributes ensured')
}

run().catch((e) => {
  console.error('Migration failed:', e?.message || e)
  process.exit(1)
})
