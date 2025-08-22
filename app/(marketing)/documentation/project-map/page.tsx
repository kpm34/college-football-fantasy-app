import { MermaidRenderer } from '@/components/docs/MermaidRenderer'

export default async function Page() {
  let charts: string[] = []
  let systemCharts: string[] = []
  try {
    const [pmRes, smRes] = await Promise.all([
      fetch('/api/docs/mermaid/project-map', { cache: 'no-store' }),
      fetch('/api/docs/mermaid/system-map', { cache: 'no-store' })
    ])
    if (pmRes.ok) {
      const json = await pmRes.json()
      charts = Array.isArray(json.charts) ? json.charts : []
    }
    if (smRes.ok) {
      const json = await smRes.json()
      systemCharts = Array.isArray(json.charts) ? json.charts : []
    }
  } catch {}

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Project Map</h1>
      <MermaidRenderer charts={[...charts, ...systemCharts]} />
    </div>
  )
}


