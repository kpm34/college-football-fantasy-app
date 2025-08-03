// Free API Alternatives for College Football Fantasy App
// These don't require paid subscriptions

export const FREE_API_ALTERNATIVES = {
  // 1. Web Scraping Approach (Free)
  WEB_SCRAPING: {
    name: 'Web Scraping',
    description: 'Scrape odds from public websites',
    cost: 'Free',
    implementation: 'Python/Node.js scraper',
    sources: [
      'ESPN.com odds pages',
      'Sportsbook websites',
      'Public betting sites'
    ]
  },

  // 2. ESPN API (Free with proper headers)
  ESPN_API: {
    name: 'ESPN API',
    description: 'Free sports data from ESPN',
    cost: 'Free',
    baseUrl: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football',
    endpoints: [
      '/scoreboard',
      '/teams',
      '/players',
      '/standings'
    ],
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },

  // 3. CFBD API (Already working)
  CFBD_API: {
    name: 'College Football Data API',
    description: 'Comprehensive college football data',
    cost: 'Free tier available',
    status: '✅ Working with your key',
    key: 'YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz'
  },

  // 4. Public Data Sources
  PUBLIC_DATA: {
    name: 'Public Data Sources',
    description: 'Open data and public APIs',
    cost: 'Free',
    sources: [
      'NCAA official statistics',
      'University athletic departments',
      'Public betting odds aggregators',
      'Sports news websites'
    ]
  },

  // 5. Community APIs
  COMMUNITY_APIS: {
    name: 'Community APIs',
    description: 'Open source and community APIs',
    cost: 'Free',
    sources: [
      'GitHub community projects',
      'Open source sports APIs',
      'Reddit API for sports discussions',
      'Twitter API for sports news'
    ]
  }
};

// Implementation Strategy
export const IMPLEMENTATION_STRATEGY = {
  phase1: [
    'Use CFBD API for core data (✅ Working)',
    'Implement ESPN API with proper headers',
    'Create web scraper for odds data'
  ],
  phase2: [
    'Add public data sources',
    'Integrate community APIs',
    'Build fallback data sources'
  ],
  phase3: [
    'Consider paid APIs for premium features',
    'Scale with multiple data sources'
  ]
};

// Web Scraping Targets
export const SCRAPING_TARGETS = {
  odds: [
    'https://www.espn.com/chalk/odds',
    'https://www.cbssports.com/college-football/odds',
    'https://www.actionnetwork.com/ncaaf/odds'
  ],
  news: [
    'https://www.rotowire.com/college-football',
    'https://www.cbssports.com/college-football/news',
    'https://www.espn.com/college-football/news'
  ],
  stats: [
    'https://www.ncaa.com/stats/football/fbs',
    'https://www.espn.com/college-football/stats'
  ]
}; 