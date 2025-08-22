# Repository Structure

```mermaid
flowchart TD
    ROOT[college-football-fantasy-app]
    
    ROOT --> APP[app/<br/>Next.js 15 App Router<br/>Pages and API Routes]
    ROOT --> COMPONENTS[components/<br/>React Components<br/>UI Library]
    ROOT --> SCHEMA[schema/<br/>SINGLE SOURCE OF TRUTH<br/>zod-schema.ts]
    
    ROOT --> LIB[lib/<br/>Appwrite Clients<br/>Services and Utils]
    ROOT --> CORE[core/<br/>Config, Auth<br/>Domain Logic]
    ROOT --> HOOKS[hooks/<br/>React Hooks<br/>Realtime Logic]
    ROOT --> TYPES[types/<br/>TypeScript Types<br/>Shared Interfaces]
    
    ROOT --> SCRIPTS[ops/common/scripts/<br/>Migrations, Sync<br/>Validation Guards]
    ROOT --> OPS[ops/<br/>Claude/Cursor/ChatGPT Ops<br/>Automation Scripts]
    ROOT --> DATA[data/<br/>EA Ratings, Mock Drafts<br/>Depth Charts, CSV/JSON]
    ROOT --> FUNCTIONS[ops/common/functions/<br/>Appwrite & Pipeline Functions<br/>Serverless Code]
    
    ROOT --> DOCS[docs/<br/>Documentation<br/>Project Memory]
    ROOT --> PUBLICDOCS[public/docs/<br/>Docs served via API<br/>Mermaid for Admin]
    ROOT --> VENDOR[vendor/<br/>Submodules<br/>3D Assets]
    
    APP --> CLAUDEAPI[api/claude/route.ts<br/>Anthropic (Node runtime)]
    HOOKS --> CLAUDEHOOK[hooks/useClaude.ts<br/>Client hooks]

    SCHEMA --> SSOT[zod-schema.ts<br/>Collections, Types<br/>Validation Rules]
    LIB --> FRONTEND[appwrite.ts<br/>Frontend Client<br/>Session Auth]
    LIB --> BACKEND[appwrite-server.ts<br/>Server Client<br/>API Key Auth]
    SCRIPTS --> GUARDS[guards/<br/>Build Validation<br/>Schema Drift Prevention]

    PUBLICDOCS --> MERMAIDAPI[app/api/docs/mermaid/[slug]<br/>Extracts ```mermaid blocks]
    MERMAIDAPI --> ADMINPAGE[app/admin/page.tsx<br/>MermaidRenderer]

    style SCHEMA fill:#fff2cc,stroke:#d6b656,stroke-width:4px,color:#000000
    style SSOT fill:#fff2cc,stroke:#d6b656,stroke-width:4px,color:#000000
```
