// Sample Data Population Script
// Run this in the browser console to populate test data

class SampleDataPopulator {
    constructor() {
        this.appwriteService = window.appwriteService;
    }

    async populateSampleData() {
        console.log('🚀 Starting sample data population...');
        
        try {
            // 1. Create sample teams
            await this.createSampleTeams();
            
            // 2. Create sample players
            await this.createSamplePlayers();
            
            // 3. Create sample games
            await this.createSampleGames();
            
            // 4. Create sample rankings
            await this.createSampleRankings();
            
            // 5. Create sample league
            await this.createSampleLeague();
            
            console.log('✅ Sample data population completed!');
            console.log('🎮 You can now test the league dashboard and team roster pages.');
            
        } catch (error) {
            console.error('❌ Error populating sample data:', error);
        }
    }

    async createSampleTeams() {
        console.log('📊 Creating sample teams...');
        
        const teams = [
            { name: 'Alabama Crimson Tide', conference: 'SEC', abbreviation: 'ALA' },
            { name: 'Georgia Bulldogs', conference: 'SEC', abbreviation: 'UGA' },
            { name: 'Michigan Wolverines', conference: 'Big Ten', abbreviation: 'MICH' },
            { name: 'Ohio State Buckeyes', conference: 'Big Ten', abbreviation: 'OSU' },
            { name: 'Clemson Tigers', conference: 'ACC', abbreviation: 'CLEM' },
            { name: 'Florida State Seminoles', conference: 'ACC', abbreviation: 'FSU' },
            { name: 'Texas Longhorns', conference: 'Big 12', abbreviation: 'TEX' },
            { name: 'Oklahoma Sooners', conference: 'Big 12', abbreviation: 'OKLA' },
            { name: 'USC Trojans', conference: 'PAC-12', abbreviation: 'USC' },
            { name: 'Oregon Ducks', conference: 'PAC-12', abbreviation: 'ORE' }
        ];

        for (const team of teams) {
            try {
                await this.appwriteService.databases.createDocument(
                    'college-football-fantasy',
                    'teams',
                    this.appwriteService.client.ID.unique(),
                    {
                        name: team.name,
                        conference: team.conference,
                        abbreviation: team.abbreviation,
                        colors: JSON.stringify({ primary: '#FF0000', secondary: '#FFFFFF' })
                    }
                );
                console.log(`  ✅ Created team: ${team.name}`);
            } catch (error) {
                console.log(`  ⚠️ Team ${team.name} might already exist`);
            }
        }
    }

    async createSamplePlayers() {
        console.log('👥 Creating sample players...');
        
        const players = [
            { name: 'Caleb Williams', team: 'USC Trojans', position: 'QB', number: 13 },
            { name: 'Jahmyr Gibbs', team: 'Alabama Crimson Tide', position: 'RB', number: 1 },
            { name: 'Isiah Pacheco', team: 'Rutgers Scarlet Knights', position: 'RB', number: 24 },
            { name: 'Tyreek Hill', team: 'Miami Hurricanes', position: 'WR', number: 10 },
            { name: 'Tee Higgins', team: 'Clemson Tigers', position: 'WR', number: 5 },
            { name: 'Hunter Henry', team: 'Michigan Wolverines', position: 'TE', number: 84 },
            { name: 'Romeo Doubs', team: 'Wisconsin Badgers', position: 'WR', number: 87 },
            { name: 'George Pickens', team: 'Georgia Bulldogs', position: 'WR', number: 1 },
            { name: 'Cairo Santos', team: 'USC Trojans', position: 'K', number: 17 }
        ];

        for (const player of players) {
            try {
                await this.appwriteService.databases.createDocument(
                    'college-football-fantasy',
                    'players',
                    this.appwriteService.client.ID.unique(),
                    {
                        name: player.name,
                        teamId: player.team, // This would normally be a team ID
                        position: player.position,
                        number: player.number,
                        height: '6-0',
                        weight: 200,
                        class: 'Senior',
                        hometown: 'Various'
                    }
                );
                console.log(`  ✅ Created player: ${player.name} (${player.position})`);
            } catch (error) {
                console.log(`  ⚠️ Player ${player.name} might already exist`);
            }
        }
    }

