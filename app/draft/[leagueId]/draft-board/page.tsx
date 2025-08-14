"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DraftBoardRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Redirect deprecated draft board route to canonical draft room
    const path = window.location.pathname;
    const leagueId = path.split('/')[3];
    router.replace(`/draft/${leagueId}`);
  }, [router]);
  return null;
}