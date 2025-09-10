'use client'

import Link from 'next/link'
import { driveFolderUrlByAlias, getDriveManifest } from '@/lib/utils/drive'

export default function AdminResourcesPage() {
  const manifest = getDriveManifest()
  const planningUrl = driveFolderUrlByAlias('planning_guides')
  const diagrammingUrl = driveFolderUrlByAlias('diagramming_guides')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8ED' }}>
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-900">Admin Resources</h1>
          <Link href="/admin" className="underline text-sky-700">Back to Admin</Link>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-white/90 shadow p-5">
          <h2 className="text-lg font-semibold text-emerald-900 mb-3">Google Drive Guides</h2>
          <ul className="space-y-2 text-emerald-900">
            <li>
              <a className="underline text-sky-700" href={planningUrl || '#'} target="_blank" rel="noreferrer">
                Planning Guides (Drive)
              </a>
              {!planningUrl && <span className="ml-2 text-amber-800">Missing alias planning_guides</span>}
            </li>
            <li>
              <a className="underline text-sky-700" href={diagrammingUrl || '#'} target="_blank" rel="noreferrer">
                Diagramming Guides (Drive)
              </a>
              {!diagrammingUrl && <span className="ml-2 text-amber-800">Missing alias diagramming_guides</span>}
            </li>
          </ul>

          {manifest && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Manifest</h3>
              <pre className="text-xs bg-emerald-50/50 border border-emerald-200 rounded p-3 overflow-auto">{JSON.stringify(manifest, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
