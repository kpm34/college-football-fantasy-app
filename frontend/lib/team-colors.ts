// Official team colors for all Power 4 Conference teams

export const TEAM_COLORS = {
  // Big Ten Conference
  'Michigan': { primary: '#00274C', secondary: '#FFCB05' },
  'Ohio State': { primary: '#BB0000', secondary: '#666666' },
  'Penn State': { primary: '#041E42', secondary: '#FFFFFF' },
  'Michigan State': { primary: '#18453B', secondary: '#FFFFFF' },
  'Indiana': { primary: '#990000', secondary: '#FFFFFF' },
  'Maryland': { primary: '#E03A3E', secondary: '#FFD520' },
  'Rutgers': { primary: '#CC0033', secondary: '#000000' },
  'UCLA': { primary: '#2D68C4', secondary: '#F2A900' },
  'USC': { primary: '#990000', secondary: '#FFC72C' },
  'Washington': { primary: '#4B2E83', secondary: '#B7A57A' },
  'Oregon': { primary: '#154733', secondary: '#FEE123' },
  'Wisconsin': { primary: '#C5050C', secondary: '#FFFFFF' },
  'Iowa': { primary: '#000000', secondary: '#FFCD00' },
  'Minnesota': { primary: '#7A0019', secondary: '#FFCC33' },
  'Illinois': { primary: '#E84A27', secondary: '#13294B' },
  'Northwestern': { primary: '#4E2A84', secondary: '#FFFFFF' },
  'Purdue': { primary: '#CEB888', secondary: '#000000' },
  'Nebraska': { primary: '#E41C38', secondary: '#FFFFFF' },

  // SEC Conference
  'Georgia': { primary: '#BA0C2F', secondary: '#000000' },
  'Alabama': { primary: '#9E1B32', secondary: '#FFFFFF' },
  'LSU': { primary: '#461D7C', secondary: '#FDD023' },
  'Florida': { primary: '#0021A5', secondary: '#FA4616' },
  'Tennessee': { primary: '#FF8200', secondary: '#FFFFFF' },
  'Kentucky': { primary: '#0033A0', secondary: '#FFFFFF' },
  'South Carolina': { primary: '#73000A', secondary: '#000000' },
  'Missouri': { primary: '#F1B82D', secondary: '#000000' },
  'Ole Miss': { primary: '#14213D', secondary: '#CE1126' },
  'Mississippi State': { primary: '#660000', secondary: '#FFFFFF' },
  'Texas': { primary: '#BF5700', secondary: '#FFFFFF' },
  'Oklahoma': { primary: '#841617', secondary: '#FFC82E' },
  'Texas A&M': { primary: '#500000', secondary: '#FFFFFF' },
  'Arkansas': { primary: '#9D2235', secondary: '#FFFFFF' },
  'Auburn': { primary: '#0C2340', secondary: '#E87722' },
  'Vanderbilt': { primary: '#866D4B', secondary: '#000000' },

  // Big 12 Conference
  'Kansas': { primary: '#0051BA', secondary: '#E8000D' },
  'Kansas State': { primary: '#512888', secondary: '#FFFFFF' },
  'Oklahoma State': { primary: '#FF7300', secondary: '#000000' },
  'TCU': { primary: '#4D1979', secondary: '#FFFFFF' },
  'Baylor': { primary: '#154734', secondary: '#FFBC35' },
  'Texas Tech': { primary: '#CC0000', secondary: '#000000' },
  'West Virginia': { primary: '#002855', secondary: '#EAAA00' },
  'Iowa State': { primary: '#C8102E', secondary: '#F1BE48' },
  'Cincinnati': { primary: '#E00122', secondary: '#000000' },
  'Houston': { primary: '#C8102E', secondary: '#FFFFFF' },
  'UCF': { primary: '#000000', secondary: '#FFC904' },
  'BYU': { primary: '#002E5D', secondary: '#FFFFFF' },
  'Colorado': { primary: '#CFB87C', secondary: '#000000' },
  'Arizona': { primary: '#CC0033', secondary: '#003366' },
  'Arizona State': { primary: '#8C1D40', secondary: '#FFC627' },
  'Utah': { primary: '#CC0000', secondary: '#FFFFFF' },

  // ACC Conference
  'Clemson': { primary: '#F56600', secondary: '#522D80' },
  'Florida State': { primary: '#782F40', secondary: '#CEB888' },
  'Miami': { primary: '#F47321', secondary: '#005030' },
  'North Carolina': { primary: '#7BAFD4', secondary: '#FFFFFF' },
  'NC State': { primary: '#CC0000', secondary: '#FFFFFF' },
  'Duke': { primary: '#003087', secondary: '#FFFFFF' },
  'Wake Forest': { primary: '#9E7E38', secondary: '#000000' },
  'Virginia': { primary: '#232D4B', secondary: '#F84C1E' },
  'Virginia Tech': { primary: '#630031', secondary: '#CF4420' },
  'Georgia Tech': { primary: '#003057', secondary: '#B3A369' },
  'Louisville': { primary: '#AD0000', secondary: '#000000' },
  'Syracuse': { primary: '#F76900', secondary: '#002D62' },
  'Boston College': { primary: '#862334', secondary: '#BC9B6A' },
  'Pitt': { primary: '#003594', secondary: '#FFB81C' },
  'Notre Dame': { primary: '#0C2340', secondary: '#C99700' },
  'California': { primary: '#003262', secondary: '#FDB515' },
  'Stanford': { primary: '#8C1515', secondary: '#FFFFFF' },
  'SMU': { primary: '#0033A0', secondary: '#C8102E' }
};

// Helper function to get team colors
export function getTeamColors(teamName: string): { primary: string; secondary: string } {
  if (!teamName) {
    return { primary: '#666666', secondary: '#FFFFFF' };
  }
  
  // Check for exact match first
  if (TEAM_COLORS[teamName]) {
    return TEAM_COLORS[teamName];
  }
  
  // Handle various team name formats
  const searchName = teamName.trim();
  
  // Try to find by checking if the key starts with the search name
  for (const [key, colors] of Object.entries(TEAM_COLORS)) {
    if (key.toLowerCase().includes(searchName.toLowerCase()) || 
        searchName.toLowerCase().includes(key.toLowerCase())) {
      return colors;
    }
  }
  
  // Special cases for abbreviated names
  const specialCases: Record<string, string> = {
    'OSU': 'Ohio State',
    'MICH': 'Michigan',
    'PSU': 'Penn State',
    'MSU': 'Michigan State',
    'UGA': 'Georgia',
    'ALA': 'Alabama',
    'TEX': 'Texas',
    'OKST': 'Oklahoma State',
    'KSU': 'Kansas State',
    'BAYL': 'Baylor',
    'TTU': 'Texas Tech',
    'WVU': 'West Virginia',
    'ISU': 'Iowa State',
    'ASU': 'Arizona State',
    'FSU': 'Florida State',
    'UNC': 'North Carolina',
    'VT': 'Virginia Tech',
    'MIA': 'Miami',
    'CLEM': 'Clemson',
    'LOU': 'Louisville'
  };
  
  if (specialCases[searchName.toUpperCase()]) {
    const fullName = specialCases[searchName.toUpperCase()];
    if (TEAM_COLORS[fullName]) {
      return TEAM_COLORS[fullName];
    }
  }
  
  // Default colors if team not found
  return { primary: '#666666', secondary: '#FFFFFF' };
}