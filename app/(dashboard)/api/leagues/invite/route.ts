import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
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
      // Find the invite using the inviteToken field
      const invites = await databases.listDocuments(
        DATABASE_ID,
        'activity_log',
        [
          Query.equal('type', 'league_invite'),
          Query.equal('leagueId', leagueId),
          Query.equal('inviteToken', token),
          Query.equal('status', 'pending')
        ]
      );

      if (invites.documents.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
      }

      const invite = invites.documents[0];
      
      // Check if expired
      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
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
          name: league.leagueName,
          commissioner: league.commissioner,
          maxTeams: league.maxTeams,
          currentTeams: league.currentTeams || league.members?.length || 0
        },
        invite: {
          email: invite.data ? JSON.parse(invite.data).email : null,
          expiresAt: invite.expiresAt
        }
      });
    }

    // Support token-only validation by resolving the leagueId from the invite record
    if (token && !leagueId) {
      const invites = await databases.listDocuments(
        DATABASE_ID,
        'activity_log',
        [
          Query.equal('type', 'league_invite'),
          Query.equal('inviteToken', token),
          Query.equal('status', 'pending')
        ]
      );

      if (invites.documents.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
      }

      const invite: any = invites.documents[0];
      const resolvedLeagueId: string | undefined = invite.leagueId;

      if (!resolvedLeagueId) {
        return NextResponse.json({ error: 'Invalid invite: league not found' }, { status: 400 });
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
      }

      const league = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        resolvedLeagueId
      );

      return NextResponse.json({
        valid: true,
        league: {
          id: league.$id,
          name: league.leagueName,
          commissioner: league.commissioner,
          maxTeams: league.maxTeams,
          currentTeams: league.currentTeams || league.members?.length || 0
        },
        invite: {
          email: invite.data ? JSON.parse(invite.data).email : null,
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
    
    // No more invite code links - removed legacy invite code system
    
    return NextResponse.json({
      success: true,
      league: {
        id: league.$id,
        name: league.name,
        isPrivate: league.isPrivate || Boolean(league.password),
        currentTeams: league.currentTeams || league.members?.length || 0,
        maxTeams: league.maxTeams
      },
      links: {
        direct: directLink
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
    
    // Check if user is commissioner or member
    const isMember = league.members?.includes(user.$id) || league.commissioner === user.$id;
    if (!isMember) {
      return NextResponse.json({ error: 'You must be a league member to send invites' }, { status: 403 });
    }
    
    // Generate unique invite token
    const inviteToken = ID.unique();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Store invite in activity_log with proper fields
    const inviteData = {
      email: email,
      sentBy: user.$id,
      sentAt: new Date().toISOString()
    };
    
    await databases.createDocument(
      DATABASE_ID,
      'activity_log',
      ID.unique(),
      {
        type: 'league_invite',
        userId: user.$id,
        leagueId: leagueId,
        description: `${user.name || user.email} invited ${email} to join ${league.leagueName}`,
        data: JSON.stringify(inviteData),
        inviteToken: inviteToken,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      }
    );
    
    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cfbfantasy.app';
    const inviteLink = `${baseUrl}/league/join?token=${inviteToken}&league=${leagueId}`;
    
    // Send email if requested
    if (sendEmail) {
      try {
        // Use Appwrite Functions to send email
        await fetch('https://nyc.cloud.appwrite.io/v1/functions/email-invite/executions', {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': 'college-football-fantasy-app',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            leagueName: league.leagueName,
            inviteLink: inviteLink,
            inviterName: user.name || user.email,
            expiresAt: expiresAt.toISOString()
          })
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    return NextResponse.json({
      success: true,
      inviteToken: inviteToken,
      inviteLink: inviteLink,
      expiresAt: expiresAt.toISOString()
    });
    
  } catch (error: any) {
    console.error('POST invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create invite' },
      { status: 500 }
    );
  }
}