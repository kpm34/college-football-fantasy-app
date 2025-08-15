import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

interface AppwriteWebhookBody {
  events?: string[];
  userId?: string;
  payload?: unknown;
  [key: string]: unknown;
}

function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function getSignatureHeader(request: NextRequest): string | null {
  const headers = request.headers;
  return (
    headers.get('x-appwrite-webhook-signature') ||
    headers.get('x-appwrite-signature') ||
    headers.get('x-signature') ||
    null
  );
}

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  return timingSafeEqual(expected, signature);
}

async function maybeCreateGithubIssue(title: string, body: string): Promise<{ created: boolean; reason?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return { created: false, reason: 'Missing GitHub env (GITHUB_TOKEN/OWNER/REPO)' };
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'schema-drift-bot',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({ title, body }),
  });

  if (!res.ok) {
    return { created: false, reason: `GitHub API error ${res.status}` };
  }

  return { created: true };
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.APPWRITE_WEBHOOK_SECRET;
    const rawBody = await request.text();

    if (secret) {
      const provided = getSignatureHeader(request);
      if (!provided) {
        return NextResponse.json({ success: false, error: 'Missing signature' }, { status: 401 });
      }
      const valid = verifySignature(rawBody, provided, secret);
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('[Schema Drift Webhook] No APPWRITE_WEBHOOK_SECRET set; accepting without verification.');
    }

    const body = safeJsonParse<AppwriteWebhookBody>(rawBody) || {};
    const events = Array.isArray(body.events) ? body.events : [];
    const relevant = events.some((e) => e.startsWith('databases.') && (e.includes('.collections.') || e.includes('.attributes.')));

    if (!relevant) {
      return NextResponse.json({ success: true, skipped: true, reason: 'Irrelevant event' });
    }

    const timestamp = new Date().toISOString();
    const eventsList = events.length ? events.map((e) => `- ${e}`).join('\n') : '(none)';
    const issueBody = `Schema change detected by Appwrite Webhook.\n\nSuggested next steps:\n1. Pull latest schema: \`npm run schema:pull\`\n2. Regenerate types: \`npm run schema:types\`\n3. Commit and push changes\n\nEvents:\n${eventsList}`;

    const result = await maybeCreateGithubIssue(`Appwrite schema changed in Console (${timestamp})`, issueBody);

    return NextResponse.json({ success: true, notified: result.created, reason: result.reason });
  } catch (error: any) {
    console.error('[Schema Drift Webhook] Error:', error);
    return NextResponse.json({ success: false, error: 'Unhandled error' }, { status: 500 });
  }
}


