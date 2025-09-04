import * as canonical from '@/app/api/(frontend)/draft/players/route'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  // Forward to canonical handler
  // NextRequest is compatible enough for this simple passthrough
  // @ts-ignore
  return canonical.GET(request)
}
