#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import { glob } from 'glob'

const ROOT = process.cwd()

async function collectPages() {
  const files = await glob('app/**/page.tsx', { cwd: ROOT })
  const pages = files
    .map(f =>
      f
        .replace('app/', '/')
        .replace('/page.tsx', '')
        .replace(/\/(\(.*?\))\//g, '/') // strip grouping segments
        .replace(/\[([^\]]+)\]/g, ':$1')
        .replace(/^\/$/, '/ (Landing)')
    )
    .filter(Boolean)
  return pages
}

function toGraphTD(pages: string[]): string {
  const lines: string[] = []
  lines.push('graph TD')
  lines.push('  root["/ (Landing)"]')
  const normalized = new Set(pages)
  // Create parent->child edges based on path segments
  Array.from(normalized)
    .sort((a, b) => a.length - b.length)
    .forEach(p => {
      if (p === '/ (Landing)') return
      const parts = p.split('/').filter(Boolean)
      let parent = 'root'
      let currentPath = ''
      for (let i = 0; i < parts.length; i++) {
        currentPath += '/' + parts[i]
        const nodeId = currentPath.replace(/[^a-zA-Z0-9_:]/g, '_') || 'root'
        const label = i === parts.length - 1 ? currentPath : parts[i]
        if (i === parts.length - 1) {
          // final edge: parent -> node
          const parentId = (i === 0 ? 'root' : currentPath.substring(0, currentPath.lastIndexOf('/')).replace(/[^a-zA-Z0-9_:]/g, '_'))
          lines.push(`  ${parentId} --> ${nodeId}["${label}"]`)
        }
      }
    })
  return lines.join('\n')
}

async function main() {
  const pages = await collectPages()
  const graph = toGraphTD(pages)
  const md = ['```mermaid', graph, '```'].join('\n')
  const outWeb = path.join(ROOT, 'docs/diagrams/site map/_generated.sitemap-web-active.md')
  fs.mkdirSync(path.dirname(outWeb), { recursive: true })
  fs.writeFileSync(outWeb, md)
  console.log('✅ Generated sitemap from pages ->', outWeb)
  const outMobile = path.join(ROOT, 'docs/diagrams/site map/_generated.sitemap-mobile-active.md')
  fs.writeFileSync(outMobile, md)
  console.log('✅ Generated mobile sitemap from pages ->', outMobile)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
