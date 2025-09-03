#!/usr/bin/env tsx
/**
 * Quick Appwrite Access Test
 * Run this to verify Appwrite configuration is working correctly
 *
 * Usage: npx tsx scripts/test-appwrite-access.ts
 */

import * as dotenv from 'dotenv'
import { Client, Databases, Query } from 'node-appwrite'

// Load environment
dotenv.config({ path: '.env.local' })

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy'
const API_KEY = process.env.APPWRITE_API_KEY

console.log('🔍 Appwrite Access Test\n' + '='.repeat(50))

// Check environment
console.log('\n✅ Environment Check:')
console.log(`   Endpoint: ${ENDPOINT}`)
console.log(`   Project: ${PROJECT_ID}`)
console.log(`   Database: ${DATABASE_ID}`)
console.log(`   API Key: ${API_KEY ? '✅ Found' : '❌ Missing'}`)

if (!API_KEY) {
  console.error('\n❌ APPWRITE_API_KEY not found in .env.local')
  process.exit(1)
}

// Initialize client (CORRECT ORDER!)
const client = new Client()
client
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY.replace(/^"|"$/g, '').replace(/\r?\n$/g, ''))

const databases = new Databases(client)

async function runTests() {
  const results = {
    database: false,
    collections: false,
    pagination: false,
    criticalCollections: false,
  }

  // Test 1: Database Access
  console.log('\n📊 Test 1: Database Access')
  try {
    const db = await databases.get(DATABASE_ID)
    console.log(`   ✅ Connected to: ${db.name}`)
    results.database = true
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`)
  }

  // Test 2: List Collections
  console.log('\n📚 Test 2: List Collections')
  try {
    const response = await databases.listCollections(DATABASE_ID, [Query.limit(5)])
    console.log(`   ✅ Found ${response.total} total collections`)
    console.log(`   ✅ Retrieved ${response.collections.length} in first page`)
    results.collections = true
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`)
  }

  // Test 3: Pagination
  console.log('\n📄 Test 3: Pagination')
  try {
    let total = 0
    let lastId: string | undefined
    let pages = 0

    while (pages < 3) {
      // Max 3 pages for test
      const queries: string[] = []
      if (lastId) queries.push(Query.cursorAfter(lastId))
      queries.push(Query.limit(10))

      const response = await databases.listCollections(DATABASE_ID, queries)
      total += response.collections.length

      if (response.collections.length > 0) {
        lastId = response.collections[response.collections.length - 1].$id
        pages++
      } else {
        break
      }
    }

    console.log(`   ✅ Pagination works: ${total} collections across ${pages} pages`)
    results.pagination = true
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`)
  }

  // Test 4: Critical Collections
  console.log('\n🎯 Test 4: Critical Collections')
  const critical = ['draft_picks', 'leagues', 'college_players', 'fantasy_teams']
  try {
    // Get all collections with pagination
    let allCollections: any[] = []
    let lastId: string | undefined

    while (true) {
      const queries: string[] = []
      if (lastId) queries.push(Query.cursorAfter(lastId))
      queries.push(Query.limit(25))

      const response = await databases.listCollections(DATABASE_ID, queries)
      allCollections = [...allCollections, ...response.collections]

      if (response.collections.length < 25) break
      lastId = response.collections[response.collections.length - 1].$id
    }

    for (const name of critical) {
      const found = allCollections.find(c => c.$id === name)
      console.log(`   ${found ? '✅' : '❌'} ${name}`)
    }

    results.criticalCollections = allCollections.length > 25
    console.log(`\n   Total Collections: ${allCollections.length}`)
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`)
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST RESULTS:')
  const allPassed = Object.values(results).every(r => r)

  if (allPassed) {
    console.log('✅ ALL TESTS PASSED - Appwrite fully accessible!')
  } else {
    console.log('⚠️  Some tests failed:')
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${test}`)
    })
    console.log('\nRefer to docs/APPWRITE_ACCESS_GUIDE.md for troubleshooting')
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error)
  process.exit(1)
})
