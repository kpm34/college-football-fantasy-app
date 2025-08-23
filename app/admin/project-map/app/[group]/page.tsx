import { ProjectMapClient } from '@components/docs/ProjectMapClient'

export default async function Page({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">app/{group}/</h1>
      <ProjectMapClient root={`project-map:app:${group}`} />
    </div>
  )
}


