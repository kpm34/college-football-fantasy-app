/**
 * MSW (Mock Service Worker) Setup
 * 
 * Provides API mocking for reliable unit and integration tests.
 * Isolates tests from flaky network dependencies.
 */

import { setupServer } from 'msw/node';
import { rest } from 'msw';
import type { SetupServerApi } from 'msw/node';

// Mock data generators
import { generateMockPlayer, generateMockLeague, generateMockRoster, generateMockGame } from './mock-data';

/**
 * APPWRITE API MOCKS
 */
const appwriteMocks = [
  // Database - List Documents
  rest.get('*/v1/databases/:databaseId/collections/:collectionId/documents', (req, res, ctx) => {
    const { collectionId } = req.params;
    const limit = parseInt(req.url.searchParams.get('limit') || '25');
    
    switch (collectionId) {
      case 'college_players':
        return res(ctx.json({
          total: 100,
          documents: Array.from({ length: Math.min(limit, 10) }, () => generateMockPlayer())
        }));
        
      case 'leagues':
        return res(ctx.json({
          total: 5,
          documents: Array.from({ length: Math.min(limit, 5) }, () => generateMockLeague())
        }));
        
      case 'user_teams':
        return res(ctx.json({
          total: 12,
          documents: Array.from({ length: Math.min(limit, 12) }, () => generateMockRoster())
        }));
        
      case 'games':
        return res(ctx.json({
          total: 20,
          documents: Array.from({ length: Math.min(limit, 20) }, () => generateMockGame())
        }));
        
      default:
        return res(ctx.json({ total: 0, documents: [] }));
    }
  }),
  
  // Database - Get Document
  rest.get('*/v1/databases/:databaseId/collections/:collectionId/documents/:documentId', (req, res, ctx) => {
    const { collectionId, documentId } = req.params;
    
    switch (collectionId) {
      case 'college_players':
        return res(ctx.json(generateMockPlayer({ $id: documentId as string })));
        
      case 'leagues':
        return res(ctx.json(generateMockLeague({ $id: documentId as string })));
        
      case 'user_teams':
        return res(ctx.json(generateMockRoster({ $id: documentId as string })));
        
      default:
        return res(ctx.status(404), ctx.json({ message: 'Document not found' }));
    }
  }),
  
  // Database - Create Document
  rest.post('*/v1/databases/:databaseId/collections/:collectionId/documents', (req, res, ctx) => {
    const { collectionId } = req.params;
    
    switch (collectionId) {
      case 'leagues':
        return res(ctx.json(generateMockLeague({ 
          ...req.body as any,
          $id: 'new-league-id',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        })));
        
      case 'user_teams':
        return res(ctx.json(generateMockRoster({ 
          ...req.body as any,
          $id: 'new-user-team-id',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        })));
        
      default:
        return res(ctx.status(201), ctx.json({ 
          $id: 'new-document',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          ...req.body as any
        }));
    }
  }),
  
  // Database - Update Document
  rest.patch('*/v1/databases/:databaseId/collections/:collectionId/documents/:documentId', (req, res, ctx) => {
    const { collectionId, documentId } = req.params;
    
    return res(ctx.json({
      $id: documentId,
      $updatedAt: new Date().toISOString(),
      ...req.body as any
    }));
  }),
  
  // Database - Delete Document
  rest.delete('*/v1/databases/:databaseId/collections/:collectionId/documents/:documentId', (req, res, ctx) => {
    return res(ctx.status(204));
  }),
  
  // Storage - Get File
  rest.get('*/v1/storage/buckets/:bucketId/files/:fileId', (req, res, ctx) => {
    return res(ctx.json({
      $id: req.params.fileId,
      bucketId: req.params.bucketId,
      name: 'mock-file.jpg',
      mimeType: 'image/jpeg',
      sizeOriginal: 1024000,
      $createdAt: new Date().toISOString()
    }));
  }),
  
  // Functions - Execute
  rest.post('*/v1/functions/:functionId/executions', (req, res, ctx) => {
    const { functionId } = req.params;
    
    switch (functionId) {
      case 'calculate-fantasy-scores':
        return res(ctx.json({
          $id: 'execution-id',
          status: 'completed',
          responseStatusCode: 200,
          response: JSON.stringify({ success: true, pointsCalculated: 145 }),
          duration: 2.5
        }));
        
      default:
        return res(ctx.json({
          $id: 'execution-id',
          status: 'completed',
          responseStatusCode: 200,
          response: JSON.stringify({ success: true }),
          duration: 1.2
        }));
    }
  })
];

/**
 * EXTERNAL API MOCKS
 */
