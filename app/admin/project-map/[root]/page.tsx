import { ProjectMapClient } from '@components/docs/ProjectMapClient'

export default function Page({ params }: { params: { root: string } }) {
  const { root } = params
  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">{root}/</h1>
      <ProjectMapClient root={`project-map:${root}`} />
    </div>
  )
}
