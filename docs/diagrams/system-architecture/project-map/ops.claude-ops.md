# Project Map — ops/claude-ops

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  ops_claude_ops["ops/claude-ops/" ]
  class ops_claude_ops folder
  ops_claude_ops_TOOLBOX_CLAUDE_md["TOOLBOX_CLAUDE.md"]
  class ops_claude_ops_TOOLBOX_CLAUDE_md file
  ops_claude_ops --> ops_claude_ops_TOOLBOX_CLAUDE_md
  ops_claude_ops_appwrite_update["appwrite-update/"]
  class ops_claude_ops_appwrite_update folder
  ops_claude_ops --> ops_claude_ops_appwrite_update
  click ops_claude_ops_appwrite_update "/admin/project-map/ops/claude-ops/appwrite-update" "Open appwrite-update"
  ops_claude_ops_claude_cli_js["claude-cli.js"]
  class ops_claude_ops_claude_cli_js file
  ops_claude_ops --> ops_claude_ops_claude_cli_js
  ops_claude_ops_edit["edit/"]
  class ops_claude_ops_edit folder
  ops_claude_ops --> ops_claude_ops_edit
  click ops_claude_ops_edit "/admin/project-map/ops/claude-ops/edit" "Open edit"
  ops_claude_ops_review["review/"]
  class ops_claude_ops_review folder
  ops_claude_ops --> ops_claude_ops_review
  click ops_claude_ops_review "/admin/project-map/ops/claude-ops/review" "Open review"
  ops_claude_ops_sync["sync/"]
  class ops_claude_ops_sync folder
  ops_claude_ops --> ops_claude_ops_sync
  click ops_claude_ops_sync "/admin/project-map/ops/claude-ops/sync" "Open sync"
  ops_claude_ops_test["test/"]
  class ops_claude_ops_test folder
  ops_claude_ops --> ops_claude_ops_test
  click ops_claude_ops_test "/admin/project-map/ops/claude-ops/test" "Open test"
```
