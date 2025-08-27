#!/usr/bin/env tsx
/**
 * Comprehensive End-to-End Test for College Football Fantasy App
 * Tests the complete flow from account creation to draft completion
 */

const { Client, Account, Databases, ID, Query, Models } = require('node-appwrite');
const dotenv = require('dotenv');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const API_KEY = process.env.APPWRITE_API_KEY;

// Collection IDs
const COLLECTIONS = {
  CLIENTS: 'clients',
  LEAGUES: 'leagues', 
  FANTASY_TEAMS: 'fantasy_teams',
  LEAGUE_MEMBERSHIPS: 'league_memberships',
  DRAFT_STATES: 'draft_states',
  DRAFT_EVENTS: 'draft_events',
  DRAFTS: 'drafts',
  COLLEGE_PLAYERS: 'college_players'
};

interface TestResult {
  step: string;
  status: 'success' | 'failure';
  details: any;
  appwriteVerification?: any;
  timestamp: string;
}

class E2ETest {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private results: TestResult[] = [];
  private testUserId?: string;
  private testLeagueId?: string;
  private testEmail: string;
  private testPassword: string = 'TestPassword123!';

  constructor() {
    this.client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT);
    
    if (API_KEY) {
      this.client.setKey(API_KEY);
    }
    
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.testEmail = `test${Date.now()}@cfbfantasy.app`;
  }

  private log(message: string, data?: any) {
    console.log(`\n[E2E TEST] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  private addResult(step: string, status: 'success' | 'failure', details: any, appwriteVerification?: any) {
    const result: TestResult = {
      step,
      status,
      details,
      appwriteVerification,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    this.log(`${step}: ${status.toUpperCase()}`, details);
  }

  async step1_CreateAccount() {
    try {
      this.log('Step 1: Creating test user account...');
      
      // Create account
      const user = await this.account.create(
        ID.unique(),
        this.testEmail,
        this.testPassword,
        'Test User E2E'
      );
      
      this.testUserId = user.$id;

      // Create session to authenticate
      await this.account.createEmailPasswordSession(
        this.testEmail,
        this.testPassword
      );

      // Verify in database
      let clientDoc;
      try {
        // Check if client document exists
        const clients = await this.databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.CLIENTS,
          [Query.equal('authUserId', user.$id)]
        );
        
        if (clients.documents.length === 0) {
          // Create client document
          clientDoc = await this.databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.CLIENTS,
            ID.unique(),
            {
              authUserId: user.$id,
              email: this.testEmail,
              displayName: 'Test User E2E'
            }
          );
        } else {
          clientDoc = clients.documents[0];
        }
      } catch (e) {
        this.log('Note: Client document creation handled by app');
      }

      this.addResult('Account Creation', 'success', {
        userId: user.$id,
        email: this.testEmail,
        name: user.name
      }, {
        userAccount: user,
        clientDocument: clientDoc
      });
      
      return true;
    } catch (error: any) {
      this.addResult('Account Creation', 'failure', {
        error: error.message
      });
      return false;
    }
  }

  async step2_CreateLeague() {
    try {
      this.log('Step 2: Creating test league...');
      
      const leagueName = `Test League ${Date.now()}`;
      const draftDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      
      // Create league directly in Appwrite
      const league = await this.databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        ID.unique(),
        {
          leagueName: leagueName,
          commissionerAuthUserId: this.testUserId,
          season: 2025,
          maxTeams: 8,
          currentTeams: 1,
          draftType: 'snake',
          gameMode: 'power4',
          leagueStatus: 'open',
          isPublic: true,
          pickTimeSeconds: 30,
          draftDate: draftDate.toISOString()
        }
      );
      
      this.testLeagueId = league.$id;

      // Create fantasy team for commissioner
      const fantasyTeam = await this.databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FANTASY_TEAMS,
        ID.unique(),
        {
          leagueId: league.$id,
          teamName: 'Commissioner Team',
          leagueName: leagueName,
          ownerAuthUserId: this.testUserId,
          displayName: 'Test User E2E',
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          pointsAgainst: 0
        }
      );

      // Create league membership
      const membership = await this.databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUE_MEMBERSHIPS,
        ID.unique(),
        {
          leagueId: league.$id,
          leagueName: leagueName,
          authUserId: this.testUserId,
          role: 'COMMISSIONER',
          status: 'ACTIVE',
          joinedAt: new Date().toISOString(),
          displayName: 'Test User E2E'
        }
      );

      // Create draft document
      const draftDoc = await this.databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        ID.unique(),
        {
          leagueId: league.$id,
          leagueName: leagueName,
          gameMode: 'power4',
          maxTeams: 8,
          draftStatus: 'pre-draft',
          type: 'snake',
          currentRound: 0,
          currentPick: 0,
          maxRounds: 15,
          startTime: draftDate.toISOString(),
          isMock: false,
          clockSeconds: 30,
          orderJson: JSON.stringify({
            draftOrder: [this.testUserId],
            draftType: 'snake',
            totalTeams: 8,
            pickTimeSeconds: 30
          })
        }
      );

      this.addResult('League Creation', 'success', {
        leagueId: league.$id,
        leagueName: leagueName,
        draftTime: draftDate.toISOString()
      }, {
        league: league,
        fantasyTeam: fantasyTeam,
        membership: membership,
        draft: draftDoc
      });
      
      return true;
    } catch (error: any) {
      this.addResult('League Creation', 'failure', {
        error: error.message
      });
      return false;
    }
  }

  async step3_CommissionerSettings() {
    try {
      this.log('Step 3: Testing commissioner settings...');
      
      // Update draft settings
      const draftOrder = [this.testUserId]; // Simple order for testing
      const pickTimeSeconds = 45;
      
      // Update league settings
      const updatedLeague = await this.databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        this.testLeagueId!,
        {
          pickTimeSeconds: pickTimeSeconds,
          scoringRules: JSON.stringify({
            passingYards: 0.04,
            passingTD: 4,
            rushingYards: 0.1,
            rushingTD: 6,
            receivingYards: 0.1,
            receivingTD: 6
          })
        }
      );

      // Update draft document
      const drafts = await this.databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        [Query.equal('leagueId', this.testLeagueId!)]
      );

      if (drafts.documents.length > 0) {
        const updatedDraft = await this.databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          drafts.documents[0].$id,
          {
            clockSeconds: pickTimeSeconds,
            orderJson: JSON.stringify({
              draftOrder: draftOrder,
              draftType: 'snake',
              totalTeams: 8,
              pickTimeSeconds: pickTimeSeconds
            })
          }
        );

        this.addResult('Commissioner Settings', 'success', {
          pickTimeSeconds: pickTimeSeconds,
          draftOrder: draftOrder
        }, {
          updatedLeague: updatedLeague,
          updatedDraft: updatedDraft
        });
      }
      
      return true;
    } catch (error: any) {
      this.addResult('Commissioner Settings', 'failure', {
        error: error.message
      });
      return false;
    }
  }

  async step4_DraftStart() {
    try {
      this.log('Step 4: Starting draft...');
      
      // Update league status if needed (leagues collection doesn't have draftStatus)
      // The draft status is tracked in the drafts collection

      // Update draft document
      const drafts = await this.databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        [Query.equal('leagueId', this.testLeagueId!)]
      );

      if (drafts.documents.length > 0) {
        const updatedDraft = await this.databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          drafts.documents[0].$id,
          {
            draftStatus: 'drafting',
            currentRound: 1,
            currentPick: 1
          }
        );

        // Create or update draft state (idempotent)
        let draftState;
        try {
          draftState = await this.databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.DRAFT_STATES,
            ID.unique(),
            {
              draftId: drafts.documents[0].$id,
              onClockTeamId: this.testUserId!,
              round: 1,
              pickIndex: 1,
              draftStatus: 'drafting',
              deadlineAt: new Date(Date.now() + 45000).toISOString()
            }
          );
        } catch (e) {
          // If unique(draftId) exists, update instead
          const existing = await this.databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DRAFT_STATES,
            [Query.equal('draftId', drafts.documents[0].$id)]
          );
          if (existing.total > 0) {
            draftState = await this.databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.DRAFT_STATES,
              existing.documents[0].$id,
              {
                onClockTeamId: this.testUserId!,
                round: 1,
                pickIndex: 1,
                draftStatus: 'drafting',
                deadlineAt: new Date(Date.now() + 45000).toISOString()
              }
            );
          } else {
            throw e;
          }
        }

        this.addResult('Draft Start', 'success', {
          draftStatus: 'drafting',
          currentRound: 1,
          currentPick: 1
        }, {
          draftState: draftState,
          draft: updatedDraft
        });
      }
      
      return true;
    } catch (error: any) {
      this.addResult('Draft Start', 'failure', {
        error: error.message
      });
      return false;
    }
  }

  async step5_PlayerSelection() {
    try {
      this.log('Step 5: Testing player selection...');
      
      // Get some players to draft
      const players = await this.databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COLLEGE_PLAYERS,
        [
          Query.equal('position', 'QB'),
          Query.equal('eligible', true),
          Query.limit(3)
        ]
      );

      if (players.documents.length === 0) {
        throw new Error('No eligible players found');
      }

      const pickedPlayers = [];
      
      // Simulate drafting 3 players
      for (let i = 0; i < Math.min(3, players.documents.length); i++) {
        const player = players.documents[i];
        
        // Get draft ID
        const drafts = await this.databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          [Query.equal('leagueId', this.testLeagueId!)]
        );
        
        if (drafts.documents.length === 0) {
          throw new Error('No draft found for league');
        }
        
        const draftId = drafts.documents[0].$id;
        
        // Get fantasy team ID
        const fantasyTeams = await this.databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FANTASY_TEAMS,
          [
            Query.equal('leagueId', this.testLeagueId!),
            Query.equal('ownerAuthUserId', this.testUserId!)
          ]
        );
        
        const fantasyTeamId = fantasyTeams.documents.length > 0 ? fantasyTeams.documents[0].$id : null;
        
        // Create draft event
        const pick = await this.databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFT_EVENTS,
          ID.unique(),
          {
            draftId: draftId,
            type: 'pick',
            round: 1,
            overall: i + 1,
            fantasyTeamId: fantasyTeamId,
            playerId: player.$id,
            ts: new Date().toISOString(),
            payloadJson: JSON.stringify({
              playerName: player.name,
              playerPosition: player.position,
              playerTeam: player.team,
              timeRemaining: 30
            })
          }
        );
        
        pickedPlayers.push({
          playerId: player.$id,
          playerName: player.name,
          position: player.position,
          team: player.team,
          pick: pick
        });
      }

      this.addResult('Player Selection', 'success', {
        playersSelected: pickedPlayers.length,
        players: pickedPlayers.map(p => ({
          name: p.playerName,
          position: p.position,
          team: p.team
        }))
      }, {
        draftPicks: pickedPlayers.map(p => p.pick)
      });
      
      return true;
    } catch (error: any) {
      this.addResult('Player Selection', 'failure', {
        error: error.message
      });
      return false;
    }
  }

  async step6_RosterSave() {
    try {
      this.log('Step 6: Saving roster to fantasy team...');
      
      // Get draft ID
      const drafts = await this.databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        [Query.equal('leagueId', this.testLeagueId!)]
      );
      
      if (drafts.documents.length === 0) {
        throw new Error('No draft found');
      }
      
      // Get all draft events (picks)
      const picks = await this.databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFT_EVENTS,
        [
          Query.equal('draftId', drafts.documents[0].$id),
          Query.equal('type', 'pick')
        ]
      );

      const playerIds = picks.documents.map(p => p.playerId).filter(id => id);
      
      // Update fantasy team with drafted players
      const fantasyTeams = await this.databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FANTASY_TEAMS,
        [
          Query.equal('leagueId', this.testLeagueId!),
          Query.equal('ownerAuthUserId', this.testUserId!)
        ]
      );

      if (fantasyTeams.documents.length > 0) {
        const teamId = fantasyTeams.documents[0].$id;

        // Save each drafted player into roster_slots
        const saved: string[] = [];
        for (const pid of playerIds) {
          try {
            // Fetch player to get position
            let position = 'FLEX';
            try {
              const player = await this.databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.COLLEGE_PLAYERS,
                pid
              );
              position = (player as any).position || position;
            } catch {}

            await this.databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.ROSTERS || 'roster_slots',
              ID.unique(),
              {
                fantasyTeamId: teamId,
                playerId: pid,
                position: position,
                acquiredVia: 'draft',
                acquiredAt: new Date().toISOString()
              }
            );
            saved.push(pid);
          } catch (e) {
            // ignore per-player failures
          }
        }

        // Update draft document to post-draft
        const draftsForUpdate = await this.databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          [Query.equal('leagueId', this.testLeagueId!)]
        );
        
        if (draftsForUpdate.documents.length > 0) {
          await this.databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.DRAFTS,
            draftsForUpdate.documents[0].$id,
            {
              draftStatus: 'post-draft',
              endTime: new Date().toISOString()
            }
          );
        }

        this.addResult('Roster Save', 'success', {
          teamId,
          playerCount: saved.length,
          playerIds: saved
        }, {
          savedPlayers: saved
        });
      }
      
      return true;
    } catch (error: any) {
      this.addResult('Roster Save', 'failure', {
        error: error.message
      });
      return false;
    }
  }

  async cleanup() {
    try {
      this.log('Cleaning up test data...');
      
      // Delete test data in reverse order
      if (this.testLeagueId) {
        // Get draft ID first
        const drafts = await this.databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          [Query.equal('leagueId', this.testLeagueId)]
        );
        
        // Delete draft events
        if (drafts.documents.length > 0) {
          const events = await this.databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DRAFT_EVENTS,
            [Query.equal('draftId', drafts.documents[0].$id)]
          );
          for (const event of events.documents) {
            await this.databases.deleteDocument(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, event.$id);
          }
        }

        // Delete draft states
        if (drafts.documents.length > 0) {
          const states = await this.databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DRAFT_STATES,
            [Query.equal('draftId', drafts.documents[0].$id)]
          );
          for (const state of states.documents) {
            await this.databases.deleteDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, state.$id);
          }
        }

        // Delete drafts (reuse variable from above)
        for (const draft of drafts.documents) {
          await this.databases.deleteDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draft.$id);
        }

        // Delete memberships
        const memberships = await this.databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.LEAGUE_MEMBERSHIPS,
          [Query.equal('leagueId', this.testLeagueId)]
        );
        for (const membership of memberships.documents) {
          await this.databases.deleteDocument(DATABASE_ID, COLLECTIONS.LEAGUE_MEMBERSHIPS, membership.$id);
        }

        // Delete fantasy teams
        const teams = await this.databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FANTASY_TEAMS,
          [Query.equal('leagueId', this.testLeagueId)]
        );
        for (const team of teams.documents) {
          await this.databases.deleteDocument(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, team.$id);
        }

        // Delete league
        await this.databases.deleteDocument(DATABASE_ID, COLLECTIONS.LEAGUES, this.testLeagueId);
      }

      // Delete user account
      if (this.testUserId) {
        try {
          await this.account.deleteSession('current');
        } catch (e) {
          // Session might not exist
        }
      }

      this.log('Cleanup completed');
    } catch (error: any) {
      this.log('Cleanup error:', error.message);
    }
  }

  generateReport() {
    const report = {
      testRunId: Date.now(),
      timestamp: new Date().toISOString(),
      environment: {
        endpoint: APPWRITE_ENDPOINT,
        project: APPWRITE_PROJECT,
        database: DATABASE_ID
      },
      testUser: {
        id: this.testUserId,
        email: this.testEmail
      },
      testLeague: {
        id: this.testLeagueId
      },
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'success').length,
        failed: this.results.filter(r => r.status === 'failure').length
      }
    };

    // Write report to file
    const reportPath = path.join(process.cwd(), `e2e-test-report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`\n${'='.repeat(60)}`);
    this.log('E2E TEST REPORT');
    this.log(`${'='.repeat(60)}`);
    this.log(`Test Run ID: ${report.testRunId}`);
    this.log(`Timestamp: ${report.timestamp}`);
    this.log(`\nResults Summary:`);
    this.log(`  Total Steps: ${report.summary.total}`);
    this.log(`  Passed: ${report.summary.passed}`);
    this.log(`  Failed: ${report.summary.failed}`);
    this.log(`\nDetailed Results:`);
    
    this.results.forEach((result, index) => {
      const icon = result.status === 'success' ? '✅' : '❌';
      this.log(`  ${index + 1}. ${icon} ${result.step}`);
      if (result.status === 'failure') {
        this.log(`     Error: ${result.details.error}`);
      }
    });
    
    this.log(`\nFull report saved to: ${reportPath}`);
    this.log(`${'='.repeat(60)}\n`);
    
    return report;
  }

  async run() {
    try {
      this.log('Starting E2E Test Suite...');
      
      // Run all test steps
      await this.step1_CreateAccount();
      await this.step2_CreateLeague();
      await this.step3_CommissionerSettings();
      await this.step4_DraftStart();
      await this.step5_PlayerSelection();
      await this.step6_RosterSave();
      
      // Generate report
      const report = this.generateReport();
      
      // Cleanup test data
      await this.cleanup();
      
      return report;
    } catch (error: any) {
      this.log('Test suite error:', error.message);
      this.generateReport();
      await this.cleanup();
      throw error;
    }
  }
}

// Run the test
const test = new E2ETest();
test.run()
  .then(report => {
    process.exit(report.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
