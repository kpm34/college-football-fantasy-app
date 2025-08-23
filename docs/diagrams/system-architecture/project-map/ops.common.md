# Project Map — ops/common

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  ops_common["ops/common/" ]
  class ops_common folder
  ops_common_README_md["README.md"]
  class ops_common_README_md file
  ops_common --> ops_common_README_md
  ops_common_appwrite_update["appwrite-update/"]
  class ops_common_appwrite_update folder
  ops_common --> ops_common_appwrite_update
  click ops_common_appwrite_update "/admin/project-map/ops/common/appwrite-update" "Open appwrite-update"
  ops_common_codemods["codemods/"]
  class ops_common_codemods folder
  ops_common --> ops_common_codemods
  click ops_common_codemods "/admin/project-map/ops/common/codemods" "Open codemods"
  ops_common_functions["functions/"]
  class ops_common_functions folder
  ops_common --> ops_common_functions
  click ops_common_functions "/admin/project-map/ops/common/functions" "Open functions"
  ops_common_guards["guards/"]
  class ops_common_guards folder
  ops_common --> ops_common_guards
  click ops_common_guards "/admin/project-map/ops/common/guards" "Open guards"
  ops_common_prompts["prompts/"]
  class ops_common_prompts folder
  ops_common --> ops_common_prompts
  click ops_common_prompts "/admin/project-map/ops/common/prompts" "Open prompts"
  ops_common_public["public/"]
  class ops_common_public folder
  ops_common --> ops_common_public
  click ops_common_public "/admin/project-map/ops/common/public" "Open public"
  ops_common_python["python/"]
  class ops_common_python folder
  ops_common --> ops_common_python
  click ops_common_python "/admin/project-map/ops/common/python" "Open python"
  ops_common_scripts["scripts/"]
  class ops_common_scripts folder
  ops_common --> ops_common_scripts
  click ops_common_scripts "/admin/project-map/ops/common/scripts" "Open scripts"
  ops_common_test["test/"]
  class ops_common_test folder
  ops_common --> ops_common_test
  click ops_common_test "/admin/project-map/ops/common/test" "Open test"
```
