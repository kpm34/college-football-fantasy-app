/**
 * APPWRITE FUNCTIONS SCHEMA
 * 
 * Defines all serverless functions, their triggers, permissions, and configurations.
 * This ensures consistent function deployment and management.
 */

export interface FunctionVariable {
  key: string;
  value: string;
  required: boolean;
  description: string;
}

export interface FunctionExecutionSettings {
  timeout: number; // seconds
  memory: number; // MB
  runtime: string; // node-18.0, python-3.9, etc.
}

export interface FunctionTrigger {
  type: 'http' | 'schedule' | 'database' | 'storage';
  schedule?: string; // cron expression for scheduled functions
  events?: string[]; // database events like 'create', 'update', 'delete'
  collections?: string[]; // collections to watch for database triggers
}

export interface AppwriteFunction {
  functionId: string;
  name: string;
  description: string;
  entrypoint: string; // main.js, index.py, etc.
  path: string; // relative path to function code
  trigger: FunctionTrigger;
  execution: FunctionExecutionSettings;
  variables: FunctionVariable[];
  permissions: {
    execute: string[]; // roles that can execute this function
    logs: string[]; // roles that can view logs
  };
  dependencies?: string; // package.json, requirements.txt, etc.
  enabled: boolean;
  logging: boolean;
  priority: 'high' | 'medium' | 'low';
}

/**
 * COLLEGE FOOTBALL FANTASY FUNCTIONS
 */
