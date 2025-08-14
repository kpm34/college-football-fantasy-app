# 🚨 Immediate Action Plan - Stop the Bleeding

**Created**: August 14, 2025 3:00 PM  
**Goal**: Fix critical issues TODAY to establish stable foundation

## 🎯 Today's Mission

### STOP doing these immediately:
1. ❌ Adding new features
2. ❌ Quick fixes without understanding
3. ❌ Copy-pasting code
4. ❌ Ignoring TypeScript errors
5. ❌ Making changes without testing impact

### START doing these now:
1. ✅ Consolidate authentication
2. ✅ Fix import patterns
3. ✅ Establish error handling
4. ✅ Document as we go
5. ✅ Test every change

## 📋 4-Hour Action Plan

### Hour 1: Authentication Consolidation (3:00-4:00 PM)

#### Step 1: Create Core Auth Service
```bash
# Create new structure
mkdir -p core/services
touch core/services/auth.service.ts
```

```typescript
// core/services/auth.service.ts
import { Client, Account, Databases, ID } from 'appwrite';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export class AuthService {
  private client: Client;
  private account: Account;
  
  constructor(request?: NextRequest) {
    this.client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    
    // If request provided, get session from cookie
    if (request) {
      const session = request.cookies.get('session')?.value || '';
      if (session) {
        this.client.setSession(session);
      }
    }
    
    this.account = new Account(this.client);
  }
  
  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch {
      return null;
    }
  }
  
  async requireAuth() {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    return user;
  }
  
  async login(email: string, password: string) {
    const session = await this.account.createEmailPasswordSession(email, password);
    cookies().set('session', session.secret, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    return session;
  }
  
  async logout() {
    await this.account.deleteSession('current');
    cookies().delete('session');
  }
}

// Single instance for server-side auth
export const authService = new AuthService();
```

#### Step 2: Update All Auth Imports
```bash
# Find all files using auth
grep -r "createSessionClient\|getCurrentUser\|account.get" app/ lib/ --include="*.ts" --include="*.tsx"

# Update each file to use new service
```

### Hour 2: Database Access Pattern (4:00-5:00 PM)

#### Step 1: Create Database Service
```typescript
// core/services/database.service.ts
import { Client, Databases, ID, Query } from 'appwrite';
import { cache } from 'react';

export class DatabaseService {
  private databases: Databases;
  
  constructor(client: Client) {
    this.databases = new Databases(client);
  }
  
  // Cached read operations
  getLeague = cache(async (leagueId: string) => {
    return await this.databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES!,
      leagueId
    );
  });
  
  async createLeague(data: any, userId: string) {
    return await this.databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES!,
      ID.unique(),
      {
        ...data,
        commissionerId: userId,
        createdAt: new Date().toISOString()
      }
    );
  }
  
  // Add more methods as needed
}

// Server-side instance with API key
const serverClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

export const serverDatabase = new DatabaseService(serverClient);
```

#### Step 2: Create Repository Pattern
```typescript
// core/repositories/league.repository.ts
import { DatabaseService } from '../services/database.service';

export class LeagueRepository {
  constructor(private db: DatabaseService) {}
  
  async findById(id: string) {
    return await this.db.getLeague(id);
  }
  
  async findByUser(userId: string) {
    const response = await this.db.databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS!,
      [Query.equal('userId', userId)]
    );
    return response.documents;
  }
  
  async create(data: CreateLeagueDto, userId: string) {
    return await this.db.createLeague(data, userId);
  }
}
```

### Hour 3: Error Handling Framework (5:00-6:00 PM)

#### Step 1: Create Error Classes
```typescript
// core/errors/app-error.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: any) {
    super(400, 'VALIDATION_ERROR', message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}
```

