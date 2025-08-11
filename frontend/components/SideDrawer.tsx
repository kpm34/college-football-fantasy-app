"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";
import CFPLoadingScreen from "./CFPLoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import {
  HomeIcon,
  PlusCircleIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  TrophyIcon,
  Cog6ToothIcon,
  RectangleGroupIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
};

type SessionState = {
  isAuthenticated: boolean;
  name?: string;
  email?: string;
  userId?: string;
};

export default function SideDrawer({ open, onClose }: DrawerProps) {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  const session: SessionState = {
    isAuthenticated: !!user,
    name: user?.name,
    email: user?.email,
    userId: user?.$id
  };

  async function handleLogout() {
    try {
      await logout();
      onClose();
      router.push("/");
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  function handleNavigateWithLoading(href: string) {
    setIsNavigating(true);
    onClose();
    setTimeout(() => {
      router.push(href);
      // Reset after navigation completes
      setTimeout(() => setIsNavigating(false), 500);
    }, 100);
  }

  const [leagues, setLeagues] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!session.isAuthenticated || !session.email) return;
    let cancelled = false;
    (async () => {
      try {
        // Try to get leagues from user document by email
        const userDocs = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USERS,
          [Query.equal('email', session.email)]
        );
        
        if (userDocs.documents.length > 0) {
          const userDoc = userDocs.documents[0];
          const userLeagues = (userDoc as any).leagues || [];
          const userLeagueNames = (userDoc as any).leagueNames || [];
          
          if (userLeagues.length > 0) {
            const leagueData = userLeagues.map((id: string, index: number) => ({
              id,
              name: userLeagueNames[index] || 'Unnamed League'
            }));
            if (!cancelled) setLeagues(leagueData);
            return; // Exit early if we found leagues
          }
        }

        // Fallback: try getting leagues from rosters
        console.log('No leagues in user doc, trying rosters approach');
        
        // Try to find rosters by email first
        let rostersRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ROSTERS,
          [Query.equal('email', session.email)]
        );
        
        // If not found by email, try by userName
        if (rostersRes.documents.length === 0 && session.name) {
          rostersRes = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ROSTERS,
            [Query.equal('userName', session.name)]
          );
        }
        
        // Last resort: try by userId
        if (rostersRes.documents.length === 0 && session.userId) {
          rostersRes = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ROSTERS,
            [Query.equal('userId', session.userId)]
          );
        }
        
        if (rostersRes.documents.length > 0) {
          const leagueIds = Array.from(new Set(rostersRes.documents.map((d: any) => d.leagueId)));
          const fetched = await Promise.all(
            leagueIds.map(async (lid: string) => {
              try {
                const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, lid);
                return { id: lid, name: (doc as any).name };
              } catch {
                return null;
              }
            })
          );
          if (!cancelled) setLeagues(fetched.filter(Boolean) as Array<{ id: string; name: string }>);
        }
      } catch (e) {
        console.error('Failed to load user leagues', e);
      }
    })();
    return () => {
      cancelled = true;
    }
  }, [session.isAuthenticated, session.email, session.name, session.userId]);

  return (
    <>
      <CFPLoadingScreen isLoading={isNavigating} />
      
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-80 max-w-[85vw] transform bg-[#1c1117] text-white border-r border-white/10 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div>
            <div className="text-xl font-bebas tracking-wide">CFB Fantasy</div>
            {session.isAuthenticated && (
              <div className="text-xs text-white/70">{session.name || session.email}</div>
            )}
          </div>
          <button
            className="rounded-md p-2 hover:bg-white/10"
            aria-label="Close menu"
            onClick={onClose}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <nav className="px-3 py-3 space-y-1">
          <Link href="/" onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <HomeIcon className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </Link>

          {session.isAuthenticated && (
            <>
              <Link href="/dashboard" onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <RectangleGroupIcon className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>

              {leagues.length > 0 && (
                <>
                  <div className="pt-3 mt-3 border-t border-white/10" />
                  <div className="px-3 pb-1 text-white/60 text-xs uppercase tracking-wider">My Leagues</div>
                  {leagues.map((lg) => (
                    <button
                      key={lg.id}
                      onClick={() => handleNavigateWithLoading(`/league/${lg.id}/locker-room`)}
                      className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden w-full text-left"
                    >
                      <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                      <LockClosedIcon className="h-5 w-5" />
                      <span className="font-medium">{lg.name}</span>
                    </button>
                  ))}
                </>
              )}

              <div className="pt-3 mt-3 border-t border-white/10" />
              
              <Link href="/scoreboard" onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <ChartBarIcon className="h-5 w-5" />
                <span className="font-medium">Scoreboard</span>
              </Link>
            </>
          )}

          <Link href="/league/join" onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <UserGroupIcon className="h-5 w-5" />
            <span className="font-medium">Join League</span>
          </Link>

          <div className="pt-3 mt-3 border-t border-white/10" />

          {!session.isAuthenticated ? (
            <div className="grid grid-cols-2 gap-2 px-1">
              <Link href="/login" onClick={onClose} className="text-center rounded-md px-3 py-2 bg-[#E89A5C] hover:bg-[#D4834A] transition-colors">Login</Link>
              <Link href="/signup" onClick={onClose} className="text-center rounded-md px-3 py-2 bg-[#8091BB] hover:bg-[#6B7CA6] transition-colors">Sign Up</Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1">
              <Link href="/account/settings" onClick={onClose} className="flex-1 text-center rounded-md px-3 py-2 bg-white/10 hover:bg-white/15 transition-colors">Account Settings</Link>
              <button onClick={handleLogout} className="rounded-md px-3 py-2 bg-red-600/80 hover:bg-red-600 transition-colors">Logout</button>
            </div>
          )}
        </nav>

        <div className="mt-auto" />
      </aside>
    </>
  );
}