    async createSampleGames() {
        console.log('🏈 Creating sample games...');
        
        const games = [
            {
                week: 1,
                awayTeamId: 'USC Trojans',
                homeTeamId: 'Notre Dame Fighting Irish',
                gameTime: 'Sat 7:30 PM',
                status: 'scheduled',
                eligible: true
            },
            {
                week: 1,
                awayTeamId: 'Alabama Crimson Tide',
                homeTeamId: 'Texas A&M Aggies',
                gameTime: 'Sat 3:30 PM',
                status: 'scheduled',
                eligible: true
            },
            {
                week: 1,
                awayTeamId: 'Michigan Wolverines',
                homeTeamId: 'Ohio State Buckeyes',
                gameTime: 'Sat 12:00 PM',
                status: 'scheduled',
                eligible: true
            },
            {
                week: 1,
                awayTeamId: 'Clemson Tigers',
                homeTeamId: 'Georgia Tech Yellow Jackets',
                gameTime: 'Sat 3:30 PM',
                status: 'scheduled',
                eligible: true
            }
        ];

        for (const game of games) {
            try {
                await this.appwriteService.databases.createDocument(
                    'college-football-fantasy',
                    'games',
                    this.appwriteService.client.ID.unique(),
                    {
                        week: game.week,
                        awayTeamId: game.awayTeamId,
                        homeTeamId: game.homeTeamId,
                        awayScore: 0,
                        homeScore: 0,
                        status: game.status,
                        gameTime: game.gameTime,
                        eligible: game.eligible,
                        awayTeamConference: 'SEC',
                        homeTeamConference: 'SEC'
                    }
                );
                console.log(`  ✅ Created game: ${game.awayTeamId} @ ${game.homeTeamId}`);
            } catch (error) {
                console.log(`  ⚠️ Game might already exist`);
            }
        }
    }

    async createSampleRankings() {
        console.log('🏆 Creating sample rankings...');
        
        const rankings = [
            { rank: 1, teamId: 'Georgia Bulldogs', name: 'Georgia Bulldogs', conference: 'SEC', points: 1500 },
            { rank: 2, teamId: 'Alabama Crimson Tide', name: 'Alabama Crimson Tide', conference: 'SEC', points: 1450 },
            { rank: 3, teamId: 'Michigan Wolverines', name: 'Michigan Wolverines', conference: 'Big Ten', points: 1400 },
            { rank: 4, teamId: 'Ohio State Buckeyes', name: 'Ohio State Buckeyes', conference: 'Big Ten', points: 1350 },
            { rank: 5, teamId: 'Clemson Tigers', name: 'Clemson Tigers', conference: 'ACC', points: 1300 }
        ];

        for (const ranking of rankings) {
            try {
                await this.appwriteService.databases.createDocument(
                    'college-football-fantasy',
                    'rankings',
                    this.appwriteService.client.ID.unique(),
                    {
                        rank: ranking.rank,
                        teamId: ranking.teamId,
                        name: ranking.name,
                        conference: ranking.conference,
                        week: 1,
                        points: ranking.points
                    }
                );
                console.log(`  ✅ Created ranking: #${ranking.rank} ${ranking.name}`);
            } catch (error) {
                console.log(`  ⚠️ Ranking might already exist`);
            }
        }
    }

    async createSampleLeague() {
        console.log('🏆 Creating sample league...');
        
        try {
            const currentUser = await this.appwriteService.getCurrentUser();
            if (!currentUser) {
                console.log('  ⚠️ No user logged in, skipping league creation');
                return;
            }

            const league = await this.appwriteService.databases.createDocument(
                'college-football-fantasy',
                'leagues',
                this.appwriteService.client.ID.unique(),
                {
                    name: 'Power 4 Elite League',
                    creatorId: currentUser.$id,
                    maxTeams: 12,
                    scoringType: 'PPR',
                    draftType: 'snake',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            );
            console.log(`  ✅ Created league: ${league.name}`);
            
            // Create a sample roster for the current user
            await this.createSampleRoster(league.$id, currentUser.$id);
            
        } catch (error) {
            console.log(`  ⚠️ League might already exist or user not logged in`);
        }
    }

    async createSampleRoster(leagueId, userId) {
        console.log('📋 Creating sample roster...');
        
        try {
            const roster = await this.appwriteService.databases.createDocument(
                'college-football-fantasy',
                'rosters',
                this.appwriteService.client.ID.unique(),
                {
                    leagueId: leagueId,
                    userId: userId,
                    teamName: 'Power 4 Champions',
                    starters: JSON.stringify(['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8']),
                    bench: JSON.stringify(['player9']),
                    ir: JSON.stringify([]),
                    createdAt: new Date().toISOString()
                }
            );
            console.log(`  ✅ Created roster: ${roster.teamName}`);
        } catch (error) {
            console.log(`  ⚠️ Roster might already exist`);
        }
    }
}

// Global function to run the sample data population
window.populateSampleData = async function() {
    const populator = new SampleDataPopulator();
    await populator.populateSampleData();
};

console.log('📦 Sample data populator loaded!');
console.log('💡 Run populateSampleData() in the console to populate test data.'); 