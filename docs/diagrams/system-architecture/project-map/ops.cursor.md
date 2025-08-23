# Project Map — ops/cursor

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  ops_cursor["ops/cursor/" ]
  class ops_cursor folder
  ops_cursor_context_packs["context-packs/"]
  class ops_cursor_context_packs folder
  ops_cursor --> ops_cursor_context_packs
  click ops_cursor_context_packs "/admin/project-map/ops/cursor/context-packs" "Open context-packs"
  ops_cursor_screenshot["screenshot/"]
  class ops_cursor_screenshot folder
  ops_cursor --> ops_cursor_screenshot
  click ops_cursor_screenshot "/admin/project-map/ops/cursor/screenshot" "Open screenshot"
  ops_cursor_tasks_md["tasks.md"]
  class ops_cursor_tasks_md file
  ops_cursor --> ops_cursor_tasks_md
```
