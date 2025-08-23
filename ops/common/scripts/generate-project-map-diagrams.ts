#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'docs/diagrams/project-map')

const ROOT_FOLDERS = [
  'app',
  'components',
  'lib',
  'data',
  'schema',
  'future',
  'functions',
  'docs',
  'ops',
  'public',
]

function list(dir: string, depth = 2): string[] {
  const abs = path.join(ROOT, dir)
  if (!fs.existsSync(abs)) return []
  const entries = fs.readdirSync(abs, { withFileTypes: true })
  const lines: string[] = []
  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    const rel = path.join(dir, e.name)
    if (e.isDirectory()) {
      lines.push(`${rel}/`)
      if (depth > 1) {
        for (const sub of list(rel, depth - 1)) {
          lines.push(sub)
        }
      }
    } else {
      lines.push(rel)
    }
  }
  return lines
}

function buildMermaid(root: string): string {
  const id = (s: string) => s.replace(/[^a-zA-Z0-9_]/g, '_')
  const labelText = (s: string) => s.replace(/"/g, '\\"')
  const lines: string[] = []
  lines.push('# Project Map — ' + root)
  lines.push('')
  lines.push('```mermaid')
  lines.push('flowchart TB')
  // Classes for folders vs files - high contrast with dark brown fonts
  lines.push('  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8')
  lines.push('  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4')
  lines.push(`  R["${labelText(root + '/')}"]`)
  lines.push('  class R folder')

  // Root-only view: show only immediate subfolders and selected root files
  const absRoot = path.join(ROOT, root)
  if (!fs.existsSync(absRoot)) {
    lines.push('```')
    lines.push('')
    return lines.join('\n')
  }

  // Show a few common root files prominently (if they exist)
  const highlightRootFiles: string[] = root === 'app'
    ? ['global-error.tsx', 'globals.css', 'layout.tsx']
    : []
  for (const f of highlightRootFiles) {
    const abs = path.join(absRoot, f)
    if (fs.existsSync(abs)) {
      lines.push(`  ${id(f)}["${labelText(f)}"]`)
      lines.push(`  class ${id(f)} file`)
      lines.push(`  R --> ${id(f)}`)
    }
  }

  const entries = fs.readdirSync(absRoot, { withFileTypes: true })
  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    if (!e.isDirectory()) continue
    const visualName = e.name.replace(/[()]/g, '') + '/'
    const grpId = id(`${root}_${visualName}`)
    lines.push(`  ${grpId}["${labelText(visualName)}"]`)
    lines.push(`  class ${grpId} folder`)
    lines.push(`  R --> ${grpId}`)
    const groupSlug = visualName.replace(/\/$/, '')
    lines.push(`  click ${grpId} "/admin/project-map/${root}/${groupSlug}" "Open ${groupSlug}"`)
  }

  lines.push('```')
  lines.push('')
  return lines.join('\n')
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true })
}

function writeFileEnsuringDir(filePath: string, content: string) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, content, 'utf8')
}

function findMatchingDir(parentAbs: string, displayName: string): string | null {
  if (!fs.existsSync(parentAbs)) return null
  const entries = fs.readdirSync(parentAbs, { withFileTypes: true })
  for (const e of entries) {
    if (!e.isDirectory()) continue
    const normalized = e.name.replace(/[()]/g, '')
    if (normalized === displayName) return e.name
  }
  return null
}

