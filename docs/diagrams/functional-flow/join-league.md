# Join League Flow (Invite)

## Overview
Complete flow for joining a fantasy league via invite link or browse.

## Auth Route Handlers Detected
- `/app/(dashboard)/api/leagues/invite` - Validate invite token or get invite links
- `/app/(dashboard)/api/leagues/join` - Direct join endpoint
- `/app/(dashboard)/api/leagues/search` - Browse public leagues

## 1. Flowchart

```mermaid
flowchart TD
    Start([User Opens Invite Link]) --> ParseToken[Parse Invite Token]
    ParseToken --> ValidateToken{Valid Token?}
    ValidateToken -->|Invalid| ShowError[Show Invalid Link Error]
    ValidateToken -->|Valid| CheckAuth{User Authenticated?}
    
    CheckAuth -->|No| StoreRedirect[Store Redirect URL]
    StoreRedirect --> LoginPage[Redirect to Login]
    LoginPage --> AfterLogin[After Login Success]
    AfterLogin --> RestoreRedirect[Restore Invite URL]
    RestoreRedirect --> CheckAuth2{Re-check Auth}
    
    CheckAuth -->|Yes| FetchInvite[GET /api/invites/verify]
    CheckAuth2 -->|Yes| FetchInvite
    
    FetchInvite --> CheckExpiry{Token Expired?}
    CheckExpiry -->|Yes| ExpiredError[Show Expired Error]
    CheckExpiry -->|No| CheckCapacity{League Full?}
    
    CheckCapacity -->|Yes| FullError[Show League Full]
    CheckCapacity -->|No| CheckMember{Already Member?}
    
    CheckMember -->|Yes| RedirectLeague[Redirect to League]
    CheckMember -->|No| AcceptAPI[POST /api/invites/accept]
    
    AcceptAPI --> CreateMembership[Create league_membership]
    CreateMembership --> CreateTeam[Create fantasy_team]
    CreateTeam --> UpdateInvite[Log invite usage in activity_log]
    UpdateInvite --> LogActivity[Log join activity]
    LogActivity --> Success[Redirect to League Dashboard]
    
    style Start fill:#e0f2fe
    style Success fill:#dcfce7
    style ShowError fill:#fee2e2
    style ExpiredError fill:#fee2e2
    style FullError fill:#fee2e2
```

## 2. Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User/Browser
    participant C as Invite Page
    participant A as API Route
    participant Auth as Auth Service
    participant D as DAL
    participant DB as Appwrite DB
    
    U->>C: Open invite link
    C->>C: Parse token from URL
    
    C->>Auth: Check authentication
    
    alt Not Authenticated
        Auth-->>C: Not logged in
        C->>C: Store redirect URL
        C->>U: Redirect to login
        U->>Auth: Complete login
        Auth->>C: Return to invite URL
    end
    
    C->>A: GET /api/invites/verify?token=xxx
    A->>D: getInviteByToken(token)
    D->>DB: Query invites
    DB-->>D: Invite data
    
    A->>A: Validate invite
    Note over A: Check expiry<br/>Check league capacity<br/>Check membership
    
    alt Invalid/Expired
        A-->>C: Error response
        C-->>U: Show error message
    else Valid Invite
        A-->>C: League details
        C->>U: Show league info
        
        U->>C: Click Join
        C->>A: POST /api/invites/accept
        
        A->>D: createMembership(data)
        D->>DB: INSERT league_memberships
        DB-->>D: Membership created
        
        D->>DB: INSERT fantasy_teams
        DB-->>D: Team created
        
        D->>DB: UPDATE invites
        Note over DB: Increment uses_count
        
        D->>DB: INSERT activity_log
        
        D-->>A: Success
        A-->>C: Join successful
        C->>U: Redirect to league
    end
```

## 3. Data Interaction Table

| Collection | Operation | Attributes Read/Written | Notes |
|------------|-----------|------------------------|-------|
| activity_log | READ | type='league_invite', leagueId, inviteToken, status, expiresAt | Validate invite |
| activity_log | UPDATE/CREATE | status or new log row | Track invite usage |
| leagues | READ | $id, maxTeams, currentTeams, status | Check capacity |
| league_memberships | READ | leagueId, authUserId | Check existing membership |
| league_memberships | WRITE | leagueId, authUserId, role='MEMBER', status='ACTIVE', joinedAt | Create new membership |
| fantasy_teams | WRITE | leagueId, ownerAuthUserId, name, createdAt | Create user's team for visibility |

## 4. Validation Steps

```typescript
// Invite validation logic
async function validateInvite(token: string) {
  const invite = await getInviteByToken(token)
  
  if (!invite) {
    throw new Error('Invalid invite link')
  }
  
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    throw new Error('Invite link has expired')
  }
  
  if (invite.max_uses && invite.uses_count >= invite.max_uses) {
    throw new Error('Invite link has reached maximum uses')
  }
  
  const league = await getLeague(invite.league_id)
  
  if (league.current_teams >= league.max_teams) {
    throw new Error('League is full')
  }
  
  const membership = await checkMembership(league.id, userId)
  
  if (membership) {
    throw new Error('Already a member of this league')
  }
  
  return { invite, league }
}
```

## 5. Error States

- **Invalid Token**: Token doesn't exist or malformed
- **Expired Invite**: Invite past expiration date
- **Max Uses Reached**: Invite used maximum times
- **League Full**: League at capacity
- **Already Member**: User already in league
- **Not Authenticated**: User needs to log in first
- **Database Error**: Connection or write failures

## 6. Authentication Flow

```typescript
// Store redirect for post-login
if (!authenticated) {
  sessionStorage.setItem('redirect_after_login', window.location.href)
  router.push('/login')
}

// After successful login
const redirect = sessionStorage.getItem('redirect_after_login')
if (redirect) {
  sessionStorage.removeItem('redirect_after_login')
  router.push(redirect)
}
```

## 7. Alternative Join Methods

### Browse Public Leagues
- User can browse `/leagues/browse`
- Filter by conference, draft type, open spots
- Direct join without invite for public leagues

### Direct League ID
- Share league ID directly
- Join via `/league/join?id=xxx`
- Requires password for private leagues