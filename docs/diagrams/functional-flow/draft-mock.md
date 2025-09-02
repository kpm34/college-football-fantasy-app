# Mock Draft Flow

```mermaid
digraph G
  rankdir=LR
  node [shape=rect, style=rounded]

  Lobby["Mock Draft Lobby"]
  Create["Create Mock Draft"]
  Num["Select Teams / Rounds"]
  Start["Start Mock"]
  Auto["Auto-pick Engine"]
  Timer["Per-pick Timer (configurable)"]
  Turn["Compute Turn (snake)"]
  Pick["Make Pick"]
  Validate["Validate (dupe/roster)"]
  Apply["Apply Pick -> Board"]
  Next["Next Turn"]
  Finish["Finish & Export Results"]

  Lobby -> Create -> Num -> Start -> Turn -> Timer -> Pick -> Validate
  Validate -> Apply -> Next -> Turn
  Apply -> Auto
  Auto -> Next
  Next -> Finish
```
