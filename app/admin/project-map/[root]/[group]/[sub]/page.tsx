import { ProjectMapClient } from '@components/docs/ProjectMapClient'
import Link from 'next/link'

export default function Page({ params }: { params: { root: string; group: string; sub: string } }) {
  const { root, group, sub } = params
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">
          {root}/{group}/{sub}/
        </h1>
        <Link href="/admin" className="text-sky-700 hover:text-sky-900 underline text-sm">
          Back to Admin
        </Link>
      </div>
      <ProjectMapClient root={`project-map:${root}:${group}:${sub}`} />
    </div>
  )
}
