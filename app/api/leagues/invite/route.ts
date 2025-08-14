import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { leagueId, email, sendEmail = true } = await request.json();
    
    if (!leagueId || !email) {
      return NextResponse.json({ error: 'leagueId and email are required' }, { status: 400 });
    }

    // Get league details
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Check if league has space
    if (league.members?.length >= league.maxTeams) {
      return NextResponse.json({ error: 'League is full' }, { status: 400 });
    }

    // Generate a unique invite token
    const inviteToken = ID.unique();
    
    // Create invite record
    const invite = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ACTIVITY_LOG,
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
        createdBy: league.commissioner || league.commissionerId
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
        email,
        inviteLink,
        inviteCode: league.inviteCode,
        expiresAt: invite.expiresAt
      }
    });

  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}

// GET endpoint to validate invite tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const leagueId = searchParams.get('league');

    if (!token || !leagueId) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 400 });
    }

    // Find the invite
    const invites = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ACTIVITY_LOG,
      [
        `equal("inviteToken", "${token}")`,
        `equal("leagueId", "${leagueId}")`,
        `equal("status", "pending")`
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
        currentTeams: league.members?.length || 0
      },
      invite: {
        email: invite.email,
        expiresAt: invite.expiresAt
      }
    });

  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json({ error: 'Failed to validate invite' }, { status: 500 });
  }
}
