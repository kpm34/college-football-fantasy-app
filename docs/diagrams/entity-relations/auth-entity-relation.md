# Auth Entity Relation

Collections:

- clients: authUserId (unique), displayName, email, avatarUrl, createdAt
- league_memberships: leagueId, authUserId, role, status

Relationships:

- clients (1) → (many) league_memberships

Related: ../overview/auth.md

```mermaid
erDiagram
  CLIENTS ||--o{ LEAGUE_MEMBERSHIPS : joins
  CLIENTS {
    string authUserId
    string displayName
    string email
    string avatarUrl
    datetime createdAt
  }
  LEAGUE_MEMBERSHIPS {
    string leagueId
    string authUserId
    string role
    string status
  }
```
