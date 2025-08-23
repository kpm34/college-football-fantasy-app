# Project Map — future/scoring/weekly-scoring

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  future_scoring_weekly_scoring["future/scoring/weekly-scoring/" ]
  class future_scoring_weekly_scoring folder
  future_scoring_weekly_scoring_appwrite_json["appwrite.json"]
  class future_scoring_weekly_scoring_appwrite_json file
  future_scoring_weekly_scoring --> future_scoring_weekly_scoring_appwrite_json
  future_scoring_weekly_scoring_package_json["package.json"]
  class future_scoring_weekly_scoring_package_json file
  future_scoring_weekly_scoring --> future_scoring_weekly_scoring_package_json
  future_scoring_weekly_scoring_src["src/"]
  class future_scoring_weekly_scoring_src folder
  future_scoring_weekly_scoring --> future_scoring_weekly_scoring_src
```
