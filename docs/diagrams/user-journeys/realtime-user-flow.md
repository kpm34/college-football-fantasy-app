# Realtime User Flow

Connection lifecycle:
- Connect → authenticate via cookie → subscribe to channels
- Receive updates → UI refresh → handle reconnects

Related: ../overview/realtime.md

```mermaid
flowchart LR
  C["Connect"] --> A["Authenticate (cookie)"]
  A --> S["Subscribe Channels"]
  S --> E["Receive Events"]
  E --> U["UI Update"]
  E --> R["Reconnect Handler"]
  R --> S
```


