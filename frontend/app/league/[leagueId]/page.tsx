'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import LeaguePortal from '@/components/LeaguePortal';

interface LeagueHomePageProps {
  params: Promise<{ leagueId: string }>;
}

interface League {
  $id: string;
  name: string;
  creator: string;
  format: string;
  scoring: string;
  teams: number;
  maxTeams: number;
  status: 'draft' | 'active' | 'completed';
  draftScheduled: boolean;
  draftDate?: string;
  lmNote?: string;
  createdAt: string;
}

interface Team {
  $id: string;
  name: string;
  owner: string;
  leagueId: string;
  record: string;
  pointsFor: number;
  pointsAgainst: number;
}

export default function LeagueHomePage({ params }: LeagueHomePageProps) {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState<string>('');
  const [league, setLeague] = useState<League | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'members' | 'rosters'>('settings');

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Load league data
  useEffect(() => {
    if (leagueId) {
      loadLeagueData();
    }
  }, [leagueId]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      
      // Load league from Appwrite
      const leagueResponse = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
      setLeague(leagueResponse as unknown as League);

      // Load user's team (you'd get the actual user ID from auth)
      const teamsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [
          // Add filters for this league and user
        ]
      );
      const teams = teamsResponse.documents as unknown as Team[];
      if (teams.length > 0) {
        setUserTeam(teams[0]); // For now, just get the first team
      }

    } catch (error) {
      console.error('Error loading league data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteManagers = () => {
    // Open invite modal or redirect to invite page
    router.push(`/league/${leagueId}/invite`);
  };

  const handleScheduleDraft = () => {
    // Redirect to draft scheduling page
    router.push(`/league/${leagueId}/draft/schedule`);
  };

  const handleViewRoster = () => {
    // Redirect to team roster page
    router.push(`/team/${userTeam?.$id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading league...</p>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏈</div>
          <h1 className="text-2xl font-bold text-white mb-2">League Not Found</h1>
          <p className="text-gray-400">The league you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

    return (
    <LeaguePortal leagueId={leagueId} leagueName={league.name} />
  );
} 