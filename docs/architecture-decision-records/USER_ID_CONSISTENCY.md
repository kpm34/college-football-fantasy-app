# User ID Field Consistency Documentation

## Overview
This document outlines the correct user ID field names across different collections in the College Football Fantasy App database.

## Collection-Specific User ID Fields

### 1. **`clients` Collection**
- **Field Name**: `authUserId`
- **Type**: String (max 64 chars)
- **Required**: Yes
- **Purpose**: Maps Appwrite Auth user IDs to user profile data
- **Usage**: Links authentication system to user profiles

### 2. **`fantasy_teams` Collection**
- **Field Name**: `ownerAuthUserId`
- **Type**: String (max 64 chars)
- **Required**: No (optional)
- **Purpose**: Identifies the owner of a fantasy team
- **Usage**: Links fantasy teams to their owners

### 3. **`league_memberships` Collection**
- **Field Name**: `authUserId`
- **Type**: String (max 64 chars)
- **Required**: Yes
- **Purpose**: Tracks user membership in leagues
- **Usage**: Normalized many-to-many relationship between users and leagues

## Key Principles

1. **Consistency**: Each collection uses a specific field name that reflects its purpose
2. **No Duplication**: Avoid storing `clientId`, `userId`, or other deprecated fields
3. **Source of Truth**: The Appwrite Auth `$id` is the primary identifier across all collections

## Migration Notes

### Deprecated Fields to Remove
- `clientId` in `fantasy_teams` - Use `ownerAuthUserId` instead
- `userId` in `fantasy_teams` - Use `ownerAuthUserId` instead
- Generic `userId` fields - Use collection-specific names

### Correct Query Patterns

```typescript
// Finding fantasy teams for a user
Query.equal('ownerAuthUserId', user.$id)

// Finding league memberships for a user
Query.equal('authUserId', user.$id)

// Finding client profile for a user
Query.equal('authUserId', user.$id)
```

## API Implementation

### When Creating Fantasy Team
```typescript
const fantasyTeamData = {
  leagueId: league.$id,
  leagueName: league.leagueName,
  ownerAuthUserId: user.$id,  // Correct field
  name: teamName,
  displayName: user.name || user.email,
  // ... other fields
};
```

### When Creating League Membership
```typescript
const membershipData = {
  leagueId: league.$id,
  leagueName: league.leagueName,
  authUserId: user.$id,  // Correct field
  role: 'MEMBER' | 'COMMISSIONER',
  status: 'ACTIVE',
  joinedAt: new Date().toISOString(),
  displayName: user.name || user.email
};
```

### When Creating/Updating Client Profile
```typescript
const clientData = {
  authUserId: user.$id,  // Correct field
  email: user.email,
  displayName: user.name,
  avatarUrl: user.prefs?.avatar,
  // ... other fields
};
```

## Schema Validation (Zod)

The Single Source of Truth (SSOT) in `schema/zod-schema.ts` defines:

```typescript
// Clients collection
export const Clients = z.object({
  authUserId: z.string().min(1).max(64),
  // ... other fields
});

// Fantasy Teams collection
export const FantasyTeams = z.object({
  ownerAuthUserId: z.string().min(1).max(64).optional(),
  // ... other fields
});

// League Memberships collection
export const LeagueMemberships = z.object({
  authUserId: z.string().min(1).max(64),
  // ... other fields
});
```

## Common Pitfalls to Avoid

1. **Don't mix field names**: Each collection has its specific field name
2. **Don't add redundant fields**: No need for both `userId` and `ownerAuthUserId`
3. **Don't forget optional vs required**: Some fields are optional (like `ownerAuthUserId` in fantasy_teams)
4. **Always use Appwrite Auth $id**: This is the source of truth for user identity

## Verification Checklist

- [ ] All API routes use correct field names for queries
- [ ] Join/Create league endpoints create proper league_memberships records
- [ ] Fantasy team creation uses `ownerAuthUserId`
- [ ] No deprecated fields (`clientId`, generic `userId`) in new code
- [ ] SSOT (zod-schema.ts) reflects actual database schema
- [ ] Collection constants in lib files are properly mapped
