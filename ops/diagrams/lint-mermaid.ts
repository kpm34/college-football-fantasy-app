#!/usr/bin/env tsx
import { glob } from 'glob'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

interface LintError {
  file: string
  message: string
}

const ROOT = process.cwd()
const DIAGRAMS_DIR = path.join(ROOT, 'docs/diagrams')

const IGNORES = ['**/_includes/**', '**/_templates/**', '**/_generated.*']

async function readFiles(specificFiles?: string[]): Promise<string[]> {
  if (specificFiles && specificFiles.length) {
    // Filter to existing files under diagrams dir and with valid extensions
    const picked = specificFiles
      .map(f => path.resolve(ROOT, f))
      .filter(f => f.startsWith(DIAGRAMS_DIR))
      .filter(f => f.endsWith('.md') || f.endsWith('.mmd'))
    return picked
  }
  const patterns = ['**/*.md', '**/*.mmd']
  const files = (
    await Promise.all(
      patterns.map(p => glob(path.join(DIAGRAMS_DIR, p).replace(/\\/g, '/'), { ignore: IGNORES }))
    )
  ).flat()
  // Normalize to posix paths for matching
  return files.sort()
}

function extractMermaidBlocksMd(file: string, content: string) {
  // Capture fenced code blocks
  const blocks: { lang: string; body: string }[] = []
  const fenceRe = /```([a-zA-Z0-9_-]+)?[^\n]*\n([\s\S]*?)\n```/g
  let m: RegExpExecArray | null
  while ((m = fenceRe.exec(content))) {
    const lang = (m[1] || '').trim().toLowerCase()
    const body = m[2]
    blocks.push({ lang, body })
  }
  return blocks
}

function findUnquotedLabels(body: string): string[] {
  const offenders: string[] = []
  // Check various bracket label forms
  const patterns = [
    /\[\[([^\]]*?)\]\]/g, // [[label]]
    /\[([^\]]*?)\]/g, // [label]
    /\(\(([^\)]*?)\)\)/g, // ((label))
    /\(([^\)]*?)\)/g, // (label)
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(body))) {
      const label = (m[1] || '').trim()
      if (!label) continue
      const containsSpecial = /[/:]/.test(label)
      if (!containsSpecial) continue
      const quoted = label.startsWith('"') && label.endsWith('"')
      if (!quoted) {
        offenders.push(label)
      }
    }
  }
  return offenders
}

async function lintFile(file: string): Promise<LintError[]> {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  const isUserJourney = rel.includes('docs/diagrams/user-journeys/')
  const isTemplateOrInclude = /\/(_includes|_templates)\//.test(rel)
  const isGenerated = /\/_generated\./.test(rel)

  const text = fs.readFileSync(file, 'utf8')
  const errors: LintError[] = []

  if (file.endsWith('.mmd')) {
    if (isTemplateOrInclude || isGenerated) return errors
    const body = text
    // mindmap check
    const firstNonComment =
      body
        .split(/\n/)
        .map(s => s.trim())
        .find(s => s && !s.startsWith('%%')) || ''
    if (/^mindmap\b/i.test(firstNonComment) || /```mindmap/.test(body)) {
      errors.push({ file: rel, message: 'mindmap usage is not allowed' })
    }
    // require flowchart TD
    if (!/\bflowchart\s+TD\b/.test(body)) {
      errors.push({ file: rel, message: 'Mermaid block must start with flowchart TD' })
    }
    // label quoting
    const unquoted = findUnquotedLabels(body)
    if (unquoted.length) {
      errors.push({
        file: rel,
        message: `Labels with '/' or ':' must be quoted: ${[...new Set(unquoted)].slice(0, 5).join(', ')}${unquoted.length > 5 ? ' …' : ''}`,
      })
    }
    // Legend for user journeys
    if (isUserJourney && !/\bLegend\[/.test(body)) {
      errors.push({ file: rel, message: 'User-journey is missing Legend block' })
    }
    return errors
  }

  // .md files
  const blocks = extractMermaidBlocksMd(file, text)
  const mermaidBlocks = blocks.filter(b => b.lang === 'mermaid')

  if (!blocks.length || !mermaidBlocks.length) {
    errors.push({ file: rel, message: 'File contains zero Mermaid blocks' })
    return errors
  }

  // Check for mindmap fences
  if (blocks.some(b => b.lang === 'mindmap')) {
    errors.push({ file: rel, message: 'mindmap code fence is not allowed' })
  }

  for (const b of mermaidBlocks) {
    const body = b.body
    const firstNonComment =
      body
        .split(/\n/)
        .map(s => s.trim())
        .find(s => s && !s.startsWith('%%')) || ''
    if (/^mindmap\b/i.test(firstNonComment)) {
      errors.push({ file: rel, message: 'mindmap usage inside mermaid fence is not allowed' })
    }
    if (!/\bflowchart\s+TD\b/.test(body)) {
      errors.push({ file: rel, message: 'Mermaid block must contain flowchart TD' })
    }
    const unquoted = findUnquotedLabels(body)
    if (unquoted.length) {
      errors.push({
        file: rel,
        message: `Labels with '/' or ':' must be quoted: ${[...new Set(unquoted)].slice(0, 5).join(', ')}${unquoted.length > 5 ? ' …' : ''}`,
      })
    }
    if (isUserJourney && !/\bLegend\[/.test(body)) {
      errors.push({ file: rel, message: 'User-journey is missing Legend block' })
    }
  }

  return errors
}

function getStagedDiagramFiles(): string[] {
  try {
    const out = execSync('git diff --cached --name-only -- "docs/diagrams"', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .split(/\r?\n/)
      .filter(Boolean)
    return out
  } catch {
    return []
  }
}

async function main() {
  const args = process.argv.slice(2)
  let targets: string[] | undefined
  if (args.includes('--staged')) {
    targets = getStagedDiagramFiles()
  }
  const files = await readFiles(targets)
  const allErrors: LintError[] = []
  for (const f of files) {
    const errs = await lintFile(f)
    allErrors.push(...errs)
  }

  if (allErrors.length) {
    console.error('Mermaid lint errors:')
    for (const e of allErrors) {
      console.error(`- ${e.file}: ${e.message}`)
    }
    process.exit(1)
  } else {
    console.log(`✅ Mermaid lint passed (${files.length} files checked)`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
