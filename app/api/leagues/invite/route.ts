import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get invite link or validate invite token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const leagueId = searchParams.get('leagueId') || searchParams.get('league');
    
    // If token is provided, validate it
    if (token && leagueId) {
      // Find the invite
      const invites = await databases.listDocuments(
        DATABASE_ID,
        'activity_log',
        [
          Query.equal('inviteToken', token),
          Query.equal('leagueId', leagueId),
          Query.equal('status', 'pending')
        ]
      );

      if (invites.documents.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
      }

      const invite = invites.documents[0];

      // Check if expired
      if (new Date(invite.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
      }

      // Get league details
      const league = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );

      return NextResponse.json({
        valid: true,
        league: {
          id: league.$id,
          name: league.name,
          commissioner: league.commissioner,
          maxTeams: league.maxTeams,
          currentTeams: league.currentTeams || league.members?.length || 0
        },
        invite: {
          email: invite.email,
          expiresAt: invite.expiresAt
        }
      });
    }
    
    // Otherwise, generate invite links for a league
    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }
    
    // Get user from session
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await userRes.json();
    
    // Get league details
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );
    
    // Check if user is commissioner or member
    const isMember = league.members?.includes(user.$id) || league.commissioner === user.$id;
    if (!isMember) {
      return NextResponse.json({ error: 'You must be a league member to get invite links' }, { status: 403 });
    }
    
    // Generate invite links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cfbfantasy.app';
    
    // Use the dedicated invite page for better OG preview
    const directLink = `${baseUrl}/invite/${leagueId}`;
    
    // Link with invite code if available
    const codeLink = league.inviteCode 
      ? `${baseUrl}/league/join?code=${league.inviteCode}&league=${leagueId}`
      : null;
    
    return NextResponse.json({
      success: true,
      league: {
        id: league.$id,
        name: league.name,
        inviteCode: league.inviteCode,
        isPrivate: league.isPrivate || Boolean(league.password),
        currentTeams: league.currentTeams || league.members?.length || 0,
        maxTeams: league.maxTeams
      },
      links: {
        direct: directLink,
        withCode: codeLink
      }
    });
    
  } catch (error: any) {
    console.error('GET invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process invite request' },
      { status: 500 }
    );
  }
}

// POST - Create and send invite
export async function POST(request: NextRequest) {
  try {
    const { leagueId, email, sendEmail = true } = await request.json();
    
    if (!leagueId || !email) {
      return NextResponse.json({ error: 'leagueId and email are required' }, { status: 400 });
    }

    // Get user from session
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await userRes.json();

    // Get league details
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Check if user is commissioner
    if (league.commissioner !== user.$id) {
      return NextResponse.json({ error: 'Only the commissioner can send invites' }, { status: 403 });
    }

    // Check if league has space
    const currentTeams = league.currentTeams || league.members?.length || 0;
    if (currentTeams >= league.maxTeams) {
      return NextResponse.json({ error: 'League is full' }, { status: 400 });
    }

    // Generate a unique invite token
    const inviteToken = ID.unique();
    
    // Create invite record
    const invite = await databases.createDocument(
      DATABASE_ID,
      'activity_log',
      ID.unique(),
      {
        type: 'league_invite',
        leagueId,
        leagueName: league.name,
        email,
        inviteToken,
        inviteCode: league.inviteCode,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        createdAt: new Date().toISOString(),
        createdBy: user.$id
      }
    );

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cfbfantasy.app';
    const inviteLink = `${baseUrl}/league/join?token=${inviteToken}&league=${leagueId}`;

    // Send email if requested (you'll need to implement email service)
    if (sendEmail) {
      // TODO: Implement email sending via SendGrid, Resend, or another service
      console.log('Email invite would be sent to:', email);
      console.log('Invite link:', inviteLink);
    }

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.$id,
        inviteToken,
        inviteLink,
        expiresAt: invite.expiresAt
      },
      league: {
        id: league.$id,
        name: league.name,
        inviteCode: league.inviteCode
      }
    });

  } catch (error: any) {
    console.error('Create invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create invite' },
      { status: 500 }
    );
  }
}