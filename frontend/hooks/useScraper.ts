import { useState, useCallback } from 'react';

interface ScrapeOptions {
  waitForSelector?: string;
  scrollToBottom?: boolean;
  screenshot?: boolean;
  extractors?: Record<string, string>;
}

interface ScrapeResult {
  url: string;
  title: string;
  content: string;
  html: string;
  text: string;
  links: string[];
  images: string[];
  metadata: Record<string, any>;
  screenshot?: string;
  error?: string;
  timestamp: string;
}

interface SearchResult {
  query: string;
  searchResults: Array<{ title: string; url: string; snippet: string }>;
  scrapedContent?: ScrapeResult[];
}

export function useScraper() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const scrape = useCallback(async (url: string, options?: ScrapeOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrape',
          url,
          options,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scraping failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (
    query: string,
    options?: {
      engine?: 'google' | 'bing' | 'duckduckgo';
      maxResults?: number;
      scrapeResults?: boolean;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          query,
          ...options,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const extract = useCallback(async (
    url: string,
    type: 'tables' | 'links' | 'images' | 'metadata' | 'all' = 'all'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extract',
          url,
          type,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Extraction failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const scrapeCollegeFootball = useCallback(async (
    conference: 'SEC' | 'Big Ten' | 'Big 12' | 'ACC',
    dataType?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'college-football',
          conference,
          dataType,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'College football scraping failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    scrape,
    search,
    extract,
    scrapeCollegeFootball,
    loading,
    error,
    data,
    reset,
  };
}

// Hook for monitoring changes
export function useScraperMonitor(
  url: string,
  options: {
    interval?: number;
    selector?: string;
    enabled?: boolean;
  } = {}
) {
  const [changes, setChanges] = useState<Array<{ timestamp: Date; content: string }>>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const startMonitoring = useCallback(() => {
    if (!options.enabled || isMonitoring) return;
    
    setIsMonitoring(true);
    let previousContent: string | null = null;
    
    const check = async () => {
      try {
        const response = await fetch('/api/scraper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'scrape',
            url,
            options: {
              waitForSelector: options.selector,
            },
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          const currentContent = options.selector 
            ? result.data.metadata[options.selector] 
            : result.data.html;
          
          if (previousContent && previousContent !== currentContent) {
            setChanges(prev => [...prev, {
              timestamp: new Date(),
              content: currentContent,
            }]);
          }
          
          previousContent = currentContent;
        }
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    };
    
    const intervalId = setInterval(check, options.interval || 60000);
    check(); // Initial check
    
    return () => {
      clearInterval(intervalId);
      setIsMonitoring(false);
    };
  }, [url, options]);
  
  return {
    changes,
    isMonitoring,
    startMonitoring,
  };
}