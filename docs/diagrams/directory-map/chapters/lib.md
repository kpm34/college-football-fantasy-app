# Chapter: lib/

- Purpose: Core utilities, repositories, domain logic, and SDKs.
- Usage: Keep business logic here; avoid importing UI into `lib/*`.

Notables: `lib/repos/*`, `lib/db/*`, `lib/appwrite-*.ts`, `lib/types/*`.

```mermaid
flowchart LR
%% Palette + legibility
classDef folder fill:#ADD8E6,stroke:#6CB6D9,color:#003A8C,rx:6,ry:6;
classDef file fill:#F5F5DC,stroke:#C9C9A3,color:#262626,rx:6,ry:6;
classDef config fill:#9932CC,stroke:#6E259B,color:#FFFFFF,rx:6,ry:6;
classDef generated fill:#DE5D83,stroke:#B34463,color:#FFFFFF,rx:6,ry:6;
classDef test fill:#C41E3A,stroke:#8E1F2E,color:#FFFFFF,rx:6,ry:6;
classDef legend fill:#FAFAFA,stroke:#D9D9D9,color:#595959,rx:6,ry:6;

L["lib/"]:::folder --> L1["db/"]:::folder
L --> L2["repos/"]:::folder
L --> L3["hooks/"]:::folder
L --> L4["types/"]:::folder
L --> L5["services/"]:::folder
L --> L6["config/"]:::folder
L --> L7["generated/"]:::folder
L --> L8["utils/"]:::folder
L --> FAS["appwrite-server.ts"]:::file
L --> FAP["appwrite.ts"]:::file

%% Click main files to Admin overlay (chapter view)
click L1 "/admin/diagrams/directory-map:chapters:lib" "Open lib chapter" _blank
click L2 "/admin/diagrams/directory-map:chapters:lib" "Open lib chapter" _blank
click L4 "/admin/diagrams/directory-map:chapters:lib" "Open lib chapter" _blank
click FAS "/admin/diagrams/directory-map:chapters:lib" "Open lib chapter" _blank
click FAP "/admin/diagrams/directory-map:chapters:lib" "Open lib chapter" _blank

Legend["Legend:\nFolder (Light Blue)\nFile (Beige)\n Config (DarkOrchid)\n Generated (Blush)\nTests (Cardinal)"]:::legend
```
