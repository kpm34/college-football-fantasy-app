#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface CaptureOptions {
  inputPath: string
  outDir: string
  headless: boolean
  viewport: { width: number; height: number }
  concurrency: number
}

interface PageSummary {
  url: string
  title: string
  description?: string
  colors: { value: string; count: number }[]
  fonts: { family: string; count: number }[]
  features: string[]
  headings: string[]
  nav: string[]
  timestamp: string
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true })
}

function readLines(file: string): string[] {
  if (!fs.existsSync(file)) return []
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('#'))
}

function toSlug(input: string): string {
  try {
    const url = new URL(input)
    const host = url.host.replace(/[^a-z0-9.-]/gi, '-')
    const pathPart = url.pathname
      .replace(/\/+$/g, '')
      .replace(/\//g, '-')
      .replace(/[^a-z0-9.-]/gi, '-')
    const base = `${host}${pathPart ? '-' + pathPart : ''}`
    return base.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'page'
  } catch {
    return input
      .replace(/https?:\/\//, '')
      .replace(/\W+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

function parseArgs(): CaptureOptions {
  const args = process.argv.slice(2)
  const get = (flag: string, fallback?: string) => {
    const idx = args.findIndex(a => a === flag || a.startsWith(flag + '='))
    if (idx === -1) return fallback
    const eq = args[idx].indexOf('=')
    if (eq !== -1) return args[idx].slice(eq + 1)
    return args[idx + 1]
  }
  const headlessFlag = get('--headless')
  const headless = headlessFlag === 'false' ? false : true
  const inputPath = get('--input', path.resolve(process.cwd(), 'docs/inspiration/urls.txt'))!
  const outDir = path.resolve(process.cwd(), 'docs/inspiration')
  const viewportW = Number(get('--width', '1440'))
  const viewportH = Number(get('--height', '900'))
  const concurrency = Math.max(1, Number(get('--concurrency', '3')))
  return {
    inputPath,
    outDir,
    headless,
    viewport: { width: viewportW, height: viewportH },
    concurrency,
  }
}

async function analyzePage(
  url: string,
  outDir: string,
  viewport: { width: number; height: number },
  headless: boolean
): Promise<PageSummary> {
  const browser = await puppeteer.launch({ headless })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {})

  const slug = toSlug(url)
  const screenshotsDir = path.join(outDir, 'screenshots')
  const dataDir = path.join(outDir, 'data')
  const summariesDir = path.join(outDir, 'summaries')
  ensureDir(screenshotsDir)
  ensureDir(dataDir)
  ensureDir(summariesDir)

  const title = (await page.title()) || ''
  // Try to expand page before screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {})
  await new Promise(resolve => setTimeout(resolve, 350))

  await page
    .screenshot({ path: path.join(screenshotsDir, `${slug}.png`), fullPage: true })
    .catch(() => {})

  const evalScript = `(() => {\n    try {\n      const freq = (items) => {\n        const map = Object.create(null);\n        for (const i of items) map[i] = (map[i] || 0) + 1;\n        return Object.entries(map)\n          .map(([key, count]) => ({ key, count }))\n          .sort((a, b) => b.count - a.count);\n      };\n      const metaEl = document.querySelector('meta[name="description"]');\n      const metaDesc = metaEl ? metaEl.getAttribute('content') || undefined : undefined;\n      const candidates = Array.from(document.querySelectorAll('body, header, nav, main, section, article, footer, button, a, h1, h2, h3, h4, h5, h6, p, .btn, .card, .hero, .cta, .chip, .badge, .tag'));\n      const colorsRaw = [];\n      const fontsRaw = [];\n      const isVisible = (el) => {\n        const rect = el.getBoundingClientRect();\n        return rect.width > 0 && rect.height > 0;\n      };\n      const toColor = (v) => (v && !/rgba\\(\\s*0\\s*,\\s*0\\s*,\\s*0\\s*,\\s*0\\s*\\)/i.test(v) && v !== 'transparent' ? v : null);\n      for (const el of candidates) {\n        if (!isVisible(el)) continue;\n        const cs = getComputedStyle(el);\n        for (const prop of ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor']) {\n          const c = toColor(cs.getPropertyValue(prop));\n          if (c) colorsRaw.push(c);\n        }\n        const ff = cs.getPropertyValue('font-family');\n        if (ff) fontsRaw.push(ff.split(',')[0].replace(/["']/g, '').trim());\n      }\n      const colorFreq = freq(colorsRaw).slice(0, 12);\n      const fontFreq = freq(fontsRaw).slice(0, 8);\n      const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => (h.textContent || '').trim()).filter(Boolean);\n      const nav = Array.from(document.querySelectorAll('nav a')).map((a) => (a.textContent || '').trim()).filter(Boolean);\n      const features = [];\n      if (window.THREE) features.push('three.js');\n      if (window.gsap) features.push('gsap');\n      if (document.querySelector('canvas')) features.push('canvas/webgl');\n      if (document.querySelector('video')) features.push('video');\n      if (document.querySelector('model-viewer')) features.push('model-viewer');\n      if (document.querySelector('[data-spline]') || document.querySelector('spline-viewer') || document.querySelector('iframe[src*="spline.design"]')) features.push('spline');\n      return { description: metaDesc, colors: colorFreq.map(({ key, count }) => ({ value: key, count })), fonts: fontFreq.map(({ key, count }) => ({ family: key, count })), headings, nav, features };\n    } catch (e) {\n      return { error: String(e) };\n    }\n  })()`
  const summary: any = await page.evaluate(evalScript)

  const data: PageSummary = {
    url,
    title,
    description: summary.description,
    colors: summary.colors,
    fonts: summary.fonts,
    features: summary.features,
    headings: summary.headings,
    nav: summary.nav,
    timestamp: new Date().toISOString(),
  }

  const jsonPath = path.join(dataDir, `${slug}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')

  const md = `# Inspiration Summary\n\n- **URL**: ${url}\n- **Title**: ${title}\n- **Description**: ${data.description || ''}\n- **Features**: ${data.features.join(', ') || 'n/a'}\n\n## Top Colors\n${data.colors
    .slice(0, 8)
    .map(c => `- ${c.value} (${c.count})`)
    .join('\n')}\n\n## Fonts\n${data.fonts
    .slice(0, 6)
    .map(f => `- ${f.family} (${f.count})`)
    .join(
      '\n'
    )}\n\n## Headings\n${data.headings.map(h => `- ${h}`).join('\n')}\n\n## Nav\n${data.nav.map(n => `- ${n}`).join('\n')}\n`
  fs.writeFileSync(path.join(summariesDir, `${slug}.md`), md, 'utf8')

  await browser.close()
  return data
}

async function main() {
  const opts = parseArgs()
  ensureDir(path.join(opts.outDir, 'screenshots'))
  ensureDir(path.join(opts.outDir, 'data'))
  ensureDir(path.join(opts.outDir, 'summaries'))

  const urls = readLines(opts.inputPath)
  if (urls.length === 0) {
    console.error(`No URLs found. Add some to ${opts.inputPath}`)
    process.exit(1)
  }

  const queue = urls.slice()
  const results: PageSummary[] = []

  const workers = Array.from({ length: opts.concurrency }).map(async () => {
    while (queue.length > 0) {
      const url = queue.shift()!
      try {
        const res = await analyzePage(url, opts.outDir, opts.viewport, opts.headless)
        results.push(res)
        console.log(`Captured: ${url}`)
      } catch (err) {
        console.warn(`Failed: ${url}`, err)
      }
    }
  })

  await Promise.all(workers)
  console.log(`Done. ${results.length} pages captured.`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
