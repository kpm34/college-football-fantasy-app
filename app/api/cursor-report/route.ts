import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('screenshot') as File | null
    const path = (form.get('path') as string) || ''

    if (!file) return NextResponse.json({ ok: false, error: 'missing screenshot' }, { status: 400 })

    // For now, just echo back metadata; future: store in tmp or upload to bucket
    const arrayBuffer = await file.arrayBuffer()
    const sizeKb = Math.round(arrayBuffer.byteLength / 1024)

    return NextResponse.json({ ok: true, received: { sizeKb, path, name: file.name, type: file.type } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
