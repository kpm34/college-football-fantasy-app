'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTeamColors } from '@/lib/team-colors';

type ConferenceTeam = {
  name?: string;
  school?: string;
  mascot: string;
  abbreviation: string;
};

export default function ConferenceShowcaseTwo() {
  const [big12Teams, setBig12Teams] = useState<ConferenceTeam[]>([]);
  const [accTeams, setAccTeams] = useState<ConferenceTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [big12Res, accRes] = await Promise.all([
          fetch('/api/big12?type=teams'),
          fetch('/api/acc?type=teams')
        ]);
        if (big12Res.ok) {
          const d = await big12Res.json();
          setBig12Teams((d.data?.teams || d.teams || d.data || []).map((t: any) => ({
            name: t.name || t.school,
            school: t.school || t.name,
            mascot: t.mascot || '',
            abbreviation: t.abbreviation || ''
          })));
        }
        if (accRes.ok) {
          const d = await accRes.json();
          setAccTeams((d.data || []).map((t: any) => ({
            name: t.name || t.school,
            school: t.school || t.name,
            mascot: t.mascot || '',
            abbreviation: t.abbreviation || ''
          })));
        }
      } catch (e) {
        console.error('Conference showcase 2 load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const list = (teams: ConferenceTeam[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {teams.map((team, idx) => {
        const name = team.name || team.school || '';
        const colors = getTeamColors(name);
        return (
          <div key={idx} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300 cursor-pointer group">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.secondary,
                borderWidth: '3px',
                borderStyle: 'solid',
                boxShadow: '0 6px 12px rgba(0,0,0,0.4)'
              }}
            >
              <span className="font-bold text-xs" style={{ color: colors.secondary }}>
                {team.abbreviation}
              </span>
            </div>
            <div className="text-sm font-bold mb-1">{name}</div>
            <div className="text-xs text-white/70">{team.mascot}</div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4A58F] via-[#D9BBA4] to-[#C4A58F] text-[#3A1220] flex items-center justify-center">
        <div>Loading conferences...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4A58F] via-[#D9BBA4] to-[#C4A58F] text-[#3A1220]">
      <nav className="bg-[#3A1220]/20 backdrop-blur-sm border-b border-[#3A1220]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-[#3A1220]">College Football Fantasy</Link>
            <Link href="/conference-showcase" className="text-[#5C1F30] hover:text-[#3A1220]">← Back to Big Ten & SEC</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#3A1220] mb-2">Power 4 Conferences</h1>
          <p className="text-xl text-[#5C1F30]">Page 2: Big 12 & ACC</p>
        </div>

        <section className="bg-[#1c1117]/10 backdrop-blur-sm rounded-xl p-8 border border-[#1c1117]/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-[#1c1117] uppercase tracking-tight">Big 12</h2>
            <span className="px-4 py-2 bg-[#1c1117]/10 text-[#1c1117] rounded-full text-sm font-bold">{big12Teams.length} Teams</span>
          </div>
          {list(big12Teams)}
        </section>

        <section className="bg-[#0B0E13]/10 backdrop-blur-sm rounded-xl p-8 border border-[#0B0E13]/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-[#0B0E13] uppercase tracking-tight">ACC</h2>
            <span className="px-4 py-2 bg-[#0B0E13]/10 text-[#0B0E13] rounded-full text-sm font-bold">{accTeams.length} Teams</span>
          </div>
          {list(accTeams)}
        </section>
      </div>
    </div>
  );
}


