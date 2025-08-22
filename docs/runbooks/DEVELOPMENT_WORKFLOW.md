# College Football Fantasy App - Development Workflow

## Overview
This guide ensures code changes and database schema remain synchronized, preventing runtime errors.

## Development Workflow

### 1. Before Making Changes

#### Check Current State:
```bash
# 1. Pull latest code
git pull origin main

# 2. Check database schema is in sync
APPWRITE_API_KEY="your-key" node scripts/check-all-permissions.js

# 3. Run sync if needed
APPWRITE_API_KEY="your-key" node scripts/sync-appwrite-complete.js
```

### 2. Making Database Schema Changes

#### Adding a New Field:

1. **Update Schema Documentation**:
   - Edit `docs/DATABASE_SCHEMA.md`
   - Add field to collection attributes

2. **Update Sync Script**:
   - Edit `scripts/sync-appwrite-complete.js`
   - Add field to COLLECTIONS_SCHEMA

3. **Run Sync**:
   ```bash
   APPWRITE_API_KEY="your-key" node scripts/sync-appwrite-complete.js
   ```

4. **Update TypeScript Types**:
   ```typescript
   // In types/[model].ts
   interface League {
     // ... existing fields
     newField?: string; // Add new field
   }
   ```

5. **Update API Routes** that use this collection

#### Example: Adding "trophyCount" to leagues:

1. **docs/DATABASE_SCHEMA.md**:
   ```markdown
   - `trophyCount` (integer, default: 0): Number of trophies won
   ```

2. **scripts/sync-appwrite-complete.js**:
   ```javascript
   leagues: {
     attributes: [
       // ... existing
       { key: 'trophyCount', type: 'integer', required: false, default: 0 }
     ]
   }
   ```

3. **Run sync, then update code**

### 3. Adding New API Routes

#### Checklist:

1. **Document in API_ROUTES.md**:
   ```markdown
   ### POST `/api/leagues/[leagueId]/trophy`
   **Description**: Award trophy to league winner
   **Auth Required**: Yes (commissioner only)
   **Database Operations**:
   - Updates `trophyCount` in `leagues`
   - Creates entry in `activity_log`
   ```

2. **Implement Route**:
   ```typescript
   // app/api/leagues/[leagueId]/trophy/route.ts
   export async function POST(req: Request) {
     // Check auth
     // Verify commissioner
     // Update database
     // Return response
   }
   ```

3. **Add Error Handling**:
   ```typescript
   try {
     // ... route logic
   } catch (error) {
     console.error('Trophy API Error:', {
       route: '/api/leagues/[leagueId]/trophy',
       error: error.message,
       code: error.code
     });
     
     return NextResponse.json(
       { error: error.message },
       { status: error.code || 500 }
     );
   }
   ```

### 4. Testing Changes

#### Local Testing:
```bash
# 1. Start dev server
npm run dev

# 2. Test with real Appwrite (not local)
# Make sure .env.local has production Appwrite credentials

# 3. Test as regular user, not admin
# Create test account, join league, test permissions
```

#### Integration Tests:
```javascript
// tests/api/leagues.test.js
describe('League Trophy API', () => {
  test('commissioner can award trophy', async () => {
    // Test implementation
  });
  
  test('non-commissioner cannot award trophy', async () => {
    // Test 403 response
  });
});
```

### 5. Deployment Process

#### Pre-deployment:
```bash
# 1. Run linter
npm run lint

# 2. Check types
npm run type-check

# 3. Verify schema sync
APPWRITE_API_KEY="your-key" node scripts/check-all-permissions.js
```

#### Deploy:
```bash
# Deploy to production
vercel --prod

# Update alias
vercel alias [deployment-url] cfbfantasy.app
```

#### Post-deployment:
1. Test critical flows:
   - Login/Signup
   - View leagues
   - Access locker room
   - Make draft pick

2. Monitor errors in browser console

3. Check Appwrite dashboard for failed queries

### 6. Troubleshooting Workflow

#### When Something Breaks:

1. **Check Browser Console**:
   - What's the exact error?
   - What API call failed?
   - What was the response code?

2. **Check Appwrite Permissions**:
   ```bash
   APPWRITE_API_KEY="your-key" node scripts/check-all-permissions.js
   ```

3. **Fix Permissions if Needed**:
   ```bash
   APPWRITE_API_KEY="your-key" node scripts/sync-appwrite-complete.js
   ```

4. **Verify Data Exists**:
   - Check Appwrite console
   - Verify documents exist
   - Check relationships are valid

### 7. Git Workflow

#### Feature Branch:
```bash
# 1. Create feature branch
git checkout -b feature/trophy-system

# 2. Make changes following workflow above

# 3. Commit with clear message
git add .
git commit -m "feat: add trophy system for league winners

- Added trophyCount field to leagues collection
- Added POST /api/leagues/[id]/trophy endpoint  
- Updated commissioner panel with trophy UI
- Synced Appwrite schema"

# 4. Push and create PR
git push origin feature/trophy-system
```

#### PR Checklist:
- [ ] Schema documentation updated
- [ ] Sync script updated
- [ ] API routes documented
- [ ] TypeScript types updated
- [ ] Error handling added
- [ ] Permissions verified
- [ ] Tested as regular user

### 8. Emergency Fixes

#### Quick Permission Fix:
```javascript
// scripts/emergency-fix.js
const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Fix specific collection
await databases.updateCollection(
  'college-football-fantasy',
  'rosters',
  'Rosters',
  [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users())
  ]
);
```

#### Reset User Session:
```typescript
// In component or API route
import { account } from '@/lib/appwrite';

// Force fresh login
await account.deleteSession('current');
redirect('/login');
```

## Best Practices

1. **Always Sync Schema First**: Database changes before code changes
2. **Document Everything**: Update docs with every change
3. **Test Permissions**: Always test as regular user, not admin
4. **Handle Errors Gracefully**: Show user-friendly messages
5. **Log for Debugging**: Console.log critical operations
6. **Use TypeScript**: Catch type errors at compile time
7. **Version Control**: Commit schema changes with code changes

## Quick Commands

```bash
# Sync all collections
APPWRITE_API_KEY="..." node scripts/sync-appwrite-complete.js

# Check permissions only
APPWRITE_API_KEY="..." node scripts/check-all-permissions.js

# Fix specific collection
APPWRITE_API_KEY="..." node scripts/fix-rosters-permissions.js

# Deploy to production
vercel --prod

# Update production URL
vercel alias [deployment-url] cfbfantasy.app
```

## Schema Change Template

When adding new feature:

1. **Plan the data model**
2. **Update DATABASE_SCHEMA.md**
3. **Update sync-appwrite-complete.js**  
4. **Run sync script**
5. **Update TypeScript types**
6. **Implement API routes**
7. **Add UI components**
8. **Test thoroughly**
9. **Deploy**
10. **Monitor for errors**
