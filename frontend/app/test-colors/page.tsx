'use client';

import { getTeamColors } from '@/lib/team-colors';

export default function TestColorsPage() {
  const testTeams = [
    "Michigan Wolverines",
    "Ohio State Buckeyes", 
    "Penn State Nittany Lions",
    "Georgia Bulldogs",
    "Alabama Crimson Tide",
    "Texas Longhorns"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Team Colors Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {testTeams.map((teamName, index) => {
          const colors = getTeamColors(teamName);
          console.log(`Team: ${teamName}, Colors:`, colors);
          
          return (
            <div key={index} className="bg-white/10 rounded-lg p-6 text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ 
                  backgroundColor: colors.primary,
                  borderColor: colors.secondary,
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  boxShadow: `0 6px 12px rgba(0,0,0,0.4)`
                }}
              >
                <span 
                  className="font-bold text-sm" 
                  style={{ 
                    color: colors.secondary,
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  {teamName.split(' ')[0].substring(0, 3).toUpperCase()}
                </span>
              </div>
              <div className="text-lg font-semibold mb-2">{teamName}</div>
              <div className="text-sm text-gray-400">
                Primary: {colors.primary}
              </div>
              <div className="text-sm text-gray-400">
                Secondary: {colors.secondary}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}