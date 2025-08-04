# Advanced Web Scraper with Chromium Capabilities

A powerful, dynamic web scraping tool with full Chromium browser capabilities, similar to ChatGPT's browsing feature.

## 🚀 Features

- **Full JavaScript Rendering**: Scrapes dynamic content rendered by JavaScript
- **Smart Waiting**: Wait for specific elements before scraping
- **Lazy Loading Support**: Scrolls to load lazy content
- **Search Integration**: Search Google, Bing, or DuckDuckGo and scrape results
- **Table Extraction**: Automatically extracts and structures tables
- **Metadata Extraction**: Gets Open Graph, Twitter Cards, and structured data
- **Screenshots**: Capture full-page screenshots
- **Monitoring**: Watch pages for changes
- **Batch Processing**: Scrape multiple URLs concurrently
- **Form Interaction**: Fill forms and click elements
- **Proxy Support**: Use proxies for scraping

## 📦 Installation

Dependencies are already installed. If needed:

```bash
npm install playwright cheerio commander chalk ora
```

## 🎯 Quick Start

### 1. Command Line Usage

```bash
# Basic scraping
node lib/scraper-cli.ts scrape https://example.com

# Wait for specific element
node lib/scraper-cli.ts scrape https://example.com --wait ".content"

# Take screenshot
node lib/scraper-cli.ts scrape https://example.com --screenshot

# Search and scrape
node lib/scraper-cli.ts search "college football rankings" --scrape

# Extract tables
node lib/scraper-cli.ts extract https://espn.com --tables

# Monitor for changes
node lib/scraper-cli.ts monitor https://example.com --interval 60000

# Batch scraping
echo -e "https://url1.com\nhttps://url2.com" > urls.txt
node lib/scraper-cli.ts batch urls.txt --output results/
```

### 2. React Component Usage

```tsx
import { useScraper } from '@/hooks/useScraper';

function MyComponent() {
  const { scrape, search, extract, loading, error, data } = useScraper();

  const handleScrape = async () => {
    try {
      const result = await scrape('https://example.com', {
        waitForSelector: '.main-content',
        scrollToBottom: true,
        screenshot: false
      });
      console.log('Scraped:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSearch = async () => {
    const results = await search('college football', {
      engine: 'google',
      maxResults: 10,
      scrapeResults: true
    });
    console.log('Search results:', results);
  };

  const handleExtractTables = async () => {
    const tables = await extract('https://espn.com', 'tables');
    console.log('Tables:', tables);
  };

  return (
    <div>
      <button onClick={handleScrape} disabled={loading}>
        {loading ? 'Scraping...' : 'Scrape Page'}
      </button>
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### 3. API Endpoint Usage

```javascript
// POST /api/scraper

// Scrape a page
const response = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'scrape',
    url: 'https://example.com',
    options: {
      waitForSelector: '.content',
      scrollToBottom: true,
      screenshot: false,
      extractors: {
        title: 'h1',
        price: '.price',
        description: '.description'
      }
    }
  })
});

// Search
const searchResponse = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'search',
    query: 'college football rankings',
    engine: 'google',
    maxResults: 10,
    scrapeResults: true
  })
});

// Extract data
const extractResponse = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'extract',
    url: 'https://espn.com',
    type: 'tables' // or 'links', 'images', 'metadata', 'all'
  })
});

// College Football specific
const cfbResponse = await fetch('/api/scraper', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'college-football',
    conference: 'SEC', // or 'Big Ten', 'Big 12', 'ACC'
    dataType: 'standings'
  })
});
```

### 4. Direct TypeScript Usage

```typescript
import { WebScraper } from '@/lib/web-scraper';

async function example() {
  const scraper = new WebScraper({
    headless: true,
    timeout: 30000,
    viewport: { width: 1920, height: 1080 }
  });

  try {
    // Basic scraping
    const result = await scraper.scrape('https://example.com');
    console.log('Title:', result.title);
    console.log('Links:', result.links.length);
    
    // Wait for element and scroll
    const dynamicResult = await scraper.scrape('https://example.com', {
      waitForSelector: '.lazy-content',
      scrollToBottom: true,
      screenshot: true
    });
    
    // Search and scrape
    const searchResults = await scraper.searchAndScrape('college football', {
      searchEngine: 'google',
      maxResults: 10,
      scrapeResults: true
    });
    
    // Extract structured data
    const data = await scraper.extractStructuredData('https://example.com', {
      title: { selector: 'h1' },
      price: { selector: '.price', transform: (v) => parseFloat(v) },
      features: { selector: '.feature', multiple: true },
      image: { selector: 'img', attribute: 'src' }
    });
    
    // Extract tables
    const tables = await scraper.extractTables('https://espn.com');
    
    // Monitor for changes
    await scraper.monitor('https://example.com', {
      interval: 60000,
      selector: '.score',
      onChange: (old, new) => {
        console.log('Content changed!');
      }
    });
    
  } finally {
    await scraper.close();
  }
}
```

## 🏈 College Football Specific Examples

### Scrape SEC Standings

```typescript
const { scrapeCollegeFootball } = useScraper();

