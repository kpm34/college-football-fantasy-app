'use client'

import { useEffect, useMemo, useState } from 'react'

type Row = {
  Section: string
  Route: string
  Access: string
  Status: string
  Notes: string
}

export default function SiteMapFinalTablePage() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<keyof Row>('Section')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(
          '/api/docs/diagrams/site map/sitemap-final-version.csv?bypass=1',
          { cache: 'no-store' }
        )
        if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status})`)
        const text = await res.text()
        const lines = text.trim().split(/\r?\n/)
        const header = lines.shift() || ''
        const cols = header.split(',').map(s => s.replace(/^\"|\"$/g, ''))
        const out: Row[] = []
        for (const line of lines) {
          const parts = parseCsvLine(line)
          if (parts.length < 5) continue
          out.push({
            Section: parts[0],
            Route: parts[1],
            Access: parts[2],
            Status: parts[3],
            Notes: parts[4],
          })
        }
        setRows(out)
      } catch (e: any) {
        setError(e?.message || 'Failed to load table')
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const needle = q.toLowerCase()
    const base = !needle
      ? rows
      : rows.filter(r =>
          `${r.Section} ${r.Route} ${r.Access} ${r.Status} ${r.Notes}`
            .toLowerCase()
            .includes(needle)
        )
    const sorted = [...base].sort((a, b) => {
      const av = String(a[sortKey] || '').toLowerCase()
      const bv = String(b[sortKey] || '').toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return sorted
  }, [rows, q, sortKey, sortDir])

  function toggleSort(key: keyof Row) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-bold mb-4">Site Map — Final Version (Table)</h1>
        {error && <div className="text-red-700 mb-3">{error}</div>}
        <div className="mb-3 flex items-center gap-2">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search (section, route, notes)"
            className="flex-1 rounded border border-amber-300 bg-white px-3 py-2 text-amber-900 placeholder:text-amber-700/60"
          />
        </div>
        <div className="overflow-auto rounded border border-amber-200 bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-50 text-amber-900">
              <tr>
                {(['Section', 'Route', 'Access', 'Status', 'Notes'] as (keyof Row)[]).map(h => (
                  <th
                    key={String(h)}
                    className="px-3 py-2 text-left cursor-pointer select-none"
                    onClick={() => toggleSort(h)}
                  >
                    {h}
                    {sortKey === h ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className={i % 2 ? 'bg-white' : 'bg-amber-50/40'}>
                  <td className="px-3 py-2 whitespace-nowrap">{r.Section}</td>
                  <td className="px-3 py-2 font-mono">{r.Route}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.Access}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.Status}</td>
                  <td className="px-3 py-2">{r.Notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result.map(s => s.trim())
}