#### Step 2: Create Global Error Handler
```typescript
// core/utils/error-handler.ts
import { NextResponse } from 'next/server';
import { AppError } from '../errors/app-error';
import * as Sentry from '@sentry/nextjs';

export function handleError(error: unknown): NextResponse {
  // Log to Sentry
  Sentry.captureException(error);
  
  // Handle known errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error instanceof ValidationError && { errors: error.errors })
        }
      },
      { status: error.statusCode }
    );
  }
  
  // Handle Appwrite errors
  if (error && typeof error === 'object' && 'code' in error) {
    const appwriteError = error as any;
    return NextResponse.json(
      {
        error: {
          code: 'APPWRITE_ERROR',
          message: appwriteError.message || 'Database operation failed'
        }
      },
      { status: appwriteError.code || 500 }
    );
  }
  
  // Unknown errors
  console.error('Unhandled error:', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    },
    { status: 500 }
  );
}

// Wrapper for API routes
export function withErrorHandler(
  handler: (req: Request, context: any) => Promise<NextResponse>
) {
  return async (req: Request, context: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleError(error);
    }
  };
}
```

### Hour 4: Update Critical Routes (6:00-7:00 PM)

#### Step 1: Update League Creation Route
```typescript
// app/api/leagues/create/route.ts
import { NextRequest } from 'next/server';
import { AuthService } from '@/core/services/auth.service';
import { LeagueRepository } from '@/core/repositories/league.repository';
import { serverDatabase } from '@/core/services/database.service';
import { withErrorHandler } from '@/core/utils/error-handler';
import { ValidationError } from '@/core/errors/app-error';

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Auth check
  const authService = new AuthService(request);
  const user = await authService.requireAuth();
  
  // Parse and validate input
  const data = await request.json();
  if (!data.name || !data.maxTeams) {
    throw new ValidationError('Missing required fields', {
      name: !data.name ? 'Name is required' : undefined,
      maxTeams: !data.maxTeams ? 'Max teams is required' : undefined
    });
  }
  
  // Business logic in repository
  const leagueRepo = new LeagueRepository(serverDatabase);
  const league = await leagueRepo.create(data, user.$id);
  
  return NextResponse.json({ 
    success: true, 
    data: league 
  });
});
```

#### Step 2: Update Locker Room Route
```typescript
// app/api/leagues/[leagueId]/locker-room/route.ts
import { NextRequest } from 'next/server';
import { AuthService } from '@/core/services/auth.service';
import { LeagueRepository } from '@/core/repositories/league.repository';
import { RosterRepository } from '@/core/repositories/roster.repository';
import { serverDatabase } from '@/core/services/database.service';
import { withErrorHandler } from '@/core/utils/error-handler';
import { NotFoundError } from '@/core/errors/app-error';

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) => {
  const authService = new AuthService(request);
  const user = await authService.requireAuth();
  
  const leagueRepo = new LeagueRepository(serverDatabase);
  const rosterRepo = new RosterRepository(serverDatabase);
  
  // Parallel data fetching
  const [league, userRoster, allRosters] = await Promise.all([
    leagueRepo.findById(params.leagueId),
    rosterRepo.findByUserAndLeague(user.$id, params.leagueId),
    rosterRepo.findByLeague(params.leagueId)
  ]);
  
  if (!league) {
    throw new NotFoundError('League');
  }
  
  return NextResponse.json({
    success: true,
    data: {
      user,
      league,
      team: userRoster,
      allRosters,
      isCommissioner: league.commissionerId === user.$id
    }
  });
});
```

## 📝 Testing Checklist

After each change:
- [ ] Run `npm run build` - Must pass
- [ ] Run `npm run typecheck` - Must pass  
- [ ] Test in browser - Must work
- [ ] Check error handling - Must show proper errors
- [ ] Check logs - No unhandled errors

## 🎯 Success Criteria

By end of today:
1. ✅ All auth goes through AuthService
2. ✅ All database calls go through repositories
3. ✅ All errors handled consistently
4. ✅ No more import confusion
5. ✅ Foundation for clean architecture

## 🚫 What NOT to Do Today

1. Don't refactor everything at once
2. Don't add new features
3. Don't skip testing
4. Don't ignore TypeScript errors
5. Don't work on UI/UX improvements

## 📊 Progress Tracking

- [ ] Hour 1: Auth Service created and tested
- [ ] Hour 2: Database Service and first repository
- [ ] Hour 3: Error handling framework
- [ ] Hour 4: Update 2 critical routes

## 🔄 Next Steps (Tomorrow)

Once foundation is stable:
1. Migrate remaining routes
2. Add integration tests
3. Setup CI/CD checks
4. Document patterns
5. Train team on new architecture

---

*Focus on these 4 hours. No distractions. No feature requests. Just fix the foundation.*
