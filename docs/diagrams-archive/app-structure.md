%%{init: {'themeVariables': {'fontSize': '20px'}}}%%
graph TD
  ROOT[Repo Root]
  %% --- APP ---
  ROOT --> APP[/app/]
  APP --> API[app/api/* — Route Handlers]
  API --> API_LEAGUES[api/leagues/*]
  API --> API_DRAFTS[api/drafts/*]
  API --> API_PLAYERS[api/players/*]
  API --> API_RANKINGS[api/rankings/*]
  API --> API_ROSTERS[api/rosters/*]
  API --> API_AUCTIONS[api/auctions/*]
  API --> API_BIDS[api/bids/*]
  API --> API_ADMIN[api/admin/*]
  API --> API_HEALTH[api/health]
  API --> API_CURSOR[api/cursor-report]
  APP --> SEG_MARKETING[app/(marketing) — public pages]
  APP --> SEG_DASH[app/(dashboard) — authed app]
  APP --> SEG_DRAFT[app/(draft) — draft feature]
  APP --> SEG_ADMIN[app/admin — docs/diagram viewer]
  
  %% --- COMPONENTS ---
  ROOT --> COMPONENTS[/components/]
  COMPONENTS --> UI[components/ui/* — design system]
  COMPONENTS --> TABLES[components/tables/*]
  COMPONENTS --> CHARTS[components/charts/*]
  COMPONENTS --> FEATURES[components/features/*]
  FEATURES --> FEAT_DRAFT[components/features/draft/*]
  FEATURES --> FEAT_LEAGUES[components/features/leagues/*]
  COMPONENTS --> INDEX[components/index.ts — barrel]

