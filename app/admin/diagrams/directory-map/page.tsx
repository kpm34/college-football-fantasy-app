'use client'

const items = [
  { slug: 'directory-map:index', title: 'Directory Map — Index' },
  { slug: 'directory-map:overview', title: 'Overview Diagram' },
  { slug: 'directory-map:live', title: 'Live: Repo Root (dynamic)' },
  { slug: 'directory-map:live:app', title: 'Live: app/ (dynamic)' },
  { slug: 'directory-map:live:components', title: 'Live: components/ (dynamic)' },
  { slug: 'directory-map:live:lib', title: 'Live: lib/ (dynamic)' },
  { slug: 'directory-map:live:docs', title: 'Live: docs/ (dynamic)' },
  { slug: 'directory-map:live:public', title: 'Live: public/ (dynamic)' },
  { slug: 'directory-map:chapters:app', title: 'Chapter: app/' },
  { slug: 'directory-map:chapters:components', title: 'Chapter: components/' },
  { slug: 'directory-map:chapters:lib', title: 'Chapter: lib/' },
  { slug: 'directory-map:chapters:docs', title: 'Chapter: docs/' },
  { slug: 'directory-map:chapters:functions', title: 'Chapter: functions/' },
  { slug: 'directory-map:chapters:schema', title: 'Chapter: schema/' },
  { slug: 'directory-map:chapters:ops', title: 'Chapter: ops/' },
  { slug: 'directory-map:chapters:public', title: 'Chapter: public/' },
  { slug: 'directory-map:chapters:styles', title: 'Chapter: styles/' },
  { slug: 'directory-map:chapters:tests', title: 'Chapter: tests/' },
  { slug: 'directory-map:chapters:data', title: 'Chapter: data/' },
  { slug: 'directory-map:chapters:scripts', title: 'Chapter: scripts/' },
  { slug: 'directory-map:chapters:vendor', title: 'Chapter: vendor/' },
]

export default function DirectoryMapDocsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">Directory Map (Docs)</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <a
              key={i.slug}
              href={`/admin/diagrams/${encodeURIComponent(i.slug)}`}
              className="px-4 py-3 rounded bg-emerald-700 text-white text-left shadow hover:bg-emerald-800"
            >
              <div className="font-semibold">{i.title}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
