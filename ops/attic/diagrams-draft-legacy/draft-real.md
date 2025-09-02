# Real Draft Flow

```mermaid
digraph G
  rankdir=LR
  node [shape=rect, style=rounded]

  Lobby["League Draft Lobby"]
  Schedule["Draft Date & Clock"]
  Ready["Teams Ready"]
  Start["Commissioner Starts"]
  Realtime["Realtime Channel (Appwrite)"]
  Turn["Compute Turn (snake)"]
  Clock["Pick Clock"]
  Pick["Team Makes Pick"]
  Validate["Validate (eligibility, roster)"]
  Apply["Apply Pick -> State + Persist"]
  Broadcast["Broadcast Update"]
  Auto["Autopick On Timeout"]
  Next["Next Turn"]
  Complete["Draft Complete"]

  Lobby -> Schedule -> Ready -> Start -> Realtime -> Turn -> Clock -> Pick -> Validate
  Validate -> Apply -> Broadcast -> Next -> Turn
  Clock -> Auto -> Apply
  Next -> Complete
```
