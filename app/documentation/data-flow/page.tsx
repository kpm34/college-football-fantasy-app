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
  let charts = await loadMermaidBlocks('docs/DATA_FLOW.md')
  if (charts.length === 0) {
    try {
      const res = await fetch('/api/docs/mermaid/data-flow', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        charts = Array.isArray(json.charts) ? json.charts : []
      }
    } catch {}
  }
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Data Flow</h1>
      <MermaidRenderer charts={charts} />
    </div>
  )
}


