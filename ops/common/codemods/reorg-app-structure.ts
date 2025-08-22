/*
  Reorg App Structure Codemod
  - Idempotently creates Option A directories
  - Moves selected paths into segments using `git mv` when available
  - Ensures domain index handlers under app/api/* delegate to existing subroutes
  - Normalizes hook imports to @hooks/*

  Usage:
    npx tsx ops/common/codemods/reorg-app-structure.ts --apply
    npx tsx ops/common/codemods/reorg-app-structure.ts --dry
*/

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

type Mode = 'apply' | 'dry'

const mode: Mode = process.argv.includes('--apply') ? 'apply' : 'dry'
const repoRoot = process.cwd()

function log(step: string, detail?: string) {
  console.log(`[reorg] ${step}${detail ? `: ${detail}` : ''}`)
}

function ensureDir(target: string) {
  if (!fs.existsSync(target)) {
    if (mode === 'apply') fs.mkdirSync(target, { recursive: true })
    log('mkdir', target)
  }
}

function fileExists(p: string) {
  try { return fs.statSync(p).isFile() } catch { return false }
}

function writeFileIfMissing(p: string, content: string) {
  if (!fileExists(p)) {
    if (mode === 'apply') fs.writeFileSync(p, content)
    log('write', p)
  }
}

function tryGitMv(from: string, to: string) {
  if (!fs.existsSync(from)) return
  if (fs.existsSync(to)) return
  const relFrom = path.relative(repoRoot, from)
  const relTo = path.relative(repoRoot, to)
  if (mode === 'apply') {
    try {
      execSync(`git mv -k ${JSON.stringify(relFrom)} ${JSON.stringify(relTo)}`, { stdio: 'ignore' })
    } catch {
      fs.mkdirSync(path.dirname(relTo), { recursive: true })
      fs.renameSync(relFrom, relTo)
    }
  }
  log('move', `${relFrom} -> ${relTo}`)
}

function replaceInFiles(globs: string[], replaces: Array<{ from: RegExp, to: string }>) {
  const files: string[] = []
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) walk(full)
      else files.push(full)
    }
  }
  for (const g of globs) {
    const start = path.join(repoRoot, g)
    if (fs.existsSync(start)) walk(start)
  }
  for (const f of files) {
    let text = fs.readFileSync(f, 'utf8')
    let changed = false
    for (const r of replaces) {
      if (r.from.test(text)) {
        text = text.replace(r.from, r.to)
        changed = true
      }
    }
    if (changed) {
      if (mode === 'apply') fs.writeFileSync(f, text)
      log('edit', f)
    }
  }
}

function ensureApiIndex(domain: string, upstream: string, edge = false) {
  const file = path.join(repoRoot, 'app', 'api', domain, 'route.ts')
  ensureDir(path.dirname(file))
  const runtime = edge ? "export const runtime = 'edge'" : "export const runtime = 'nodejs'"
  const contents = `import { NextRequest } from 'next/server'\n${runtime}\nexport async function GET(request: NextRequest){\n  const url=new URL(request.url)\n  const upstream=\`${upstream}\${url.search || ''}\`\n  const res=await fetch(upstream,{ cache:'no-store', headers:{ cookie: request.headers.get('cookie')||'' }})\n  const data=await res.json().catch(()=>({ ok:true }))\n  return new Response(JSON.stringify(data),{ status: res.status, headers:{ 'content-type':'application/json' }})\n}\n`
  writeFileIfMissing(file, contents)
}

// 1) Create segment dirs
ensureDir(path.join(repoRoot, 'app', '(marketing)'))
ensureDir(path.join(repoRoot, 'app', '(dashboard)'))
ensureDir(path.join(repoRoot, 'app', '(draft)'))

// 2) Move known pages
tryGitMv(path.join(repoRoot, 'app', 'offline'), path.join(repoRoot, 'app', '(marketing)', 'offline'))
tryGitMv(path.join(repoRoot, 'app', 'admin'), path.join(repoRoot, 'app', 'admin')) // normalize to top-level

// 3) Hook index API routes to existing subroutes (idempotent)
ensureApiIndex('leagues', '/api/leagues/search')
ensureApiIndex('players', '/api/players/search', true)
ensureApiIndex('drafts', '/api/drafts', false)
ensureApiIndex('rankings', '/api/rankings/cached', false)
ensureApiIndex('rosters', '/api/leagues/mine', false)
ensureApiIndex('auctions', '/api/auctions', false)
ensureApiIndex('bids', '/api/bids', false)
ensureApiIndex('admin', '/api/admin/pipeline-status', false)
ensureApiIndex('cursor-report', '/api/monitoring/dashboard', false)

// 4) Normalize common hook imports
replaceInFiles([
  'app', 'components', 'lib'
], [
  { from: /from ['"]\/useAuth['"];?/g, to: "from '@hooks/useAuth'" },
  { from: /from ['"]\/useDraftRealtime['"];?/g, to: "from '@hooks/useDraftRealtime'" },
  { from: /from ['"]\/useLeagueMembersRealtime['"];?/g, to: "from '@hooks/useLeagueMembersRealtime'" },
])

log('done', mode === 'apply' ? 'APPLIED' : 'DRY-RUN')


