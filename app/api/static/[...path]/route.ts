import fs from 'node:fs'
import path from 'node:path'

export async function GET(
  _request: any,
  ctx: { params: Promise<{ path: string[] }> } | { params: { path: string[] } }
) {
  try {
    const resolved = 'then' in ctx.params ? await (ctx.params as Promise<{ path: string[] }>) : (ctx.params as { path: string[] })
    const filePath = path.join(process.cwd(), 'public', ...resolved.path)

    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: 'File not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }

    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === '.html') contentType = 'text/html; charset=utf-8'
    else if (ext === '.css') contentType = 'text/css; charset=utf-8'
    else if (ext === '.js') contentType = 'application/javascript; charset=utf-8'
    else if (ext === '.json') contentType = 'application/json; charset=utf-8'
    else if (ext === '.svg') contentType = 'image/svg+xml'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.drawio') contentType = 'application/xml; charset=utf-8'

    const data = fs.readFileSync(filePath)
    return new Response(data, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}