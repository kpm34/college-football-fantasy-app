import Link from 'next/link'

const ROOTS = [
  'app','components','lib','data','schema','future','functions','docs','ops','public'
]

export default function Page() {
  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Project Map</h1>
      <p className="text-gray-400 mb-4">Select a root to view its diagram.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {ROOTS.map((r) => (
          <Link key={r} href={`/admin/project-map/${r}`} className="px-4 py-3 rounded-lg bg-indigo-600 text-white text-center hover:bg-indigo-500">
            {r}
          </Link>
        ))}
      </div>
    </div>
  )
}


