"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DraftRedirect() {
  const router = useRouter();
  const params = useParams<{ leagueId: string }>();

  useEffect(() => {
    const id = params?.leagueId;
    if (id) {
      router.replace(`/draft/${id}/realtime`);
    }
  }, [params?.leagueId, router]);

  return null;
} 