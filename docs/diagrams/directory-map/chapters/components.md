# Chapter: components/

- Purpose: Reusable UI pieces and feature-level components.
- Usage: Mirror target folder structure; prefer server-driven data into props; expose via `components/index.ts`.

Key subfolders: `ui/`, `features/`, `layout/`, `tables/`, `charts/`.

```mermaid
graph LR
  C[components/] --> C1[ui/]
  C --> C2[features/]
  C --> C3[layout/]
  C --> C4[tables/]
  C --> C5[charts/]
```
