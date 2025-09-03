#!/usr/bin/env tsx
/**
 * Update all schema files from live Appwrite schema
 * This script ensures all schema files are in sync with the live database
 */

import * as fs from 'fs'
import * as path from 'path'

// Read the fetched schema
const schemaPath = path.join(__dirname, '../schema/sdk-appwrite-schema.json')
const liveSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

console.log('📊 Updating Schema Files from Live Appwrite')
console.log('=' + '='.repeat(60))
console.log(`Found ${liveSchema.totalCollections} collections\n`)

// Helper to convert Appwrite types to Zod types
function getZodType(attr: any): string {
  const baseType = (() => {
    switch (attr.type) {
      case 'string':
        return attr.size ? `z.string().max(${attr.size})` : 'z.string()'
      case 'integer':
        let intType = 'z.number().int()'
        if (attr.min !== undefined) intType += `.min(${attr.min})`
        if (attr.max !== undefined) intType += `.max(${attr.max})`
        return intType
      case 'double':
      case 'float':
        return 'z.number()'
      case 'boolean':
        return 'z.boolean()'
      case 'datetime':
        return 'z.date()'
      case 'email':
        return 'z.string().email()'
      case 'url':
        return 'z.string().url()'
      case 'enum':
        const values = attr.elements?.map((e: string) => `"${e}"`).join(', ') || ''
        return `z.enum([${values}])`
      case 'relationship':
        return `z.string()` // Relationship IDs are strings
      default:
        return 'z.unknown()'
    }
  })()

  // Handle arrays
  if (attr.array) {
    return `z.array(${baseType})`
  }

  // Handle optional fields
  if (!attr.required && attr.default === null) {
    return `${baseType}.optional()`
  }

  // Handle defaults
  if (attr.default !== null && attr.default !== undefined) {
    if (typeof attr.default === 'string') {
      return `${baseType}.default("${attr.default}")`
    } else {
      return `${baseType}.default(${attr.default})`
    }
  }

  return baseType
}

// Generate Zod schemas for each collection
const zodSchemas: string[] = []
const registryImports: string[] = []
const registryExports: string[] = []

// Sort collections by name for consistent output
const sortedCollections = Object.entries(liveSchema.collections).sort(([a], [b]) =>
  a.localeCompare(b)
)

