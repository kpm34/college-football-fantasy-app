'use client'

import {
  HomeIcon,
  LockClosedIcon,
  RectangleGroupIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@lib/hooks/useAuth'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import CFPLoadingScreen from './CFPLoadingScreen'

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [leagues, setLeagues] = useState<
    Array<{ id: string; name: string; leagueName?: string; isCommissioner?: boolean }>
  >([])
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading, logout } = useAuth()
  const isHome = pathname === '/'

  // Dev admin bypass detection to avoid sticky loading indicators in dev
  const devBypass = (() => {
    if (typeof window === 'undefined') return false
    if (process.env.NODE_ENV === 'production') return false
    const envToken = process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN || ''
    try {
      const url = new URL(window.location.href)
      const qp = url.searchParams.get('devAdmin')
      if (qp) {
        window.localStorage.setItem('admin-dev-token', qp)
      }
    } catch {}
    const lsToken = window.localStorage.getItem('admin-dev-token') || ''
    return Boolean(envToken && lsToken && envToken === lsToken)
  })()

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Load user's leagues via the unified server endpoint (Auth-driven; no direct DB reads)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/leagues/mine', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (!cancelled && Array.isArray(data.leagues)) {
            setLeagues(data.leagues)
          }
        }
      } catch (e) {
        console.error('Failed to load user leagues', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.$id])

  function handleNavigateWithLoading(href: string) {
    setIsNavigating(true)
    setOpen(false)
    setTimeout(() => {
      router.push(href)
      setTimeout(() => setIsNavigating(false), 500)
    }, 100)
  }

  async function handleLogout() {
    try {
      setOpen(false)
      await logout()
    } catch (e) {
      console.error('Logout failed', e)
      // Even if logout fails, close the menu and redirect
      setOpen(false)
      router.push('/')
    }
  }

  // Don't show navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  return (
    <>
      <CFPLoadingScreen isLoading={isNavigating} />
      <nav className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#3A1220]/50 bg-[#3A1220]/70 border-b border-white/10">
        {isHome && (
          <div className="fixed left-6 top-24 z-50">
            <HamburgerButton isOpen={open} onClick={() => setOpen(true)} />
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              {!isHome && <HamburgerButton isOpen={open} onClick={() => setOpen(true)} />}
              <Link href="/" className="text-white font-bebas tracking-wide text-2xl">
                CFB Fantasy
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1 ml-4">
              {/* Non-essential top navigation */}
              <NavLink href="/blog" label="Blog" />
              <NavLink href="/scoreboard" label="Scoreboard" />
              <NavLink href="/about" label="About" />
            </div>
            <div className="ml-auto hidden md:flex items-center gap-3">
              <UserMenu
                user={user}
                loading={devBypass ? false : authLoading}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay above navbar to avoid overlap issues */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Left drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] transform bg-[#1c1117] text-white border-r border-white/10 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div>
            <div className="text-xl font-bebas tracking-wide">CFB Fantasy</div>
            {!!user && <div className="text-xs text-white/70">{user.name || user.email}</div>}
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
              {/* Essential links for logged-in users */}
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
              >
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <RectangleGroupIcon className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
              >
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <RectangleGroupIcon className="h-5 w-5" />
                <span className="font-medium">Leagues</span>
              </Link>

              <Link
                href="/standings"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
              >
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <RectangleGroupIcon className="h-5 w-5" />
                <span className="font-medium">Teams</span>
              </Link>

              {leagues.length > 0 && (
                <>
                  <div className="pt-3 mt-3 border-t border-white/10" />
                  <div className="px-3 pb-1 text-white/60 text-xs uppercase tracking-wider">
                    My Leagues
                  </div>
                  {leagues.map(lg => (
                    <div key={lg.id} className="mb-3">
                      <button
                        onClick={() => handleNavigateWithLoading(`/league/${lg.id}`)}
                        className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden w-full text-left"
                      >
                        <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                        <RectangleGroupIcon className="h-5 w-5 shrink-0" />
                        <span className="font-medium">{lg.leagueName || lg.name}</span>
                      </button>
                      <div className="ml-8 mt-1 flex gap-2">
                        <button
                          onClick={() => handleNavigateWithLoading(`/league/${lg.id}/locker-room`)}
                          className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
                          aria-label="Open Locker Room"
                        >
                          <LockClosedIcon className="h-3.5 w-3.5" />
                          <span>Locker Room</span>
                        </button>
                        {lg.isCommissioner && (
                          <button
                            onClick={() =>
                              handleNavigateWithLoading(`/league/${lg.id}/commissioner`)
                            }
                            className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
                            aria-label="Commissioner Settings"
                            title="Commissioner Settings"
                          >
                            <UserGroupIcon className="h-3.5 w-3.5" />
                            <span>Commish</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className="pt-3 mt-3 border-t border-white/10" />

              <Link
                href="/draft/mock"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
              >
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <TrophyIcon className="h-5 w-5" />
                <span className="font-medium">Mock Draft</span>
              </Link>

              <Link
                href="/league/create"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
              >
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <RectangleGroupIcon className="h-5 w-5" />
                <span className="font-medium">Create League</span>
              </Link>

              <Link
                href="/league/join"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-white/85 hover:text-white relative overflow-hidden"
              >
                <span className="absolute inset-0 -z-10 scale-x-0 group-hover:scale-x-100 origin-left bg-white/10 transition-transform duration-300" />
                <UserGroupIcon className="h-5 w-5" />
                <span className="font-medium">Join League</span>
              </Link>
            </>
          )}

          {/* Account & auth actions */}
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
                href="/account-settings"
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
  )
}

function UserMenu({
  user,
  loading,
  onLogout,
}: {
  user: any
  loading: boolean
  onLogout?: () => Promise<void> | void
}) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout()
      } else {
        await logout()
      }
    } catch (e) {
      console.error('Logout failed', e)
      // Even if logout fails, redirect to home
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="text-sm px-3 py-1.5 rounded-md bg-white/10 text-white/50">Loading...</div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/account-settings"
          className="text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white/90 hover:text-white transition-colors"
        >
          {user.name || user.email}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm px-3 py-1.5 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition-colors"
          title="Logout"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/login"
      className="text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white"
    >
      Login
    </Link>
  )
}

function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const appRef = useRef<any>(null)
  const originalsRef = useRef<{
    saved: boolean
    lacesZ: number
    outerZ: number
    sunIntensity: number
    laceBars?: any[]
    laceBarsY?: number[]
    condensedY?: number[]
  }>({ saved: false, lacesZ: 0, outerZ: 0, sunIntensity: 1 })

  function onLoad(app: any) {
    appRef.current = app
    try {
      const laces = app.findObjectByName?.('laces')
      const outer = app.findObjectByName?.('outer edge')
      const sun =
        app.findObjectByName?.('Directional Light') || app.findObjectByName?.('DirectionalLight')
      if (laces && outer && sun && !originalsRef.current.saved) {
        originalsRef.current = {
          saved: true,
          lacesZ: laces.position.z,
          outerZ: outer.position.z,
          sunIntensity: sun.intensity ?? 1,
        }
        // Capture individual lace bars and build a condensed arrangement near their center
        try {
          const bars = (laces.children || []).filter((c: any) => c?.position)
          if (bars.length >= 4) {
            const ys = bars.map((b: any) => b.position.y)
            const yCenter = ys.reduce((a: number, b: number) => a + b, 0) / ys.length
            const spacing = 1.0
            const indices = bars
              .map((bar: any, index: number) => ({ b: bar, idx: index }))
              .sort((a: { b: any }, c: { b: any }) => a.b.position.y - c.b.position.y)
              .map((x: { idx: number }) => x.idx)
            const condensed = indices.map(
              (_: number, i: number) => yCenter + (i - (indices.length - 1) / 2) * spacing
            )
            originalsRef.current.laceBars = bars
            originalsRef.current.laceBarsY = ys
            originalsRef.current.condensedY = condensed
            // Start in condensed state
            bars.forEach((bar: any, i: number) => {
              bar.position.y = condensed[i]
            })
          }
        } catch {}
        // Ensure sun shadows are available
        try {
          sun.castShadow = true
          if (sun.shadow) {
            sun.shadow.mapSize = { x: 2048, y: 2048 }
            sun.shadow.radius = 2
          }
        } catch {}
        // Hide large background meshes from the scene (use object names from export)
        try {
          const bgRect = app.findObjectByName?.('Rectangle 6')
          if (bgRect) bgRect.visible = false
          const football = app.findObjectByName?.('football')
          if (football) football.visible = false
        } catch {}
        // Initial visibility: laces visible, crescents hidden
        try {
          laces.visible = true
          outer.visible = false
        } catch {}
      }
    } catch {}
  }

  function tween(durationMs: number, step: (t01: number) => void) {
    const start = performance.now()
    function frame(now: number) {
      const t = Math.min(1, (now - start) / durationMs)
      step(t)
      if (t < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }

  function animateExtrusion(expand: boolean) {
    const app = appRef.current
    if (!app || !originalsRef.current.saved) return
    const laces = app.findObjectByName?.('laces')
    const outer = app.findObjectByName?.('outer edge')
    const sun =
      app.findObjectByName?.('Directional Light') || app.findObjectByName?.('DirectionalLight')
    if (!laces || !outer) return

    const target = {
      lacesZ: expand ? originalsRef.current.lacesZ + 12 : originalsRef.current.lacesZ,
      outerZ: expand ? originalsRef.current.outerZ + 9 : originalsRef.current.outerZ,
      sunIntensity: Math.max(
        0,
        expand
          ? (originalsRef.current.sunIntensity || 1) * 1.4
          : originalsRef.current.sunIntensity || 1
      ),
    }

    const startVals = {
      lacesZ: laces.position.z,
      outerZ: outer.position.z,
      sunIntensity: sun?.intensity ?? 1,
    }

    // show crescents when expanding
    if (expand) {
      try {
        outer.visible = true
      } catch {}
    }
    tween(360, t => {
      const ease = t * (2 - t)
      try {
        laces.position.z = startVals.lacesZ + (target.lacesZ - startVals.lacesZ) * ease
        outer.position.z = startVals.outerZ + (target.outerZ - startVals.outerZ) * ease
        if (sun)
          sun.intensity =
            startVals.sunIntensity + (target.sunIntensity - startVals.sunIntensity) * ease
        // Animate lace bar spacing
        const bars = originalsRef.current.laceBars
        const ys = originalsRef.current.laceBarsY
        const condensed = originalsRef.current.condensedY
        if (bars && ys && condensed && ys.length === bars.length) {
          bars.forEach((bar: any, i: number) => {
            const from = expand ? condensed[i] : ys[i]
            const to = expand ? ys[i] : condensed[i]
            bar.position.y = from + (to - from) * ease
          })
        }
      } catch {}
    })
    if (!expand) {
      setTimeout(() => {
        try {
          outer.visible = false
        } catch {}
      }, 380)
    }
  }

  return (
    <button
      className="relative w-12 h-12 flex items-center justify-center group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Open menu"
    >
      <div className="relative w-8 h-8">
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered || isOpen ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="relative w-6 h-5 flex flex-col justify-between">
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </div>
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered || isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <svg
            width="28"
            height="22"
            viewBox="0 0 28 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="14"
              cy="11"
              rx="12"
              ry="8"
              fill="url(#fbGrad)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
            <path
              d="M4 11C6 9 10 8 14 8C18 8 22 9 24 11"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="1"
            />
            <path
              d="M4 11C6 13 10 14 14 14C18 14 22 13 24 11"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
            />
            <line
              x1="9"
              y1="11"
              x2="19"
              y2="11"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="9"
              x2="12"
              y2="13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="14"
              y1="9"
              x2="14"
              y2="13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="16"
              y1="9"
              x2="16"
              y2="13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient
                id="fbGrad"
                x1="2"
                y1="3"
                x2="24"
                y2="19"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#8B4513" />
                <stop offset="0.5" stopColor="#A0522D" />
                <stop offset="1" stopColor="#5A2E12" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(circle, rgba(165,42,42,0.2) 0%, transparent 60%)',
          filter: 'blur(10px)',
        }}
      />
    </button>
  )
}
