# Chapter: app/

- Purpose: Next.js App Router entry points, routes, and pages.
- Usage: Server Components by default; client components only where interactivity is required.
- Notes: Organize by route segments; colocate route-specific components; avoid data fetching in client components.

Key files:

- `app/layout.tsx` — Root layout
- `app/globals.css` — Global styles

```mermaid
flowchart LR
%% Palette + legibility
classDef folder fill:#ADD8E6,stroke:#6CB6D9,color:#003A8C,rx:6,ry:6;
classDef file fill:#F5F5DC,stroke:#C9C9A3,color:#262626,rx:6,ry:6;
classDef config fill:#9932CC,stroke:#6E259B,color:#FFFFFF,rx:6,ry:6;
classDef generated fill:#DE5D83,stroke:#B34463,color:#FFFFFF,rx:6,ry:6;
classDef test fill:#C41E3A,stroke:#8E1F2E,color:#FFFFFF,rx:6,ry:6;
classDef legend fill:#FAFAFA,stroke:#D9D9D9,color:#595959,rx:6,ry:6;

A["app/"]:::folder
A --> L1["layout.tsx"]:::file
A --> F1["global-error.tsx"]:::file
A --> F2["globals.css"]:::file
A --> D1["(dashboard)/"]:::folder
A --> L2["(league)/"]:::folder
A --> AD["admin/"]:::folder
A --> API["api/"]:::folder
API --> APB["api/(backend)/"]:::folder
API --> APF["api/(frontend)/"]:::folder
API --> APE["api/(external)/"]:::folder
A --> DR["draft/"]:::folder
A --> AU["auth/"]:::folder
A --> OG["og/"]:::folder

%% Click main files to Admin overlay (chapter view)
click L1 "/admin/diagrams/directory-map:chapters:app" "Open app chapter" _blank
click F1 "/admin/diagrams/directory-map:chapters:app" "Open app chapter" _blank
click F2 "/admin/diagrams/directory-map:chapters:app" "Open app chapter" _blank

%% Drill-down clicks for major folders
click API "/admin/diagrams/project-map:app:api" "Open app/api project map" _blank
click APB "/admin/diagrams/project-map:app:api:backend" "Open app/api/(backend)" _blank
click APF "/admin/diagrams/project-map:app:api:frontend" "Open app/api/(frontend)" _blank
click APE "/admin/diagrams/project-map:app:api:external" "Open app/api/(external)" _blank
click AD "/admin/diagrams/project-map:app:admin" "Open app/admin project map" _blank
click D1 "/admin/diagrams/project-map:app:dashboard" "Open app/(dashboard) project map" _blank
click DR "/admin/diagrams/project-map:app:draft" "Open app/draft project map" _blank

Legend["Legend:\nFolder (Light Blue)\nFile (Beige)\n Config (DarkOrchid)\n Generated (Blush)\nTests (Cardinal)"]:::legend
```
