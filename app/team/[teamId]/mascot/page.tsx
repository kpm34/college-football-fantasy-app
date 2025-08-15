'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { GLTFViewer } from './viewer'

// Lazy-load the 3D studio shell when ready; placeholder for future vendor import
const StudioPlaceholder = () => (
  <div className="aspect-video w-full rounded-xl border border-white/10 bg-white/5 grid place-items-center text-sm text-white/70">
    3D Mascot Studio loading...
  </div>
)

export default function MascotStudioPage({ params }: { params: { teamId: string } }) {
  const [saving, setSaving] = useState(false)
  const [preset, setPreset] = useState<Record<string, unknown> | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [glbUrl, setGlbUrl] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/teams/${params.teamId}/mascot`, { cache: 'no-store' })
        const data = await res.json()
        if (data?.mascotPreset) setPreset(data.mascotPreset)
        if (data?.outputGlbUrl) setGlbUrl(data.outputGlbUrl)
      } catch {}
      setLoaded(true)
    }
    load()
  }, [params.teamId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/teams/${params.teamId}/mascot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mascotPreset: preset })
      })
      if (!res.ok) throw new Error('Failed to save')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bebas uppercase tracking-wide text-3xl">Mascot Studio</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-pink-600 text-white disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Preset'}
            </button>
          </div>
        </div>

        <div className="aspect-video w-full rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          {glbUrl ? <GLTFViewer url={glbUrl} /> : <StudioPlaceholder />}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p>
            This is a lightweight shell. When the 3D editor is finalized, we will swap in the
            full editor component, add helmet and football tabs, and enable thumbnail export
            and storage uploads.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 text-white text-sm"
              onClick={async () => {
                const res = await fetch('/api/blender/exports', { cache: 'no-store' })
                const data = await res.json()
                const first = data?.files?.[0]
                if (first?.fileId) setGlbUrl(`/api/blender/file/${first.fileId}`)
              }}
            >
              Load Latest Export
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}


