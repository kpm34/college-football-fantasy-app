# 🔍 Comprehensive Audit and Cleanup Plan

**Created**: August 14, 2025 2:30 PM  
**Purpose**: Establish a strong foundation by addressing technical debt and architectural issues

## 🚨 Current State Assessment

### Critical Issues Identified

#### 1. **Import/Export Pattern Chaos**
- **Problem**: Inconsistent import patterns between client and server code
- **Examples**: 
  - `createSessionClient` moved multiple times
  - `appwrite-server` vs `appwrite-client` confusion
  - Duplicate code in multiple files
- **Impact**: Build failures, runtime errors, developer confusion

#### 2. **Authentication Flow Fragmentation**
- **Problem**: Auth logic scattered across multiple files and patterns
- **Current Locations**:
  - `/lib/auth.ts`
  - `/lib/auth-utils.ts`
  - `/lib/appwrite-server.ts`
  - Individual API routes
- **Impact**: Security vulnerabilities, inconsistent behavior

#### 3. **Database Operations Inconsistency**
- **Problem**: No standardized approach to database operations
- **Issues**:
  - Direct Appwrite calls from components
  - Mixed client/server database access
  - No proper error handling patterns
  - Permissions not properly enforced

#### 4. **Missing Architectural Boundaries**
- **Problem**: No clear separation of concerns
- **Examples**:
  - Business logic in API routes
  - Database queries in components
  - No service layer
  - No repository pattern

#### 5. **Reactive Development Pattern**
- **Problem**: Fixing symptoms, not root causes
- **Pattern**: Error → Quick fix → New error → Another fix
- **Result**: Growing technical debt

## 📊 Code Quality Metrics

### Current State
- **TypeScript Strictness**: Partially disabled
- **Error Handling**: Inconsistent (mix of try-catch, .catch, unhandled)
- **Code Duplication**: High (same logic in multiple places)
- **Test Coverage**: 0%
- **Documentation**: Scattered and outdated

### Architectural Anti-Patterns Found
1. **God Files**: Some API routes doing too much
2. **Spaghetti Imports**: Circular dependencies potential
3. **Magic Strings**: Collection names, API keys scattered
4. **No Single Source of Truth**: Settings stored in multiple places
5. **Premature Optimization**: Complex caching before establishing basics

## 🏗️ Proposed Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────┐
│          Presentation Layer                  │
│    (React Components, Pages, UI Logic)       │
├─────────────────────────────────────────────┤
│           Application Layer                  │
│    (Use Cases, Business Logic, DTOs)        │
├─────────────────────────────────────────────┤
│            Domain Layer                      │
│    (Entities, Value Objects, Rules)         │
├─────────────────────────────────────────────┤
│         Infrastructure Layer                 │
│    (Database, External APIs, Cache)         │
└─────────────────────────────────────────────┘
```

### Folder Structure Refactoring

```
/app
  /api                    # Thin API routes (controllers)
  /(routes)              # Page components
  
/core                    # Business logic
  /application           # Use cases
    /auth
    /leagues
    /draft
  /domain               # Domain models
    /entities
    /value-objects
    /repositories       # Repository interfaces
  
/infrastructure         # External dependencies
  /appwrite            # Appwrite implementation
    /repositories      # Repository implementations
    /client.ts         # Client setup
  /cache               # Caching layer
  /external-apis       # CFBD, ESPN, etc.
  
/shared                # Shared utilities
  /constants
  /types
  /utils
  /errors             # Custom error classes
