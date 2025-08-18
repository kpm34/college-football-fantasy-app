import fs from 'node:fs/promises'
import path from 'node:path'
import { MermaidRenderer } from '@/components/docs/MermaidRenderer'

async function loadMermaidBlocks(filePath: string): Promise<string[]> {
  const absolutePath = path.join(process.cwd(), filePath)
  const content = await fs.readFile(absolutePath, 'utf8')
  const blocks: string[] = []
  const regex = /```mermaid\n([\s\S]*?)```/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content))) {
    blocks.push(match[1].trim())
  }
  return blocks
}

export default async function Page() {
  const charts = await loadMermaidBlocks('PROJECT_MAP.md')
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Project Map</h1>
      <MermaidRenderer charts={charts} />
    </div>
  )
}


