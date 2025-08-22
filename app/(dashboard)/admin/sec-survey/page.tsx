'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type MatchItem = { id: string; name: string; position: string; team: string; season: number; nflTeam: string }
type GradItem = { id: string; name: string; position: string; team: string; season: number }

export default function SecSurveyPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [season, setSeason] = useState<number>(new Date().getFullYear())
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [grads, setGrads] = useState<GradItem[]>([])
  const [applied, setApplied] = useState<{ retired: number; deleted: number } | null>(null)

  async function runSurvey(apply = false) {
    try {
      setLoading(true)
      setError(null)
      setApplied(null)
      const res = await fetch('/api/admin/players/survey-sec-nfl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ season, include: 1000, apply })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setMatches(Array.isArray(data.matchesList) ? data.matchesList : (data.sampleMatches || []))
      setGrads(Array.isArray(data.graduatedList) ? data.graduatedList : (data.sampleGraduated || []))
      if (apply) setApplied({ retired: data.appliedRetired || 0, deleted: data.deleted || 0 })
    } catch (e: any) {
      setError(e.message || 'Failed to run survey')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { runSurvey(false) }, [])

  const total = matches.length + grads.length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">SEC → NFL/Graduated Survey</h1>
          <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20" aria-label="Close and go home">
            ×
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-gray-300">Season</label>
          <input type="number" value={season} onChange={(e) => setSeason(Number(e.target.value || season))} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 w-28" />
          <button onClick={() => runSurvey(false)} disabled={loading} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50">Refresh</button>
          <button onClick={() => runSurvey(true)} disabled={loading} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50">Apply Retire</button>
          {applied && (
            <span className="text-sm text-gray-300">Applied: retired {applied.retired}, deleted {applied.deleted}</span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold">NFL Matches</h2>
              <span className="text-sm text-gray-300">{matches.length}</span>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-950">
                  <tr className="text-left text-gray-300">
                    <th className="p-2">Name</th>
                    <th className="p-2">Pos</th>
                    <th className="p-2">College Team</th>
                    <th className="p-2">Season</th>
                    <th className="p-2">NFL Team</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id} className="border-t border-white/10">
                      <td className="p-2">{m.name}</td>
                      <td className="p-2">{m.position}</td>
                      <td className="p-2">{m.team}</td>
                      <td className="p-2">{m.season}</td>
                      <td className="p-2">{m.nflTeam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold">Graduated (No NFL Match)</h2>
              <span className="text-sm text-gray-300">{grads.length}</span>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-950">
                  <tr className="text-left text-gray-300">
                    <th className="p-2">Name</th>
                    <th className="p-2">Pos</th>
                    <th className="p-2">College Team</th>
                    <th className="p-2">Season</th>
                  </tr>
                </thead>
                <tbody>
                  {grads.map((g) => (
                    <tr key={g.id} className="border-t border-white/10">
                      <td className="p-2">{g.name}</td>
                      <td className="p-2">{g.position}</td>
                      <td className="p-2">{g.team}</td>
                      <td className="p-2">{g.season}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400">Total candidates: {total}</div>
      </div>
    </div>
  )
}


