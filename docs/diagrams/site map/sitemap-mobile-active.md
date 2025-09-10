---
title: Sitemap — Mobile (Active)
updated: 2025-09-10
state: active
platform: mobile
source: docs/diagrams/site map
---

### Purpose
Active (current) site map for the mobile experience. Mirrors web where possible; include mobile-only entry points.

### Editing guidelines
- Keep hierarchy shallow for mobile
- Prefer bottom nav groups over deep trees
- Only include routes available today

```mermaid
flowchart TB
  %% Entry points
  Landing[Landing]
  Auth[Auth (Login / Sign Up)]
  Dashboard[Dashboard]

  %% Bottom nav (example clusters)
  subgraph MainNav
    Dashboard
    Teams[Teams]
    Leagues[Leagues]
    Activity[Activity]
    Profile[Profile]
  end

  Landing --> Auth
  Auth --> Dashboard
  Dashboard --> Leagues
  Leagues --> League[League Home]
  League --> DraftRoom[Draft Room]
  League --> Schedule[Schedule]
  League --> Settings[Settings]
```
