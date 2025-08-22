%%{init: {'themeVariables': {'fontSize': '22px'}}}%%
graph TD
    ROOT[college-football-fantasy-app]

    ROOT --> APP[app/<br/>Next.js 15 App Router<br/>Pages and API Routes]
    ROOT --> COMPONENTS[components/<br/>React Components]
    ROOT --> SCHEMA[schema/<br/>SSOT zod-schema.ts]
    ROOT --> LIB[lib/<br/>Clients & Domain]
    ROOT --> FUNCTIONS[functions/<br/>Appwrite Functions & Workers]
    ROOT --> OPS[ops/<br/>AI Toolbox Only<br/>prompts/codemods/guards]
    ROOT --> DOCS[docs/<br/>Project Map + Diagrams]
    ROOT --> PUBLIC[public/<br/>Static Assets + docs mirror]

    style SCHEMA fill:#fff2cc,stroke:#d6b656,stroke-width:3px,color:#000
    style OPS fill:#f8cecc,stroke:#b85450,stroke-width:2px,color:#000
