/*
  Node script to generate a PDF from a markdown string using pdfkit.
  Usage:
    tsx ops/scripts/generate-client-brief-pdf.ts
*/

import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'

const OUT_DIR = path.resolve(process.cwd(), 'docs/client-briefs')
const OUT_PDF = path.join(OUT_DIR, 'kash-client-brief.pdf')

const content = `Client Brief\n\nAbout\n- Who: Kash, founder and product lead of CFB Fantasy; product strategist building a modern college fantasy experience\n- Business: A product-led platform that makes conference-based and Power 4-based college fantasy simple, engaging, and manageable on any device, with fun interactive content and features to personalize the fantasy experience.\n- Product/Service: Cross-platform app: draft rooms (snake & auction), live scoring, trades; league home; player projections & rankings; fantasy mascot design studio. Built for casual and diehard fans to create a fun, interactive service that brings people together to bond over college football.\n\nContext\n- Discovery: Primarily social and content, then word-of-mouth and group chats; goal to reach influencers, NIL athlete partnerships, podcasts, college orgs, and alumni groups.\n- Devices: mobile, desktop\n- Audience: Alumni and student groups; office and coworker leagues; content-driven fans who follow recruiting and rankings. Onboarding aims to be low-friction for casual players. Non-technical guardrails; intuitive, reliable; draft rooms that don't glitch.\n- User Needs: Social, low-friction play; content-driven engagement; intuitive onboarding; stability.\n- Competitors: Fantrax (we set a much higher UX bar); content vibe: Pardon My Take / Barstool Sports.\n\nGoals\n- Expectations: Blend content (video + articles) with fast, cutting-edge UI and informative tools to make gameplay effortless; launch a Pro tier featuring custom projection interface with a 3D mascot builder for competitive leagues; enhance personalization; drive year-over-year retention by persisting history (head-to-head rivals, season archives, trophy room, streaks); social hooks to make returning each season a no-brainer. Prioritize speed, stability, legibility; mobile-first; crash-free and intuitive for casual players while powerful for veterans. Key flows (create league, join, draft, set lineup, waivers, scoreboard) must be obvious and zero-friction with contextual guidance.\n- CTA Triggers: Weekly cadence — set lineup, make waiver claim, review updated projections, view/change trade proposals.\n- Look & Feel: Micro-interactions (draft pick confirm), touchdown moments, rivalry wins confetti; 3D mascot; never expensive; prioritize speed and performance.\n\nDeliverables\n- Essential Pages: Home/landing (explain modes, value prop, latest, contact); Dashboard (all leagues/teams + quick actions); League Home (overview, standings, schedule, news, activity); Draft Room (snake/auction, auto-pick, queue, projections); Locker Room (set lineup, review injuries, projections, news inline); Waivers (claims, budget, priority, results); Live Scores (real-time college stats & fantasy); League Scoreboard (weekly H2H updates in real-time); History (H2H history, all-time rankings, trophy room lore).\n- Competition Look: Sleeper-like polish, mobile-friendly.\n- Key Differentiators: Mobile-first speed; offline resilience for draft/lineup; frictionless onboarding; mock draft; transparent scoring rules.\n- Works / Not: Working — create league, homepage, dashboard, commissioner settings. In development — locker room flow, projections, live scoring pipeline, studio. Yet to begin — injury/news integration, live scoring of games, history artifacts, drafting.\n\nInfo\n- Contact: Kash Maheshwari\n- Email: KASHPM2002@gmail.com\n- Phone: 412-980-1292\n- Timeline: December\n`

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function writePdf(text: string, outPath: string) {
  const doc = new PDFDocument({ margin: 48, size: 'LETTER' })
  const stream = fs.createWriteStream(outPath)
  doc.pipe(stream)

  doc.fontSize(18).text('Client Brief', { align: 'left' })
  doc.moveDown(1)
  doc.fontSize(11).text(text, { align: 'left' })

  doc.end()
  return new Promise<void>((resolve, reject) => {
    stream.on('finish', () => resolve())
    stream.on('error', reject)
  })
}

async function main() {
  ensureDir(OUT_DIR)
  await writePdf(content, OUT_PDF)
  console.log('Wrote PDF:', OUT_PDF)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
