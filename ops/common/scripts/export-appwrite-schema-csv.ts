#!/usr/bin/env tsx
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { Client, Databases, Query } from 'node-appwrite'

function sanitize(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  // Escape quotes for CSV
  return '"' + s.replace(/"/g, '""') + '"'
}

function getEnvOrThrow(name: string, fallback?: string): string {
  const raw = process.env[name] ?? fallback
  if (!raw) throw new Error(`Missing required env: ${name}`)
  return raw.replace(/^"|"$/g, '').trim()
}

async function main() {
  const endpoint = getEnvOrThrow('NEXT_PUBLIC_APPWRITE_ENDPOINT', 'https://nyc.cloud.appwrite.io/v1')
  const projectId = getEnvOrThrow('NEXT_PUBLIC_APPWRITE_PROJECT_ID', 'college-football-fantasy-app')
  const databaseId = getEnvOrThrow('NEXT_PUBLIC_APPWRITE_DATABASE_ID', 'college-football-fantasy')
  const apiKey = getEnvOrThrow('APPWRITE_API_KEY')

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const databases = new Databases(client)

  // Pull collections with pagination to ensure we get all (target: 42)
  const rows: string[] = []
  rows.push(['collection', 'attributes', 'indexes'].map((h) => sanitize(h)).join(','))

  const allCollections: any[] = []
  let offset = 0
  const limit = 100
  while (true) {
    const queries = [Query.limit(limit), Query.offset(offset)]
    const page = await databases.listCollections(databaseId, queries as any)
    allCollections.push(...page.collections)
    if (page.collections.length < limit) break
    offset += limit
  }

  // Sort collections alphabetically by id for a stable CSV
  allCollections.sort((a, b) => String(a.$id).localeCompare(String(b.$id)))

  for (const col of allCollections) {
    const colId = col.$id
    let attributesCsv = ''
    let indexesCsv = ''
    try {
      const attrs = await databases.listAttributes(databaseId, colId as string)
      const attrParts: string[] = []
      const attrList = ((attrs as any).attributes ?? []).slice().sort((a: any, b: any) => String(a.key ?? a.name ?? '').localeCompare(String(b.key ?? b.name ?? '')))
      for (const a of attrList) {
        const key = a.key ?? a.name ?? a.$id ?? 'unknown'
        const type = a.type ?? a.kind ?? 'unknown'
        const required = a.required === true ? 'required' : 'optional'
        const def = a.default !== undefined && a.default !== null ? String(a.default) : ''
        attrParts.push(`${key}:${type}|${required}|${def}`)
      }
      attributesCsv = attrParts.join('; ')
    } catch (e) {
      attributesCsv = `ERROR: ${(e as Error).message}`
    }

    try {
      const idxs = await databases.listIndexes(databaseId, colId as string)
      const idxParts: string[] = []
      const idxList = ((idxs as any).indexes ?? []).slice().sort((a: any, b: any) => String(a.key ?? a.name ?? '').localeCompare(String(b.key ?? b.name ?? '')))
      for (const ix of idxList) {
        const name = ix.key ?? ix.name ?? 'index'
        const type = ix.type ?? 'key'
        const fields = Array.isArray(ix.attributes) ? ix.attributes.join('|') : ''
        const unique = ix.unique ? 'unique' : 'normal'
        idxParts.push(`${name}(${type}):[${fields}] ${unique}`)
      }
      indexesCsv = idxParts.join('; ')
    } catch (e) {
      indexesCsv = `ERROR: ${(e as Error).message}`
    }

    rows.push([colId, attributesCsv, indexesCsv].map((v) => sanitize(v)).join(','))
  }

  const outDir = path.join(process.cwd(), 'schema')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'Schema Table.csv')
  fs.writeFileSync(outFile, rows.join('\n'), 'utf8')
  console.log(`Wrote ${allCollections.length} collections to ${outFile}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


