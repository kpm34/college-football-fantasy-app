# Diagrams Guide

This directory contains diagrams for project maps, functional flows, and system architecture.

- Active diagrams live under:
  - `project-map/` – repository structure maps
  - `functional-flow/` – user journeys and feature flows
  - `system-architecture/` – platform components and data flow

- Archived diagrams are moved to `ops/attic/diagrams-archive/`. Do not reference attic files from the app.

- Duplicates policy: only one canonical diagram per topic. The script `scripts/diagrams/archive-duplicates.js` finds and archives duplicate markdowns by content hash.

## Index

- Project Map: app — `project-map/app.md`
- Project Map: app/api — `project-map/app.api.md`
- Project Map: app/(league) — `project-map/app/league/index.md`
- Functional: Create Account — `functional-flow/create-account.md`
- Functional: Create League — `functional-flow/create-league-flow-with-draft-scheduling.md`
- Functional: Join League — `functional-flow/join-league-flow-invite.md`
- Functional: Draft — `functional-flow/draft-system-flow-mock-vs-real-scheduled.md`
- System: Projections Overview — `system-architecture/projections-system-overview.md`
