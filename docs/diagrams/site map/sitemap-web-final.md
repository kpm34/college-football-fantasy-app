---
title: Sitemap — Web (Final)
updated: 2025-09-10
state: final
platform: web
source: docs/diagrams/site map
---

### Purpose
Final/target state site map for the web experience. Include planned sections and future routes.

### Editing guidelines
- Mark future routes with (planned) or (v2)
- Keep within ~120 lines max
- Align with product roadmap

```mermaid
flowchart LR
  %% Top-level
  Landing[Landing]
  Login[Login]
  Signup[Sign Up]
  Dashboard[Dashboard]
  Admin[Admin]
  Help[Help / Docs (planned)]

  %% Dashboard areas
  subgraph Dashboard Areas
    Dashboard --> MyTeams[My Teams]
    Dashboard --> Leagues[Leagues]
    Dashboard --> Players[Players]
    Dashboard --> MockDraft[Mock Draft]
    Dashboard --> Explore[Explore (planned)]
  end

  %% League hub
  Leagues --> League[League Home]
  League --> DraftRoom[Draft Room]
  League --> Matchups[Matchups (planned)]
  League --> Lineups[Lineups]
  League --> Schedule[Schedule]
  League --> Trades[Trades (planned)]
  League --> Waivers[Waivers (planned)]
  League --> Settings[Commissioner Settings]

  %% Admin
  Admin --> AdminDashboard[Admin Dashboard]
  Admin --> AdminDiagrams[Diagrams]
  Admin --> AdminTools[Tools]
  Admin --> AdminReports[Reports (planned)]

  %% Auth
  Landing --> Login
  Landing --> Signup
  Login --> Dashboard
  Signup --> Dashboard

  %% Help
  Landing --> Help
  Dashboard --> Help
```
