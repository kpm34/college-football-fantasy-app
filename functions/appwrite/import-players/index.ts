import { Client, Databases, ID } from 'node-appwrite'

export interface ImportEvent {
  season: number
  conference?: string
}

export async function main(event: ImportEvent) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!)

  const databases = new Databases(client)
  const dbId = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy'

  // TODO: wire to data/scripts ingestors or CFBD API
  console.log(`[import-players] starting import for season=${event.season}`)

  return { ok: true, imported: 0 }
}

export default main
