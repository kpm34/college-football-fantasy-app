'use client';

import { useState, useEffect } from 'react';
import { getTeamColors } from '@/lib/team-colors';
import Link from 'next/link';

interface ConferenceTeam {
  name?: string;
  school?: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  colors?: string[];
  color?: string;
  altColor?: string;
  division?: string;
  location?: string;
  stadium?: string;
  capacity?: number;
  coach?: string;
  established?: number;
  conference_id?: string;
  power_4?: boolean;
  created_at?: string;
}

export default function ConferenceShowcasePage2() {
  const [big12Teams, setBig12Teams] = useState<ConferenceTeam[]>([]);
  const [accTeams, setAccTeams] = useState<ConferenceTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConferenceData();
  }, []);

  const loadConferenceData = async () => {
    try {
      setLoading(true);
      console.log('Loading conference data...');
      
      // Load conference teams
      const [big12Response, accResponse] = await Promise.all([
        fetch('/api/big12?type=teams'),
        fetch('/api/acc?type=teams')
      ]);

      console.log('Big 12 Response:', big12Response.status);
      console.log('ACC Response:', accResponse.status);

      if (big12Response.ok) {
        const big12Data = await big12Response.json();
        console.log('Big 12 Data:', big12Data);
        setBig12Teams(big12Data.teams || big12Data.data || []);
      }

      if (accResponse.ok) {
        const accData = await accResponse.json();
        console.log('ACC Data:', accData);
        setAccTeams(accData.data || []);
      }

    } catch (error) {
      console.error('Error loading conference data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Static data for fallback - using full team names
  const staticBig12Teams = [
    { name: "Kansas Jayhawks", abbreviation: "KU", mascot: "Jayhawks" },
    { name: "Oklahoma State Cowboys", abbreviation: "OKST", mascot: "Cowboys" },
    { name: "Kansas State Wildcats", abbreviation: "KSU", mascot: "Wildcats" },
    { name: "TCU Horned Frogs", abbreviation: "TCU", mascot: "Horned Frogs" },
    { name: "Baylor Bears", abbreviation: "BAYL", mascot: "Bears" },
    { name: "Texas Tech Red Raiders", abbreviation: "TTU", mascot: "Red Raiders" },
    { name: "West Virginia Mountaineers", abbreviation: "WVU", mascot: "Mountaineers" },
    { name: "Iowa State Cyclones", abbreviation: "ISU", mascot: "Cyclones" },
    { name: "Cincinnati Bearcats", abbreviation: "CIN", mascot: "Bearcats" },
    { name: "Houston Cougars", abbreviation: "HOU", mascot: "Cougars" },
    { name: "UCF Knights", abbreviation: "UCF", mascot: "Knights" },
    { name: "BYU Cougars", abbreviation: "BYU", mascot: "Cougars" },
    { name: "Arizona Wildcats", abbreviation: "ARIZ", mascot: "Wildcats" },
    { name: "Arizona State Sun Devils", abbreviation: "ASU", mascot: "Sun Devils" },
    { name: "Colorado Buffaloes", abbreviation: "COLO", mascot: "Buffaloes" },
    { name: "Utah Utes", abbreviation: "UTAH", mascot: "Utes" }
  ];

  const staticAccTeams = [
    { name: "Florida State Seminoles", abbreviation: "FSU", mascot: "Seminoles" },
    { name: "Clemson Tigers", abbreviation: "CLEM", mascot: "Tigers" },
    { name: "Miami Hurricanes", abbreviation: "MIA", mascot: "Hurricanes" },
    { name: "Louisville Cardinals", abbreviation: "LOU", mascot: "Cardinals" },
    { name: "North Carolina Tar Heels", abbreviation: "UNC", mascot: "Tar Heels" },
    { name: "Virginia Tech Hokies", abbreviation: "VT", mascot: "Hokies" },
    { name: "Duke Blue Devils", abbreviation: "DUKE", mascot: "Blue Devils" },
    { name: "Wake Forest Demon Deacons", abbreviation: "WAKE", mascot: "Demon Deacons" },
    { name: "Boston College Eagles", abbreviation: "BC", mascot: "Eagles" },
    { name: "NC State Wolfpack", abbreviation: "NCST", mascot: "Wolfpack" },
    { name: "Virginia Cavaliers", abbreviation: "UVA", mascot: "Cavaliers" },
    { name: "Georgia Tech Yellow Jackets", abbreviation: "GT", mascot: "Yellow Jackets" },
    { name: "Pittsburgh Panthers", abbreviation: "PITT", mascot: "Panthers" },
    { name: "Syracuse Orange", abbreviation: "SYR", mascot: "Orange" },
    { name: "California Golden Bears", abbreviation: "CAL", mascot: "Golden Bears" },
    { name: "Stanford Cardinal", abbreviation: "STAN", mascot: "Cardinal" },
    { name: "SMU Mustangs", abbreviation: "SMU", mascot: "Mustangs" }
  ];

  const displayBig12Teams = big12Teams.length > 0 ? big12Teams : staticBig12Teams;
  const displayAccTeams = accTeams.length > 0 ? accTeams : staticAccTeams;

  console.log('Display Big 12 Teams:', displayBig12Teams);
  console.log('Display ACC Teams:', displayAccTeams);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4A58F] via-[#D9BBA4] to-[#C4A58F] text-[#3A1220]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading conferences...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4A58F] via-[#D9BBA4] to-[#C4A58F] text-[#3A1220]">
      {/* Navigation */}
      <nav className="bg-[#3A1220]/20 backdrop-blur-sm border-b border-[#3A1220]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-[#3A1220]">
                College Football Fantasy
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/conference-showcase" className="text-[#5C1F30] hover:text-[#3A1220]">Page 1</Link>
              <Link href="/conference-showcase-2" className="text-[#8091BB] font-medium">Page 2</Link>
              <Link href="/league/create" className="text-[#5C1F30] hover:text-[#3A1220]">Create League</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#3A1220] mb-4">Power 4 Conferences</h1>
          <p className="text-xl text-[#5C1F30]">Page 2: Big 12 & ACC</p>
        </div>

        {/* Big 12 Conference */}
        <div className="bg-gradient-to-r from-[#8B0000]/20 to-[#DC143C]/15 backdrop-blur-sm rounded-xl p-8 border border-[#8B0000]/40 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-[#8B0000] uppercase" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>BIG XII</h2>
            <span className="px-4 py-2 bg-[#8B0000]/20 text-[#8B0000] rounded-full text-sm font-bold">
              {displayBig12Teams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayBig12Teams.map((team, index) => {
              const teamName = team.name || (team as any).school || '';
              const colors = getTeamColors(teamName);
              console.log(`Team: ${teamName}, Colors:`, colors);
              
              return (
                <div key={index} className="bg-[#8B0000]/5 rounded-lg p-4 text-center hover:bg-[#8B0000]/10 transition-all duration-300 cursor-pointer group">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                    style={{ 
                      backgroundColor: colors.primary,
                      borderColor: colors.secondary,
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      boxShadow: `0 6px 12px rgba(0,0,0,0.4)`
                    }}
                  >
                    <span 
                      className="font-bold text-xs" 
                      style={{ 
                        color: colors.secondary,
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {team.abbreviation}
                    </span>
                  </div>
                  <div className="text-sm font-bold mb-1 text-[#8B0000]">{teamName}</div>
                  <div className="text-xs text-[#8B0000]/60">{team.mascot}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACC Conference */}
        <div className="bg-gradient-to-r from-[#003594]/20 to-[#E47125]/10 backdrop-blur-sm rounded-xl p-8 border border-[#003594]/40">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-[#003594] uppercase italic" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', fontWeight: 900, fontStyle: 'italic' }}>ACC</h2>
            <span className="px-4 py-2 bg-[#003594]/20 text-[#003594] rounded-full text-sm font-bold">
              {displayAccTeams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayAccTeams.map((team, index) => {
              const teamName = team.name || (team as any).school || '';
              const colors = getTeamColors(teamName);
              console.log(`Team: ${teamName}, Colors:`, colors);
              
              return (
                <div key={index} className="bg-[#003594]/5 rounded-lg p-4 text-center hover:bg-[#E47125]/10 transition-all duration-300 cursor-pointer group">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                    style={{ 
                      backgroundColor: colors.primary,
                      borderColor: colors.secondary,
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      boxShadow: `0 6px 12px rgba(0,0,0,0.4)`
                    }}
                  >
                    <span 
                      className="font-bold text-xs" 
                      style={{ 
                        color: colors.secondary,
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {team.abbreviation}
                    </span>
                  </div>
                  <div className="text-sm font-bold mb-1 text-[#003594]">{teamName}</div>
                  <div className="text-xs text-[#003594]/60">{team.mascot}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-12 text-center">
          <Link 
            href="/conference-showcase"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8091BB] to-[#6B7CA6] rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg text-white"
          >
            ← View Big Ten & SEC
          </Link>
        </div>
      </div>
    </div>
  );
} 