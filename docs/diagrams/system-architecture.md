# System Architecture Overview

```mermaid
flowchart TB
    %% External providers and data feeds
    subgraph ExtAPIs[External APIs]
        CFBD[College Football<br/>Data API]
        ESPN[ESPN API<br/>Live Scores]
        OAUTH[OAuth Providers<br/>Google, Apple]
        ROTOWIRE[Rotowire API<br/>Injuries]
    end

    %% Data inputs powering projections
    subgraph TalentIntel[Talent Intelligence]
        EA_DATA[EA Sports Ratings]
        DEPTH_DATA[Depth Charts (model_inputs.depth_chart_json)]
        EFF_DATA[Pace & Efficiency (efficiency/*)]
        MANUAL_OVR[Manual Overrides (model_inputs.manual_overrides_json)]
    end

    %% Appwrite single source of truth
    subgraph AppwriteDB[Appwrite Database NYC]
        subgraph CoreColls[Core Collections]
            PLAYERS[(college_players)]
            PLAYER_STATS[(player_stats)]
            GAMES[(games)]
            RANKINGS[(rankings)]
        end

        subgraph FantasyColls[Fantasy Collections]
            LEAGUES[(leagues)]
            USER_TEAMS[(user_teams)]
            LINEUPS[(lineups)]
            AUCTIONS[(auctions)]
            BIDS[(bids)]
        end

        subgraph DraftSys[Draft System]
            MOCK_DRAFTS[(mock_drafts)]
            MOCK_PICKS[(mock_draft_picks)]
            DRAFT_PICKS[(draft_picks)]
        end
    end

    %% Next.js API (Node) and Edge
    subgraph APIRoutes[Next.js API Routes]
        API_PLAYERS[/GET /api/draft/players/]
        API_LEAGUES[/GET/PUT /api/leagues/*/]
        API_MOCK[/api/mock-draft/*/]
        API_DRAFT[/api/drafts/*/]
        API_RANKINGS[/api/rankings/cached/]
        API_SCHEDULE[/api/games/cached/]
    end

    %% Frontend surfaces
    subgraph FrontendPages[Frontend]
        MOCK_DRAFT_UI[Mock Draft Room (Appwrite realtime)]
        DRAFT_UI[League Draft Room (Realtime + Timer)]
        LEAGUE_UI[League Home + DraftButton]
        ADMIN_UI[Admin (Mermaid Diagrams)]
    end

    %% Data flow: inputs -> projections -> API -> UI
    CFBD -->|teams, games| GAMES
    ESPN -->|live scores| GAMES
    ROTOWIRE -->|injuries| PLAYER_STATS
    EA_DATA -->|ratings seed| PLAYERS
    DEPTH_DATA -->|depth multipliers| PLAYERS
    EFF_DATA -->|pace/efficiency| PLAYERS
    MANUAL_OVR -->|fixups| PLAYERS

    PLAYERS --> API_PLAYERS
    RANKINGS --> API_RANKINGS
    GAMES --> API_SCHEDULE
    LEAGUES --> API_LEAGUES
    MOCK_DRAFTS --> API_MOCK
    DRAFT_PICKS --> API_DRAFT

    API_PLAYERS --> DRAFT_UI
    API_LEAGUES --> LEAGUE_UI
    API_MOCK --> MOCK_DRAFT_UI
    API_DRAFT --> DRAFT_UI
    API_RANKINGS --> DRAFT_UI
    API_SCHEDULE --> DRAFT_UI
```
