#!/usr/bin/env tsx
/**
 * Fetch Appwrite Schema using SDK with proper configuration
 * Based on Appwrite documentation best practices
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { Client, Databases, Query } from 'node-appwrite'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy'
const API_KEY = process.env.APPWRITE_API_KEY

if (!API_KEY) {
  console.error('❌ APPWRITE_API_KEY not found in environment')
  process.exit(1)
}

console.log('🔍 Testing Appwrite SDK Configuration...')
console.log('Endpoint:', APPWRITE_ENDPOINT)
console.log('Project ID:', APPWRITE_PROJECT_ID)
console.log('Database ID:', DATABASE_ID)
console.log('API Key:', API_KEY.substring(0, 20) + '...')
console.log('-'.repeat(80))

// Initialize client with proper configuration
const client = new Client()

// Set configuration in correct order (important!)
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(API_KEY.replace(/^"|"$/g, '').replace(/\r?\n$/g, ''))

// Initialize Databases service
const databases = new Databases(client)

async function testConnection() {
  try {
    console.log('\n1️⃣ Testing database access...')
    const db = await databases.get(DATABASE_ID)
    console.log('✅ Database found:', db.name)
    console.log('   ID:', db.$id)
    console.log('   Created:', db.$createdAt)
    return true
  } catch (error: any) {
    console.error('❌ Cannot access database:', error.message)
    if (error.code === 404) {
      console.error('   Database not found. Check DATABASE_ID.')
    } else if (error.code === 401) {
      console.error('   Authentication failed. Check API_KEY permissions.')
    }
    return false
  }
}

async function listAllCollections() {
  try {
    console.log('\n2️⃣ Fetching collections with proper pagination...')

    let allCollections: any[] = []
    let lastId: string | undefined = undefined
    let hasMore = true
    const limit = 25 // Appwrite's default page size

    while (hasMore) {
      // Build queries array
      const queries: string[] = []
      if (lastId) {
        queries.push(Query.cursorAfter(lastId))
      }
      queries.push(Query.limit(limit))

      console.log(`   Fetching page (after: ${lastId || 'start'})...`)

      // Use the correct method signature
      const response = await databases.listCollections(DATABASE_ID, queries)

      if (response.collections.length > 0) {
        allCollections = [...allCollections, ...response.collections]
        lastId = response.collections[response.collections.length - 1].$id
        console.log(
          `   ✅ Got ${response.collections.length} collections (total: ${allCollections.length})`
        )
      }

      // Check if there are more pages
      hasMore = response.collections.length === limit
    }

    return allCollections
  } catch (error: any) {
    console.error('❌ Error listing collections:', error)
    console.error('   Code:', error.code)
    console.error('   Type:', error.type)
    console.error('   Message:', error.message)

    // Try alternative method without queries
    console.log('\n   Trying without pagination...')
    try {
      const response = await databases.listCollections(DATABASE_ID)
      return response.collections
    } catch (fallbackError: any) {
      console.error('   ❌ Fallback also failed:', fallbackError.message)
      return []
    }
  }
}

async function fetchCompleteSchema() {
  try {
    // Test connection first
    const connected = await testConnection()
    if (!connected) {
      throw new Error('Cannot connect to Appwrite database')
    }

    // Get all collections
    const collections = await listAllCollections()
    console.log(`\n✅ Found ${collections.length} collections total`)

    if (collections.length === 0) {
      console.error('\n⚠️ No collections found. Possible issues:')
      console.error('1. API key lacks "databases.read" scope')
      console.error('2. Collections have restrictive permissions')
      console.error('3. Wrong database ID')
      console.error('\nTry these solutions:')
      console.error('1. Create a new API key with all scopes in Appwrite Console')
      console.error('2. Check collection permissions in Appwrite Console')
      console.error('3. Verify DATABASE_ID matches your Appwrite project')
      return
    }

    // Display collections
    console.log('\n📋 Collections Found:')
    console.log('-'.repeat(80))

    const sortedCollections = collections.sort((a, b) => a.name.localeCompare(b.name))

    for (const col of sortedCollections) {
      console.log(`  - ${col.name.padEnd(30)} (ID: ${col.$id})`)
    }

    // Process each collection
    console.log('\n3️⃣ Fetching detailed schemas...')
    const schemaData: any = {
      fetchedAt: new Date().toISOString(),
      database: DATABASE_ID,
      totalCollections: collections.length,
      collections: {},
    }

    for (const col of sortedCollections) {
      try {
        process.stdout.write(`   ${col.name}...`)

        // Get attributes
        const attrs = await databases.listAttributes(DATABASE_ID, col.$id)

        // Get indexes
        const indexes = await databases.listIndexes(DATABASE_ID, col.$id)

        schemaData.collections[col.$id] = {
          name: col.name,
          id: col.$id,
          documentSecurity: col.documentSecurity,
          attributes: attrs.attributes,
          indexes: indexes.indexes,
          permissions: col.$permissions,
        }

        process.stdout.write(` ✅\n`)
      } catch (error: any) {
        process.stdout.write(` ❌ ${error.message}\n`)
      }
    }

    // Save results
    const outputPath = path.join(__dirname, '../schema/sdk-appwrite-schema.json')
    fs.writeFileSync(outputPath, JSON.stringify(schemaData, null, 2))
    console.log(`\n✅ Schema saved to: ${outputPath}`)

    // Check for draft_picks
    console.log('\n4️⃣ Checking for draft_picks collection:')
    const hasDraftPicks = collections.some(c => c.$id === 'draft_picks')
    if (hasDraftPicks) {
      console.log('✅ draft_picks collection FOUND in API!')
    } else {
      console.log('❌ draft_picks collection NOT found in API')
      console.log('   But it exists in Appwrite Console - permission issue likely')
    }
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
console.log('\n🚀 Starting Appwrite SDK schema fetch...\n')
fetchCompleteSchema()
  .then(() => {
    console.log('\n✨ Complete!')
  })
  .catch(error => {
    console.error('\n❌ Failed:', error)
    process.exit(1)
  })
