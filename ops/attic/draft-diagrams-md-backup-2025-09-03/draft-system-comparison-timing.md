# Draft System Comparison & Timing Control

> Comparison of Mock vs Real drafts with timing control sequence.

```mermaid
%% Comparison table via notes and classes is omitted; we include core sequence diagram
sequenceDiagram
  autonumber
  participant U as User
  participant UI as Draft Room UI
  participant API as API Routes
  participant WS as WebSocket
  participant DB as Database
  participant Clock as Server Clock

  rect rgb(240, 248, 255)
    note over U,Clock: ROOM STATE CALCULATION
    U->>UI: Enter Draft Room
    UI->>API: GET /api/drafts/:id/room-state

    API->>Clock: Get current time
    API->>DB: Get draft settings
    DB-->>API: draft_start_at, room_open_at

    API->>API: Calculate state
    note over API: isOpen = now >= room_open_at\n isLive = now >= draft_start_at

    API-->>UI: Return room state
  end

  alt Room Not Open (Before T-60min)
    rect rgb(255, 240, 240)
      note over U,UI: CLOSED STATE
      UI-->>U: Show "Room opens in X minutes"
    end
  else Room Open, Not Live (T-60 to T-0)
    rect rgb(255, 250, 240)
      note over U,WS: PREVIEW STATE
      UI-->>U: Show preview + countdown
      UI->>WS: Connect WebSocket

      loop Every second until draft start
        Clock->>WS: Time update
        WS-->>UI: Countdown tick
        UI-->>U: Update timer display
      end

      Clock->>WS: Draft start signal
      WS-->>UI: Enable draft controls
    end
  else Draft Live (T-0 onwards)
    rect rgb(240, 255, 240)
      note over U,DB: LIVE DRAFT STATE
      UI-->>U: Full draft interface

      loop For each pick
        WS-->>UI: Pick event broadcast
        UI-->>U: Update draft board
      end
    end
  end
```

## Notes
- No emojis; accessible colors in sequence blocks.
- Focuses on timing gates and realtime updates.
