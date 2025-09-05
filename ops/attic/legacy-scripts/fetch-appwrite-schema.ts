#!/usr/bin/env tsx
/**
 * Fetch Appwrite Schema using CLI
 *
 * This script uses the Appwrite CLI to fetch the complete schema
 * The CLI is more reliable than the SDK for fetching all collections
 *
 * Usage: npx tsx scripts/fetch-appwrite-schema.ts
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const DATABASE_ID = 'college-football-fantasy'

console.log('🔍 Fetching Appwrite Schema using CLI...')
console.log('Database ID:', DATABASE_ID)
console.log('-'.repeat(80))

try {
  // Fetch collections using CLI (JSON format)
  console.log('\n📥 Fetching collections from Appwrite...')
  const collectionsJson = execSync(
    `appwrite databases list-collections --database-id ${DATABASE_ID} --json`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
  )

  const collectionsData = JSON.parse(collectionsJson)
  const collections = collectionsData.collections || []

  console.log(`✅ Found ${collections.length} collections\n`)

  // Display collection summary
  console.log('📋 Collections Found:')
  console.log('-'.repeat(80))

  const sortedCollections = collections.sort((a: any, b: any) => a.name.localeCompare(b.name))

  for (const col of sortedCollections) {
    const attrCount = col.attributes?.length || 0
    const indexCount = col.indexes?.length || 0
    console.log(
      `  ${col.name.padEnd(30)} (ID: ${col.$id.padEnd(25)}) - ${attrCount} attrs, ${indexCount} indexes`
    )
  }
  console.log('-'.repeat(80))

  // Save to JSON file
  const outputPath = path.join(__dirname, '../schema/appwrite-schema.json')
  fs.writeFileSync(outputPath, JSON.stringify(collectionsData, null, 2))
  console.log(`\n✅ Schema saved to: ${outputPath}`)

  // Generate Markdown documentation
  let markdown = `# Appwrite Schema Documentation\n\n`
  markdown += `Generated: ${new Date().toISOString()}\n`
  markdown += `Database: ${DATABASE_ID}\n`
  markdown += `Total Collections: ${collections.length}\n\n`

  markdown += `## Collections Overview\n\n`
  markdown += `| Collection Name | Collection ID | Attributes | Indexes | Doc Security |\n`
  markdown += `|-----------------|---------------|------------|---------|-------------|\n`

  for (const col of sortedCollections) {
    const attrCount = col.attributes?.length || 0
    const indexCount = col.indexes?.length || 0
    const docSec = col.documentSecurity ? 'Yes' : 'No'
    markdown += `| ${col.name} | \`${col.$id}\` | ${attrCount} | ${indexCount} | ${docSec} |\n`
  }

  markdown += `\n## Collection Details\n\n`

  for (const col of sortedCollections) {
    markdown += `### ${col.name} (\`${col.$id}\`)\n\n`

    if (col.documentSecurity) {
      markdown += `⚠️ **Document Security**: ENABLED\n\n`
    }

    if (col.attributes && col.attributes.length > 0) {
      markdown += `**Attributes:**\n\n`
      markdown += `| Field | Type | Required | Details |\n`
      markdown += `|-------|------|----------|---------||\n`

      for (const attr of col.attributes) {
        const required = attr.required ? '✅' : '❌'
        const array = attr.array ? '[]' : ''
        let details = ''

        if (attr.type === 'string' && attr.size) {
          details = `max: ${attr.size}`
        } else if (attr.type === 'integer') {
          if (attr.min !== undefined || attr.max !== undefined) {
            details = `${attr.min || '*'} to ${attr.max || '*'}`
          }
        }

        if (attr.default !== null && attr.default !== undefined) {
          details += details ? `, default: ${attr.default}` : `default: ${attr.default}`
        }

        markdown += `| \`${attr.key}\` | ${attr.type}${array} | ${required} | ${details || '-'} |\n`
      }
      markdown += '\n'
    }

    if (col.indexes && col.indexes.length > 0) {
      markdown += `**Indexes:**\n\n`
      for (const index of col.indexes) {
        const type = index.type === 'unique' ? '🔑 UNIQUE' : '📍 KEY'
        markdown += `- \`${index.key}\` (${type}): [${index.attributes.join(', ')}]\n`
      }
      markdown += '\n'
    }

    markdown += '---\n\n'
  }

  // Save markdown
  const mdPath = path.join(__dirname, '../schema/APPWRITE_SCHEMA.md')
  fs.writeFileSync(mdPath, markdown)
  console.log(`✅ Documentation saved to: ${mdPath}`)

  // Check for critical collections
  console.log('\n🔍 Checking for critical collections:')
  const criticalCollections = [
    'draft_picks',
    'draft_events',
    'draft_states',
    'drafts',
    'leagues',
    'fantasy_teams',
    'college_players',
    'roster_slots',
  ]

  for (const name of criticalCollections) {
    const found = collections.find((c: any) => c.$id === name)
    if (found) {
      console.log(`  ✅ ${name}`)
    } else {
      console.log(`  ❌ ${name} - NOT FOUND!`)
    }
  }

  // Generate TypeScript types update
  console.log('\n📝 Generating TypeScript collection constants...\n')

  const tsConstants = collections
    .map((col: any) => {
      const constName = col.$id.toUpperCase().replace(/-/g, '_')
      return `  ${constName}: '${col.$id}',`
    })
    .join('\n')

  console.log('Add these to lib/appwrite-generated.ts:')
  console.log('-'.repeat(80))
  console.log('export const COLLECTIONS = {')
  console.log(tsConstants)
  console.log('} as const;')
  console.log('-'.repeat(80))

  console.log('\n✨ Schema fetch complete!')
} catch (error: any) {
  console.error('\n❌ Error fetching schema:', error.message)

  if (error.message.includes('command not found')) {
    console.error('\n📌 Make sure Appwrite CLI is installed:')
    console.error('   npm install -g appwrite')
    console.error('\n📌 Then login:')
    console.error('   appwrite login')
  }

  process.exit(1)
}
