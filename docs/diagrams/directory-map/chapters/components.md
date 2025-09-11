# Chapter: components/

- Purpose: Reusable UI pieces and feature-level components.
- Usage: Mirror target folder structure; prefer server-driven data into props; expose via `components/index.ts`.

Key subfolders: `ui/`, `features/`, `layout/`, `tables/`, `charts/`.

```mermaid
flowchart LR
%% Palette + legibility
classDef folder fill:#ADD8E6,stroke:#6CB6D9,color:#003A8C,rx:6,ry:6;
classDef file fill:#F5F5DC,stroke:#C9C9A3,color:#262626,rx:6,ry:6;
classDef config fill:#9932CC,stroke:#6E259B,color:#FFFFFF,rx:6,ry:6;
classDef generated fill:#DE5D83,stroke:#B34463,color:#FFFFFF,rx:6,ry:6;
classDef test fill:#C41E3A,stroke:#8E1F2E,color:#FFFFFF,rx:6,ry:6;
classDef legend fill:#FAFAFA,stroke:#D9D9D9,color:#595959,rx:6,ry:6;

C["components/"]:::folder --> C1["ui/"]:::folder
C --> C2["features/"]:::folder
C --> C3["layout/"]:::folder
C --> C4["tables/"]:::folder
C --> C5["charts/"]:::folder
C --> CF["forms/"]:::folder
C --> CH["hooks/"]:::folder
C --> CX["index.ts"]:::file

%% Click main files to Admin overlay (chapter view)
click CX "/admin/diagrams/directory-map:chapters:components" "Open components chapter" _blank

%% Drill-down clicks for major folders in components
click C2 "/admin/diagrams/directory-map:chapters:components" "Open components chapter" _blank
click C3 "/admin/diagrams/directory-map:chapters:components" "Open components chapter" _blank
click C1 "/admin/diagrams/directory-map:chapters:components" "Open components chapter" _blank
click C5 "/admin/diagrams/directory-map:chapters:components" "Open components chapter" _blank
click CF "/admin/diagrams/directory-map:chapters:components" "Open components chapter" _blank
click CH "/admin/diagrams/directory-map:chapters:components" "Open components chapter" _blank

Legend["Legend:\nFolder (Light Blue)\nFile (Beige)\n Config (DarkOrchid)\n Generated (Blush)\nTests (Cardinal)"]:::legend
```
