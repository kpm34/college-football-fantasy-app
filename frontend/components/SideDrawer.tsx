"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import {
  HomeIcon,
  PlusCircleIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  TrophyIcon,
  Cog6ToothIcon,
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
  const [session, setSession] = useState<SessionState>({ isAuthenticated: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await account.get();
        if (!cancelled)
          setSession({ isAuthenticated: true, name: me.name, email: me.email, userId: me.$id });
      } catch {
        if (!cancelled) setSession({ isAuthenticated: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await account.deleteSessions();
      setSession({ isAuthenticated: false });
      onClose();
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  const [leagues, setLeagues] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!session.isAuthenticated || !session.userId) return;
    let cancelled = false;
    (async () => {
      try {
        // Find teams for the current user
        const teamsRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TEAMS,
          [Query.equal('user_id', session.userId)]
        );
        const leagueIds = Array.from(new Set(teamsRes.documents.map((d: any) => d.league_id)));
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
      } catch (e) {
        console.error('Failed to load user leagues', e);
      }
    })();
    return () => {
      cancelled = true;
    }
  }, [session.isAuthenticated, session.userId]);

  return (
    <>
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
          <Link href="/league/create" onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <PlusCircleIcon className="h-5 w-5" />
            <span className="font-medium">Create League</span>
          </Link>
          <Link href="/league/join" onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <UserGroupIcon className="h-5 w-5" />
            <span className="font-medium">Join League</span>
          </Link>
          <Link href="/leagues/search" onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span className="font-medium">Find Leagues</span>
          </Link>
          <Link href="/scoreboard" onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <ChartBarIcon className="h-5 w-5" />
            <span className="font-medium">Scoreboard</span>
          </Link>
          <Link href="/standings" onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <TrophyIcon className="h-5 w-5" />
            <span className="font-medium">Standings</span>
          </Link>

          {session.isAuthenticated && leagues.length > 0 && (
            <>
              <div className="pt-3 mt-3 border-t border-white/10" />
              <div className="px-3 pb-1 text-white/60 text-xs uppercase tracking-wider">My Leagues</div>
              {leagues.map((lg) => (
                <Link key={lg.id} href={`/league/${lg.id}`} onClick={onClose} className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden">
                  <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span className="font-medium">{lg.name}</span>
                </Link>
              ))}
            </>
          )}

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


