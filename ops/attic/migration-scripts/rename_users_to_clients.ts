#!/usr/bin/env ts-node
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, skipped: 0, errors: 0 }
  // Ensure target exists
  try { await databases.getCollection(databaseId, 'clients') } catch { await databases.createCollection(databaseId, 'clients', 'clients') }

  for await (const u of paginate(databases, databaseId, 'users')) {
    summary.scanned++
    const id = u.$id
    const data = {
      auth_user_id: u.authId || u.userId || id,
      display_name: u.displayName || u.name || '',
      email: u.email || '',
      avatar_url: u.avatar || u.avatar_url || '',
      created_at: u.createdAt || u.created_at || u.$createdAt,
      last_login: u.lastLogin || u.last_login || null
    }
    try {
      const res = await safeCreateOrUpdate(databases, databaseId, 'clients', id, data)
      if (res === 'created') summary.created!++
      if (res === 'updated') summary.updated!++
    } catch (e) { summary.errors!++ }
  }

  writeSummary('rename_users_to_clients', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


