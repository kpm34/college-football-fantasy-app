import { ProjectMapClient } from '@components/docs/ProjectMapClient'
import Link from 'next/link'

export default function Page({ params }: { params: { root: string } }) {
  const { root } = params
  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{root}/</h1>
        <Link href="/admin" className="text-sky-700 hover:text-sky-900 underline text-sm">
          Back to Admin
        </Link>
      </div>
      <ProjectMapClient root={`project-map:${root}`} />
    </div>
  )
}
