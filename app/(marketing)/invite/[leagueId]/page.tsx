import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';

interface InvitePageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { leagueId } = await params;
  
  try {
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );
    
    return {
      title: `Join ${league.name} - CFB Fantasy`,
      description: `You've been invited to join ${league.name} fantasy football league. ${league.currentTeams || 0}/${league.maxTeams} teams.`,
      openGraph: {
        title: `Join ${league.name}`,
        description: `You've been invited to join ${league.name} fantasy football league. ${league.currentTeams || 0}/${league.maxTeams} teams.`,
        images: ['https://cfbfantasy.app/api/og/league-invite'],
        url: `https://cfbfantasy.app/invite/${leagueId}`,
        siteName: 'CFB Fantasy',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Join ${league.name}`,
        description: `You've been invited to join ${league.name} fantasy football league.`,
        images: ['https://cfbfantasy.app/api/og/league-invite'],
      },
    };
  } catch (error) {
    return {
      title: 'Join League - CFB Fantasy',
      description: 'Join a college football fantasy league',
      openGraph: {
        title: 'Join League - CFB Fantasy',
        description: 'Join a college football fantasy league',
        images: ['https://cfbfantasy.app/api/og/league-invite'],
        url: 'https://cfbfantasy.app/league/join',
        siteName: 'CFB Fantasy',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Join League - CFB Fantasy',
        description: 'Join a college football fantasy league',
        images: ['https://cfbfantasy.app/api/og/league-invite'],
      },
    };
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { leagueId } = await params;
  
  // Server-side redirect to the join page
  redirect(`/league/join?league=${leagueId}`);
}
