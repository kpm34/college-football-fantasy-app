import fs from 'node:fs'
import path from 'node:path'
import fetch from 'node-fetch'
import pdf from 'pdf-parse'
import { driveFileUrlById } from '../../lib/utils/drive'

async function main() {
  const fileId = process.argv[2] || '1SJHgcZrBx_ktqRObAhWe8YJMsUy-xMWr'
  const outDir = path.join(process.cwd(), 'docs', 'external', 'parsed')
  fs.mkdirSync(outDir, { recursive: true })

  const url = driveFileUrlById(fileId)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download PDF: ${res.status} ${res.statusText}`)
  const buf = Buffer.from(await res.arrayBuffer())

  const data = await pdf(buf, { pagerender: undefined })
  // data.text is whole doc; for page-wise, split on form feed \f which pdf-parse inserts
  const pages = data.text.split('\f').map(s => s.trim()).filter(Boolean)

  const joinedPath = path.join(outDir, 'directory-map.pages.json')
  fs.writeFileSync(joinedPath, JSON.stringify({ fileId, pagesCount: pages.length, pages }, null, 2))

  const mdPath = path.join(outDir, 'directory-map.all.md')
  fs.writeFileSync(mdPath, pages.map((p, i) => `# Page ${i+1}\n\n${p}\n`).join('\n\n---\n\n'))

  console.log(`Wrote ${pages.length} pages to`, joinedPath)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