export const FUNCTIONS_SCHEMA: Record<string, AppwriteFunction> = {
  // Data Import Functions
  'sync-player-data': {
    functionId: 'sync-player-data',
    name: 'Sync Player Data',
    description: 'Import college football player data from CFBD API',
    entrypoint: 'index.js',
    path: 'functions/sync-player-data',
    trigger: {
      type: 'schedule',
      schedule: '0 6 * * *' // Daily at 6 AM UTC
    },
    execution: {
      timeout: 900, // 15 minutes
      memory: 512,
      runtime: 'node-18.0'
    },
    variables: [
      {
        key: 'CFBD_API_KEY',
        value: '$CFBD_API_KEY',
        required: true,
        description: 'College Football Data API key'
      },
      {
        key: 'APPWRITE_API_KEY',
        value: '$APPWRITE_API_KEY',
        required: true,
        description: 'Appwrite API key for database writes'
      },
      {
        key: 'SEASON_YEAR',
        value: '2025',
        required: true,
        description: 'Current season year'
      }
    ],
    permissions: {
      execute: ['role:system', 'role:admin'],
      logs: ['role:admin']
    },
    enabled: true,
    logging: true,
    priority: 'high'
  },

  'sync-game-scores': {
    functionId: 'sync-game-scores',
    name: 'Sync Game Scores',
    description: 'Update game scores and trigger fantasy scoring',
    entrypoint: 'index.js',
    path: 'functions/sync-game-scores',
    trigger: {
      type: 'schedule',
      schedule: '*/10 * * * *' // Every 10 minutes during game season
    },
    execution: {
      timeout: 600, // 10 minutes
      memory: 256,
      runtime: 'node-18.0'
    },
    variables: [
      {
        key: 'CFBD_API_KEY',
        value: '$CFBD_API_KEY',
        required: true,
        description: 'College Football Data API key'
      },
      {
        key: 'ESPN_API_KEY',
        value: '$ESPN_API_KEY',
        required: false,
        description: 'ESPN API key for additional game data'
      }
    ],
    permissions: {
      execute: ['role:system', 'role:admin'],
      logs: ['role:admin']
    },
    enabled: true,
    logging: true,
    priority: 'high'
  },

  // Fantasy Scoring Functions
  'calculate-fantasy-scores': {
    functionId: 'calculate-fantasy-scores',
    name: 'Calculate Fantasy Scores',
    description: 'Calculate fantasy points for players based on game stats',
    entrypoint: 'index.js',
    path: 'functions/calculate-fantasy-scores',
    trigger: {
      type: 'database',
      events: ['create', 'update'],
      collections: ['player_stats', 'games']
    },
    execution: {
      timeout: 300, // 5 minutes
      memory: 256,
      runtime: 'node-18.0'
    },
    variables: [
      {
        key: 'SCORING_RULES',
        value: '{"passing_td": 6, "rushing_td": 6, "receiving_td": 6}',
        required: true,
        description: 'Default fantasy scoring rules JSON'
      }
    ],
    permissions: {
      execute: ['role:system', 'role:admin'],
      logs: ['role:admin', 'role:user']
    },
    enabled: true,
    logging: true,
    priority: 'high'
  },

  'update-lineup-scores': {
    functionId: 'update-lineup-scores',
    name: 'Update Lineup Scores',
    description: 'Update weekly lineup scores when player stats change',
    entrypoint: 'index.js',
    path: 'functions/update-lineup-scores',
    trigger: {
      type: 'database',
      events: ['update'],
      collections: ['college_players'] // When player fantasy_points update
    },
    execution: {
      timeout: 180, // 3 minutes
      memory: 128,
      runtime: 'node-18.0'
    },
    variables: [],
    permissions: {
      execute: ['role:system'],
      logs: ['role:admin']
    },
    enabled: true,
    logging: true,
    priority: 'medium'
  },

  // League Management Functions
  'start-draft': {
    functionId: 'start-draft',
    name: 'Start League Draft',
    description: 'Initialize draft for a league when scheduled',
    entrypoint: 'index.js',
    path: 'functions/start-draft',
    trigger: {
      type: 'http'
    },
    execution: {
      timeout: 60, // 1 minute
      memory: 128,
      runtime: 'node-18.0'
    },
    variables: [
      {
        key: 'DRAFT_TIMER_SECONDS',
        value: '90',
        required: true,
        description: 'Default draft pick timer in seconds'
      }
    ],
    permissions: {
      execute: ['role:user'], // League commissioners can start drafts
      logs: ['role:admin']
    },
    enabled: true,
    logging: true,
    priority: 'medium'
  },

  'auto-draft-pick': {
    functionId: 'auto-draft-pick',
    name: 'Auto Draft Pick',
    description: 'Make automatic draft pick when timer expires',
    entrypoint: 'index.js', 
    path: 'functions/auto-draft-pick',
    trigger: {
      type: 'schedule',
      schedule: '* * * * *' // Every minute to check for expired timers
    },
    execution: {
      timeout: 30,
      memory: 128,
      runtime: 'node-18.0'
    },
    variables: [],
    permissions: {
      execute: ['role:system'],
      logs: ['role:admin']
    },
    enabled: true,
    logging: true,
    priority: 'medium'
  },

  // Auction Functions
  'process-auction-bid': {
    functionId: 'process-auction-bid',
    name: 'Process Auction Bid',
    description: 'Handle auction bidding logic and validation',
    entrypoint: 'index.js',
    path: 'functions/process-auction-bid',
    trigger: {
      type: 'database',
      events: ['create'],
      collections: ['bids']
    },
    execution: {
      timeout: 30,
      memory: 128,
      runtime: 'node-18.0'
    },
    variables: [
      {
        key: 'BID_INCREMENT',
        value: '1',
        required: true,
        description: 'Minimum bid increment in dollars'
      }
    ],
    permissions: {
      execute: ['role:system'],
      logs: ['role:admin']
    },
    enabled: true,
    logging: true,
    priority: 'high'
  },

  'close-auction': {
    functionId: 'close-auction',
    name: 'Close Player Auction',
    description: 'Close auction when timer expires and assign player',
    entrypoint: 'index.js',
    path: 'functions/close-auction',
    trigger: {
      type: 'schedule',
      schedule: '* * * * *' // Check every minute
    },
    execution: {
      timeout: 60,
      memory: 128,
      runtime: 'node-18.0'
    },
    variables: [],
    permissions: {
      execute: ['role:system'],
      logs: ['role:admin']
    },
    enabled: true,
    logging: true,
    priority: 'high'
  },

  // Notification Functions
  'send-draft-notifications': {
    functionId: 'send-draft-notifications',
    name: 'Send Draft Notifications',
    description: 'Send notifications when it\'s user\'s turn to draft',
    entrypoint: 'index.js',
    path: 'functions/send-draft-notifications',
    trigger: {
      type: 'database',
      events: ['update'],
      collections: ['leagues'] // When current draft pick changes
    },
    execution: {
      timeout: 60,
      memory: 128,
      runtime: 'node-18.0'
    },
    variables: [
      {
        key: 'PUSHOVER_API_KEY',
        value: '$PUSHOVER_API_KEY',
        required: false,
        description: 'Pushover API key for push notifications'
      },
      {
        key: 'EMAIL_API_KEY',
        value: '$EMAIL_API_KEY',
        required: false,
        description: 'Email service API key'
      }
    ],
    permissions: {
      execute: ['role:system'],
      logs: ['role:admin']
    },
    enabled: false, // Enable when notification system ready
    logging: true,
    priority: 'low'
  },

  // Analytics Functions
  'generate-weekly-report': {
    functionId: 'generate-weekly-report',
    name: 'Generate Weekly Report',
    description: 'Generate weekly performance reports for leagues',
    entrypoint: 'index.js',
    path: 'functions/generate-weekly-report',
    trigger: {
      type: 'schedule',
      schedule: '0 9 * * 2' // Tuesdays at 9 AM UTC (after weekend games)
    },
    execution: {
      timeout: 300,
      memory: 256,
      runtime: 'node-18.0'
    },
    variables: [],
    permissions: {
      execute: ['role:system'],
      logs: ['role:admin']
    },
    enabled: false, // Enable when reporting system ready
    logging: true,
    priority: 'low'
  },

  // Maintenance Functions
  'cleanup-expired-data': {
    functionId: 'cleanup-expired-data',
    name: 'Cleanup Expired Data',
    description: 'Clean up old logs, temporary data, and expired sessions',
    entrypoint: 'index.js',
    path: 'functions/cleanup-expired-data',
    trigger: {
      type: 'schedule',
      schedule: '0 3 * * 0' // Sundays at 3 AM UTC
    },
    execution: {
      timeout: 600,
      memory: 256,
      runtime: 'node-18.0'
    },
    variables: [
      {
        key: 'RETENTION_DAYS',
        value: '30',
        required: true,
        description: 'Days to retain activity logs'
      }
    ],
    permissions: {
      execute: ['role:system'],
      logs: ['role:admin']
    },
    enabled: true,
    logging: true,
    priority: 'low'
  }
};

