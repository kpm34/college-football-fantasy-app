// Browser-compatible Appwrite Client
// Load this script in HTML pages to use Appwrite services

// Initialize Appwrite Client
const client = new Appwrite.Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('college-football-fantasy-app');

// Initialize services
const databases = new Appwrite.Databases(client);
const account = new Appwrite.Account(client);
// Note: Realtime is not available in browser version, using alternative approach
const realtime = null;

// Database and collection IDs
const DATABASE_ID = 'college-football-fantasy';
const COLLECTIONS = {
    GAMES: 'games',
    RANKINGS: 'rankings',
    TEAMS: 'teams',
    USERS: 'users',
    PLAYERS: 'players',
    PLAYER_STATS: 'player_stats',
    TRANSACTIONS: 'transactions',
    DRAFT_PICKS: 'draft_picks',
    LEAGUES: 'leagues',
    ROSTERS: 'rosters',
    LINEUPS: 'lineups',
    ID_MAPPINGS: 'id_mappings'
};

class AppwriteDataService {
    constructor() {
        this.client = client;
        this.databases = databases;
        this.account = account;
        this.realtime = realtime;
    }

    // Authentication Methods
    async createAccount(email, password, name) {
        try {
            const response = await this.account.create(
                Appwrite.ID.unique(),
                email,
                password,
                name
            );
            return response;
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    }

    async createEmailSession(email, password) {
        try {
            const response = await this.account.createEmailSession(email, password);
            return response;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const response = await this.account.get();
            return response;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Games Data
    async getGames(week = null) {
        try {
            let queries = [];
            if (week) {
                queries.push(`week=${week}`);
            }
            
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.GAMES,
                queries
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching games:', error);
            return [];
        }
    }

    async getEligibleGames() {
        try {
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.GAMES,
                ['eligible=true']
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching eligible games:', error);
            return [];
        }
    }

    // Rankings Data
    async getRankings() {
        try {
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.RANKINGS,
                ['orderAsc("rank")']
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching rankings:', error);
            return [];
        }
    }

    // Teams Data
    async getTeams() {
        try {
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.TEAMS
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching teams:', error);
            return [];
        }
    }

    async getPower4Teams() {
        try {
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.TEAMS,
                ['conference=SEC', 'conference=ACC', 'conference=Big 12', 'conference=Big Ten']
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching Power 4 teams:', error);
            return [];
        }
    }

    // Players Data
    async getPlayers(teamId = null, position = null) {
        try {
            let queries = [];
            if (teamId) {
                queries.push(`teamId=${teamId}`);
            }
            if (position) {
                queries.push(`position=${position}`);
            }
            
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PLAYERS,
                queries
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching players:', error);
            return [];
        }
    }

    async getPlayerStats(playerId, season = '2025') {
        try {
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PLAYER_STATS,
                [`playerId=${playerId}`, `season=${season}`]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching player stats:', error);
            return [];
        }
    }

    // League Management
    async createLeague(leagueData) {
        try {
            const response = await this.databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.LEAGUES,
                Appwrite.ID.unique(),
                {
                    name: leagueData.name,
                    creatorId: leagueData.creatorId,
                    maxTeams: leagueData.maxTeams || 12,
                    scoringType: leagueData.scoringType || 'PPR',
                    draftType: leagueData.draftType || 'snake',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            );
            return response;
        } catch (error) {
            console.error('Error creating league:', error);
            throw error;
        }
    }

    async getLeagues(userId) {
        try {
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.LEAGUES,
                [`creatorId=${userId}`]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching leagues:', error);
            return [];
        }
    }

    // Roster Management
    async getRoster(leagueId, userId) {
        try {
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.ROSTERS,
                [`leagueId=${leagueId}`, `userId=${userId}`]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error fetching roster:', error);
            return null;
        }
    }

    async updateRoster(rosterId, rosterData) {
        try {
            const response = await this.databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.ROSTERS,
                rosterId,
                rosterData
            );
            return response;
        } catch (error) {
            console.error('Error updating roster:', error);
            throw error;
        }
    }

    // Draft Management
    async getDraftPicks(leagueId) {
        try {
            const response = await this.databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.DRAFT_PICKS,
                [`leagueId=${leagueId}`],
                ['orderAsc("pickNumber")']
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching draft picks:', error);
            return [];
        }
    }

    async makeDraftPick(leagueId, userId, playerId, pickNumber) {
        try {
            const response = await this.databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.DRAFT_PICKS,
                Appwrite.ID.unique(),
                {
                    leagueId,
                    userId,
                    playerId,
                    pickNumber,
                    timestamp: new Date().toISOString()
                }
            );
            return response;
        } catch (error) {
            console.error('Error making draft pick:', error);
            throw error;
        }
    }

    // Real-time Subscriptions
    subscribeToDraftPicks(leagueId, callback) {
        return this.realtime.subscribe(
            `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
            (response) => {
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    const pick = response.payload;
                    if (pick.leagueId === leagueId) {
                        callback(pick);
                    }
                }
            }
        );
    }

    subscribeToGameUpdates(callback) {
        return this.realtime.subscribe(
            `databases.${DATABASE_ID}.collections.${COLLECTIONS.GAMES}.documents`,
            (response) => {
                if (response.events.includes('databases.*.collections.*.documents.*.update')) {
                    callback(response.payload);
                }
            }
        );
    }

    // Error Handling
    handleError(error) {
        console.error('Appwrite Error:', error);
        
        if (error.code === 401) {
            // Handle authentication error
            window.location.href = '/login';
        } else if (error.code === 403) {
            // Handle permission error
            alert('You do not have permission to perform this action.');
        } else if (error.code === 404) {
            // Handle not found error
            console.log('Resource not found');
        } else {
            // Handle other errors
            alert('An error occurred. Please try again.');
        }
    }
}

// Create global instance
window.appwriteService = new AppwriteDataService();
window.APPWRITE_COLLECTIONS = COLLECTIONS;
window.APPWRITE_DATABASE_ID = DATABASE_ID;

console.log('Appwrite Data Service loaded successfully!'); 