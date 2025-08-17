/**
 * PERMISSIONS SCHEMA
 * 
 * Defines all permission rules, user roles, and access patterns.
 * This drives Appwrite collection permissions, function permissions, and storage bucket access.
 */

export type UserRole = 'guest' | 'user' | 'commissioner' | 'admin' | 'system';

export interface PermissionRule {
  role: UserRole;
  actions: Array<'read' | 'write' | 'create' | 'update' | 'delete'>;
  conditions?: {
    ownership?: boolean; // User must own the resource
    membership?: boolean; // User must be member of related league
    status?: string[]; // Resource must have certain status
    custom?: string; // Custom permission logic
  };
}

export interface CollectionPermissions {
  collectionId: string;
  description: string;
  rules: PermissionRule[];
  ownershipField?: string; // Field that determines ownership (e.g., 'userId', 'commissioner')
  membershipField?: string; // Field that determines membership (e.g., 'leagueId')
}

/**
 * COMPREHENSIVE PERMISSION DEFINITIONS
 */
export const PERMISSIONS_SCHEMA: Record<string, CollectionPermissions> = {
  // User Management
  users: {
    collectionId: 'users',
    description: 'User profiles and preferences',
    ownershipField: 'authId',
    rules: [
      { role: 'guest', actions: [] }, // No access for guests
      { role: 'user', actions: ['read'], conditions: { ownership: true } }, // Users can read own profile
      { role: 'user', actions: ['update'], conditions: { ownership: true } }, // Users can update own profile
      { role: 'admin', actions: ['read', 'write', 'create', 'update', 'delete'] }, // Admins full access
      { role: 'system', actions: ['read', 'write', 'create', 'update', 'delete'] } // System full access
    ]
  },

  // League Management
  leagues: {
    collectionId: 'leagues',
    description: 'Fantasy leagues',
    ownershipField: 'commissioner',
    rules: [
      { role: 'guest', actions: ['read'], conditions: { status: ['open'] } }, // Guests can browse open leagues
      { role: 'user', actions: ['read'] }, // Users can read all leagues
      { role: 'user', actions: ['create'] }, // Users can create leagues
      { role: 'user', actions: ['update'], conditions: { ownership: true } }, // Commissioners can update their leagues
      { role: 'user', actions: ['delete'], conditions: { ownership: true, status: ['open', 'drafting'] } }, // Can only delete before active
      { role: 'admin', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  },

  // Team Rosters
  rosters: {
    collectionId: 'rosters',
    description: 'Fantasy team rosters within leagues',
    ownershipField: 'userId',
    membershipField: 'leagueId',
    rules: [
      { role: 'guest', actions: [] }, // No guest access
      { role: 'user', actions: ['read'], conditions: { membership: true } }, // League members can read rosters
      { role: 'user', actions: ['create', 'update'], conditions: { ownership: true } }, // Users manage own roster
      { role: 'user', actions: ['read'], conditions: { custom: 'league_commissioner' } }, // Commissioners can read all league rosters
      { role: 'admin', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  },

  // Player Data - Public Read
  college_players: {
    collectionId: 'college_players',
    description: 'College football player database',
    rules: [
      { role: 'guest', actions: ['read'] }, // Public player data
      { role: 'user', actions: ['read'] },
      { role: 'admin', actions: ['write', 'create', 'update', 'delete'] }, // Only admins can modify players
      { role: 'system', actions: ['read', 'write', 'create', 'update', 'delete'] } // System for data imports
    ]
  },

  // Team Data - Public Read  
  teams: {
    collectionId: 'teams',
    description: 'College football teams',
    rules: [
      { role: 'guest', actions: ['read'] }, // Public team data
      { role: 'user', actions: ['read'] },
      { role: 'admin', actions: ['write', 'create', 'update', 'delete'] },
      { role: 'system', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  },

  // Game Data - Public Read
  games: {
    collectionId: 'games',
    description: 'College football games and scores',
    rules: [
      { role: 'guest', actions: ['read'] }, // Public game data
      { role: 'user', actions: ['read'] },
      { role: 'admin', actions: ['write', 'create', 'update', 'delete'] },
      { role: 'system', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  },

  // Rankings - Public Read
  rankings: {
    collectionId: 'rankings',
    description: 'AP Top 25 and other rankings',
    rules: [
      { role: 'guest', actions: ['read'] }, // Public ranking data
      { role: 'user', actions: ['read'] },
      { role: 'admin', actions: ['write', 'create', 'update', 'delete'] },
      { role: 'system', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  },

  // Weekly Lineups
  lineups: {
    collectionId: 'lineups', 
    description: 'Weekly fantasy lineups',
    ownershipField: 'rosterId', // Ownership through roster
    membershipField: 'leagueId',
    rules: [
      { role: 'user', actions: ['read'], conditions: { membership: true } }, // League members can see lineups
      { role: 'user', actions: ['create', 'update'], conditions: { ownership: true } }, // Users manage own lineups
      { role: 'user', actions: ['read'], conditions: { custom: 'league_commissioner' } }, // Commissioners see all
      { role: 'admin', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  },

  // Auction System
  auctions: {
    collectionId: 'auctions',
    description: 'Auction draft sessions',
    membershipField: 'leagueId',
    rules: [
      { role: 'user', actions: ['read'], conditions: { membership: true } }, // League members can participate
      { role: 'user', actions: ['create', 'update'], conditions: { custom: 'league_commissioner' } }, // Commissioners control auctions
      { role: 'admin', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  },

  bids: {
    collectionId: 'bids',
    description: 'Auction bid history',
    ownershipField: 'teamId',
    rules: [
      { role: 'user', actions: ['read'], conditions: { membership: true } }, // League members see bids
      { role: 'user', actions: ['create'], conditions: { ownership: true } }, // Users can place bids
      { role: 'admin', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  },

  // Statistics - Public Read
  player_stats: {
    collectionId: 'player_stats',
    description: 'Player game statistics',
    rules: [
      { role: 'guest', actions: ['read'] }, // Public stats
      { role: 'user', actions: ['read'] },
      { role: 'admin', actions: ['write', 'create', 'update', 'delete'] },
      { role: 'system', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  },

  // System Logging - Admin Only
  activity_log: {
    collectionId: 'activity_log',
    description: 'System activity audit trail',
    rules: [
      { role: 'admin', actions: ['read', 'write', 'create'] },
      { role: 'system', actions: ['read', 'write', 'create', 'update', 'delete'] }
    ]
  }
};

/**
 * ROLE HIERARCHY
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'guest': 0,
  'user': 1,
  'commissioner': 2, // Users can also be commissioners of their leagues
  'admin': 3,
  'system': 4
};

/**
 * CUSTOM PERMISSION LOGIC
 */
export const CUSTOM_PERMISSIONS = {
  /**
   * League commissioner can access all resources in their league
   */
  league_commissioner: (userId: string, leagueId: string) => `
    // Check if user is commissioner of this league
    const league = await databases.getDocument('${process.env.APPWRITE_DATABASE_ID}', 'leagues', '${leagueId}');
    return league.commissioner === '${userId}';
  `,

  /**
   * Users can only modify rosters during certain league phases
   */
  roster_modification_allowed: (leagueId: string) => `
    // Check league status allows roster changes
    const league = await databases.getDocument('${process.env.APPWRITE_DATABASE_ID}', 'leagues', '${leagueId}');
    return ['open', 'drafting', 'active'].includes(league.status);
  `,

  /**
   * Lineup changes locked after game start
   */
  lineup_locked: (rosterId: string, week: number) => `
    // Check if any games for this week have started
    const games = await databases.listDocuments(
      '${process.env.APPWRITE_DATABASE_ID}', 
      'games',
      [Query.equal('week', ${week}), Query.lessThan('start_date', new Date().toISOString())]
    );
    return games.documents.length === 0; // No games started = not locked
  `
};

/**
 * APPWRITE PERMISSION HELPERS
 */
export function buildAppwritePermissions(collectionPermissions: CollectionPermissions): string[] {
  const permissions: string[] = [];
  
  for (const rule of collectionPermissions.rules) {
    const roleLabel = rule.role === 'guest' ? 'any' : rule.role;
    
    for (const action of rule.actions) {
      if (action === 'read') {
        permissions.push(`read("${roleLabel}")`);
      } else {
        // write covers create, update, delete in Appwrite
        permissions.push(`write("${roleLabel}")`);
      }
    }
    
    // Add ownership-based permissions
    if (rule.conditions?.ownership && collectionPermissions.ownershipField) {
      for (const action of rule.actions) {
        if (action === 'read') {
          permissions.push(`read("user:self")`);
        } else {
          permissions.push(`write("user:self")`);
        }
      }
    }
  }
  
  return [...new Set(permissions)]; // Remove duplicates
}

/**
 * PERMISSION VALIDATION
 */
export function validatePermissions(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [collectionId, perms] of Object.entries(PERMISSIONS_SCHEMA)) {
    // Validate ownership field references exist in schema
    if (perms.ownershipField) {
      // Would need to check against actual schema attributes
      console.log(`Validating ownership field: ${perms.ownershipField} for ${collectionId}`);
    }
    
    // Validate no conflicting permissions
    const roleActions = new Map<UserRole, Set<string>>();
    for (const rule of perms.rules) {
      const existing = roleActions.get(rule.role) || new Set();
      rule.actions.forEach(action => existing.add(action));
      roleActions.set(rule.role, existing);
    }
    
    // Validate role hierarchy makes sense
    for (const rule of perms.rules) {
      if (rule.role === 'guest' && rule.actions.includes('write')) {
        errors.push(`${collectionId}: Guests should not have write access`);
      }
      
      if (rule.role === 'admin' && !rule.actions.includes('read')) {
        errors.push(`${collectionId}: Admins should have read access`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export default PERMISSIONS_SCHEMA;