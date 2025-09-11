---
slug: workflows:design-to-code
---

### Workflow — Design to Code (Handoff → Integration)

```mermaid
flowchart TD
  %% Lanes use simple titles to avoid bracket parsing issues
  subgraph Design
    D1["Draft in Figma or Spline"]
    D2["Accessibility pass (contrast, motion)"]
    D3[Design Review]
  end
  subgraph Engineering
    E1["Ticket with acceptance criteria + snapshots"]
    E2["Implement component (RSC default)"]
    E3["Integrate 3D (R3F/Drei) if needed"]
    E4["Add tests + stories"]
    E5["Visual QA (keyboard, screen reader)"]
    E6["Perf QA (skeletons, lazy, code split)"]
  end
  subgraph Review
    R1[PR Review]
    C1{Changes requested?}
    P1{Perf budget met?}
    R2[Preview Verify]
    R3[Ship]
  end

  %% Flow
  D1 --> D2 --> D3 --> E1 --> E2 --> E3 --> E4 --> E5 --> E6 --> R1 --> C1
  C1 -- yes --> D3
  C1 -- no --> P1
  P1 -- no --> E6
  P1 -- yes --> R2 --> R3
```
