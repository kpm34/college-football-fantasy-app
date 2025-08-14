/**
 * Centralized Environment Configuration
 * Single source of truth for all environment variables
 */

export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private validated = false;

  // Server-side configuration
  readonly server = {
    appwrite: {
      endpoint: process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
      projectId: process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
      apiKey: process.env.APPWRITE_API_KEY || '',
      databaseId: process.env.DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy',
    },
    external: {
      cfbdApiKey: process.env.CFBD_API_KEY || '',
      rotowire: {
        username: process.env.ROTOWIRE_USERNAME || '',
        passwordEncrypted: process.env.ROTOWIRE_PASSWORD_ENCRYPTED || '',
        encryptionKey: process.env.ROTOWIRE_ENCRYPTION_KEY || '',
      },
    },
    security: {
      cronSecret: process.env.CRON_SECRET || '',
    },
  };

  // Client-side configuration (safe to expose)
  readonly client = {
    appwrite: {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy',
    },
    collections: {
      // Core collections
      leagues: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES || 'leagues',
      rosters: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS || 'rosters',
      players: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players',
      teams: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS || 'teams',
      games: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES || 'games',
      rankings: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS || 'rankings',
      
      // Draft collections
      draftPicks: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS || 'draft_picks',
      auctions: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS || 'auctions',
      bids: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS || 'bids',
      
      // Stats collections
      playerStats: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS || 'player_stats',
      matchups: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS || 'matchups',
      lineups: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS || 'lineups',
      playerProjections: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS || 'player_projections',
      
      // User collections
      users: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users',
      activityLog: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG || 'activity_log',
    },
  };

  private constructor() {
    // Validate on construction
    this.validate();
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  /**
   * Validate that all required environment variables are set
   */
  private validate(): void {
    if (this.validated) return;

    const errors: string[] = [];

    // Server-side validation (only in Node.js environment)
    if (typeof window === 'undefined') {
      // Critical server variables
      if (!this.server.appwrite.apiKey) {
        errors.push('APPWRITE_API_KEY is required for server-side operations');
      }
      
      if (!this.server.security.cronSecret) {
        console.warn('⚠️  CRON_SECRET is not set - cron jobs will not work');
      }

      if (!this.server.external.cfbdApiKey) {
        console.warn('⚠️  CFBD_API_KEY is not set - player data sync will not work');
      }
    }

    // Client-side validation (always required)
    if (!this.client.appwrite.endpoint) {
      errors.push('NEXT_PUBLIC_APPWRITE_ENDPOINT is required');
    }

    if (!this.client.appwrite.projectId) {
      errors.push('NEXT_PUBLIC_APPWRITE_PROJECT_ID is required');
    }

    if (!this.client.appwrite.databaseId) {
      errors.push('NEXT_PUBLIC_APPWRITE_DATABASE_ID is required');
    }

    // Throw if critical errors
    if (errors.length > 0) {
      console.error('❌ Environment configuration errors:');
      errors.forEach(error => console.error(`   - ${error}`));
      
      // Only throw in production if critical variables are missing
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Missing critical environment variables');
      }
    }

    this.validated = true;
    console.log('✅ Environment configuration validated');
  }

  /**
   * Get a safe version of the config for client-side use
   */
  getPublicConfig() {
    return {
      appwrite: this.client.appwrite,
      collections: this.client.collections,
    };
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Log current configuration (masks sensitive values)
   */
  logConfig(): void {
    console.log('🔧 Environment Configuration:');
    console.log('   Environment:', process.env.NODE_ENV);
    console.log('   Appwrite Endpoint:', this.client.appwrite.endpoint);
    console.log('   Appwrite Project:', this.client.appwrite.projectId);
    console.log('   Database ID:', this.client.appwrite.databaseId);
    
    if (typeof window === 'undefined') {
      console.log('   API Key Set:', !!this.server.appwrite.apiKey);
      console.log('   CFBD Key Set:', !!this.server.external.cfbdApiKey);
      console.log('   Cron Secret Set:', !!this.server.security.cronSecret);
    }
  }
}

// Export singleton instance
export const env = EnvironmentConfig.getInstance();

// Export collections directly for convenience
export const COLLECTIONS = env.client.collections;
