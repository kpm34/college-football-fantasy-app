# Project Map — ops

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  R["ops/"]
  class R folder
  ops__archive_["_archive/"]
  class ops__archive_ folder
  R --> ops__archive_
  click ops__archive_ "/admin/project-map/ops/_archive" "Open _archive"
  ops_attic_["attic/"]
  class ops_attic_ folder
  R --> ops_attic_
  click ops_attic_ "/admin/project-map/ops/attic" "Open attic"
  ops_chatgpt_["chatgpt/"]
  class ops_chatgpt_ folder
  R --> ops_chatgpt_
  click ops_chatgpt_ "/admin/project-map/ops/chatgpt" "Open chatgpt"
  ops_chatgpt_ops_["chatgpt-ops/"]
  class ops_chatgpt_ops_ folder
  R --> ops_chatgpt_ops_
  click ops_chatgpt_ops_ "/admin/project-map/ops/chatgpt-ops" "Open chatgpt-ops"
  ops_claude_["claude/"]
  class ops_claude_ folder
  R --> ops_claude_
  click ops_claude_ "/admin/project-map/ops/claude" "Open claude"
  ops_claude_ops_["claude-ops/"]
  class ops_claude_ops_ folder
  R --> ops_claude_ops_
  click ops_claude_ops_ "/admin/project-map/ops/claude-ops" "Open claude-ops"
  ops_common_["common/"]
  class ops_common_ folder
  R --> ops_common_
  click ops_common_ "/admin/project-map/ops/common" "Open common"
  ops_config_["config/"]
  class ops_config_ folder
  R --> ops_config_
  click ops_config_ "/admin/project-map/ops/config" "Open config"
  ops_cursor_["cursor/"]
  class ops_cursor_ folder
  R --> ops_cursor_
  click ops_cursor_ "/admin/project-map/ops/cursor" "Open cursor"
  ops_cursor_ops_["cursor-ops/"]
  class ops_cursor_ops_ folder
  R --> ops_cursor_ops_
  click ops_cursor_ops_ "/admin/project-map/ops/cursor-ops" "Open cursor-ops"
```
