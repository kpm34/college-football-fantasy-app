'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type OpenMap = Record<string, boolean>

const SECTION_IDS = [
  'exec-summary',
  'client-brief',
  'design-dev',
  'highlights',
  'implementation-guidelines',
  'conclusion',
] as const

function buildDefaultOpenMap(): OpenMap {
  return SECTION_IDS.reduce((acc, id) => {
    acc[id] = true
    return acc
  }, {} as OpenMap)
}

function Section({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section id={id} className="rounded-2xl border border-amber-200 bg-white/95 shadow">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-50/60 rounded-2xl"
        aria-expanded={open}
        aria-controls={`${id}-content`}
      >
        <span className="font-semibold text-amber-900">{title}</span>
        <span className="text-amber-700">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>
      <div
        id={`${id}-content`}
        className={open ? 'prose prose-amber max-w-none px-5 pb-6' : 'hidden'}
      >
        {children}
      </div>
    </section>
  )
}

export default function ProductVisionPage() {
  const [openMap, setOpenMap] = useState<OpenMap>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('pv-open-state-v1')
        if (raw) return JSON.parse(raw) as OpenMap
      } catch {}
    }
    return buildDefaultOpenMap()
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('pv-open-state-v1', JSON.stringify(openMap))
      } catch {}
    }
  }, [openMap])

  const toggle = (id: string) => setOpenMap(m => ({ ...m, [id]: !m[id] }))
  const setAll = (value: boolean) =>
    setOpenMap(SECTION_IDS.reduce((acc, id) => ({ ...acc, [id]: value }), {} as OpenMap))

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-orange-600 to-emerald-600">
            Product Vision
          </h1>
          <Link href="/admin" className="text-sky-700 hover:text-sky-900 underline text-sm">
            Back to Admin
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px,1fr] items-start">
          <aside className="hidden lg:block sticky top-20 self-start">
            <nav className="rounded-2xl border border-amber-200 bg-white/90 shadow p-4 text-sm text-amber-900">
              <div className="font-semibold text-amber-800 mb-2">On this page</div>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAll(true)}
                  className="px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-50"
                >
                  Expand all
                </button>
                <button
                  onClick={() => setAll(false)}
                  className="px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-50"
                >
                  Collapse all
                </button>
              </div>
              <ul className="space-y-2">
                <li>
                  <a className="hover:text-amber-700" href="#exec-summary">
                    Executive Summary
                  </a>
                </li>
                <li>
                  <a className="hover:text-amber-700" href="#client-brief">
                    Client Brief Highlights
                  </a>
                  <ul className="mt-1 ml-3 space-y-1 text-amber-800/90">
                    <li>
                      <a className="hover:text-amber-700" href="#audience-vision">
                        Audience & Vision
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#core-features">
                        Core Features
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#goals-expectations">
                        Goals & Expectations
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#deliverables">
                        Deliverables
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a className="hover:text-amber-700" href="#design-dev">
                    Design & Development
                  </a>
                  <ul className="mt-1 ml-3 space-y-1 text-amber-800/90">
                    <li>
                      <a className="hover:text-amber-700" href="#design-ai-workflows">
                        AI-first Workflows
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#design-3d-ui">
                        3D UI Implementation
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#design-performance-budgets">
                        3D Performance Budgets
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#design-live-draft">
                        Live Draft System
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#design-kv-caching">
                        Vercel KV Caching
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a className="hover:text-amber-700" href="#highlights">
                    Product Vision Highlights
                  </a>
                </li>
                <li>
                  <a className="hover:text-amber-700" href="#implementation-guidelines">
                    Implementation Guidelines
                  </a>
                </li>
                <li>
                  <a className="hover:text-amber-700" href="#conclusion">
                    Conclusion
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <div className="space-y-5">
            <div className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5">
              <h2 className="text-amber-900 font-semibold">
                College Football Fantasy App - UX Planning Document
              </h2>
            </div>

            <Section
              id="exec-summary"
              title="Executive Summary"
              open={openMap['exec-summary']}
              onToggle={() => toggle('exec-summary')}
            >
              <p>
                A comprehensive UX overview for building a next-generation college football fantasy
                platform that aims to capture the untapped $1B+ market opportunity and become "the
                DraftKings of college fantasy." The platform emphasizes zero-friction onboarding,
                real-time responsiveness, AI-powered features, and an immersive user experience
                while maintaining simplicity for casual users.
              </p>
            </Section>

            <Section
              id="client-brief"
              title="1. Client Brief Highlights"
              open={openMap['client-brief']}
              onToggle={() => toggle('client-brief')}
            >
              <h4 id="audience-vision">1.1 Audience &amp; Vision</h4>
              <p>
                <strong>Target Users:</strong>
              </p>
              <ul>
                <li>College football fans ranging from casual to die-hard enthusiasts</li>
                <li>Primary focus on group play: alumni groups, student leagues, office pools</li>
                <li>Non-technical users requiring extremely easy onboarding</li>
              </ul>
              <p>
                <strong>Key Requirements:</strong>
              </p>
              <ul>
                <li>Quick, glitch-free league creation</li>
                <li>Superior UX compared to competitor Fantrax</li>
                <li>Fun, interactive content vibe (Barstool Sports style humor)</li>
                <li>Modern, cross-platform experience accessible on any device</li>
                <li>Interactive content and personalization features</li>
              </ul>

              <h4 id="core-features">1.2 Core Features</h4>
              <p>
                <strong>Essential Functionality:</strong>
              </p>
              <ul>
                <li>
                  <strong>Live Draft Rooms</strong>
                  <ul>
                    <li>Snake and auction draft support</li>
                    <li>Real-time pick updates</li>
                    <li>Autopick for missed turns</li>
                  </ul>
                </li>
                <li>
                  <strong>League Management</strong>
                  <ul>
                    <li>Live scoring updates during games</li>
                    <li>Trading systems</li>
                    <li>Customizable league settings</li>
                    <li>Player projections &amp; rankings</li>
                  </ul>
                </li>
                <li>
                  <strong>Unique Features</strong>
                  <ul>
                    <li>Fantasy mascot design studio</li>
                    <li>Team personalization options</li>
                    <li>Social features and content integration</li>
                    <li>Advanced tools and stats for power users</li>
                  </ul>
                </li>
              </ul>

              <h4 id="goals-expectations">1.3 Goals &amp; User Expectations</h4>
              <p>
                <strong>Performance Standards:</strong>
              </p>
              <ul>
                <li>Blend rich content (videos, articles) with cutting-edge UI</li>
                <li>Fast, effortless user experience</li>
                <li>Mobile-first design philosophy</li>
                <li>Absolute reliability (no crashes, especially during drafts)</li>
                <li>Low-friction interface for new/casual users</li>
                <li>Powerful options for experienced players</li>
              </ul>
              <p>
                <strong>Engagement Strategy:</strong>
              </p>
              <ul>
                <li>
                  <strong>Premium "Pro" Tier</strong> featuring:
                  <ul>
                    <li>Custom projections interface</li>
                    <li>3D mascot builder</li>
                    <li>Competitive league enhancements</li>
                  </ul>
                </li>
                <li>
                  <strong>Long-term Retention Features:</strong>
                  <ul>
                    <li>Persistent league history</li>
                    <li>Rivalry records</li>
                    <li>Past season archives</li>
                    <li>Trophy room for champions</li>
                    <li>Streak tracking</li>
                    <li>Social hooks for yearly returns</li>
                  </ul>
                </li>
              </ul>
              <p>
                <strong>Weekly Engagement Loop:</strong>
              </p>
              <ul>
                <li>Setting lineups</li>
                <li>Making waiver claims</li>
                <li>Checking updated projections</li>
                <li>Reviewing trade offers</li>
                <li>Synchronized with college football schedule</li>
              </ul>

              <h4 id="deliverables">1.4 Key Deliverables (Pages &amp; Flows)</h4>
              <h5>Home/Landing Page</h5>
              <ul>
                <li>Marketing entry point</li>
                <li>Game modes and value proposition</li>
                <li>Latest news/content</li>
                <li>Sign-up and league creation initiation</li>
              </ul>
              <h5>User Dashboard</h5>
              <ul>
                <li>Personalized hub for all leagues/teams</li>
                <li>Quick actions for each league</li>
                <li>Pending task notifications ("lineup not set")</li>
                <li>Create/join new leagues functionality</li>
              </ul>
              <h5>League Home</h5>
              <ul>
                <li>League status overview</li>
                <li>Standings display</li>
                <li>Schedule and upcoming matchups</li>
                <li>Recent news/chat</li>
                <li>Activity feed (transactions, messages)</li>
              </ul>
              <h5>Draft Room</h5>
              <ul>
                <li>Live draft interface for snake/auction drafts</li>
                <li>Draft board showing all teams' picks</li>
                <li>Turn indicator with countdown timer</li>
                <li>Player queue and autopick functionality</li>
                <li>Available player list with search/filters</li>
                <li>Instant updates for all participants</li>
                <li>Mobile-optimized experience</li>
              </ul>
              <h5>Locker Room (Lineup Management)</h5>
              <ul>
                <li>Weekly lineup setting interface</li>
                <li>Roster display with player statuses</li>
                <li>Injury and bye week indicators</li>
                <li>Projections and news blurbs</li>
                <li>Drag-and-drop or tap-to-swap interactions</li>
              </ul>
              <h5>Waivers &amp; Free Agency</h5>
              <ul>
                <li>Available player browsing</li>
                <li>Claim/bid submission</li>
                <li>Budget balance display</li>
                <li>Waiver order visibility</li>
                <li>Clear process explanation for newcomers</li>
              </ul>
              <h5>Live Scores</h5>
              <ul>
                <li>Real-time scoring dashboard</li>
                <li>Fantasy point translation</li>
                <li>Ongoing matchup updates</li>
                <li>Play-by-play updates option</li>
                <li>Animated game visuals</li>
              </ul>
              <h5>League Scoreboard</h5>
              <ul>
                <li>Weekly head-to-head matchups</li>
                <li>Live score updates</li>
                <li>Projections and top performers</li>
                <li>League-wide results overview</li>
              </ul>
              <h5>History/Archives</h5>
              <ul>
                <li>Past champions display</li>
                <li>Win-loss histories</li>
                <li>Rivalry records</li>
                <li>All-time high scores</li>
                <li>Trophy room</li>
                <li>Past season recaps</li>
              </ul>
            </Section>

            <Section
              id="design-dev"
              title="2. Design & Development Guides"
              open={openMap['design-dev']}
              onToggle={() => toggle('design-dev')}
            >
              <h4>2.1 AI-First Design &amp; Build Process</h4>
              <p>
                <strong>Workflow Components:</strong>
              </p>
              <ol>
                <li>Inspiration Gathering - Screenshots of competitor UIs</li>
                <li>Structured Brief Generation - AI-assisted documentation</li>
                <li>Wireframe Creation - Figma with reusable components</li>
                <li>High-Fidelity Design - Component-based approach</li>
                <li>Code Generation - Anima for React/Tailwind scaffolding</li>
                <li>Design Tokens - Synchronized style properties</li>
              </ol>
              <p>
                <strong>Daily Design Loop:</strong>
              </p>
              <ul>
                <li>Capture new ideas</li>
                <li>Synthesize briefs</li>
                <li>Import examples to Figma</li>
                <li>Generate/update code</li>
                <li>Refine iteratively</li>
              </ul>
              <p>
                <strong>Feature Deployment:</strong>
              </p>
              <ul>
                <li>Feature flags for gradual rollout (e.g., "draftUIv2")</li>
                <li>Subset user testing</li>
                <li>Feedback gathering before full release</li>
              </ul>

              <h4 id="design-ai-workflows">AI-First Workflows (from guides)</h4>
              <ul>
                <li>
                  Screenshot-first briefs stored under <code>docs/inspiration</code>; automate with{' '}
                  <code>npm run design:capture</code>.
                </li>
                <li>
                  Import references to Figma with <code>html.to.design</code>; map components via
                  Code Connect.
                </li>
                <li>
                  Tokens exported with <code>ops/design/export-tokens.ts</code>; gate rollouts
                  behind feature flags.
                </li>
                <li>
                  QA loop: canary behind flags, Playwright snapshots, monitor Sentry + Vercel
                  Analytics.
                </li>
              </ul>

              <h4 id="design-3d-ui">3D UI Implementation</h4>
              <ul>
                <li>
                  Use CSS/Anime.js for microinteractions; Spline for ambient visuals; R3F for
                  bespoke widgets.
                </li>
                <li>
                  Prebuilt recipes: button press bounce, recent-pick slide-in, tile pop-in, timer
                  pulse.
                </li>
                <li>
                  Respect <code>prefers-reduced-motion</code>; lazy-load animation libs; keep added
                  JS &lt; 30KB.
                </li>
              </ul>

              <h4 id="design-performance-budgets">3D Performance Budgets</h4>
              <ul>
                <li>Per-route added JS ≤ 30KB (draft room ≤ 20KB).</li>
                <li>GPU frame headroom ≥ 4ms @ 60Hz; active meshes ≤ 500 or use instancing.</li>
                <li>
                  Optimize via instancing, texture atlases, LOD, and pausing offscreen renders.
                </li>
              </ul>

              <h4 id="design-live-draft">Live Draft System (implemented)</h4>
              <ul>
                <li>
                  Supports 2–24 teams, snake algorithm, timers, autopick; real-time via Appwrite.
                </li>
                <li>UI adapts grid columns by team count; results export and metrics included.</li>
                <li>
                  E2E suites available via <code>npm run mock:human:e2e*</code>.
                </li>
              </ul>

              <h4 id="design-kv-caching">Vercel KV Caching</h4>
              <ul>
                <li>
                  Type-safe wrapper in <code>lib/cache.ts</code> with SWR-style API and invalidation
                  helpers.
                </li>
                <li>
                  Cached routes: players, rankings, games; typical responses 50–150ms when cached.
                </li>
                <li>TTL strategy: 60s draft state; 5m lineups; 1h stats; 24h rankings.</li>
              </ul>

              <h4>2.2 Key Workflows &amp; Practices</h4>
              <h5>Mobile-First &amp; Responsive Implementation</h5>
              <p>
                <strong>Adaptive Layouts:</strong>
              </p>
              <ul>
                <li>Automatic grid adjustments for 8, 12, or 24-team drafts</li>
                <li>Fluid grids and flexbox</li>
                <li>Testing across phone, tablet, and desktop</li>
                <li>Mobile layout prioritization</li>
                <li>Desktop enhancements (not dependencies)</li>
              </ul>
              <h5>Real-Time Feedback Loop</h5>
              <p>
                <strong>Technologies:</strong>
              </p>
              <ul>
                <li>Appwrite realtime subscriptions</li>
                <li>WebSocket connections</li>
                <li>Instant UI updates without refresh buttons</li>
              </ul>
              <p>
                <strong>Design Implications:</strong>
              </p>
              <ul>
                <li>"Always-live" mentality</li>
                <li>Minimal loading indicators</li>
                <li>Offline state considerations</li>
                <li>Data caching for resilience</li>
                <li>Action queuing when offline</li>
              </ul>
              <h5>Performance &amp; Accessibility Constraints</h5>
              <p>
                <strong>Animation Guidelines:</strong>
              </p>
              <ul>
                <li>Use transforms and opacity only</li>
                <li>Lazy-load heavy resources</li>
                <li>30KB budget for UI effect scripts</li>
              </ul>
              <p>
                <strong>Accessibility Requirements:</strong>
              </p>
              <ul>
                <li>AA contrast minimum for text</li>
                <li>44px minimum touch targets</li>
                <li>Visible keyboard focus states</li>
                <li>No scroll hijacking</li>
                <li>Graceful degradation for 3D/AR features</li>
              </ul>
              <h5>Micro-interactions &amp; Delight</h5>
              <p>
                <strong>Implemented Effects:</strong>
              </p>
              <ul>
                <li>3D button depression and bounce</li>
                <li>Animated tile "pop-in" for new items</li>
                <li>Pulsing alerts for draft timer (&lt;10 seconds)</li>
                <li>Sliding ticker for recent picks</li>
                <li>Lightweight CSS or Anime.js implementation</li>
                <li>"Touchdown moments" for big events (confetti animations)</li>
              </ul>

              <h4>2.3 Workflow and Handoff</h4>
              <ul>
                <li>Design System Integration: Synchronized components between design and code</li>
                <li>Reusable patterns and components</li>
                <li>Rapid prototyping and validation</li>
                <li>Comprehensive handoff checklist</li>
                <li>All states designed (empty, loading, error)</li>
              </ul>
            </Section>

            <Section
              id="highlights"
              title="3. Product Vision Highlights"
              open={openMap['highlights']}
              onToggle={() => toggle('highlights')}
            >
              <h4>3.1 Mission and Market</h4>
              <p>
                <strong>Objective:</strong> Capture the untapped $1B+ college fantasy football
                market
              </p>
              <p>
                <strong>Scale Considerations:</strong>
              </p>
              <ul>
                <li>Design for millions of potential users</li>
                <li>Accommodate casual to power users</li>
                <li>Handle large numbers of leagues and content</li>
                <li>Maintain performance at scale</li>
              </ul>
              <h4>3.2 North Star Principles</h4>
              <h5>Zero-Friction Onboarding</h5>
              <ul>
                <li>League creation in under 60 seconds</li>
                <li>Minimal input requirements</li>
                <li>Sensible defaults</li>
                <li>Postponed non-essential settings</li>
              </ul>
              <h5>Always Live Feeling</h5>
              <ul>
                <li>Target update latency: &lt;100ms</li>
                <li>Instantaneous interface responses</li>
                <li>Subtle loading states</li>
                <li>Seamless transitions</li>
              </ul>
              <h5>AI-First Intelligence</h5>
              <ul>
                <li>Smart draft suggestions</li>
                <li>Lineup optimization alerts</li>
                <li>Conversational interfaces</li>
                <li>Proactive user assistance</li>
              </ul>
              <h5>Power without Complexity</h5>
              <ul>
                <li>Simple default experience</li>
                <li>Progressive disclosure</li>
                <li>Hidden advanced options</li>
                <li>Clean primary paths</li>
              </ul>
              <h5>Mobile-First, Offline-Support</h5>
              <ul>
                <li>Progressive Web App architecture</li>
                <li>Offline functionality</li>
                <li>Sync-when-online mechanisms</li>
                <li>Connection state indicators</li>
              </ul>
              <h5>Community-Driven</h5>
              <ul>
                <li>League chat integration</li>
                <li>Social media sharing</li>
                <li>Smack talk features</li>
                <li>Trophy comparisons</li>
                <li>Head-to-head records</li>
              </ul>
              <h4>3.3 Unique Differentiators</h4>
              <h5>Dual AI Systems</h5>
              <ul>
                <li>Claude for strategy and text insights</li>
                <li>GPT-4 for vision and analysis</li>
                <li>Chat assistant interface</li>
                <li>Screenshot analysis capabilities</li>
              </ul>
              <h5>AP Top-25 Eligibility Engine</h5>
              <ul>
                <li>Custom rules for ranked teams</li>
                <li>Conference game eligibility</li>
                <li>Clear UI indicators</li>
                <li>Explanation tooltips</li>
              </ul>
              <h5>True Real-Time Platform</h5>
              <ul>
                <li>&lt;50ms latency target</li>
                <li>Live feedback throughout</li>
                <li>Marketing emphasis on speed</li>
              </ul>
              <h5>3D Immersive Experience</h5>
              <ul>
                <li>Virtual 3D draft rooms</li>
                <li>AI-generated team mascots</li>
                <li>AR trophy displays</li>
                <li>Optional, optimized features</li>
              </ul>
              <h5>Vision Analysis</h5>
              <ul>
                <li>Screenshot upload and analysis</li>
                <li>Roster weakness identification</li>
                <li>Move suggestions</li>
                <li>Scouting integration</li>
              </ul>
              <h5>Voice Control</h5>
              <ul>
                <li>"Hey Claude" commands</li>
                <li>Lineup optimization</li>
                <li>Clear feedback display</li>
                <li>Voice-executable critical flows</li>
              </ul>
              <h4>3.4 Core Feature Pillars</h4>
              <h5>1. AI Draft Genius</h5>
              <ul>
                <li>Live pick recommendations</li>
                <li>Vision analysis during draft</li>
                <li>Deep strategy mode</li>
                <li>Voice command drafting</li>
                <li>Smart auto-draft strategies</li>
              </ul>
              <h5>2. Real-Time Everything</h5>
              <ul>
                <li>Instant updates for all features</li>
                <li>Live play-by-play animations</li>
                <li>Real-time win probability</li>
                <li>Notification system</li>
              </ul>
              <h5>3. Immersive 3D/AR</h5>
              <ul>
                <li>3D draft rooms</li>
                <li>Custom team mascots</li>
                <li>Victory animations</li>
                <li>AR trophy case</li>
                <li>Traditional alternatives available</li>
              </ul>
              <h5>4. Advanced Analytics</h5>
              <ul>
                <li>Historical data modeling</li>
                <li>Live win probability</li>
                <li>Trade simulator</li>
                <li>Injury risk analytics</li>
                <li>Opponent-adjusted projections</li>
              </ul>
              <h5>5. Intelligent Automation</h5>
              <ul>
                <li>Auto-lineup optimization</li>
                <li>Smart waiver claims</li>
                <li>Trade proposals</li>
                <li>Commissioner co-pilot</li>
                <li>Scheduled reports</li>
              </ul>
              <h4>3.5 Business Model</h4>
              <p>
                <strong>Subscription Tiers:</strong>
              </p>
              <ul>
                <li>
                  <strong>Free</strong> - Basic features, limited leagues
                </li>
                <li>
                  <strong>Pro</strong> - Advanced features, 3D access
                </li>
                <li>
                  <strong>Dynasty</strong> - Full feature access
                </li>
              </ul>
              <p>
                <strong>UX Considerations:</strong>
              </p>
              <ul>
                <li>Clear tier indicators</li>
                <li>Non-intrusive upgrade paths</li>
                <li>Feature lock explanations</li>
                <li>Limit notifications</li>
              </ul>
              <h4>3.6 Roadmap Timeline</h4>
              <p>
                <strong>August-November 2025 Launch Schedule:</strong>
              </p>
              <p>
                <strong>Phase 1 (August):</strong> Core platform completion
              </p>
              <ul>
                <li>Draft system</li>
                <li>Scoring engine</li>
                <li>Authentication</li>
              </ul>
              <p>
                <strong>Phase 2 (September):</strong> Feature additions
              </p>
              <ul>
                <li>Waivers and trades</li>
                <li>Marketing site</li>
                <li>Referral program</li>
                <li>Public launch</li>
              </ul>
              <p>
                <strong>Phase 3 (October):</strong> Scaling features
              </p>
              <ul>
                <li>3D mascots</li>
                <li>Tournament modes</li>
                <li>Notifications</li>
              </ul>
              <p>
                <strong>Phase 4 (November):</strong> AI integration
              </p>
              <ul>
                <li>AI features</li>
                <li>Voice control</li>
              </ul>
            </Section>

            <Section
              id="implementation-guidelines"
              title="4. Implementation Guidelines"
              open={openMap['implementation-guidelines']}
              onToggle={() => toggle('implementation-guidelines')}
            >
              <h4>4.1 Design Priorities</h4>
              <p>
                <strong>Must-Have (Core Functionality):</strong>
              </p>
              <ul>
                <li>Rock-solid draft experience</li>
                <li>Intuitive lineup management</li>
                <li>Reliable scoring system</li>
                <li>Clear league navigation</li>
              </ul>
              <p>
                <strong>Nice-to-Have (Enhancements):</strong>
              </p>
              <ul>
                <li>3D visualizations</li>
                <li>AI assistants</li>
                <li>Voice commands</li>
                <li>AR features</li>
              </ul>
              <h4>4.2 UX Design Principles</h4>
              <ol>
                <li>Clarity First - Every action should be obvious</li>
                <li>Speed Matters - Optimize for performance</li>
                <li>Mobile Primary - Design for small screens first</li>
                <li>Progressive Enhancement - Add complexity gradually</li>
                <li>Delight Thoughtfully - Animations serve purpose</li>
                <li>Resilient Design - Work under all conditions</li>
                <li>Social by Nature - Enable community interaction</li>
              </ol>
              <h4>4.3 Success Metrics</h4>
              <ul>
                <li>Onboarding completion rate</li>
                <li>Draft completion time</li>
                <li>Weekly active users</li>
                <li>Feature adoption rates</li>
                <li>User retention (year-over-year)</li>
                <li>Performance benchmarks (&lt;100ms updates)</li>
              </ul>
            </Section>

            <Section
              id="conclusion"
              title="Conclusion"
              open={openMap['conclusion']}
              onToggle={() => toggle('conclusion')}
            >
              <p>
                The College Football Fantasy App represents an ambitious project to dominate the
                college fantasy football market through superior user experience, innovative
                features, and cutting-edge technology. Success depends on delivering rock-solid core
                functionality while progressively introducing differentiating features that set the
                platform apart from competitors.
              </p>
              <p>
                The UX redesign must balance simplicity for casual users with depth for power users,
                all while maintaining blazing-fast performance and mobile-first accessibility. By
                following the principles and guidelines outlined in this document, the team can
                create a platform that not only meets user needs but exceeds expectations,
                establishing itself as the definitive destination for college fantasy football.
              </p>
              <p>
                <strong>Key Takeaways:</strong>
              </p>
              <ul>
                <li>Prioritize frictionless core experiences</li>
                <li>Design for real-time, always-live interactions</li>
                <li>Implement progressive disclosure for complexity</li>
                <li>Maintain performance budgets rigorously</li>
                <li>Enable social and community features throughout</li>
                <li>Plan for AI integration from the start</li>
                <li>Ensure mobile-first, offline-capable architecture</li>
              </ul>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}
