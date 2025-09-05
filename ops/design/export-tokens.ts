/*
  Export design tokens from our codebase into a Tokens Studio compatible JSON.
  - Reads CSS variables from app/globals.css (ui-* and color-* tokens)
  - Reads Tailwind extended colors from tailwind.config.js
  - Writes to ops/design/tokens.tokens.json
*/
import fs from 'node:fs'
import path from 'node:path'

type Token = { value: string; type: string }
type TokenGroup = Record<string, Token | TokenGroup>

const rootDir = process.cwd()
const globalsCssPath = path.join(rootDir, 'app', 'globals.css')
const tailwindConfigPath = path.join(rootDir, 'tailwind.config.js')
const outDir = path.join(rootDir, 'ops', 'design')
const outFile = path.join(outDir, 'tokens.tokens.json')

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function parseCssTokens(fileContent: string) {
  // Collect lines containing CSS custom properties
  const lines = fileContent.split(/\r?\n/)
  const ui: Record<string, Token> = {}
  const baseColors: Record<string, Token> = {}

  for (const line of lines) {
    const m = line.match(/--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/)
    if (!m) continue
    const name = m[1]
    const val = m[2].trim()
    if (name.startsWith('ui-')) {
      const key = name.replace(/^ui-/, '').replace(/-/g, '')
      ui[key] = { value: val, type: 'color' }
    } else if (name.startsWith('color-')) {
      const key = name.replace(/^color-/, '').replace(/-/g, '')
      // Heuristic: values are colors or gradients; mark gradients as gradient type
      const type = val.includes('gradient(') ? 'gradient' : 'color'
      baseColors[key] = { value: val, type }
    }
  }

  return { ui, baseColors }
}

function parseTailwindColors(): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cfg = require(tailwindConfigPath)
  const colors = ((cfg && cfg.theme && cfg.theme.extend && cfg.theme.extend.colors) ||
    {}) as Record<string, any>
  return colors
}

function flatten(obj: Record<string, any>, prefix: string[] = []) {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      out[[...prefix, k].join('.')] = v
    } else if (v && typeof v === 'object') {
      Object.assign(out, flatten(v, [...prefix, k]))
    }
  }
  return out
}

function nestTokens(flat: Record<string, string>, type: string): TokenGroup {
  const root: TokenGroup = {}
  for (const [k, v] of Object.entries(flat)) {
    const parts = k.split('.')
    let node: TokenGroup = root
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]
      if (i === parts.length - 1) {
        node[p] = { value: v, type }
      } else {
        if (!node[p] || typeof node[p] !== 'object') node[p] = {}
        node = node[p] as TokenGroup
      }
    }
  }
  return root
}

function main() {
  const css = fs.readFileSync(globalsCssPath, 'utf-8')
  const { ui, baseColors } = parseCssTokens(css)
  const tw = parseTailwindColors()
  const twFlat = flatten(tw)

  const tokens: Record<string, any> = {
    color: {
      ui,
      base: baseColors,
      tailwind: nestTokens(twFlat, 'color'),
    },
  }

  ensureDir(outDir)
  fs.writeFileSync(outFile, JSON.stringify(tokens, null, 2), 'utf-8')
  console.log('✅ Tokens exported to', path.relative(rootDir, outFile))
}

main()