const externalApiMocks = [
  // College Football Data API
  rest.get('https://api.collegefootballdata.com/games', (req, res, ctx) => {
    const week = req.url.searchParams.get('week') || '1';
    const season = req.url.searchParams.get('year') || '2025';
    
    return res(ctx.json([
      {
        id: 401520720,
        season: parseInt(season),
        week: parseInt(week),
        season_type: 'regular',
        start_date: '2025-08-30T19:00:00.000Z',
        completed: false,
        home_team: 'Georgia',
        away_team: 'Alabama', 
        home_points: null,
        away_points: null,
        venue: 'Mercedes-Benz Stadium'
      },
      {
        id: 401520721,
        season: parseInt(season),
        week: parseInt(week),
        season_type: 'regular',
        start_date: '2025-08-30T15:30:00.000Z',
        completed: true,
        home_team: 'Texas',
        away_team: 'Oklahoma',
        home_points: 35,
        away_points: 21,
        venue: 'Darrell K Royal Stadium'
      }
    ]));
  }),
  
  // CFBD Player Stats
  rest.get('https://api.collegefootballdata.com/stats/player/season', (req, res, ctx) => {
    const season = req.url.searchParams.get('year') || '2025';
    
    return res(ctx.json([
      {
        season: parseInt(season),
        playerId: 4432111,
        player: 'Carson Beck',
        team: 'Georgia',
        conference: 'SEC',
        category: 'passing',
        stat: 'YDS',
        statValue: 3456
      },
      {
        season: parseInt(season),
        playerId: 4432111,
        player: 'Carson Beck',
        team: 'Georgia', 
        conference: 'SEC',
        category: 'passing',
        stat: 'TD',
        statValue: 28
      }
    ]));
  }),
  
  // CFBD Rankings
  rest.get('https://api.collegefootballdata.com/rankings', (req, res, ctx) => {
    const week = req.url.searchParams.get('week') || '1';
    const season = req.url.searchParams.get('year') || '2025';
    
    return res(ctx.json([
      {
        season: parseInt(season),
        seasonType: 'regular',
        week: parseInt(week),
        poll: 'AP Top 25',
        ranks: [
          { rank: 1, school: 'Georgia', firstPlaceVotes: 45, points: 1575 },
          { rank: 2, school: 'Texas', firstPlaceVotes: 10, points: 1489 },
          { rank: 3, school: 'Ohio State', firstPlaceVotes: 5, points: 1432 }
        ]
      }
    ]));
  }),
  
  // ESPN API
  rest.get('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard', (req, res, ctx) => {
    return res(ctx.json({
      events: [
        {
          id: '401520720',
          date: '2025-08-30T19:00:00.000Z',
          status: { type: { completed: false } },
          competitions: [{
            competitors: [
              { 
                team: { abbreviation: 'UGA', displayName: 'Georgia' },
                score: '0',
                homeAway: 'home'
              },
              {
                team: { abbreviation: 'ALA', displayName: 'Alabama' },
                score: '0', 
                homeAway: 'away'
              }
            ]
          }]
        }
      ]
    }));
  }),
  
  // Vercel Edge Config (for feature flags)
  rest.get('https://edge-config.vercel.com/*/item/*', (req, res, ctx) => {
    return res(ctx.json({
      draftingEnabled: true,
      auctionEnabled: true,
      weeklyScoring: true,
      maintenanceMode: false
    }));
  })
];

/**
 * ERROR SIMULATION MOCKS
 */
const errorMocks = [
  // Simulate 500 errors for testing error handling
  rest.get('*/v1/databases/*/collections/*/documents/error-500', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Internal Server Error' }));
  }),
  
  // Simulate 404 errors
  rest.get('*/v1/databases/*/collections/*/documents/not-found', (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ message: 'Document not found' }));
  }),
  
  // Simulate network timeout
  rest.get('*/timeout-test', (req, res, ctx) => {
    return res(ctx.delay(10000)); // 10 second delay
  }),
  
  // Simulate rate limiting
  rest.get('*/rate-limit-test', (req, res, ctx) => {
    return res(ctx.status(429), ctx.json({ message: 'Too Many Requests' }));
  })
];

/**
 * MSW SERVER SETUP
 */
export const server: SetupServerApi = setupServer(
  ...appwriteMocks,
  ...externalApiMocks,
  ...errorMocks
);

/**
 * TEST UTILITIES
 */
export const mockUtils = {
  // Reset all handlers to default state
  resetHandlers: () => {
    server.resetHandlers();
  },
  
  // Add custom handlers for specific tests
  useHandlers: (handlers: Parameters<typeof server.use>[0][]) => {
    server.use(...handlers);
  },
  
  // Mock successful responses
  mockSuccess: (endpoint: string, data: any) => {
    server.use(
      rest.get(endpoint, (req, res, ctx) => {
        return res(ctx.json(data));
      })
    );
  },
  
  // Mock error responses
  mockError: (endpoint: string, status: number = 500, message: string = 'Server Error') => {
    server.use(
      rest.get(endpoint, (req, res, ctx) => {
        return res(ctx.status(status), ctx.json({ message }));
      })
    );
  },
  
  // Mock slow responses for timeout testing
  mockDelay: (endpoint: string, delayMs: number = 5000) => {
    server.use(
      rest.get(endpoint, (req, res, ctx) => {
        return res(ctx.delay(delayMs), ctx.json({ delayed: true }));
      })
    );
  }
};

// Test environment configuration
export const testConfig = {
  // Mock environment variables for tests
  env: {
    APPWRITE_ENDPOINT: 'https://localhost/v1',
    APPWRITE_PROJECT_ID: 'test-project',
    APPWRITE_DATABASE_ID: 'test-database',
    APPWRITE_API_KEY: 'test-api-key',
    CFBD_API_KEY: 'test-cfbd-key'
  },
  
  // Default timeouts for tests
  timeouts: {
    short: 1000,   // 1 second
    medium: 5000,  // 5 seconds  
    long: 15000    // 15 seconds
  }
};

export default server;