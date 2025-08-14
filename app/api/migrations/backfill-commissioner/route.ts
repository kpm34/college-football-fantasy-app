import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

export const runtime = 'nodejs';

function getEnv(name: string, fallback?: string): string {
  const v = process.env[name] || fallback;
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) return false;
    // Use explicit cookie name to avoid subtle mismatches
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const res = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': getEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID', 'college-football-fantasy-app'),
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
    });
    if (!res.ok) return false;
    const user = await res.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
    return user?.email === adminEmail;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorized = await isAdmin(request) || (request.headers.get('x-migration-token') && request.headers.get('x-migration-token') === process.env.MIGRATION_TOKEN);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const endpoint = getEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT', 'https://nyc.cloud.appwrite.io/v1');
    const project = getEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID', 'college-football-fantasy-app');
    const databaseId = getEnv('NEXT_PUBLIC_APPWRITE_DATABASE_ID', 'college-football-fantasy');
    const apiKey = getEnv('APPWRITE_API_KEY');

    const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
    const databases = new Databases(client);

    let offset = 0;
    const limit = 100;
    let updated = 0;

    while (true) {
      const batch = await databases.listDocuments(databaseId, 'leagues', [Query.limit(limit), Query.offset(offset)]);
      if (batch.documents.length === 0) break;

      for (const raw of batch.documents as any[]) {
        const doc = raw as any;
        const commissioner = doc.commissioner || doc.commissioner_id;
        const commissionerId = doc.commissionerId || doc.commissioner_id;

        const update: Record<string, any> = {};
        // Ensure commissioner exists
        if (!commissioner && commissionerId) {
          update.commissioner = commissionerId;
        }
        // If legacy field present, remove it (now optional as per updated schema)
        if (typeof doc.commissionerId !== 'undefined') {
          update.commissionerId = null;
        }

        if (Object.keys(update).length > 0) {
          await databases.updateDocument(databaseId, 'leagues', doc.$id, update);
          updated += 1;
        }
      }

      offset += batch.documents.length;
    }

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message || 'Migration failed' }, { status: 500 });
  }
}