/**
 * FUNCTION DEPLOYMENT ORDER
 * Functions should be deployed in this order to handle dependencies
 */
export const DEPLOYMENT_ORDER: string[] = [
  // Infrastructure functions first
  'cleanup-expired-data',
  
  // Data sync functions
  'sync-player-data',
  'sync-game-scores',
  'calculate-fantasy-scores',
  
  // Fantasy game functions
  'update-lineup-scores',
  'start-draft',
  'auto-draft-pick',
  'process-auction-bid',
  'close-auction',
  
  // Notification and reporting (optional)
  'send-draft-notifications',
  'generate-weekly-report'
];

/**
 * FUNCTION ENVIRONMENT CONFIGURATION
 */
export const FUNCTION_ENVIRONMENTS = {
  development: {
    globalVariables: [
      { key: 'NODE_ENV', value: 'development' },
      { key: 'LOG_LEVEL', value: 'debug' },
      { key: 'SEASON_YEAR', value: '2025' }
    ],
    defaultTimeout: 60,
    defaultMemory: 128
  },
  
  production: {
    globalVariables: [
      { key: 'NODE_ENV', value: 'production' },
      { key: 'LOG_LEVEL', value: 'info' },
      { key: 'SEASON_YEAR', value: '2025' }
    ],
    defaultTimeout: 300,
    defaultMemory: 256
  }
};

/**
 * FUNCTION MONITORING AND ALERTS
 */
export const FUNCTION_MONITORING = {
  // Critical functions that must work
  critical: ['sync-game-scores', 'calculate-fantasy-scores', 'process-auction-bid'],
  
  // Functions to monitor for performance
  performance: ['sync-player-data', 'update-lineup-scores'],
  
  // Alert thresholds
  alerts: {
    errorRate: 0.05, // 5% error rate
    executionTime: 0.9, // 90% of timeout limit
    memoryUsage: 0.8 // 80% of memory limit
  }
};

/**
 * HELPER FUNCTIONS FOR DEPLOYMENT
 */
export function getFunctionsByPriority(): {
  high: AppwriteFunction[];
  medium: AppwriteFunction[];
  low: AppwriteFunction[];
} {
  const high: AppwriteFunction[] = [];
  const medium: AppwriteFunction[] = [];
  const low: AppwriteFunction[] = [];
  
  for (const func of Object.values(FUNCTIONS_SCHEMA)) {
    switch (func.priority) {
      case 'high': high.push(func); break;
      case 'medium': medium.push(func); break;
      case 'low': low.push(func); break;
    }
  }
  
  return { high, medium, low };
}

export function getEnabledFunctions(): AppwriteFunction[] {
  return Object.values(FUNCTIONS_SCHEMA).filter(func => func.enabled);
}

export function getFunctionsByTrigger(triggerType: FunctionTrigger['type']): AppwriteFunction[] {
  return Object.values(FUNCTIONS_SCHEMA).filter(func => func.trigger.type === triggerType);
}

export default FUNCTIONS_SCHEMA;