#!/usr/bin/env ts-node
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

function getLatest(dir: string): string | null {
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'))
    if (!files.length) return null
    const sorted = files.map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a,b)=>b.t-a.t)
    return path.join(dir, sorted[0].f)
  } catch {
    return null
  }
}

function main() {
  const dir = path.join(process.cwd(), 'ops', 'cursor', 'screenshot')
  const latest = getLatest(dir)
  if (!latest) {
    console.log('No screenshots found in ops/cursor/screenshot')
    process.exit(0)
  }
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  try {
    spawn(opener, [latest], { stdio: 'ignore', shell: process.platform === 'win32' }).unref()
    console.log('Opening', latest)
  } catch {
    console.log('Latest screenshot at', latest)
  }
}

if (require.main === module) main()
