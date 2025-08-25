import { Client, Databases } from 'node-appwrite'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.DATABASE_ID || 'college-football-fantasy'
const apiKey = process.env.APPWRITE_API_KEY

const JAWN_ID = '6894db4a0001ad84e4b0'

async function main() {
  if (!apiKey) throw new Error('Missing APPWRITE_API_KEY')
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const db = new Databases(client)

  let attrExists = false
  try {
    const attr = await db.getAttribute(databaseId, 'leagues', 'commissioner_auth_user_id')
    attrExists = Boolean(attr)
  } catch {}

  let jawn: any = null
  try {
    jawn = await db.getDocument(databaseId, 'leagues', JAWN_ID)
  } catch {}

  console.log(JSON.stringify({
    commissioner_attr_exists: attrExists,
    jawn: jawn ? {
      id: jawn.$id,
      commissioner_auth_user_id: (jawn as any).commissioner_auth_user_id,
      commissioner: (jawn as any).commissioner,
      owner_client_id: (jawn as any).owner_client_id
    } : null
  }, null, 2))
}

main().catch(err => { console.error(err); process.exit(1) })