for (const [collectionId, collection] of sortedCollections) {
  const col = collection as any

  // Convert collection ID to PascalCase for schema name
  const schemaName = collectionId
    .split(/[_-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  console.log(`📝 Processing ${col.name} (${collectionId}) → ${schemaName}`)

  // Build Zod schema
  let schema = `// Collection: ${col.name} (ID: ${collectionId})\n`
  schema += `export const ${schemaName} = z.object({\n`

  // Add $id, $createdAt, $updatedAt system fields
  schema += `  $id: z.string().optional(),\n`
  schema += `  $createdAt: z.string().optional(),\n`
  schema += `  $updatedAt: z.string().optional(),\n`
  schema += `  $permissions: z.array(z.string()).optional(),\n`
  schema += `  $databaseId: z.string().optional(),\n`
  schema += `  $collectionId: z.string().optional(),\n`

  // Add collection attributes
  if (col.attributes && col.attributes.length > 0) {
    for (const attr of col.attributes) {
      const zodType = getZodType(attr)
      schema += `  ${attr.key}: ${zodType},\n`
    }
  }

  schema += `})\n`
  schema += `export type ${schemaName}Type = z.infer<typeof ${schemaName}>\n`

  zodSchemas.push(schema)
  registryImports.push(schemaName)
  registryExports.push(`  ${collectionId}: ${schemaName},`)
}

// Write updated zod-schema.ts
const zodSchemaContent = `/**
 * Zod Schema Definitions
 * Auto-generated from live Appwrite schema
 * Generated: ${new Date().toISOString()}
 * Total Collections: ${liveSchema.totalCollections}
 */

import { z } from 'zod'

${zodSchemas.join('\n')}

// Export all schemas
export const schemas = {
${registryExports.join('\n')}
} as const

// Export type for all schemas
export type Schemas = typeof schemas
`

const zodSchemaPath = path.join(__dirname, '../schema/zod-schema.ts')
fs.writeFileSync(zodSchemaPath, zodSchemaContent)
console.log(`\n✅ Updated ${zodSchemaPath}`)

// Update schemas.registry.ts
const registryContent = `/**
 * Schema Registry
 * Central registry for all database schemas
 * Auto-generated from live Appwrite schema
 * Generated: ${new Date().toISOString()}
 */

import {
  ${registryImports.join(',\n  ')}
} from './zod-schema'

// Collection ID to Schema mapping
export const schemas = {
${registryExports.join('\n')}
} as const

// Collection names for reference
export const COLLECTION_NAMES = {
${sortedCollections.map(([id, col]: [string, any]) => `  '${id}': '${col.name}',`).join('\n')}
} as const

// Type exports
export type SchemaRegistry = typeof schemas
export type CollectionId = keyof SchemaRegistry
export type CollectionSchema<T extends CollectionId> = typeof schemas[T]

// Helper to get schema by collection ID
export function getSchema<T extends CollectionId>(collectionId: T) {
  return schemas[collectionId]
}

// Helper to validate data against schema
export function validateSchema<T extends CollectionId>(
  collectionId: T,
  data: unknown
) {
  const schema = schemas[collectionId]
  return schema.parse(data)
}

// Export collection statistics
export const SCHEMA_STATS = {
  totalCollections: ${liveSchema.totalCollections},
  lastUpdated: '${new Date().toISOString()}',
  collections: [
${sortedCollections.map(([id]) => `    '${id}',`).join('\n')}
  ]
} as const
`

const registryPath = path.join(__dirname, '../schema/schemas.registry.ts')
fs.writeFileSync(registryPath, registryContent)
console.log(`✅ Updated ${registryPath}`)

// Check for schema drift
console.log('\n🔍 Checking for Schema Drift...')
console.log('-'.repeat(60))

// Read existing appwrite-generated.ts to check for missing collections
const generatedPath = path.join(__dirname, '../lib/appwrite-generated.ts')
const generatedContent = fs.readFileSync(generatedPath, 'utf-8')

const missingInGenerated: string[] = []
const extraInGenerated: string[] = []

// Check each collection
for (const [collectionId] of sortedCollections) {
  const constantName = collectionId.toUpperCase().replace(/-/g, '_')
  if (!generatedContent.includes(`${constantName}: '${collectionId}'`)) {
    missingInGenerated.push(collectionId)
  }
}

// Check for collections in generated but not in live
const generatedMatches = generatedContent.match(/(\w+): '([^']+)'/g) || []
const generatedIds = generatedMatches
  .map(m => m.match(/'([^']+)'/)?.[1])
  .filter(Boolean) as string[]

for (const id of generatedIds) {
  if (!liveSchema.collections[id] && !['PLAYERS', 'ROSTERS', 'USER_TEAMS'].includes(id)) {
    extraInGenerated.push(id)
  }
}

// Generate drift report
let driftReport = `# Schema Drift Report

Generated: ${new Date().toISOString()}

## Summary
- Live Collections: ${liveSchema.totalCollections}
- Schema Files Updated: ✅
- Registry Updated: ✅

## Collections Status
`

for (const [id, col] of sortedCollections) {
  const c = col as any
  driftReport += `\n### ${c.name} (\`${id}\`)
- Attributes: ${c.attributes?.length || 0}
- Indexes: ${c.indexes?.length || 0}
- Document Security: ${c.documentSecurity ? 'Yes' : 'No'}
- Status: ✅ Synced
`
}

if (missingInGenerated.length > 0) {
  driftReport += `\n## ⚠️ Missing in appwrite-generated.ts
These collections exist in live but not in constants file:
${missingInGenerated.map(id => `- ${id}`).join('\n')}
`
}

if (extraInGenerated.length > 0) {
  driftReport += `\n## ⚠️ Extra in appwrite-generated.ts
These collections are in constants but not in live:
${extraInGenerated.map(id => `- ${id}`).join('\n')}
`
}

driftReport += `\n## Recommendations
1. ${missingInGenerated.length > 0 ? 'Update lib/appwrite-generated.ts with missing collections' : '✅ All collections present in constants'}
2. ${extraInGenerated.length > 0 ? 'Review and remove obsolete collection references' : '✅ No obsolete collections'}
3. ✅ Schema files are now synchronized with live database
4. ✅ Type definitions are up to date

## Next Steps
- Run \`npm run typecheck\` to verify TypeScript compilation
- Review any breaking changes in collection schemas
- Update application code if schema changes affect functionality
`

const reportPath = path.join(__dirname, '../schema/SCHEMA_DRIFT_REPORT.md')
fs.writeFileSync(reportPath, driftReport)
console.log(`✅ Drift report saved to ${reportPath}`)

// Display summary
console.log('\n📊 Update Summary:')
console.log(`  ✅ ${liveSchema.totalCollections} collections processed`)
console.log(`  ✅ zod-schema.ts updated`)
console.log(`  ✅ schemas.registry.ts updated`)
if (missingInGenerated.length > 0) {
  console.log(`  ⚠️ ${missingInGenerated.length} collections missing in appwrite-generated.ts`)
}
if (extraInGenerated.length > 0) {
  console.log(`  ⚠️ ${extraInGenerated.length} obsolete collections in appwrite-generated.ts`)
}

console.log('\n✨ Schema update complete!')
console.log('Run `npm run typecheck` to verify everything compiles correctly.')