```

## 🎯 Cleanup Action Plan

### Phase 1: Stabilize Foundation (Week 1)

#### Day 1-2: Consolidate Authentication
1. **Create Single Auth Service**
   ```typescript
   // /core/application/auth/auth.service.ts
   export class AuthService {
     async login(email: string, password: string): Promise<User>
     async logout(): Promise<void>
     async getCurrentUser(): Promise<User | null>
     async createSession(request: NextRequest): Promise<Session>
   }
   ```

2. **Standardize Auth Middleware**
   ```typescript
   // /infrastructure/middleware/auth.middleware.ts
   export async function withAuth(
     handler: AuthenticatedHandler,
     options?: AuthOptions
   ): Promise<NextResponse>
   ```

3. **Remove Duplicate Auth Code**
   - Consolidate all auth logic
   - Update all imports
   - Test thoroughly

#### Day 3-4: Create Repository Pattern
1. **Define Repository Interfaces**
   ```typescript
   // /core/domain/repositories/league.repository.ts
   export interface LeagueRepository {
     findById(id: string): Promise<League>
     findByUser(userId: string): Promise<League[]>
     create(data: CreateLeagueDto): Promise<League>
     update(id: string, data: UpdateLeagueDto): Promise<League>
   }
   ```

2. **Implement Appwrite Repositories**
   ```typescript
   // /infrastructure/appwrite/repositories/league.repository.ts
   export class AppwriteLeagueRepository implements LeagueRepository {
     constructor(private databases: Databases) {}
     // Implementation
   }
   ```

#### Day 5: Error Handling Framework
1. **Create Custom Error Classes**
   ```typescript
   // /shared/errors/app.errors.ts
   export class AppError extends Error {
     constructor(
       public statusCode: number,
       public message: string,
       public code: string
     ) {}
   }
   
   export class NotFoundError extends AppError {}
   export class UnauthorizedError extends AppError {}
   export class ValidationError extends AppError {}
   ```

2. **Global Error Handler**
   ```typescript
   // /infrastructure/middleware/error.middleware.ts
   export function errorHandler(error: unknown): NextResponse
   ```

### Phase 2: Implement Core Patterns (Week 2)

#### Day 1-2: Service Layer
1. **Create Business Logic Services**
   - LeagueService
   - DraftService
   - RosterService
   - PlayerService

2. **Move Logic from API Routes**
   - API routes become thin controllers
   - Services handle business logic
   - Repositories handle data access

#### Day 3-4: Dependency Injection
1. **Create Service Container**
   ```typescript
   // /infrastructure/container/service.container.ts
   export class ServiceContainer {
     private static instance: ServiceContainer
     
     getAuthService(): AuthService
     getLeagueService(): LeagueService
     // etc.
   }
   ```

2. **Update API Routes**
   ```typescript
   // /app/api/leagues/create/route.ts
   export async function POST(request: NextRequest) {
     const container = ServiceContainer.getInstance()
     const leagueService = container.getLeagueService()
     
     return withAuth(async (user) => {
       const data = await request.json()
       const league = await leagueService.create(user.id, data)
       return NextResponse.json(league)
     })
   }
   ```

#### Day 5: Testing Infrastructure
1. **Setup Testing Framework**
   - Jest configuration
   - Testing utilities
   - Mock factories

2. **Write Core Tests**
   - Auth service tests
   - Repository tests
   - API route tests

### Phase 3: Advanced Patterns (Week 3)

#### Day 1-2: Caching Strategy
1. **Implement Cache Service**
   ```typescript
   // /infrastructure/cache/cache.service.ts
   export interface CacheService {
     get<T>(key: string): Promise<T | null>
     set<T>(key: string, value: T, ttl?: number): Promise<void>
     invalidate(pattern: string): Promise<void>
   }
   ```

2. **Add Caching Decorators**
   ```typescript
   @Cacheable({ ttl: 3600 })
   async getPlayers(conference: string): Promise<Player[]>
   ```

#### Day 3-4: Event System
1. **Create Event Bus**
   ```typescript
   // /core/application/events/event-bus.ts
   export class EventBus {
     emit(event: DomainEvent): void
     subscribe(eventType: string, handler: EventHandler): void
   }
   ```

2. **Implement Domain Events**
   - DraftPickMadeEvent
   - LeagueCreatedEvent
   - RosterUpdatedEvent

#### Day 5: Monitoring & Observability
1. **Add Structured Logging**
2. **Implement Metrics Collection**
3. **Setup Performance Monitoring**

## 📋 Migration Checklist

### Immediate Actions (Do Today)
- [ ] Create `/core` directory structure
- [ ] Move auth logic to AuthService
- [ ] Create error handling framework
- [ ] Update imports in 5 most critical files

### Short Term (This Week)
- [ ] Implement repository pattern for Leagues
- [ ] Create service layer for core features
- [ ] Add proper TypeScript types everywhere
- [ ] Setup basic integration tests

### Medium Term (Next 2 Weeks)
- [ ] Complete migration to clean architecture
- [ ] Add comprehensive error handling
- [ ] Implement caching strategy
- [ ] Add monitoring and logging

## 🚀 Success Metrics

### Technical Metrics
- Build time: < 60 seconds
- TypeScript errors: 0
- Test coverage: > 80%
- Code duplication: < 5%

### Quality Metrics
- No more "fix creating new problems"
- Clear separation of concerns
- Easy to add new features
- New developers can understand quickly

## 🎯 End Goal

A clean, maintainable codebase where:
1. **Adding features is straightforward**
2. **Bugs are easy to trace and fix**
3. **Code is self-documenting**
4. **Performance is predictable**
5. **Scaling is simple**

## 📝 Next Steps

1. **Get buy-in on architecture**
2. **Start with auth consolidation**
3. **Create first repository**
4. **Migrate one feature completely**
5. **Document patterns for team**

---

*This plan prioritizes stability over features. We must stop the cycle of reactive fixes and build a proper foundation.*
