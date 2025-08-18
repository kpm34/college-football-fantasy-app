import fs from 'node:fs/promises'
import path from 'node:path'
import { MermaidRenderer } from '../../../components/docs/MermaidRenderer'

async function loadMermaidBlocks(filePath: string): Promise<string[]> {
  try {
    const absolutePath = path.join(process.cwd(), filePath)
    const content = await fs.readFile(absolutePath, 'utf8')
    const blocks: string[] = []
    const regex = /```mermaid\n([\s\S]*?)```/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(content))) {
      blocks.push(match[1].trim())
    }
    return blocks
  } catch {
    return []
  }
}

export default async function Page() {
  // Try filesystem first; if empty (e.g., on certain serverless builds), use API fallback
  let charts = (await loadMermaidBlocks('docs/PROJECT_MAP.md'))
    .concat(await loadMermaidBlocks('PROJECT_MAP.md'))
  let extra = await loadMermaidBlocks('docs/SYSTEM_MAP.md')
  if (charts.length === 0) {
    try {
      const res = await fetch('/api/docs/mermaid/project-map', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        charts = Array.isArray(json.charts) ? json.charts : []
      }
    } catch {}
  }
  if (extra.length === 0) {
    // SYSTEM_MAP fallback is non-critical; ignore
  }
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Project Map</h1>
      <MermaidRenderer charts={[...charts, ...extra]} />
    </div>
  )
}


