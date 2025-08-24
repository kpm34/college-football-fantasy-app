#!/usr/bin/env tsx

import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { Client, Databases } from 'node-appwrite'

// Load production env if available
const prodEnv = path.resolve(process.cwd(), '.vercel/.env.production.local')
if (fs.existsSync(prodEnv)) {
  dotenv.config({ path: prodEnv })
} else if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
}

function sanitize(v?: string): string { return (v || '').replace(/^"|"$/g, '').trim().replace(/\n/g, '') }

const endpoint = sanitize(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
const project  = sanitize(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
const databaseId = sanitize(process.env.DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy')
const apiKey   = sanitize(process.env.APPWRITE_API_KEY)

if (!endpoint || !project || !apiKey) {
  console.error('Missing Appwrite env: endpoint/project/apiKey required')
  process.exit(1)
}

async function run() {
  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey)
  const databases = new Databases(client)

  const res: any = await databases.listCollections(databaseId as any)
  const rows: string[] = []
  rows.push('Collection,Attributes,Indexes,Description')

  for (const col of (res.collections || [])) {
    const attrs = (col.attributes || [])
      .map((a: any) => {
        const req = a.required ? ' required' : ''
        const size = typeof a.size === 'number' ? `:${a.size}` : ''
        const format = a.format ? ` ${a.format}` : ''
        return `${a.key} (${a.type}${size}${format}${req})`
      })
      .join('; ')

    const idx = (col.indexes || [])
      .map((i: any) => i.key || i.uid || i.name)
      .join('; ')

    const desc = (col.description || '').replace(/"/g, '"')

    rows.push(`${col.$id},"${attrs}","${idx}","${desc}"`)
  }

  const outPath = path.resolve(process.cwd(), 'schema', 'Database Schema Table.csv')
  fs.writeFileSync(outPath, rows.join('\n'))
  console.log('Wrote', outPath)
}

run().catch(err => { console.error(err); process.exit(1) })
