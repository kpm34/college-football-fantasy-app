import { MermaidRenderer } from '@components/docs/MermaidRenderer'

export default async function Page() {
  let charts: string[] = []
  try {
    const res = await fetch('/api/docs/mermaid/data-flow', { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      charts = Array.isArray(json.charts) ? json.charts : []
    }
  } catch {}

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Data Flow</h1>
      <MermaidRenderer charts={charts} />
    </div>
  )
}


