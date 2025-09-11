# Chapter: ops/

- Purpose: Operational scripts, diagrams, and automation.
- Usage: Put legacy in `ops/attic`; scripts in `ops/scripts`; dev helpers in `ops/dev`.

```mermaid
graph LR
  classDef folder fill:#e5e7eb,stroke:#6b7280,color:#111827,rx:6,ry:6
  classDef tooling fill:#f59e0b,stroke:#b45309,color:#1f2937,rx:6,ry:6

  subgraph TOOLING[Config/Tooling]
    O[ops/]:::folder --> O1[attic/]:::folder
    O --> O2[scripts/]:::folder
    O --> O3[dev/]:::folder
  end
  class TOOLING tooling;
```
