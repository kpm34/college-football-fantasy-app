---
slug: user-journeys:auth:sign-in-up
---

### Auth — Sign in/up

```mermaid
flowchart TD
  %% Lanes
  subgraph U[User]
    U0((Start))
  end
  subgraph A[App (Next.js)]
    %% Avoid special [/ ... /] shape to prevent parse ambiguity with slashes
    A1[Open /login or /signup]
    A2{Has session?}
    A3[/Post credentials to API/]
    A4[Set returnTo]
    A5[Redirect to returnTo or /dashboard]
    A6[/Logout -> clear cookie/]
  end
  subgraph AW[Appwrite]
    W1[Verify email+password]
    W2[Create session]
    W3[Issue httpOnly cookie]
  end

  U0 --> A1
  A1 --> A2
  A2 -- yes --> A5
  A2 -- no --> A3
  A3 --> W1 --> W2 --> W3 --> A5

  %% Errors
  A3 -. invalid creds .-x U0

  %% Logout (separate entry)
  U0 -. click Logout .-> A6
```

#### Legend

- Terminator: rounded (Start/End)
- Decision: diamond
- Process: rectangle
- Swimlanes: User | App (Next.js) | Appwrite
- Async steps are dashed when shown
