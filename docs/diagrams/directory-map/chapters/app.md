# Chapter: app/

- Purpose: Next.js App Router entry points, routes, and pages.
- Usage: Server Components by default; client components only where interactivity is required.
- Notes: Organize by route segments; colocate route-specific components; avoid data fetching in client components.

Key files:
- `app/layout.tsx` — Root layout
- `app/globals.css` — Global styles

```mermaid
graph LR
  classDef dir fill:#e5e7eb,stroke:#6b7280,color:#111827,rx:6,ry:6
  A[app/]:::dir --> A1[(routes)]:::dir
  A --> A2[global-error.tsx]
  A --> A3[layout.tsx]
```
