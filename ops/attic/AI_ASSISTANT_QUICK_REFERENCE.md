# AI Assistant Quick Reference

## 🚀 Start Here
1. Read `.cursorrules` for project context
2. Check `CLAUDE.md` for detailed architecture
3. Review this guide for quick commands

## 📍 Key Locations
- **Schema**: `/schema/zod-schema.ts` (Single Source of Truth)
- **API Routes**: `/app/api/` (organized by feature)
- **Components**: `/components/` (ui, features, layout)
- **Docs**: `/docs/` (API tests, guides, diagrams)
- **Scripts**: `/ops/` (operational tools)

## 🔧 Essential Commands
```bash
# Development
npm run dev              # Start server (port 3001)
npm run build            # Build for production
npm run lint             # Check code quality
npm run typecheck        # Check TypeScript

# Database
npm run generate:all     # Generate types from schema
npx tsx scripts/sync-appwrite-simple.ts  # Sync to Appwrite

# Testing
npm test                 # Run all tests
npm run test:e2e         # E2E tests

# Deployment
vercel                   # Deploy preview
vercel --prod           # Deploy production
vercel logs             # View logs
```

## 🐛 Quick Fixes

### OAuth Issues
```typescript
// Use direct Appwrite URL for OAuth
const oauthUrl = `${APPWRITE_ENDPOINT}/account/sessions/oauth2/google?project=${PROJECT_ID}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
```

### Collection Names
- ✅ Use: `college_players`
- ❌ Not: `players`
- ✅ Use: `user_teams`
- ❌ Not: `rosters`

### TypeScript Errors
```bash
# Skip validation if needed
SKIP_ENV_VALIDATION=true npm run build
```

### Port Conflicts
```bash
lsof -i :3001 && kill -9 [PID]
```

## 📝 Code Patterns

### API Route
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  // Define input schema
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    // Implementation
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Component
```tsx
'use client'; // Only if needed

import { type FC } from 'react';

interface Props {
  // TypeScript interface
}

export const Component: FC<Props> = (props) => {
  return <div className="tailwind-classes" />;
};
```

### Database Query
```typescript
import { Query } from 'appwrite';
import { databases } from '@/lib/appwrite';

const response = await databases.listDocuments(
  DATABASE_ID,
  COLLECTION_ID,
  [
    Query.equal('field', 'value'),
    Query.limit(100),
    Query.orderDesc('$createdAt')
  ]
);
```

## 🔍 Debugging Tools

### VS Code Extensions
- **Error Lens**: See errors inline
- **TODO Tree**: Find all TODOs
- **REST Client**: Test APIs in `.http` files
- **GitLens**: See code history

### Browser Extensions
- React Developer Tools
- Redux DevTools (if using)
- Lighthouse (built-in)

### Commands
```bash
# Check logs
vercel logs --follow

# Test API
curl http://localhost:3001/api/health

# Check Appwrite
curl https://nyc.cloud.appwrite.io/v1/health
```

## 📊 Database Collections
| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `leagues` | Fantasy leagues | name, maxTeams, commissioner |
| `college_players` | Player data | name, team, position, conference |
| `user_teams` | Drafted teams | userId, leagueId, players |
| `drafts` | Draft state | leagueId, currentPick, timer |
| `games` | Game schedule | homeTeam, awayTeam, week |
| `rankings` | AP Top 25 | team, rank, week |

## 🎯 Business Rules
1. Players score only vs AP Top-25 or conference games
2. 12-week regular season (no playoffs)
3. Power 4 conferences only (SEC, ACC, Big 12, Big Ten)
4. Snake draft with 90-second timer
5. Auction draft with $200 budget

## ⚡ Performance Tips
- Use React Server Components by default
- Lazy load heavy components
- Optimize images with next/image
- Cache API responses
- Use virtual scrolling for long lists

## 🚫 Common Mistakes
- ❌ Exposing API keys in client code
- ❌ Using `any` type
- ❌ Ignoring TypeScript errors
- ❌ Synchronous operations in API routes
- ❌ Direct DOM manipulation

## ✅ Best Practices
- ✅ Validate with Zod
- ✅ Handle loading/error states
- ✅ Use semantic HTML
- ✅ Test on mobile
- ✅ Follow existing patterns

## 🔗 Quick Links
- [Vercel Dashboard](https://vercel.com/kpm34s-projects)
- [Appwrite Console](https://nyc.cloud.appwrite.io)
- [GitHub Repo](https://github.com/kpm34/college-football-fantasy-app)
- [Production Site](https://cfbfantasy.app)

## 💡 AI Tips
1. Use multiple tools in parallel for faster results
2. Check `/docs/api/*.http` files for API examples
3. Run `npm run typecheck` before committing
4. Test changes locally before deploying
5. Update docs when adding features

---
**Remember**: You have full autonomy. Be confident and thorough!