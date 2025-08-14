# Rotowire Integration Plan

## Overview
Integrate Rotowire's college football content using authenticated web scraping since they don't provide a public API.

## What Rotowire Provides for College Football

### 1. Player News & Updates
- Injury reports
- Depth chart changes
- Transfer portal news
- Suspensions/eligibility updates

### 2. Game Previews
- Matchup analysis
- Weather reports
- Betting lines
- Key player updates

### 3. Player Projections
- Weekly statistical projections
- Season-long projections
- DFS pricing and values

### 4. Expert Analysis
- Start/sit recommendations
- Waiver wire pickups
- Dynasty rankings

## Implementation Strategy

### Phase 1: Authentication & Basic Scraping (2-3 hours)

#### 1.1 Secure Credential Storage
```typescript
// Environment variables
ROTOWIRE_USERNAME=your_email
ROTOWIRE_PASSWORD=encrypted_password
ROTOWIRE_ENCRYPTION_KEY=random_32_char_key
```

#### 1.2 Authentication Service
```typescript
// lib/rotowire/auth.ts
import * as crypto from 'crypto';

export class RotowireAuth {
  private static algorithm = 'aes-256-gcm';
  
  static encryptPassword(password: string): string {
    const key = Buffer.from(process.env.ROTOWIRE_ENCRYPTION_KEY!, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }
  
  static decryptPassword(encryptedPassword: string): string {
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const key = Buffer.from(process.env.ROTOWIRE_ENCRYPTION_KEY!, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Phase 2: Playwright Integration (3-4 hours)

#### 2.1 Scraper Setup
```typescript
// lib/rotowire/scraper.ts
import { chromium, Browser, Page } from 'playwright';

export class RotowireScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  
  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    this.page = await context.newPage();
  }
  
  async login() {
    if (!this.page) throw new Error('Browser not initialized');
    
    await this.page.goto('https://www.rotowire.com/users/login.php');
    await this.page.fill('input[name="email"]', process.env.ROTOWIRE_USERNAME!);
    await this.page.fill('input[name="password"]', RotowireAuth.decryptPassword(process.env.ROTOWIRE_PASSWORD!));
    await this.page.click('button[type="submit"]');
    
    // Wait for login to complete
    await this.page.waitForNavigation();
  }
  
  async getCollegeFootballNews() {
    if (!this.page) throw new Error('Not logged in');
    
    await this.page.goto('https://www.rotowire.com/football/college-football-news.php');
    
    const news = await this.page.evaluate(() => {
      const articles = [];
      const newsItems = document.querySelectorAll('.news-item');
      
      newsItems.forEach(item => {
        const title = item.querySelector('.news-title')?.textContent?.trim();
        const content = item.querySelector('.news-content')?.textContent?.trim();
        const date = item.querySelector('.news-date')?.textContent?.trim();
        const player = item.querySelector('.player-name')?.textContent?.trim();
        
        if (title && content) {
          articles.push({ title, content, date, player });
        }
      });
      
      return articles;
    });
    
    return news;
  }
}
```

### Phase 3: Caching Layer (2-3 hours)

#### 3.1 Redis Cache with Vercel KV
```typescript
// lib/rotowire/cache.ts
import { kv } from '@vercel/kv';

export class RotowireCache {
  static async get(key: string) {
    return await kv.get(key);
  }
  
  static async set(key: string, value: any, ttl: number = 3600) {
    return await kv.setex(key, ttl, JSON.stringify(value));
  }
  
  static async invalidate(pattern: string) {
    const keys = await kv.keys(pattern);
    if (keys.length > 0) {
      await kv.del(...keys);
    }
  }
}
```

#### 3.2 Cache Keys
- `rotowire:news:college` - Latest CFB news (1 hour TTL)
- `rotowire:injuries:{week}` - Injury reports (30 min TTL)
- `rotowire:projections:{week}` - Player projections (6 hour TTL)
- `rotowire:analysis:{date}` - Expert analysis (24 hour TTL)

### Phase 4: API Endpoints (2-3 hours)

#### 4.1 News Endpoint
```typescript
// app/api/rotowire/news/route.ts
export async function GET(request: NextRequest) {
  // Check cache first
  const cached = await RotowireCache.get('rotowire:news:college');
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }
  
  // Scrape fresh data
  const scraper = new RotowireScraper();
  await scraper.initialize();
  await scraper.login();
  const news = await scraper.getCollegeFootballNews();
  await scraper.close();
  
  // Cache results
  await RotowireCache.set('rotowire:news:college', news, 3600);
  
  return NextResponse.json(news);
}
```

#### 4.2 Scheduled Updates
```typescript
// app/api/cron/rotowire-sync/route.ts
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Update all Rotowire data
  await updateNews();
  await updateInjuries();
  await updateProjections();
  
  return NextResponse.json({ success: true });
}
```

### Phase 5: UI Integration (2-3 hours)

#### 5.1 News Component
```typescript
// components/RotowireNews.tsx
export function RotowireNews({ playerId }: { playerId?: string }) {
  const { data: news, loading } = useRotowireNews(playerId);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="rotowire-news">
      <h3>Latest News from Rotowire</h3>
      {news.map(article => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

#### 5.2 Integration Points
1. **Player Profile Pages** - Show relevant news
2. **Draft Room** - Display latest updates
3. **Roster Management** - Injury status badges
4. **Dashboard** - News feed widget

## Security Considerations

### 1. Credential Protection
- Never commit credentials
- Use environment variables
- Encrypt passwords at rest
- Rotate credentials regularly

### 2. Rate Limiting
- Max 1 request per minute per endpoint
- Implement exponential backoff
- Use caching extensively
- Queue requests if needed

### 3. Legal Compliance
- Respect robots.txt
- Don't overload servers
- Cache data appropriately
- Display attribution

## Monitoring & Error Handling

### 1. Health Checks
```typescript
// Monitor login status
// Track scraping success rate
// Alert on failures
```

### 2. Fallback Strategy
- Return cached data on failure
- Graceful degradation
- User-friendly error messages

## Testing Checklist

- [ ] Authentication works
- [ ] News scraping returns data
- [ ] Cache hit/miss working
- [ ] Rate limiting enforced
- [ ] Error handling graceful
- [ ] UI displays correctly
- [ ] Mobile responsive

## Future Enhancements

1. **WebSocket Updates** - Real-time news push
2. **Machine Learning** - Relevance scoring
3. **Custom Alerts** - Player-specific notifications
4. **Historical Data** - Trend analysis

## Implementation Order

1. Set up environment variables
2. Create authentication service
3. Implement basic news scraper
4. Add caching layer
5. Create API endpoints
6. Build UI components
7. Add error handling
8. Deploy and test
