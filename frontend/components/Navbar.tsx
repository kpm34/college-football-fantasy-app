"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";

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

import SideDrawer from "./SideDrawer";
import FootballHamburger from "./FootballHamburger";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#3A1220]/50 bg-[#3A1220]/70 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <FootballHamburger isOpen={open} onClick={() => setOpen(true)} />
              <Link href="/" className="text-white font-bebas tracking-wide text-2xl">
                CFB Fantasy
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1 ml-4">
              <NavLink href="/scoreboard" label="Scoreboard" />
              <NavLink href="/standings" label="Standings" />
            </div>
            <div className="ml-auto hidden md:flex items-center gap-3">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>
      <SideDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function UserMenu() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await account.get();
        if (!cancelled) setName(me.name || me.email);
      } catch {
        if (!cancelled) setName(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  if (name) {
    return (
      <Link 
        href="/account/settings" 
        className="text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white/90 hover:text-white transition-colors"
      >
        {name}
      </Link>
    );
  }
  return (
    <Link href="/login" className="text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white">Login</Link>
  );
}


