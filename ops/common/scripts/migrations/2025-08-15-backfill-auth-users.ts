/**
 * Backfill: For any user profiles that exist in `users` collection without a corresponding
 * Appwrite Account, auto-create an account with a temporary password and email the user (TODO).
 *
 * Safety:
 * - Only runs on server with APPWRITE_API_KEY set
 * - Skips documents missing valid email
 * - Won't overwrite existing Accounts
 */

import { serverDatabases as databases, serverUsers as users, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';

function randomTempPassword(): string {
  const base = Math.random().toString(36).slice(2);
  return `Temp-${base}-A1!`;
}

async function main() {
  // 1) Read all user profile docs
  const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, []);

  let created = 0;
  for (const doc of profiles.documents as any[]) {
    const email: string | undefined = doc.email || doc.username || doc.contactEmail;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) continue;

    try {
      // 2) Try to find existing account by email
      // Appwrite Users API doesn't provide direct find-by-email; attempt list + filter
      const all = await users.list();
      const exists = (all.users || []).some((u: any) => u.email?.toLowerCase() === email.toLowerCase());
      if (exists) continue;

      // 3) Create account with temp password
      const tempPass = randomTempPassword();
      const account = await users.create('unique()', email, tempPass, doc.name || email.split('@')[0]);

      // 4) Optionally store authMethod info on profile
      try {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, doc.$id, {
          authMethod: 'email',
          migratedAt: new Date().toISOString()
        });
      } catch {}

      // TODO: send onboarding email with password reset link
      console.log(`Created account for ${email} (id: ${account.$id})`);
      created += 1;
    } catch (err) {
      console.error(`Failed to create account for ${email}:`, err);
    }
  }

  console.log(`Backfill complete. Created ${created} accounts.`);
}

// Run when executed directly with ts-node or next-node runtime
main().catch((e) => {
  console.error(e);
  process.exit(1);
});


