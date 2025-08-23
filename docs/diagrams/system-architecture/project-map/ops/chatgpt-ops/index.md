# Project Map — ops/chatgpt-ops

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  ops_chatgpt_ops["ops/chatgpt-ops/" ]
  class ops_chatgpt_ops folder
  ops_chatgpt_ops_appwrite_update["appwrite-update/"]
  class ops_chatgpt_ops_appwrite_update folder
  ops_chatgpt_ops --> ops_chatgpt_ops_appwrite_update
  click ops_chatgpt_ops_appwrite_update "/admin/project-map/ops/chatgpt-ops/appwrite-update" "Open appwrite-update"
  ops_chatgpt_ops_edit["edit/"]
  class ops_chatgpt_ops_edit folder
  ops_chatgpt_ops --> ops_chatgpt_ops_edit
  click ops_chatgpt_ops_edit "/admin/project-map/ops/chatgpt-ops/edit" "Open edit"
  ops_chatgpt_ops_review["review/"]
  class ops_chatgpt_ops_review folder
  ops_chatgpt_ops --> ops_chatgpt_ops_review
  click ops_chatgpt_ops_review "/admin/project-map/ops/chatgpt-ops/review" "Open review"
  ops_chatgpt_ops_sync["sync/"]
  class ops_chatgpt_ops_sync folder
  ops_chatgpt_ops --> ops_chatgpt_ops_sync
  click ops_chatgpt_ops_sync "/admin/project-map/ops/chatgpt-ops/sync" "Open sync"
  ops_chatgpt_ops_test["test/"]
  class ops_chatgpt_ops_test folder
  ops_chatgpt_ops --> ops_chatgpt_ops_test
  click ops_chatgpt_ops_test "/admin/project-map/ops/chatgpt-ops/test" "Open test"
```
