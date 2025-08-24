export default function VideosHub() {
  const programs = [
    { slug: 'usc', name: 'USC Trojans' },
    { slug: 'tennessee', name: 'Tennessee Volunteers' },
    { slug: 'georgia', name: 'Georgia Bulldogs' },
    { slug: 'lsu', name: 'LSU Tigers' },
    { slug: 'ohio-state', name: 'Ohio State Buckeyes' },
    { slug: 'oregon', name: 'Oregon Ducks' },
    { slug: 'alabama', name: 'Alabama Crimson Tide' },
    { slug: 'louisville', name: 'Louisville Cardinals' },
    { slug: 'michigan', name: 'Michigan Wolverines' },
    { slug: 'clemson', name: 'Clemson Tigers' },
    { slug: 'texas', name: 'Texas Longhorns' },
    { slug: 'notre-dame', name: 'Notre Dame Fighting Irish' },
    { slug: 'penn-state', name: 'Penn State Nittany Lions' },
    { slug: 'oklahoma', name: 'Oklahoma Sooners' },
    { slug: 'florida-state', name: 'Florida State Seminoles' },
  ];
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Top College Football Hype Video Programs</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map(p => (
          <li key={p.slug} className="rounded border p-4 hover:bg-muted">
            <a href={`/videos/${p.slug}`} className="font-medium underline">{p.name}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
