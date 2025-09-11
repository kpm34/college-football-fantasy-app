# Page 1

Section 3 — Directory Maps: Style & Authoring
Guide
This section defines what to draw,  how to lay it out, and    the legend you must use for directory maps. It’s
tool‑agnostic and meant for consistent, reviewable diagrams during production.
Purpose
A directory map shows where things live in the repo and how code is organized by feature and    layer. Use
it to: - Onboard teammates quickly. - Spot misplaced files and needless coupling. - Plan refactors and
production hardening.
Which directory maps to create
Create them in this order (keep each as a separate diagram): 1. Global Repo Map — top‑level folders only
plus 1–2 levels of depth for critical areas. 2. Client App Map (e.g., Next.js /app, /components, /lib)
— show routes, layouts, shared UI. 3. Server/API Map (API routes, server actions, serverless functions) —
show handlers and adapters. 4. Data/Schema Map (types, schemas, queries, SDK wrappers) — show read/
write boundaries. 5. Docs/Diagrams Map (/docs/diagrams) — show where specs and visuals live and
how they’re grouped.
Zoom‑ins: If a branch gets busy (e.g., Draft, League), create a per‑feature directory map with only that
subtree.
Recommended layout
Default:Left → Right hierarchical tree (root on the left). This scans well on widescreens and
handles long names.
Alternative:Top‑down if you have many nested levels but few siblings.
Clustering: Visually group by layer (Client / API / Data / Config / Docs). Use soft containers with
titles.
Depth rule: Show at most 3 levels deep in any single diagram. If deeper, link to a zoom‑in diagram
for that branch.
Legend (shapes, colors, lines, badges)
Use this legend across all directory maps to stay consistent.
• 
• 
• 
• 
1

Shapes
Folder ( rectangle) — a directory.
File (page rectangle) — any source file.
Entry point (double‑border rectangle) — page.tsx, layout.tsx, route.ts, server.ts, 
index.ts.
External module (hexagon) — 3rd‑party or external integration adapters.
Generated/Build (dashed rectangle) — artifacts like .next, dist, coverage.
Note/Callout (sticky) — commentary (e.g., owner, TODO, risk).
Colors (by layer/cluster)
Client/UI → Blue (e.g., /app, /components)
API/Server → Teal  (e.g., /api, server actions, route handlers)
Data/Schema → Green  (types, schemas, queries, SDK wrappers)
Shared/Lib → Purple (utils, hooks, constants)
Config/Tooling → Yellow    (/config, /scripts, tsconfig.json)
Docs/Design → Indigo (/docs, /diagrams)
Build/Generated → Grey   (excluded from ownership)
External → Orange (SDKs, adapters)
Edge semantics
Solid connector — contains/“is inside”.
Dotted connector — generated from (e.g., schema → generated types) or alias to (symlink/path
alias).
(Optional overlay)Curved dashed arrow — important import/usage cross‑links between clusters
(limit to 3–5 so it stays readable).
Badges (tiny pills on files)
PAGE / LAYOUT / ROUTE — framework entry files
CLIENT / SERVER / RSC  — rendering/runtime markers
EDGE / NODE — runtime target
TYPE / SCHEMA / QUERY — data semantics
TEST / STORY — quality assets
CFG  — configuration
ASSET — static asset (img/svg/fonts)
Keep badges short (≤5 chars) and place them top‑right on the node.
What to include (content rules)
Top level: show all first‑level folders. Hide vendor/build folders (list them in an “Excluded” sticky).
Client App Map:
Show   routes  and dynamic segments as folder names (e.g., /app/league/[id]/...).
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
2

Mark entry files with PAGE, LAYOUT, ROUTE. Add CLIENT if the file has "use client".
Group shared UI under /components (atoms/molecules/organisms) and mark notable patterns
(e.g., Dialog, Table, Chart).
Server/API Map:
Show route handlers (route.ts), server actions, and any adapters for external services.
Call out Edge vs Node runtime where relevant.
Data/Schema Map:
Show   types (*.d.ts, types/), schemas (Zod/Yup), queries (data access), and SDK wrappers
(e.g., Appwrite client).
Mark WRITE boundaries (mutations) vs READ queries if helpful.
Docs/Diagrams Map:
Show category folders like project-map/, user-journeys/, architecture/, workflows/.
Keep per‑diagram README/links visible so readers can open the right artifact.
Authoring steps (numbered, repeatable)
Pick scope & depth. Decide which of the five map types you’re drawing and cap depth to 3 levels.
Place the root. Add the repo name as the root node.
Add top‑level directories. Use  Folder nodes. Add a sticky labeled Excluded listing build/vendor
dirs (e.g., node_modules, .next, dist).
Cluster by layer. Encapsulate related folders into Blue (Client), Teal (API), Green (Data), Purple
(Shared), Yellow (Config), Indigo (Docs) containers.
Add critical files. Within each cluster, add Entry point files (double‑border) and core files (page/
components/hooks/types/queries).
Mark semantics with badges. Apply PAGE, LAYOUT, ROUTE, CLIENT, SERVER, RSC , 
EDGE, NODE, TYPE, SCHEMA, QUERY, TEST, CFG , ASSET appropriately.
Show dynamic segments. For app routes, display {param} folders like [id]. If there’s a 
catch‑all (e.g., [...slug]), annotate it with a small sticky.
Optional overlays. Add up to 5 curved dashed arrows to show critical imports/usages across
clusters (e.g., UI → Data queries). Label them tersely (e.g., uses, imports).
Runtime and ownership notes. On key nodes, use stickies for runtime (Edge/Node), SSR/CSR/RSC,
and owner  (team/member).
Legend panel. Place the legend box in the lower right; reuse the same legend across all directory
maps.
Clarity pass. Enforce alignment, spacing, and label wrap. Avoid crossed lines. Collapse or link out
when crowded.
QA pass. Cross‑check against the actual repo tree; verify entry points and aliases.
Stamp & link. Date‑stamp the footer and include a link to the commit hash or release tag this map
reflects.
Acceptance criteria (quality bar)
Accurate: Matches the repo at a known commit/tag.
Legible: ≤3 levels deep; no visual clutter; legend present.
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. 
11. 
12. 
13. 
• 
• 
3

Semantic: Badges and colors correctly describe runtime, role, or type.
Actionable: Highlights entry points and key cross‑links/aliases.
Consistent: Same legend and color scheme used across all directory maps.
Do’s & Don’ts
Do - Keep one clear purpose per diagram. - Use zoom‑ins for busy branches. - Annotate runtime (EDGE/
NODE) and rendering (CLIENT/RSC ) where it matters.
Don’t   - Don’t show every file; focus on explainable structure. - Don’t mix logical flows (that’s for User
Journeys), keep this structural. - Don’t exceed five overlay dependency arrows.
Optional add‑ons
Path alias box (e.g., @/components, @/lib) to clarify import roots.
Risk/TODO stickies for branches slated for refactor.
Ownership labels to make code reviews and on‑call easier.
Next (when you’re ready): We can do System & Architecture Diagrams (containers/components/runtime,
with deployment environments) or Workflows (async jobs, cron, draft timers) in the same step‑by‑step
style.
• 
• 
• 
• 
• 
• 
4
