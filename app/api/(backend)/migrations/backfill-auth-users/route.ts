import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, serverUsers as users, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface InputUser {
  email: string;
  password: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Require admin session (owner email) to run
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const currentUser = await userRes.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
    if ((currentUser.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { users: inputUsers } = await request.json() as { users: InputUser[] };
    if (!Array.isArray(inputUsers) || inputUsers.length === 0) {
      return NextResponse.json({ error: 'No users provided' }, { status: 400 });
    }

    const results: Array<{ email: string; status: 'created' | 'exists' | 'skipped' | 'error'; message?: string }> = [];

    // Fetch existing profiles (optional; used to backfill authMethod flag)
    let profiles: any[] = [];
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.activityLog, []);
      profiles = (res.documents as any[]) || [];
    } catch {}

    // For each provided user, attempt to create Appwrite Account using given password
    for (const u of inputUsers) {
      const email = (u.email || '').trim();
      const password = u.password || '';
      const name = u.name || email.split('@')[0];
      if (!email || !password) {
        results.push({ email, status: 'skipped', message: 'Missing email or password' });
        continue;
      }

      try {
        // Check if account exists (list and filter by email)
        const all = await users.list();
        const exists = (all.users || []).some((acc: any) => (acc.email || '').toLowerCase() === email.toLowerCase());
        if (exists) {
          results.push({ email, status: 'exists' });
        } else {
          // Signature: create(client_id, email?, phone?, password?, name?)
          await users.create('unique()', email, undefined, password, name);
          results.push({ email, status: 'created' });
        }

        // Backfill profile flag
        const profile = profiles.find((p) => (p.email || '').toLowerCase() === email.toLowerCase());
        if (profile) {
          try {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.activityLog, profile.$id, {
              authMethod: 'email',
              migratedAt: new Date().toISOString()
            });
          } catch {}
        }
      } catch (err: any) {
        results.push({ email, status: 'error', message: err?.message || 'Failed' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Backfill auth users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to backfill users' },
      { status: 500 }
    );
  }
}


