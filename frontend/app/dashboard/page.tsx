"use client";

import { useEffect, useState } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrophyIcon, UserGroupIcon, CalendarIcon } from "@heroicons/react/24/outline";

type League = {
  id: string;
  name: string;
  status: string;
  maxTeams: number;
  commissioner: string;
  draftDate?: string;
};

type TeamInfo = {
  leagueId: string;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Record<string, TeamInfo>>({});
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        // Check if user is authenticated
        const user = await account.get();
        if (!cancelled) {
          setUserName(user.name || user.email);
          
          // Get user's leagues by email
          let userLeagues: string[] = [];
          let userLeagueNames: string[] = [];
          const userEmail = user.email;
          
          try {
            // First try to find user document by email
            const userDocs = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.USERS,
              [`equal("email", "${userEmail}")`]
            );
            
            if (userDocs.documents.length > 0) {
              const userDoc = userDocs.documents[0];
              userLeagues = (userDoc as any).leagues || [];
              userLeagueNames = (userDoc as any).leagueNames || [];
            }
          } catch (docError) {
            console.log('Error finding user by email:', docError);
          }
          
          // If no leagues found in user doc, try roster-based approach with multiple ID fields
          if (userLeagues.length === 0) {
            try {
              // Try to find rosters by email first
              let rostersRes = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.ROSTERS,
                [`equal("email", "${userEmail}")`]
              );
              
              // If not found by email, try by userName
              if (rostersRes.documents.length === 0 && user.name) {
                rostersRes = await databases.listDocuments(
                  DATABASE_ID,
                  COLLECTIONS.ROSTERS,
                  [`equal("userName", "${user.name}")`]
                );
              }
              
              // Last resort: try by any userId field
              if (rostersRes.documents.length === 0) {
                rostersRes = await databases.listDocuments(
                  DATABASE_ID,
                  COLLECTIONS.ROSTERS,
                  [`equal("userId", "${user.$id}")`]
                );
              }
              
              if (rostersRes.documents.length > 0) {
                const leagueIds = [...new Set(rostersRes.documents.map((r: any) => r.leagueId))];
                userLeagues = leagueIds as string[];
              }
            } catch (rosterError) {
              console.error('Error fetching rosters:', rosterError);
            }
          }
          
          if (userLeagues.length > 0) {
            // Fetch full league details
            const leagueDetails = await Promise.all(
              userLeagues.map(async (leagueId: string, index: number) => {
                try {
                  const league = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.LEAGUES,
                    leagueId
                  );
                  
                  // Get team info for this league - try multiple approaches
                  let rosterDocs = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.ROSTERS,
                    [`equal("leagueId", "${leagueId}")`, `equal("email", "${userEmail}")`]
                  );
                  
                  // If not found by email, try by userName
                  if (rosterDocs.documents.length === 0 && user.name) {
                    rosterDocs = await databases.listDocuments(
                      DATABASE_ID,
                      COLLECTIONS.ROSTERS,
                      [`equal("leagueId", "${leagueId}")`, `equal("userName", "${user.name}")`]
                    );
                  }
                  
                  // Last resort: try by userId
                  if (rosterDocs.documents.length === 0) {
                    rosterDocs = await databases.listDocuments(
                      DATABASE_ID,
                      COLLECTIONS.ROSTERS,
                      [`equal("leagueId", "${leagueId}")`, `equal("userId", "${user.$id}")`]
                    );
                  }
                  
                  if (rosterDocs.documents.length > 0) {
                    const roster = rosterDocs.documents[0];
                    teams[leagueId] = {
                      leagueId,
                      teamName: roster.teamName,
                      wins: roster.wins || 0,
                      losses: roster.losses || 0,
                      ties: roster.ties || 0,
                      pointsFor: roster.pointsFor || 0,
                    };
                  }
                  
                  return {
                    id: leagueId,
                    name: userLeagueNames[index] || league.name || 'Unnamed League',
                    status: league.status || 'pre-draft',
                    maxTeams: league.maxTeams || 12,
                    commissioner: league.commissioner || league.commissionerId,
                    draftDate: league.draftDate,
                  };
                } catch (e) {
                  console.error('Failed to fetch league details:', e);
                  return null;
                }
              })
            );
            
            if (!cancelled) {
              setLeagues(leagueDetails.filter(Boolean) as League[]);
              setTeams(teams);
            }
          }
        }
      } catch (error) {
        console.error('Dashboard error:', error);
        // Only redirect to login if we truly can't get user info
        if (error instanceof Error && error.message.includes('Missing required parameter')) {
          router.push('/login');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0B0E13] via-[#1c1117] to-[#0B0E13] flex items-center justify-center">
        <div className="text-white/60">Loading your leagues...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B0E13] via-[#1c1117] to-[#0B0E13]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Welcome back, {userName}!</p>
        </div>

        {leagues.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <UserGroupIcon className="h-16 w-16 mx-auto text-white/40 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No Leagues Yet</h2>
            <p className="text-white/60 mb-6">Join or create a league to get started!</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/league/create"
                className="px-6 py-3 bg-[#E89A5C] hover:bg-[#D4834A] rounded-lg text-white font-medium transition-colors"
              >
                Create League
              </Link>
              <Link
                href="/league/join"
                className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-lg text-white font-medium transition-colors"
              >
                Join League
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => {
              const team = teams[league.id];
              return (
                <div
                  key={league.id}
                  className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">{league.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      league.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      league.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {league.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  {team && (
                    <div className="mb-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-white/80 mb-1">{team.teamName}</p>
                      <div className="flex gap-4 text-sm text-white/60">
                        <span>{team.wins}-{team.losses}{team.ties > 0 && `-${team.ties}`}</span>
                        <span>{team.pointsFor.toFixed(1)} PF</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{league.maxTeams} teams</span>
                    </div>
                    {league.draftDate && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Draft: {new Date(league.draftDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/league/${league.id}`}
                      className="flex-1 text-center py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      League Home
                    </Link>
                    <Link
                      href={`/league/${league.id}/locker-room`}
                      className="flex-1 text-center py-2 bg-[#5C1F30] hover:bg-[#4A1626] rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      Locker Room
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
