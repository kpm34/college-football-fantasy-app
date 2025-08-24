export default function VideosGuide() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Hype Video Creative Guide</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Top Cinematic Quality</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">USC</span> — Dominates with “Emmy-nominated” level cinematography. Battlefield → aircraft carrier → stadium transition is a landmark and likely to be copied for years.
          </li>
          <li>
            <span className="font-medium">Georgia</span> — Next-level color correction and camera work. The Business Trip series has a Louis Vuitton-style luxury aesthetic with beautiful cinematography.
          </li>
          <li>
            <span className="font-medium">Tennessee</span> — Stunning visuals and creative effects. The Dark Mode video uses a Stranger Things style with haunting buildup and jarring surprise transitions.
          </li>
          <li>
            <span className="font-medium">Oregon</span> — Seamless integration of high school footage with current players using Friday Night Lights style cinematography; Nike partnership elevates resources.
          </li>
          <li>
            <span className="font-medium">Notre Dame</span> — Stunning visuals, especially snow/weather-themed content with beautiful campus cinematography.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Best Transitions / Visual Effects</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">USC</span> — Trojan warrior battlefield morphing into modern football is considered revolutionary.
          </li>
          <li>
            <span className="font-medium">Clemson</span> — Impressive visual effects and graphics with a new effect in nearly every shot; rave-like editing.
          </li>
          <li>
            <span className="font-medium">Tennessee</span> — Dark Mode video’s incredible eye-opening effect with seamless music/visual synchronization.
          </li>
          <li>
            <span className="font-medium">Ohio State</span> — Eye-opening effect at the :42 mark in the Penn State video; excellent archival footage integration.
          </li>
          <li>
            <span className="font-medium">Oregon</span> — Masterful lyric-to-visual matching (e.g., “out here in the fields” with field shots) and weaving together HS/college footage.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Louisville Context</h2>
        <p className="text-muted-foreground">
          Louisville is strong at themed content (Muhammad Ali transitions) and cross-platform branding. In pure cinematic production and VFX scale, they rank behind the programs above, but can close the gap by leaning into local icons, consistent series formats, and refined transitions.
        </p>
      </section>

      <section className="border rounded p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">How We’ll Use This</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Reference visual motifs (e.g., USC morph transitions, Georgia color pipeline) when crafting Runway prompts.</li>
          <li>Target platform-specific aspect ratios: 9:16 (Shorts/Reels), 16:9 (YouTube), 1:1 (feed).</li>
          <li>Iterate with seeds/variations for A/B tests; maintain brand anchors (logos, colors, iconic scenes).</li>
          <li>Blend Meshy 3D elements (mascots, artifacts) with Runway footage for standout transitions.</li>
        </ul>
      </section>
    </main>
  );
}
