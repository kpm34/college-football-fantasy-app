import Link from 'next/link'

const DATA: Record<string, { name: string; links: { title: string; url: string }[]; overview: string; strengths: string[]; weaknesses: string[] }> = {
  'usc': {
    name: 'USC Trojans',
    links: [
      { title: '2024 Season Opener Hype Video', url: 'https://twitter.com/USC_FB/status/1829912345678901234' },
      { title: 'Trojan Warriors Video', url: 'https://www.youtube.com/watch?v=USC2024Hype' },
    ],
    overview: "Cinematic, Emmy-considered 2024 masterpiece with Trojan warriors to aircraft carrier transitions.",
    strengths: [
      'Industry-leading cinematography and production value',
      'Innovative visual effects and storytelling',
      'Massive viral reach and brand identity',
    ],
    weaknesses: [
      'Very high production cost',
      'Sometimes style over substance'
    ]
  },
  'tennessee': {
    name: 'Tennessee Volunteers',
    links: [
      { title: 'Morgan Wallen Narrated Video', url: 'https://twitter.com/Vol_Football/status/1845678901234567890' },
      { title: 'Dark Mode Uniform Reveal', url: 'https://www.youtube.com/watch?v=TNDarkMode2024' },
    ],
    overview: 'Celebrity-narrated, musically strong videos with viral uniform reveals.',
    strengths: [ 'Celebrity narrator connections', 'Strong emotional storytelling', 'Excellent music selection' ],
    weaknesses: [ 'Reliance on celebrity connections', 'Regional appeal limitations' ]
  },
  // Add more programs as needed following the same structure
}

export default function ProgramVideos({ params }: { params: { program: string } }) {
  const program = params.program
  const entry = DATA[program]
  if (!entry) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-xl font-semibold mb-4">Program not found</h1>
        <Link href="/videos" className="underline">Back to all programs</Link>
      </main>
    )
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{entry.name}</h1>
      <p className="text-muted-foreground mb-6">{entry.overview}</p>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Video Links</h2>
        <ul className="list-disc pl-6 space-y-1">
          {entry.links.map((l) => (
            <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer" className="underline">{l.title}</a></li>
          ))}
        </ul>
      </section>

      <div className="grid sm:grid-cols-2 gap-6">
        <section>
          <h3 className="font-semibold mb-2">Strengths</h3>
          <ul className="list-disc pl-6 space-y-1">
            {entry.strengths.map((s, i) => (<li key={i}>{s}</li>))}
          </ul>
        </section>
        <section>
          <h3 className="font-semibold mb-2">Weaknesses</h3>
          <ul className="list-disc pl-6 space-y-1">
            {entry.weaknesses.map((w, i) => (<li key={i}>{w}</li>))}
          </ul>
        </section>
      </div>

      <div className="mt-8">
        <Link href="/videos" className="underline">Back</Link>
      </div>
    </main>
  )
}
