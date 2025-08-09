"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

  return (
    <nav className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#3A1220]/50 bg-[#3A1220]/70 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white font-bebas tracking-wide text-2xl">
              CFB Fantasy
            </Link>
            <div className="hidden md:flex items-center gap-1 ml-4">
              <NavLink href="/" label="Home" />
              <NavLink href="/league/create" label="Create League" />
              <NavLink href="/league/join" label="Join" />
              <NavLink href="/leagues/search" label="Leagues" />
              <NavLink href="/scoreboard" label="Scoreboard" />
              <NavLink href="/standings" label="Standings" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/conference-showcase"
              className="hidden md:inline-block text-sm px-3 py-1.5 rounded-md bg-[#E89A5C] text-white hover:bg-[#D4834A]"
            >
              Conferences
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:text-white hover:bg-white/10"
              aria-label="Open menu"
              onClick={() => setOpen((v) => !v)}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {open ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#3A1220]/95">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <NavLink href="/" label="Home" />
            <NavLink href="/league/create" label="Create League" />
            <NavLink href="/league/join" label="Join" />
            <NavLink href="/leagues/search" label="Leagues" />
            <NavLink href="/scoreboard" label="Scoreboard" />
            <NavLink href="/standings" label="Standings" />
            <NavLink href="/conference-showcase" label="Conferences" />
          </div>
        </div>
      )}
    </nav>
  );
}


