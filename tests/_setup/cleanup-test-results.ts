import fs from 'node:fs'
import path from 'node:path'

/**
 * Pre-run cleanup: remove all previous Playwright test results so that
 * after the next run completes, only the latest results exist.
 * Keeps a small marker file `.last-run.json` with timestamp.
 */
export default async function globalSetup() {
  const root = process.cwd()
  const resultsDir = path.join(root, 'test-results')

  try {
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true })
    } else {
      const entries = fs.readdirSync(resultsDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name === '.last-run.json') continue
        rmrf(path.join(resultsDir, entry.name))
      }
    }

    const marker = {
      startedAt: new Date().toISOString(),
    }
    fs.writeFileSync(path.join(resultsDir, '.last-run.json'), JSON.stringify(marker, null, 2))
  } catch (err) {
    // Non-fatal
    console.warn('[cleanup-test-results] warning:', err)
  }
}

function rmrf(targetPath: string) {
  if (!fs.existsSync(targetPath)) return
  const stat = fs.lstatSync(targetPath)
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      rmrf(path.join(targetPath, entry))
    }
    fs.rmdirSync(targetPath)
  } else {
    fs.unlinkSync(targetPath)
  }
}
