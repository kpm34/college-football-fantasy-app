%%{init: {'themeVariables': {'fontSize': '22px'}}}%%
graph LR
  subgraph Frontend["Next.js App (App Router)"]
    APP[app/* pages & /app/api/*]
    SEG1[(marketing)]
    SEG2[(dashboard)]
    SEG3[(draft)]
    COMPONENTS[components/*]
  end

  subgraph Shared[Shared Code]
    LIB[lib/* clients & utils]
    DOMAIN[lib/domain/*]
    SCHEMA[schema/zod-schema.ts]
  end

  subgraph Runtime["/functions (runtime)"]
    FX_APPWRITE[functions/appwrite/*]
    FX_WORKERS[functions/workers/*]
  end

  subgraph Ops[/ops/ AI Toolbox]
    PROMPTS[common/prompts]
    CODEMODS[common/codemods]
    GUARDS[common/guards]
    SCRIPTS[common/scripts]
  end

  APP -->|HTTP| APPWRITE_DB[(Appwrite DB)]
  FX_APPWRITE -->|server| APPWRITE_DB
  FX_WORKERS -->|jobs| APPWRITE_DB

  SCHEMA -->|SSOT| LIB
  SCHEMA -->|SSOT| FX_APPWRITE
  SCHEMA -->|SSOT| APP
  APP --> SEG1
  APP --> SEG2
  APP --> SEG3

  GUARDS -.->|dev-time checks| SCHEMA
  CODEMODS -.->|refactors| APP

  classDef ssot fill:#fff2cc,stroke:#d6b656,stroke-width:3px,color:#000
  class SCHEMA ssot
