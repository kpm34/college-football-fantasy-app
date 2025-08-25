import { Client, Databases } from 'node-appwrite'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.DATABASE_ID || 'college-football-fantasy'
const apiKey = process.env.APPWRITE_API_KEY

if (!apiKey) {
  console.error('Missing APPWRITE_API_KEY')
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
const db = new Databases(client)

const snakeAttrs = [
  'draft_date',
  'draft_type',
  'is_public',
  'max_teams',
  'pick_time_seconds',
  'playoff_start_week'
]

async function main() {
  for (const key of snakeAttrs) {
    try {
      await db.deleteAttribute(databaseId, 'leagues', key)
      console.log(`Deleted leagues.${key}`)
    } catch (e: any) {
      console.warn(`Could not delete leagues.${key}: ${e?.message}`)
    }
  }
}

main().catch(err => { console.error(err); process.exit(1) })


