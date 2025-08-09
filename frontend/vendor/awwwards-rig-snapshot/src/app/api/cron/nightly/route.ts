export const runtime = 'nodejs'

export async function GET() {
  const now = new Date().toISOString()
  // Minimal stub: extend with real nightly tasks
  return new Response(JSON.stringify({ ok: true, ranAt: now }), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  })
}


