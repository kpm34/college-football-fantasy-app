import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('screenshot') as File | null
    const path = (form.get('path') as string) || ''

    if (!file) return NextResponse.json({ ok: false, error: 'missing screenshot' }, { status: 400 })

    // Persist to ops/cursor/screenshot with timestamp
    const arrayBuffer = await file.arrayBuffer()
    const buf = Buffer.from(arrayBuffer)
    const dir = path.join(process.cwd(), 'ops', 'cursor', 'screenshot')
    try { fs.mkdirSync(dir, { recursive: true }) } catch {}
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const out = path.join(dir, `${stamp}-${file.name || 'cursor-context'}.png`)
    fs.writeFileSync(out, buf)
    const sizeKb = Math.round(buf.byteLength / 1024)

    return NextResponse.json({ ok: true, saved: out.replace(process.cwd() + path.sep, ''), meta: { sizeKb, path, name: file.name, type: file.type } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
