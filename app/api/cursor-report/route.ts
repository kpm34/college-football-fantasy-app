import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import nodePath from 'node:path'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('screenshot') as File | null
    const reqPath = (form.get('path') as string) || ''

    if (!file) return NextResponse.json({ ok: false, error: 'missing screenshot' }, { status: 400 })

    // Persist to ops/cursor/screenshot with timestamp
    const arrayBuffer = await file.arrayBuffer()
    const buf = Buffer.from(arrayBuffer)
    const dir = nodePath.join(process.cwd(), 'ops', 'cursor', 'screenshot')
    try { fs.mkdirSync(dir, { recursive: true }) } catch {}
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const out = nodePath.join(dir, `${stamp}-${file.name || 'cursor-context'}.png`)
    fs.writeFileSync(out, buf)
    const sizeKb = Math.round(buf.byteLength / 1024)

    return NextResponse.json({ ok: true, saved: out.replace(process.cwd() + nodePath.sep, ''), meta: { sizeKb, path: reqPath, name: file.name, type: file.type } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
