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

export default function ConferenceShowcasePage() {
  const [bigTenTeams, setBigTenTeams] = useState<ConferenceTeam[]>([]);
  const [secTeams, setSecTeams] = useState<ConferenceTeam[]>([]);
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
      const [bigTenResponse, secResponse, big12Response, accResponse] = await Promise.all([
        fetch('/api/bigten?type=teams'),
        fetch('/api/sec?type=teams'),
        fetch('/api/big12?type=teams'),
        fetch('/api/acc?type=teams')
      ]);

      console.log('Big Ten Response:', bigTenResponse.status);
      console.log('SEC Response:', secResponse.status);

      if (bigTenResponse.ok) {
        const bigTenData = await bigTenResponse.json();
        console.log('Big Ten Data:', bigTenData);
        setBigTenTeams(bigTenData.data || []);
      }

      if (secResponse.ok) {
        const secData = await secResponse.json();
        console.log('SEC Data:', secData);
        setSecTeams(secData.data || []);
      }

      if (big12Response.ok) {
        const big12Data = await big12Response.json();
        setBig12Teams(big12Data.teams || big12Data.data || []);
      }

      if (accResponse.ok) {
        const accData = await accResponse.json();
        setAccTeams(accData.data || []);
      }

    } catch (error) {
      console.error('Error loading conference data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Static data for fallback - using full team names
  const staticBigTenTeams = [
    { name: "Michigan Wolverines", abbreviation: "MICH", mascot: "Wolverines" },
    { name: "Ohio State Buckeyes", abbreviation: "OSU", mascot: "Buckeyes" },
    { name: "Penn State Nittany Lions", abbreviation: "PSU", mascot: "Nittany Lions" },
    { name: "Michigan State Spartans", abbreviation: "MSU", mascot: "Spartans" },
    { name: "Indiana Hoosiers", abbreviation: "IND", mascot: "Hoosiers" },
    { name: "Maryland Terrapins", abbreviation: "MD", mascot: "Terrapins" },
    { name: "Rutgers Scarlet Knights", abbreviation: "RUTG", mascot: "Scarlet Knights" },
    { name: "UCLA Bruins", abbreviation: "UCLA", mascot: "Bruins" },
    { name: "Washington Huskies", abbreviation: "WASH", mascot: "Huskies" },
    { name: "Oregon Ducks", abbreviation: "ORE", mascot: "Ducks" },
    { name: "USC Trojans", abbreviation: "USC", mascot: "Trojans" },
    { name: "Wisconsin Badgers", abbreviation: "WIS", mascot: "Badgers" },
    { name: "Iowa Hawkeyes", abbreviation: "IOWA", mascot: "Hawkeyes" },
    { name: "Minnesota Golden Gophers", abbreviation: "MINN", mascot: "Golden Gophers" },
    { name: "Nebraska Cornhuskers", abbreviation: "NEB", mascot: "Cornhuskers" },
    { name: "Northwestern Wildcats", abbreviation: "NW", mascot: "Wildcats" },
    { name: "Purdue Boilermakers", abbreviation: "PUR", mascot: "Boilermakers" },
    { name: "Illinois Fighting Illini", abbreviation: "ILL", mascot: "Fighting Illini" }
  ];

  const staticSecTeams = [
    { name: "Georgia Bulldogs", abbreviation: "UGA", mascot: "Bulldogs" },
    { name: "Alabama Crimson Tide", abbreviation: "ALA", mascot: "Crimson Tide" },
    { name: "LSU Tigers", abbreviation: "LSU", mascot: "Tigers" },
    { name: "Texas Longhorns", abbreviation: "TEX", mascot: "Longhorns" },
    { name: "Oklahoma Sooners", abbreviation: "OU", mascot: "Sooners" },
    { name: "Florida Gators", abbreviation: "UF", mascot: "Gators" },
    { name: "Tennessee Volunteers", abbreviation: "TENN", mascot: "Volunteers" },
    { name: "Kentucky Wildcats", abbreviation: "UK", mascot: "Wildcats" },
    { name: "South Carolina Gamecocks", abbreviation: "SC", mascot: "Gamecocks" },
    { name: "Missouri Tigers", abbreviation: "MIZ", mascot: "Tigers" },
    { name: "Auburn Tigers", abbreviation: "AUB", mascot: "Tigers" },
    { name: "Ole Miss Rebels", abbreviation: "MISS", mascot: "Rebels" },
    { name: "Mississippi State Bulldogs", abbreviation: "MSST", mascot: "Bulldogs" },
    { name: "Arkansas Razorbacks", abbreviation: "ARK", mascot: "Razorbacks" },
    { name: "Vanderbilt Commodores", abbreviation: "VAN", mascot: "Commodores" },
    { name: "Texas A&M Aggies", abbreviation: "TAMU", mascot: "Aggies" }
  ];

  const displayBigTenTeams = bigTenTeams.length > 0 ? bigTenTeams : staticBigTenTeams;
  const displaySecTeams = secTeams.length > 0 ? secTeams : staticSecTeams;

  console.log('Display Big Ten Teams:', displayBigTenTeams);
  console.log('Display SEC Teams:', displaySecTeams);

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
              <Link href="/conference-showcase" className="text-[#8091BB] font-medium">Page 1</Link>
              <Link href="/conference-showcase-2" className="text-[#5C1F30] hover:text-[#3A1220]">Page 2</Link>
              <Link href="/league/create" className="text-[#5C1F30] hover:text-[#3A1220]">Create League</Link>
              <Link href="/league/join" className="text-[#5C1F30] hover:text-[#3A1220]">Join League</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#3A1220] mb-4">Power 4 Conferences</h1>
          <p className="text-xl text-[#5C1F30]">Big Ten, SEC, Big 12, ACC</p>
        </div>

        {/* Big Ten Conference */}
        <div className="bg-gradient-to-r from-[#002D72]/20 to-[#041E42]/20 backdrop-blur-sm rounded-xl p-8 border border-[#002D72]/40 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-[#002D72] uppercase tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', fontWeight: 900 }}>BIG TEN</h2>
            <span className="px-4 py-2 bg-[#002D72]/20 text-[#002D72] rounded-full text-sm font-bold">
              {displayBigTenTeams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayBigTenTeams.map((team, index) => {
              const teamName = team.name || (team as any).school || '';
              const colors = getTeamColors(teamName);
              console.log(`Team: ${teamName}, Colors:`, colors);
              
              return (
                <div key={index} className="bg-[#002D72]/5 rounded-lg p-4 text-center hover:bg-[#002D72]/10 transition-all duration-300 cursor-pointer group">
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
                  <div className="text-sm font-bold mb-1 text-[#002D72]">{teamName}</div>
                  <div className="text-xs text-[#041E42]/70">{team.mascot}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEC Conference */}
        <div className="bg-gradient-to-r from-[#002D72]/20 to-[#FCD647]/10 backdrop-blur-sm rounded-xl p-8 border border-[#002D72]/40">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-[#002D72] uppercase" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.15em' }}>SEC</h2>
            <span className="px-4 py-2 bg-[#FCD647]/30 text-[#002D72] rounded-full text-sm font-bold">
              {displaySecTeams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displaySecTeams.map((team, index) => {
              const teamName = team.name || (team as any).school || '';
              const colors = getTeamColors(teamName);
              console.log(`Team: ${teamName}, Colors:`, colors);
              
              return (
                <div key={index} className="bg-[#002D72]/5 rounded-lg p-4 text-center hover:bg-[#FCD647]/10 transition-all duration-300 cursor-pointer group">
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
                  <div className="text-sm font-bold mb-1 text-[#002D72]">{teamName}</div>
                  <div className="text-xs text-[#002D72]/60">{team.mascot}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Big 12 Conference */}
        <div className="bg-gradient-to-r from-[#7a1c1c]/20 to-[#7a1c1c]/10 backdrop-blur-sm rounded-xl p-8 border border-[#7a1c1c]/30 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-[#7a1c1c] uppercase">BIG 12</h2>
            <span className="px-4 py-2 bg-[#7a1c1c]/10 text-[#7a1c1c] rounded-full text-sm font-bold">
              {big12Teams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {big12Teams.map((team, index) => {
              const teamName = team.name || (team as any).school || '';
              const colors = getTeamColors(teamName);
              return (
                <div key={index} className="bg-[#7a1c1c]/5 rounded-lg p-4 text-center hover:bg-[#7a1c1c]/10 transition-all duration-300 cursor-pointer group">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                    style={{ backgroundColor: colors.primary, borderColor: colors.secondary, borderWidth: '3px', borderStyle: 'solid' }}
                  >
                    <span className="font-bold text-xs" style={{ color: colors.secondary }}>{team.abbreviation}</span>
                  </div>
                  <div className="text-sm font-bold mb-1 text-[#7a1c1c]">{teamName}</div>
                  <div className="text-xs text-[#7a1c1c]/70">{team.mascot}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACC Conference */}
        <div className="bg-gradient-to-r from-[#0B0E13]/20 to-[#0B0E13]/10 backdrop-blur-sm rounded-xl p-8 border border-[#0B0E13]/30">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-[#0B0E13] uppercase">ACC</h2>
            <span className="px-4 py-2 bg-[#0B0E13]/10 text-[#0B0E13] rounded-full text-sm font-bold">
              {accTeams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {accTeams.map((team, index) => {
              const teamName = team.name || (team as any).school || '';
              const colors = getTeamColors(teamName);
              return (
                <div key={index} className="bg-[#0B0E13]/5 rounded-lg p-4 text-center hover:bg-[#0B0E13]/10 transition-all duration-300 cursor-pointer group">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                    style={{ backgroundColor: colors.primary, borderColor: colors.secondary, borderWidth: '3px', borderStyle: 'solid' }}
                  >
                    <span className="font-bold text-xs" style={{ color: colors.secondary }}>{team.abbreviation}</span>
                  </div>
                  <div className="text-sm font-bold mb-1 text-[#0B0E13]">{teamName}</div>
                  <div className="text-xs text-[#0B0E13]/70">{team.mascot}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 