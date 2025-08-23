#!/usr/bin/env ts-node
/*
  Create Appwrite collections, attributes, and indexes from SSOT registry.
  - Idempotent: create-if-missing; skip-if-exists
  - Arrays are represented as JSON strings
  - Attributes use snake_case as defined in the SSOT
*/

import fs from 'node:fs'
import path from 'node:path'
import { Client, Databases } from 'node-appwrite'

type Attr = {
  name: string
  type: 'string' | 'integer' | 'double' | 'boolean' | 'datetime'
  size?: number
  required?: boolean
  unique?: boolean
}

type Index = {
  name: string
  type: 'key' | 'unique' | 'fulltext' | string
  fields: string[]
}

type CollectionDef = {
  id: string
  attrs: Attr[]
  indexes?: Index[]
}

type Registry = { collections: CollectionDef[] }

function getEnv(name: string, fallback?: string): string {
  const raw = process.env[name] ?? fallback
  if (!raw) throw new Error(`Missing env ${name}`)
  return raw.replace(/^"|"$/g, '').trim()
}

async function ensureCollection(databases: Databases, databaseId: string, def: CollectionDef, log: string[]): Promise<void> {
  // Check existence
  try {
    await databases.getCollection(databaseId, def.id)
    log.push(`collection: ${def.id} (exists)`) 
  } catch {
    await databases.createCollection(databaseId, def.id, def.id)
    log.push(`collection: ${def.id} (created)`) 
  }

  // Attributes
  try {
    const current = await databases.listAttributes(databaseId, def.id)
    const existing = new Set<string>((current as any).attributes?.map((a: any) => a.key) ?? [])
    for (const a of def.attrs) {
      if (existing.has(a.name)) { log.push(`  attr: ${a.name} (exists)`); continue }
      const required = a.required === true
      const size = a.size ?? (a.type === 'string' ? 255 : undefined)
      switch (a.type) {
        case 'string':
          await databases.createStringAttribute(databaseId, def.id, a.name, size ?? 255, required)
          break
        case 'integer':
          await databases.createIntegerAttribute(databaseId, def.id, a.name, required)
          break
        case 'double':
          await databases.createFloatAttribute(databaseId, def.id, a.name, required)
          break
        case 'boolean':
          await databases.createBooleanAttribute(databaseId, def.id, a.name, required)
          break
        case 'datetime':
          await databases.createDatetimeAttribute(databaseId, def.id, a.name, required)
          break
        default:
          throw new Error(`Unsupported attribute type: ${a.type}`)
      }
      if (a.unique) {
        // Unique constraint implemented as an index with type 'unique'
        await databases.createIndex(databaseId, def.id, `${a.name}_unique`, 'unique', [a.name])
      }
      log.push(`  attr: ${a.name} (created)`) 
    }
  } catch (e: any) {
    log.push(`  attrs error: ${e?.message ?? String(e)}`)
  }

  // Indexes
  if (!def.indexes || def.indexes.length === 0) return
  try {
    const idxResp = await databases.listIndexes(databaseId, def.id)
    const existing = new Set<string>(((idxResp as any).indexes ?? []).map((ix: any) => ix.key ?? ix.name))
    for (const ix of def.indexes) {
      const key = ix.name
      if (existing.has(key)) { log.push(`  index: ${key} (exists)`); continue }
      await databases.createIndex(databaseId, def.id, key, ix.type, ix.fields)
      log.push(`  index: ${key} (created)`) 
    }
  } catch (e: any) {
    log.push(`  indexes error: ${e?.message ?? String(e)}`)
  }
}

async function main() {
  const registryPath = path.join(process.cwd(), 'schema', 'target_schema_registry.json')
  const json = JSON.parse(fs.readFileSync(registryPath, 'utf8')) as Registry

  const endpoint = getEnv('APPWRITE_ENDPOINT', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  const projectId = getEnv('APPWRITE_PROJECT_ID', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  const apiKey = getEnv('APPWRITE_API_KEY')
  const databaseId = getEnv('APPWRITE_DATABASE_ID', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const databases = new Databases(client)

  const log: string[] = []
  log.push(`Connected to ${endpoint} project=${projectId} database=${databaseId}`)

  for (const col of json.collections) {
    await ensureCollection(databases, databaseId, col, log)
  }

  // Summary
  const created = log.filter((l) => l.includes('(created)')).length
  const existed = log.filter((l) => l.includes('(exists)')).length
  console.log(log.join('\n'))
  console.log(`\nSummary: created=${created}, existed=${existed}, total-ops=${log.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


