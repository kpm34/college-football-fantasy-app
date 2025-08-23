import { NextRequest, NextResponse } from 'next/server';
import { getTeamsByConference, normalizeColors } from '@lib/conference-data';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(
  request: NextRequest,
  { params }: { params: { conference: string } }
) {
  try {
    const conference = params.conference.toUpperCase().replace('-', '');
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'teams';

    // Normalize conference name
    let normalizedConference = conference;
    if (conference === 'BIG12') normalizedConference = 'Big 12';
    if (conference === 'BIGTEN' || conference === 'BIG10') normalizedConference = 'Big Ten';
    if (conference === 'ACC') normalizedConference = 'ACC';
    if (conference === 'SEC') normalizedConference = 'SEC';

    switch (type) {
      case 'teams': {
        const teams = getTeamsByConference(conference);
        if (teams.length === 0) {
          return NextResponse.json(
            { error: `Conference ${conference} not found` },
            { status: 404 }
          );
        }

        // Normalize colors to array format for consistent response
        const normalizedTeams = teams.map(team => ({
          ...team,
          colors: normalizeColors(team),
          created_at: new Date().toISOString()
        }));

        return NextResponse.json({
          success: true,
          conference: normalizedConference,
          data: normalizedTeams,
          count: normalizedTeams.length
        });
      }

      case 'players': {
        try {
          // Fetch players from Appwrite database
          const playersResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PLAYERS,
            [
              Query.equal('conference', normalizedConference),
              Query.orderDesc('rating'),
              Query.limit(100)
            ]
          );

          const players = playersResponse.documents.map(player => ({
            id: player.$id,
            name: player.name,
            position: player.position || player.pos,
            team: player.team || player.school,
            rating: player.rating || player.overall_rating || 75,
            conference: player.conference,
            year: player.year,
            height: player.height,
            weight: player.weight,
            jersey: player.jersey,
            draftable: player.draftable !== false
          }));

          return NextResponse.json({
            success: true,
            conference: normalizedConference,
            data: players,
            count: players.length,
            total: playersResponse.total
          });
        } catch (dbError) {
          console.error('Database error fetching players:', dbError);
          // Return empty array if database fails
          return NextResponse.json({
            success: true,
            conference: normalizedConference,
            data: [],
            count: 0,
            error: 'Unable to fetch players from database'
          });
        }
      }

      case 'games': {
        try {
          // Fetch games from Appwrite database
          const teams = getTeamsByConference(conference);
          const teamNames = teams.map(t => t.name);
          
          const gamesResponse = await databases.listDocuments(
            DATABASE_ID,
            'games',
            [
              Query.orderAsc('week'),
              Query.limit(100)
            ]
          );

          // Filter games for this conference
          const conferenceGames = gamesResponse.documents.filter(game => 
            teamNames.some(team => 
              game.home_team?.includes(team) || 
              game.away_team?.includes(team) ||
              game.homeTeam?.includes(team) || 
              game.awayTeam?.includes(team)
            )
          );

          const games = conferenceGames.map(game => ({
            id: game.$id,
            homeTeam: game.home_team || game.homeTeam,
            awayTeam: game.away_team || game.awayTeam,
            week: game.week,
            date: game.date || game.start_date,
            time: game.time || game.start_time,
            homeScore: game.home_score || game.homeScore || null,
            awayScore: game.away_score || game.awayScore || null,
            status: game.status || 'scheduled'
          }));

          return NextResponse.json({
            success: true,
            conference: normalizedConference,
            data: games,
            count: games.length
          });
        } catch (dbError) {
          console.error('Database error fetching games:', dbError);
          return NextResponse.json({
            success: true,
            conference: normalizedConference,
            data: [],
            count: 0,
            error: 'Unable to fetch games from database'
          });
        }
      }

      case 'stats': {
        try {
          const teams = getTeamsByConference(conference);
          
          // Get player count from database
          const playersResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PLAYERS,
            [
              Query.equal('conference', normalizedConference),
              Query.limit(1)
            ]
          );

          return NextResponse.json({
            success: true,
            conference: normalizedConference,
            data: {
              totalTeams: teams.length,
              totalPlayers: playersResponse.total || 0,
              lastUpdated: new Date().toISOString()
            }
          });
        } catch (dbError) {
          return NextResponse.json({
            success: true,
            conference: normalizedConference,
            data: {
              totalTeams: getTeamsByConference(conference).length,
              totalPlayers: 0,
              lastUpdated: new Date().toISOString()
            }
          });
        }
      }

      case 'draft-board': {
        try {
          // Fetch draftable players from database
          const playersResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PLAYERS,
            [
              Query.equal('conference', normalizedConference),
              Query.equal('draftable', true),
              Query.orderDesc('rating'),
              Query.limit(200)
            ]
          );

          const draftBoard = playersResponse.documents.map((player, index) => ({
            id: player.$id,
            name: player.name,
            position: player.position || player.pos,
            team: player.team || player.school,
            rating: player.rating || player.overall_rating || 75,
            conference: player.conference,
            rank: index + 1,
            adp: player.adp || index + 1,
            draftable: true,
            year: player.year,
            height: player.height,
            weight: player.weight
          }));

          return NextResponse.json({
            success: true,
            conference: normalizedConference,
            data: draftBoard,
            count: draftBoard.length
          });
        } catch (dbError) {
          console.error('Database error fetching draft board:', dbError);
          return NextResponse.json({
            success: true,
            conference: normalizedConference,
            data: [],
            count: 0,
            error: 'Unable to fetch draft board from database'
          });
        }
      }

      default:
        return NextResponse.json(
          { error: `Invalid type: ${type}. Use teams, players, games, stats, or draft-board` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Conference API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conference data' },
      { status: 500 }
    );
  }
}