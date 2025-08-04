import { NextRequest, NextResponse } from 'next/server';
import { WebScraper } from '@/lib/web-scraper';
import { z } from 'zod';

// Request validation schemas
const ScrapeRequestSchema = z.object({
  url: z.string().url(),
  options: z.object({
    waitForSelector: z.string().optional(),
    scrollToBottom: z.boolean().optional(),
    screenshot: z.boolean().optional(),
    extractors: z.record(z.string()).optional(),
  }).optional(),
});

const SearchRequestSchema = z.object({
  query: z.string(),
  engine: z.enum(['google', 'bing', 'duckduckgo']).optional(),
  maxResults: z.number().min(1).max(50).optional(),
  scrapeResults: z.boolean().optional(),
});

const ExtractRequestSchema = z.object({
  url: z.string().url(),
  type: z.enum(['tables', 'links', 'images', 'metadata', 'all']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Initialize scraper
    const scraper = new WebScraper({
      headless: true,
      timeout: 30000,
    });

    try {
      switch (action) {
        case 'scrape': {
          const { url, options } = ScrapeRequestSchema.parse(body);
          const result = await scraper.scrape(url, options || {});
          
          // Remove screenshot from response if too large
          if (result.screenshot && result.screenshot.length > 1000000) {
            result.screenshot = '[Screenshot too large - omitted]';
          }
          
          return NextResponse.json({
            success: true,
            data: result,
          });
        }

        case 'search': {
          const { query, engine, maxResults, scrapeResults } = SearchRequestSchema.parse(body);
          const result = await scraper.searchAndScrape(query, {
            searchEngine: engine,
            maxResults,
            scrapeResults,
          });
          
          return NextResponse.json({
            success: true,
            data: result,
          });
        }

        case 'extract': {
          const { url, type } = ExtractRequestSchema.parse(body);
          
          let data: any = {};
          
          if (type === 'tables' || type === 'all') {
            data.tables = await scraper.extractTables(url);
          }
          
          if (type === 'links' || type === 'images' || type === 'metadata' || type === 'all') {
            const result = await scraper.scrape(url);
            
            if (type === 'links' || type === 'all') {
              data.links = result.links;
            }
            
            if (type === 'images' || type === 'all') {
              data.images = result.images;
            }
            
            if (type === 'metadata' || type === 'all') {
              data.metadata = result.metadata;
            }
          }
          
          return NextResponse.json({
            success: true,
            data,
          });
        }

        case 'college-football': {
          // Special endpoint for college football data
          const { conference, dataType } = body;
          
          let url: string;
          let extractors: Record<string, string> = {};
          
          if (conference === 'SEC') {
            url = 'https://www.espn.com/college-football/conference/_/name/sec';
            extractors = {
              teams: '.Table__TD a.AnchorLink',
              standings: '.Table__TR',
              topPlayers: '.top-players-list',
            };
          } else if (conference === 'Big Ten') {
            url = 'https://www.espn.com/college-football/conference/_/name/b1g';
            extractors = {
              teams: '.Table__TD a.AnchorLink',
              standings: '.Table__TR',
              topPlayers: '.top-players-list',
            };
          } else if (conference === 'Big 12') {
            url = 'https://www.espn.com/college-football/conference/_/name/b12';
            extractors = {
              teams: '.Table__TD a.AnchorLink',
              standings: '.Table__TR',
              topPlayers: '.top-players-list',
            };
          } else if (conference === 'ACC') {
            url = 'https://www.espn.com/college-football/conference/_/name/acc';
            extractors = {
              teams: '.Table__TD a.AnchorLink',
              standings: '.Table__TR',
              topPlayers: '.top-players-list',
            };
          } else {
            throw new Error('Invalid conference');
          }
          
          const result = await scraper.scrape(url, {
            waitForSelector: '.Table',
            scrollToBottom: true,
            extractors,
          });
          
          // Extract tables for better data structure
          const tables = await scraper.extractTables(url);
          
          return NextResponse.json({
            success: true,
            data: {
              conference,
              url,
              title: result.title,
              tables,
              extractedData: result.metadata,
              links: result.links.filter(link => 
                link.includes('/player/') || 
                link.includes('/team/') || 
                link.includes('/game/')
              ),
            },
          });
        }

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          );
      }
    } finally {
      await scraper.close();
    }
  } catch (error) {
    console.error('Scraper API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple URL scraping
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json(
      { success: false, error: 'URL parameter required' },
      { status: 400 }
    );
  }
  
  try {
    const scraper = new WebScraper({ headless: true });
    const result = await scraper.scrape(url);
    await scraper.close();
    
    return NextResponse.json({
      success: true,
      data: {
        title: result.title,
        url: result.url,
        text: result.text.substring(0, 1000),
        links: result.links.length,
        images: result.images.length,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}