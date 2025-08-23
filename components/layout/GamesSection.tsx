'use client';

import { useGames } from '@lib/hooks/useGames';
import { GamesGrid } from '@components/features/games/GamesGrid';
import { Button } from '@components/ui/Button';
import { Card, CardContent } from '@components/ui/Card';

export function GamesSection() {
  const { games, loading, error } = useGames({ autoRefresh: true });

  return (
    <section className="py-20 px-4 relative bg-black/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-8 chrome-text">
          This Week's Games
        </h2>
        
        <Card className="mb-12 max-w-4xl mx-auto">
          <CardContent className="text-center text-lg">
            Games with chrome borders are eligible for fantasy scoring - AP Top 25 matchups or conference games only!
          </CardContent>
        </Card>
        
        <div className="mb-8">
          <GamesGrid games={games} loading={loading} error={error} />
        </div>
        
        {!loading && !error && games.length > 0 && (
          <div className="text-center">
            <Button variant="primary">
              View All Games
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}