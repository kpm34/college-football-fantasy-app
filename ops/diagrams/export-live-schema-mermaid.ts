#!/usr/bin/env tsx
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { Client, Databases, Query } from 'node-appwrite'

function getEnvOrThrow(name: string, fallback?: string): string {
  const raw = process.env[name] ?? fallback
  if (!raw) throw new Error(`Missing required env: ${name}`)
  return String(raw).replace(/^"|"$/g, '').trim()
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '\\"')
}

async function main() {
  const endpoint = getEnvOrThrow('NEXT_PUBLIC_APPWRITE_ENDPOINT', 'https://nyc.cloud.appwrite.io/v1')
  const projectId = getEnvOrThrow('NEXT_PUBLIC_APPWRITE_PROJECT_ID', 'college-football-fantasy-app')
  const databaseId = getEnvOrThrow('NEXT_PUBLIC_APPWRITE_DATABASE_ID', 'college-football-fantasy')
  const apiKey = getEnvOrThrow('APPWRITE_API_KEY')

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const databases = new Databases(client)

  // Fetch all collections
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

  // Fetch details
  const details = await Promise.all(
    allCollections.sort((a, b) => String(a.$id).localeCompare(String(b.$id))).map(async (c) => {
      const [attrs, idxs] = await Promise.all([
        databases.listAttributes(databaseId, c.$id as string).catch(() => ({ attributes: [] })),
        databases.listIndexes(databaseId, c.$id as string).catch(() => ({ indexes: [] })),
      ])
      return {
        id: c.$id as string,
        name: (c.name as string) || c.$id,
        attributes: (attrs as any).attributes || [],
        indexes: (idxs as any).indexes || []
      }
    })
  )

  let mermaid = ''
  mermaid += 'graph TB\n'
  mermaid += '  classDef coll fill:#0ea5e9,stroke:#0369a1,stroke-width:2,color:#fff,rx:6,ry:6\n'
  mermaid += '  classDef attr fill:#111827,stroke:#334155,stroke-width:1,color:#e5e7eb,rx:4,ry:4\n'
  mermaid += '  classDef idx fill:#1f2937,stroke:#4b5563,stroke-width:1,color:#d1d5db,rx:4,ry:4\n'

  for (const d of details) {
    const attrsLines: string[] = []
    const sortedAttrs = [...d.attributes].sort((a: any, b: any) => String(a.key || '').localeCompare(String(b.key || '')))
    for (const a of sortedAttrs) {
      const key = esc(String(a.key || a.name || ''))
      const type = esc(String(a.type || a.kind || ''))
      const req = a.required ? 'required' : 'optional'
      const def = a.default !== undefined && a.default !== null ? ` = ${esc(String(a.default))}` : ''
      attrsLines.push(`- ${key}: ${type} (${req})${def}`)
    }
    const idxLines: string[] = []
    const sortedIdxs = [...d.indexes].sort((a: any, b: any) => String(a.key || a.name || '').localeCompare(String(b.key || b.name || '')))
    for (const ix of sortedIdxs) {
      const name = esc(String(ix.key || ix.name || 'index'))
      const fields = Array.isArray(ix.attributes) ? ix.attributes.map((f: string) => esc(f)).join(' | ') : ''
      const unique = ix.unique ? 'unique' : 'normal'
      idxLines.push(`${name}: [${fields}] ${unique}`)
    }

    const parts: string[] = []
    parts.push(`<b>${esc(d.id)}</b>`)
    if (d.name && d.name !== d.id) parts.push(`<i>${esc(d.name)}</i>`)
    if (attrsLines.length) {
      parts.push('<hr/>')
      for (const line of attrsLines) parts.push(esc(line))
    }
    if (idxLines.length) {
      parts.push('<hr/><i>Indexes</i>')
      for (const line of idxLines) parts.push(esc(line))
    }
    const nodeId = `col_${d.id.replace(/[^a-zA-Z0-9_]/g, '_')}`
    const label = parts.join('<br/>')
    mermaid += `  ${nodeId}["${label}"]:::coll\n`
  }

  const outDir = path.join(process.cwd(), 'docs/diagrams/project-map')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'appwrite-schema.md')
  const content = `# Appwrite Live Schema\n\nUpdated: ${new Date().toISOString()}\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n`
  fs.writeFileSync(outFile, content, 'utf-8')
  console.log(`Wrote Mermaid schema to ${outFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})



