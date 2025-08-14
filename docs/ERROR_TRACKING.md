# College Football Fantasy App - Error Tracking Guide

## Common Errors and Solutions

### Authentication Errors

#### Error: "The current user is not authorized to perform the requested action" (401)
**Cause**: User session expired or missing permissions  
**Database**: Check `users` collection permissions  
**Solution**:
1. Verify user is logged in (`/api/auth/user`)
2. Check collection permissions allow `Role.users()`
3. Verify document-level permissions for specific resources

#### Error: "User not found" (404)
**Cause**: User document missing from database  
**Database**: `users` collection  
**Solution**:
1. Re-sync user from Appwrite Auth to database
2. Check if user was deleted but auth session remains

---

### League Errors

#### Error: "League not found" (404)
**Route**: `/api/leagues/[leagueId]`  
**Database**: `leagues` collection  
**Common Causes**:
- Invalid league ID
- League was deleted
- User doesn't have permission to view private league

#### Error: "Only commissioner can perform this action" (403)
**Routes**: Commissioner-only endpoints  
**Database**: Check `commissionerId` in `leagues`  
**Solution**: Verify user ID matches `commissionerId`

---

### Roster/Locker Room Errors

#### Error: "No roster found for user in league"
**Route**: `/league/[leagueId]/locker-room`  
**Database**: `rosters` collection  
**Solution**:
1. Create roster when user joins league
2. Check if `rosters` has entry for `userId` + `leagueId`

#### Error: "Failed to load players" (500)
**Database**: `players` collection  
**Common Causes**:
- `players` JSON field is malformed
- Player IDs don't exist in database
- Permissions issue on `players` collection

---

### Draft Errors

#### Error: "Not your turn to pick" (403)
**Route**: `/api/draft/[leagueId]/pick`  
**Database**: `draft_picks`, `rosters`  
**Solution**: Verify draft order and current pick

#### Error: "Player already drafted" (409)
**Database**: `draft_picks`  
**Solution**: Check if `playerId` exists in draft_picks for league

---

### Data Sync Errors

#### Error: "Failed to sync game data"
**Routes**: `/api/scraper`, cron jobs  
**External APIs**: ESPN, CFBD  
**Common Causes**:
- API rate limits
- External API down
- Invalid API keys

---

## Error Monitoring Checklist

### Before Deployment:

1. **Run Permission Check**:
   ```bash
   APPWRITE_API_KEY="..." node scripts/check-all-permissions.js
   ```

2. **Sync Schema**:
   ```bash
   APPWRITE_API_KEY="..." node scripts/sync-appwrite-complete.js
   ```

3. **Test Auth Flow**:
   - Signup → Login → Access protected route
   - Verify session persists

4. **Test Data Access**:
   - Load leagues list
   - Access locker room
   - View draft board

### Debug Steps:

1. **Check Browser Console**:
   - Network tab for failed requests
   - Console for JavaScript errors
   - Application tab for cookies/session

2. **Check Appwrite Console**:
   - Collection permissions
   - Document count
   - Recent queries

3. **API Response Codes**:
   - 401: Authentication issue
   - 403: Permission issue  
   - 404: Resource not found
   - 500: Server error

### Common Permission Fixes:

```javascript
// Rosters - Users can read all, update own
[
  Permission.read(Role.users()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users())
]

// Players - Read only for users
[
  Permission.read(Role.users())
]

// Leagues - Users can read/create
[
  Permission.read(Role.users()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users())
]
```

### Error Logging:

Add to all API routes:
```javascript
} catch (error) {
  console.error('API Error:', {
    route: req.url,
    method: req.method,
    error: error.message,
    code: error.code,
    type: error.type,
    userId: session?.userId
  });
  
  return NextResponse.json(
    { error: error.message },
    { status: error.code === 401 ? 401 : 500 }
  );
}
```

### Testing Commands:

```bash
# Test auth
curl -X GET https://cfbfantasy.app/api/auth/user -H "Cookie: [session-cookie]"

# Test league access  
curl -X GET https://cfbfantasy.app/api/leagues/[leagueId] -H "Cookie: [session-cookie]"

# Test roster access
curl -X GET https://cfbfantasy.app/api/rosters/[rosterId] -H "Cookie: [session-cookie]"
```

## Prevention Strategy:

1. **Always update permissions** when creating new collections
2. **Test with regular user account**, not just admin
3. **Add error boundaries** to React components
4. **Log all database operations** for debugging
5. **Use TypeScript** for type safety
6. **Create integration tests** for critical flows

## Quick Fixes:

### Reset All Permissions:
```bash
APPWRITE_API_KEY="..." node scripts/sync-appwrite-complete.js
```

### Fix Specific Collection:
```javascript
// In scripts/fix-collection.js
const collection = 'rosters'; // Change as needed
await databases.updateCollection(
  DATABASE_ID,
  collection,
  collection,
  [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users())
  ]
);
```

### Clear User Session:
```javascript
// Force logout and fresh login
await account.deleteSession('current');
window.location.href = '/login';
```
