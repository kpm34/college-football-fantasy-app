%%{init: {'themeVariables': {'fontSize': '22px'}}}%%
graph TD
    ROOT["college-football-fantasy-app"]

    ROOT --> APP["app/<br/>Next.js 15 App Router<br/>Pages and API Routes"]
    APP --> SEG_MKT["(marketing)/<br/>public pages, invite, login, signup, docs"]
    APP --> SEG_DASH["(dashboard)/<br/>authed app: league, admin, account"]
    APP --> SEG_DRAFT["(draft)/<br/>draft and mock-draft UIs"]
    APP --> API["app/api/*<br/>Route Handlers"]

    ROOT --> COMPONENTS["components/<br/>React Components"]
    ROOT --> LIB["lib/<br/>Clients & Domain"]
    LIB --> DOMAIN["lib/domain/*"]
    LIB --> HOOKS["lib/hooks/*"]
    LIB --> TYPES["lib/types/*"]

    ROOT --> SCHEMA["schema/<br/>SSOT zod-schema.ts"]
    SCHEMA --> GENS["generators/* → outputs to lib/*"]

    ROOT --> FUNCTIONS["functions/<br/>Appwrite Functions & Workers"]
    FUNCTIONS --> FX_APP["functions/appwrite/*"]
    FUNCTIONS --> FX_WORK["functions/workers/*"]

    ROOT --> OPS["ops/<br/>AI Toolbox Only<br/>prompts/codemods/guards"]
    OPS --> COMMON["ops/common/*"]
    OPS --> ATTIC["ops/attic/*"]

    ROOT --> DOCS["docs/<br/>Project Map + Diagrams"]
    ROOT --> PUBLIC["public/<br/>Static Assets"]
    ROOT --> FUTURE["future/<br/>ideas, marketing, scoring, trading, waiver, auction-drafts"]

    style SCHEMA fill:#fff2cc,stroke:#d6b656,stroke-width:3px,color:#000
    style OPS fill:#f8cecc,stroke:#b85450,stroke-width:2px,color:#000
