'use client';

import { getTeamColors, TEAM_COLORS } from '@/lib/team-colors';

export default function TestColorsPage() {
  const testTeams = [
    "Michigan",
    "Ohio State",
    "Michigan Wolverines",
    "Ohio State Buckeyes",
    "Penn State Nittany Lions",
    "Georgia",
    "Alabama"
  ];

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Team Colors Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl mb-4">Direct TEAM_COLORS Object:</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(TEAM_COLORS).slice(0, 10).map(([name, colors]) => (
            <div key={name} className="border p-2">
              <div>{name}</div>
              <div className="flex gap-2 mt-2">
                <div 
                  className="w-8 h-8 rounded" 
                  style={{ backgroundColor: colors.primary }}
                />
                <div 
                  className="w-8 h-8 rounded" 
                  style={{ backgroundColor: colors.secondary }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl mb-4">Testing getTeamColors Function:</h2>
        <div className="space-y-4">
          {testTeams.map((teamName) => {
            const colors = getTeamColors(teamName);
            return (
              <div key={teamName} className="border p-4">
                <div className="mb-2">Input: "{teamName}"</div>
                <div className="mb-2">Result: {JSON.stringify(colors)}</div>
                <div className="flex gap-4">
                  <div 
                    className="w-16 h-16 rounded border-2 border-white"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div 
                    className="w-16 h-16 rounded border-2 border-white"
                    style={{ backgroundColor: colors.secondary }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}