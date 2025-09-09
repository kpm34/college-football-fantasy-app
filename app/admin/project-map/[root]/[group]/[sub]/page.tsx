import { ProjectMapClient } from '@components/docs/ProjectMapClient'

export default function Page({ params }: { params: { root: string; group: string; sub: string } }) {
  const { root, group, sub } = params
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {root}/{group}/{sub}/
      </h1>
      <ProjectMapClient root={`project-map:${root}:${group}:${sub}`} />
    </div>
  )
}
