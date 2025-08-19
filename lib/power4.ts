export type Power4Conference = 'SEC' | 'ACC' | 'Big 12' | 'Big Ten';

export const POWER4_CONFERENCES: Record<Power4Conference, string[]> = {
  SEC: [
    'Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky', 'LSU',
    'Mississippi State', 'Missouri', 'Ole Miss', 'South Carolina', 'Tennessee',
    'Texas A&M', 'Vanderbilt', 'Texas', 'Oklahoma',
  ],
  ACC: [
    'Boston College', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech', 'Louisville',
    'Miami', 'NC State', 'North Carolina', 'Pitt', 'Syracuse', 'Virginia',
    'Virginia Tech', 'Wake Forest', 'California', 'Stanford', 'SMU',
  ],
  'Big 12': [
    'Arizona', 'Arizona State', 'Colorado', 'Utah', 'Baylor', 'BYU', 'Cincinnati', 'Houston',
    'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State', 'TCU', 'Texas Tech', 'UCF', 'West Virginia',
  ],
  'Big Ten': [
    'Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State', 'Minnesota',
    'Nebraska', 'Northwestern', 'Ohio State', 'Penn State', 'Purdue', 'Rutgers', 'Wisconsin',
    'UCLA', 'USC', 'Oregon', 'Washington',
  ],
};

export const POWER4_TEAM_SET: ReadonlySet<string> = new Set(
  Object.values(POWER4_CONFERENCES).flat()
);

export function getTeamsForConference(conf: Power4Conference | 'All'): string[] {
  if (conf === 'All') return Array.from(POWER4_TEAM_SET).sort();
  return [...POWER4_CONFERENCES[conf]].sort();
}


