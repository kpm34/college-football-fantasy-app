---
title: Sitemap — Mobile (Final)
updated: 2025-09-10
state: final
platform: mobile
source: docs/diagrams/site map
---

### Purpose
Final/target state site map for the mobile experience.

### Editing guidelines
- Favor 3–5 primary tabs
- Use sheets/modals for deep tasks
- Tag future routes as (planned)

```mermaid
flowchart TB
  %% Tabs
  subgraph Tabs
    Home[Home]
    Teams[Teams]
    Leagues[Leagues]
    Activity[Activity]
    Profile[Profile]
  end

  %% Entry
  Landing[Landing] --> Auth[Auth]
  Auth --> Home

  %% Leagues flow
  Leagues --> League[League Home]
  League --> DraftRoom[Draft Room]
  League --> Lineups[Lineups]
  League --> Matchups[Matchups (planned)]
  League --> Trades[Trades (planned)]
  League --> Waivers[Waivers (planned)]
  League --> Schedule[Schedule]
  League --> Settings[Settings]

  %% Profile / Settings
  Profile --> Notifications[Notifications (planned)]
  Profile --> Subscriptions[Subscriptions (planned)]
```
