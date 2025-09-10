# Chapter: lib/

- Purpose: Core utilities, repositories, domain logic, and SDKs.
- Usage: Keep business logic here; avoid importing UI into `lib/*`.

Notables: `lib/repos/*`, `lib/db/*`, `lib/appwrite-*.ts`, `lib/types/*`.

```mermaid
graph LR
  L[lib/] --> L1[db/]
  L --> L2[repos/]
  L --> L3[hooks/]
  L --> L4[types/]
  L --> L5[services/]
```
