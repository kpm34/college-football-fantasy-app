import { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { code?: string; league?: string };
}): Promise<Metadata> {
  const leagueName = searchParams.league || 'College Football Fantasy League';
  
  return {
    title: `Join ${leagueName} - College Football Fantasy`,
    description: 'Join our exclusive Power 4 college football fantasy league. Draft your team and compete for glory!',
    openGraph: {
      title: `Join ${leagueName}`,
      description: '🏈 Join our exclusive Power 4 college football fantasy league!',
      type: 'website',
      images: [
        {
          url: '/api/og/league-invite',
          width: 1200,
          height: 630,
          alt: 'College Football Fantasy League Invitation',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Join ${leagueName}`,
      description: '🏈 Join our exclusive Power 4 college football fantasy league!',
      images: ['/api/og/league-invite'],
    },
  };
}
