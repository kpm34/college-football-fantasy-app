# System Overview (Project Map)

High-level architecture across domains.

## Components
- Client: Next.js 15 (RSC), shadcn/ui, Tailwind
- Backend: Appwrite (DB + Auth + Realtime), Edge Functions
- Data: Appwrite collections, Vercel KV (locks), CFBD/EA/Depth Charts
- Realtime: Appwrite v16 channels
- Deploy: Vercel

## Flows
- Auth → League → Draft → Season (lineups, scoring)
- Data pipeline → Projections → UI
- Realtime updates → Draft + Scoring

See domain folders for details.
