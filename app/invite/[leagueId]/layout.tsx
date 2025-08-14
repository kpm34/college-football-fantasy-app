import { Metadata } from 'next';

interface Props {
  params: Promise<{ leagueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leagueId } = await params;
  
  return {
    title: 'Join League - CFB Fantasy',
    description: 'You\'ve been invited to join a College Football Fantasy league!',
    openGraph: {
      title: 'Join League - CFB Fantasy',
      description: 'You\'ve been invited to join a Power 4 Conference Fantasy Football league!',
      url: `https://cfbfantasy.app/invite/${leagueId}`,
      siteName: 'CFB Fantasy',
      images: [
        {
          url: `https://cfbfantasy.app/api/og/league-invite?league=${leagueId}`,
          width: 1200,
          height: 630,
          alt: 'Join League - CFB Fantasy',
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Join League - CFB Fantasy',
      description: 'You\'ve been invited to join a College Football Fantasy league!',
      images: [`https://cfbfantasy.app/api/og/league-invite?league=${leagueId}`],
    },
  };
}

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