const secData = await scrapeCollegeFootball('SEC', 'standings');
console.log('SEC Tables:', secData.tables);
console.log('Team Links:', secData.links);
```

### Get Player Stats

```typescript
const scraper = new WebScraper();
const playerPage = await scraper.scrape('https://espn.com/player/123456', {
  waitForSelector: '.player-stats',
  extractors: {
    name: '.player-name',
    position: '.player-position',
    stats: '.season-stats'
  }
});
```

### Monitor Game Scores

```typescript
const scraper = new WebScraper();
await scraper.monitor('https://espn.com/game/123456', {
  interval: 30000,
  selector: '.game-score',
  onChange: (oldScore, newScore) => {
    console.log('Score updated!');
    // Send notification or update database
  }
});
```

## 🛠️ Advanced Configuration

### With Proxy

```typescript
const scraper = new WebScraper({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  }
});
```

### Custom Headers & Cookies

```typescript
const scraper = new WebScraper({
  headers: {
    'Accept-Language': 'en-US',
    'Custom-Header': 'value'
  },
  cookies: [{
    name: 'session',
    value: 'abc123',
    domain: '.example.com',
    path: '/'
  }]
});
```

### Form Interaction

```typescript
const result = await scraper.scrape('https://example.com/form', {
  fillForms: [
    { selector: '#username', value: 'user@example.com' },
    { selector: '#password', value: 'password' }
  ],
  clickElements: ['#submit-button'],
  waitForSelector: '.dashboard'
});
```

## 📊 Data Processing

### Extract and Process Tables

```typescript
const tables = await scraper.extractTables('https://espn.com/standings');

// Process first table
const standings = tables[0];
const teams = standings.rows.map((row, index) => ({
  rank: index + 1,
  team: row[0],
  wins: parseInt(row[1]),
  losses: parseInt(row[2]),
  winPercentage: parseFloat(row[3])
}));
```

### Search and Analyze

```typescript
const results = await scraper.searchAndScrape('SEC football news', {
  searchEngine: 'google',
  maxResults: 20,
  scrapeResults: true
});

// Analyze sentiment, extract dates, etc.
const articles = results.scrapedContent?.map(content => ({
  title: content.title,
  date: extractDate(content.text),
  sentiment: analyzeSentiment(content.text),
  mentions: extractPlayerMentions(content.text)
}));
```

## 🔧 Troubleshooting

### Common Issues

1. **Timeout errors**: Increase timeout in config
2. **Element not found**: Use different selector or add wait
3. **JavaScript not loading**: Ensure `javascript: true` in config
4. **Rate limiting**: Add delays between requests
5. **Captcha**: Use proxy rotation or manual solving

### Performance Tips

1. **Reuse browser instance**: Don't create new browser for each scrape
2. **Use headless mode**: Faster than headed mode
3. **Limit concurrency**: Don't overload the target server
4. **Cache results**: Store scraped data to avoid re-scraping
5. **Use specific selectors**: More efficient than broad selectors

## 📝 API Reference

### WebScraper Class

```typescript
class WebScraper {
  constructor(config?: ScraperConfig)
  
  // Main methods
  scrape(url: string, options?: ScrapeOptions): Promise<ScrapeResult>
  scrapeMultiple(urls: string[], options?, concurrency?): Promise<ScrapeResult[]>
  searchAndScrape(query: string, options?): Promise<SearchResult>
  extractStructuredData(url: string, schema): Promise<any>
  extractTables(url: string): Promise<Table[]>
  monitor(url: string, options): Promise<void>
  close(): Promise<void>
}
```

### Configuration Options

```typescript
interface ScraperConfig {
  headless?: boolean          // Run browser in headless mode
  timeout?: number           // Timeout in milliseconds
  waitForSelector?: string   // Default selector to wait for
  userAgent?: string         // Custom user agent
  viewport?: { width, height } // Browser viewport size
  cookies?: Cookie[]         // Cookies to set
  headers?: Record<string, string> // HTTP headers
  javascript?: boolean       // Enable JavaScript
  screenshots?: boolean      // Take screenshots
  proxy?: ProxyConfig       // Proxy configuration
}
```

## 🎉 Integration with Cursor AI

This scraper is optimized for use with Cursor AI:

1. **Structured Output**: Returns well-formatted JSON data
2. **Error Handling**: Clear error messages for debugging
3. **Type Safety**: Full TypeScript support
4. **React Hooks**: Easy integration with React components
5. **API Endpoints**: RESTful API for external access
6. **CLI Tools**: Command-line interface for quick tasks

Use this scraper to:
- Gather real-time sports data
- Monitor game scores and standings
- Extract player statistics
- Track news and updates
- Build comprehensive databases
- Automate data collection

The scraper handles dynamic content, lazy loading, and JavaScript-rendered pages just like ChatGPT's browsing feature!