function buildHeader(title: string): string[] {
  const labelText = (s: string) => s.replace(/"/g, '\\"')
  const lines: string[] = []
  lines.push('# ' + title)
  lines.push('')
  lines.push('```mermaid')
  lines.push('flowchart TB')
  lines.push('  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8')
  lines.push('  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4')
  return lines
}

function buildGroupDiagram(root: string, groupDisplay: string): string {
  const id = (s: string) => s.replace(/[^a-zA-Z0-9_]/g, '_')
  const labelText = (s: string) => s.replace(/"/g, '\\"')
  const lines = buildHeader(`Project Map — ${root}/${groupDisplay}`)
  const parentAbs = path.join(ROOT, root)
  const actual = findMatchingDir(parentAbs, groupDisplay) || groupDisplay
  const absGroup = path.join(parentAbs, actual)
  const rootId = id(`${root}_${groupDisplay}`)
  lines.push(`  ${rootId}["${labelText(root + '/' + groupDisplay + '/')}" ]`)
  lines.push(`  class ${rootId} folder`)
  if (fs.existsSync(absGroup)) {
    const children = fs.readdirSync(absGroup, { withFileTypes: true })
    for (const c of children) {
      if (c.name.startsWith('.')) continue
      const isDir = c.isDirectory()
      const display = isDir ? `${c.name}/` : c.name
      const nodeId = id(`${root}_${groupDisplay}_${c.name}`)
      lines.push(`  ${nodeId}["${labelText(display)}"]`)
      lines.push(`  class ${nodeId} ${isDir ? 'folder' : 'file'}`)
      lines.push(`  ${rootId} --> ${nodeId}`)
      if (isDir) {
        const subDisplay = c.name
        lines.push(`  click ${nodeId} "/admin/project-map/${root}/${groupDisplay}/${subDisplay}" "Open ${subDisplay}"`)
      }
    }
  }
  lines.push('```')
  lines.push('')
  return lines.join('\n')
}

function buildSubDiagram(root: string, groupDisplay: string, subDisplay: string): string {
  const id = (s: string) => s.replace(/[^a-zA-Z0-9_]/g, '_')
  const labelText = (s: string) => s.replace(/"/g, '\\"')
  const lines = buildHeader(`Project Map — ${root}/${groupDisplay}/${subDisplay}`)
  const parentAbs = path.join(ROOT, root)
  const actualGroup = findMatchingDir(parentAbs, groupDisplay) || groupDisplay
  const absGroup = path.join(parentAbs, actualGroup)
  const actualSub = findMatchingDir(absGroup, subDisplay) || subDisplay
  const absSub = path.join(absGroup, actualSub)
  const subId = id(`${root}_${groupDisplay}_${subDisplay}`)
  lines.push(`  ${subId}["${labelText(root + '/' + groupDisplay + '/' + subDisplay + '/')}" ]`)
  lines.push(`  class ${subId} folder`)
  if (fs.existsSync(absSub)) {
    const children = fs.readdirSync(absSub, { withFileTypes: true })
    for (const c of children) {
      if (c.name.startsWith('.')) continue
      const isDir = c.isDirectory()
      const display = isDir ? `${c.name}/` : c.name
      const nodeId = id(`${root}_${groupDisplay}_${subDisplay}_${c.name}`)
      lines.push(`  ${nodeId}["${labelText(display)}"]`)
      lines.push(`  class ${nodeId} ${isDir ? 'folder' : 'file'}`)
      lines.push(`  ${subId} --> ${nodeId}`)
    }
  }
  lines.push('```')
  lines.push('')
  return lines.join('\n')
}
async function main() {
  ensureDir(OUT_DIR)
  const summary: Record<string, number> = {}
  for (const folder of ROOT_FOLDERS) {
    // Root page → nested at <OUT_DIR>/<root>/index.md
    const content = buildMermaid(folder)
    const nestedRoot = path.join(OUT_DIR, folder, 'index.md')
    writeFileEnsuringDir(nestedRoot, content)
    summary[folder] = content.length

    // Also write flat file for backward compatibility
    const flatRoot = path.join(OUT_DIR, `${folder}.md`)
    writeFileEnsuringDir(flatRoot, content)

    // Generate group pages (second level)
    const absRoot = path.join(ROOT, folder)
    if (!fs.existsSync(absRoot)) continue
    const entries = fs.readdirSync(absRoot, { withFileTypes: true })
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.')) continue
      const groupName = e.name.replace(/[()]/g, '')
      const groupDiagram = buildGroupDiagram(folder, groupName)
      const nestedGroup = path.join(OUT_DIR, folder, groupName, 'index.md')
      writeFileEnsuringDir(nestedGroup, groupDiagram)
      // Flat fallback
      const flatGroup = path.join(OUT_DIR, `${folder}.${groupName}.md`)
      writeFileEnsuringDir(flatGroup, groupDiagram)

      // Generate third-level pages for each subfolder inside the group
      const absGroup = path.join(absRoot, e.name)
      const subs = fs.readdirSync(absGroup, { withFileTypes: true })
      for (const s of subs) {
        if (!s.isDirectory() || s.name.startsWith('.')) continue
        const subName = s.name
        const subDiagram = buildSubDiagram(folder, groupName, subName)
        const nestedSub = path.join(OUT_DIR, folder, groupName, subName, 'index.md')
        writeFileEnsuringDir(nestedSub, subDiagram)
        // Flat fallback
        const flatSub = path.join(OUT_DIR, `${folder}.${groupName}.${subName}.md`)
        writeFileEnsuringDir(flatSub, subDiagram)
      }
    }
  }
  console.log('Generated project-map diagrams:', Object.keys(summary).length)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
