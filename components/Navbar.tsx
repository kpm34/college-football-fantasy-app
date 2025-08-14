"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import CFPLoadingScreen from "./CFPLoadingScreen";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { isUserCommissioner } from "@/lib/utils/commissioner";
import { Query } from "appwrite";
import {
  HomeIcon,
  RectangleGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  UserGroupIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-white/10 text-white"
          : "text-white/80 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [leagues, setLeagues] = useState<Array<{ id: string; name: string; isCommissioner?: boolean }>>(
    []
  );
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Load user's leagues to show in the drawer
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!user?.email) return;
        const byEmail = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USERS,
          [Query.equal("email", user.email)]
        );
        if (byEmail.documents.length > 0) {
          const doc: any = byEmail.documents[0];
          const ids: string[] = doc.leagues || [];
          const names: string[] = doc.leagueNames || [];
          if (ids.length > 0) {
            const next = await Promise.all(ids.map(async (id, i) => {
              try {
                // Trust server if available
                let isCommissioner = false;
                try {
                  const res = await fetch(`/api/leagues/is-commissioner/${id}`, { cache: 'no-store' });
                  if (res.ok) {
                    const data = await res.json();
                    isCommissioner = !!data.isCommissioner;
                  }
                } catch {}
                if (!isCommissioner) {
                  const d = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.LEAGUES,
                    id
                  );
                  isCommissioner = isUserCommissioner(d, user);
                }
                return { id, name: (d as any).name || names[i] || "Unnamed League", isCommissioner };
              } catch {
                return { id, name: names[i] || "Unnamed League" };
              }
            }));
            if (!cancelled) setLeagues(next);
            return;
          }
        }

        // Fallback via rosters
        let rosters = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ROSTERS,
          [Query.equal("email", user.email)]
        );
        if (rosters.documents.length === 0 && user.name) {
          rosters = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ROSTERS,
            [Query.equal("userName", user.name)]
          );
        }
        if (rosters.documents.length === 0 && user.$id) {
          rosters = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ROSTERS,
            [Query.equal("userId", user.$id)]
          );
        }
        // Legacy field name: owner
        if (rosters.documents.length === 0 && user.$id) {
          rosters = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ROSTERS,
            [Query.equal("owner", user.$id)]
          );
        }

        if (rosters.documents.length > 0) {
          const leagueIds = Array.from(
            new Set((rosters.documents as any[]).map((d) => d.leagueId))
          );
          const fetched = await Promise.all(
            leagueIds.map(async (lid: string) => {
              try {
                const d = await databases.getDocument(
                  DATABASE_ID,
                  COLLECTIONS.LEAGUES,
                  lid
                );
                const isCommissioner = isUserCommissioner(d, user);
                return { id: lid, name: (d as any).name, isCommissioner };
              } catch {
                return null;
              }
            })
          );
          if (!cancelled)
            setLeagues(
              fetched.filter(Boolean) as Array<{ id: string; name: string }>
            );
        } else if (user.$id) {
          // Final fallback via TEAMS collection
          const teams = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TEAMS,
            [Query.equal("userId", user.$id)]
          );
          if (teams.documents.length > 0) {
            const leagueIds = Array.from(
              new Set((teams.documents as any[]).map((d) => d.leagueId))
            );
            const fetched = await Promise.all(
              leagueIds.map(async (lid: string) => {
                try {
                  const d = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.LEAGUES,
                    lid
                  );
                  const leagueAny: any = d;
                  const leagueIdentifiers = [
                    leagueAny.commissionerId,
                    leagueAny.commissioner,
                    leagueAny.commissionerEmail
                  ].filter(Boolean);
                  const userIdentifiers = [user.$id, user.email, user.name].filter(Boolean) as string[];
                  const isCommissioner = leagueIdentifiers.some((val: string) => userIdentifiers.includes(val));
                  return { id: lid, name: (d as any).name, isCommissioner };
                } catch {
                  return null;
                }
              })
            );
            if (!cancelled)
              setLeagues(
                fetched.filter(Boolean) as Array<{ id: string; name: string }>
              );
          }
        }
      } catch (e) {
        console.error("Failed to load user leagues", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.name, user?.$id]);

  function handleNavigateWithLoading(href: string) {
    setIsNavigating(true);
    setOpen(false);
    setTimeout(() => {
      router.push(href);
      setTimeout(() => setIsNavigating(false), 500);
    }, 100);
  }

  async function handleLogout() {
    try {
      await logout();
      setOpen(false);
      router.push("/");
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  return (
    <>
      <CFPLoadingScreen isLoading={isNavigating} />
      <nav className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#3A1220]/50 bg-[#3A1220]/70 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <HamburgerButton isOpen={open} onClick={() => setOpen(true)} />
              <Link href="/" className="text-white font-bebas tracking-wide text-2xl">
                CFB Fantasy
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1 ml-4">
              <NavLink href="/scoreboard" label="Scoreboard" />
              <NavLink href="/standings" label="Standings" />
              <NavLink href="/draft/mock" label="Mock Draft" />
              <Link
                href={user ? "/league/create" : "/login"}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-white/80 hover:text-white hover:bg-white/5`}
              >
                Create League
              </Link>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-3">
              <UserMenu user={user} loading={authLoading} />
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay above navbar to avoid overlap issues */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Left drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] transform bg-[#1c1117] text-white border-r border-white/10 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div>
            <div className="text-xl font-bebas tracking-wide">CFB Fantasy</div>
            {!!user && (
              <div className="text-xs text-white/70">{user.name || user.email}</div>
            )}
          </div>
          <button
            className="rounded-md p-2 hover:bg-white/10"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="px-3 py-3 space-y-1">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
          >
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <HomeIcon className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </Link>

          {!!user && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
              >
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <RectangleGroupIcon className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>

              {leagues.length > 0 && (
                <>
                  <div className="pt-3 mt-3 border-t border-white/10" />
                  <div className="px-3 pb-1 text-white/60 text-xs uppercase tracking-wider">
                    My Leagues
                  </div>
                  {leagues.map((lg) => (
                    <div key={lg.id} className="flex items-center justify-between gap-2 px-2 py-1">
                      <button
                        onClick={() => handleNavigateWithLoading(`/league/${lg.id}`)}
                        className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden flex-1 text-left"
                      >
                        <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                        <RectangleGroupIcon className="h-5 w-5" />
                        <span className="font-medium truncate">{lg.name}</span>
                      </button>
                      <button
                        onClick={() => handleNavigateWithLoading(`/league/${lg.id}/locker-room`)}
                        className="shrink-0 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-white text-sm flex items-center gap-2"
                        aria-label="Open Locker Room"
                      >
                        <LockClosedIcon className="h-4 w-4" />
                        Locker
                      </button>
                      {lg.isCommissioner && (
                        <button
                          onClick={() => handleNavigateWithLoading(`/league/${lg.id}/commissioner`)}
                          className="shrink-0 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-white text-sm"
                          aria-label="Open Commissioner"
                        >
                          Commish
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}

              <div className="pt-3 mt-3 border-t border-white/10" />

              <Link
                href="/scoreboard"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
              >
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <ChartBarIcon className="h-5 w-5" />
                <span className="font-medium">Scoreboard</span>
              </Link>

              <Link
                href="/draft/mock"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
              >
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <TrophyIcon className="h-5 w-5" />
                <span className="font-medium">Mock Draft</span>
              </Link>
            </>
          )}

          <Link
            href="/league/join"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
          >
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <UserGroupIcon className="h-5 w-5" />
            <span className="font-medium">Join League</span>
          </Link>

          <Link
            href={user ? "/league/create" : "/login"}
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
          >
            <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
            <RectangleGroupIcon className="h-5 w-5" />
            <span className="font-medium">Create League</span>
          </Link>

          <div className="pt-3 mt-3 border-t border-white/10" />

          {!user ? (
            <div className="grid grid-cols-2 gap-2 px-1">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-center rounded-md px-3 py-2 bg-[#E89A5C] hover:bg-[#D4834A] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="text-center rounded-md px-3 py-2 bg-[#8091BB] hover:bg-[#6B7CA6] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1">
              <Link
                href="/account/settings"
                onClick={() => setOpen(false)}
                className="flex-1 text-center rounded-md px-3 py-2 bg-white/10 hover:bg-white/15 transition-colors"
              >
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-2 bg-red-600/80 hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </nav>

        <div className="mt-auto" />
      </aside>
    </>
  );
}

function UserMenu({
  user,
  loading,
}: {
  user: any;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="text-sm px-3 py-1.5 rounded-md bg-white/10 text-white/50">
        Loading...
      </div>
    );
  }
  
  if (user) {
    return (
      <Link 
        href="/account/settings" 
        className="text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white/90 hover:text-white transition-colors"
      >
        {user.name || user.email}
      </Link>
    );
  }
  
  return (
    <Link
      href="/login"
      className="text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white"
    >
      Login
    </Link>
  );
}

function HamburgerButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      className="relative w-12 h-12 flex items-center justify-center group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Open menu"
    >
      {/* Football outline */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          isHovered || isOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-90 rotate-12"
        }`}
      >
        <div
          className="relative w-10 h-7"
          style={{
            background:
              "linear-gradient(145deg, #8B4513 0%, #A0522D 25%, #654321 50%, #8B4513 75%, #654321 100%)",
            borderRadius: "50% / 40%",
            boxShadow:
              "inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)",
            transform: `rotate(${isHovered || isOpen ? "0deg" : "15deg"})`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)",
              borderRadius: "inherit",
            }}
          />
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 w-4/5 h-1/3"
            style={{
              background: "ellipse at center, rgba(255,255,255,0.2) 0%, transparent 60%",
              filter: "blur(2px)",
            }}
          />
        </div>
      </div>

      {/* Hamburger lines */}
      <div className="relative z-10 w-6 h-5 flex flex-col justify-between">
        <span
          className={`block bg-white transition-all duration-500 ${
            isHovered || isOpen
              ? "w-[2px] h-[8px] rotate-[20deg] translate-x-[3px] -translate-y-[1px] bg-white shadow-sm"
              : "w-full h-[2px]"
          }`}
          style={{ transformOrigin: "center" }}
        />
        <span
          className={`block bg-white transition-all duration-500 ${
            isHovered || isOpen
              ? "w-[2px] h-[10px] rotate-0 bg-white shadow-sm"
              : "w-full h-[2px]"
          }`}
          style={{ transformOrigin: "center" }}
        />
        <span
          className={`block bg-white transition-all duration-500 ${
            isHovered || isOpen
              ? "w-[2px] h-[8px] rotate-[-20deg] translate-x-[3px] translate-y-[1px] bg-white shadow-sm"
              : "w-full h-[2px]"
          }`}
          style={{ transformOrigin: "center" }}
        />
        <div
          className={`absolute inset-0 flex flex-col justify-center items-center gap-[3px] transition-opacity duration-300 ${
            isHovered || isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="block w-[10px] h-[1.5px] bg-white shadow-sm" />
          <span className="block w-[12px] h-[1.5px] bg-white shadow-sm" />
          <span className="block w-[10px] h-[1.5px] bg-white shadow-sm" />
        </div>
      </div>
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-500 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(165,42,42,0.2) 0%, transparent 60%)",
          filter: "blur(10px)",
        }}
      />
    </button>
  );
}


