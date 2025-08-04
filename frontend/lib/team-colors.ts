// Official team colors for all Power 4 Conference teams

export const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
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
  'Oklahoma': { primary: '#841617', secondary: '#FFFFFF' },
  'Texas A&M': { primary: '#500000', secondary: '#FFFFFF' },
  'Arkansas': { primary: '#9D2235', secondary: '#FFFFFF' },
  'Auburn': { primary: '#0C2340', secondary: '#E87722' },
  'Vanderbilt': { primary: '#866D4B', secondary: '#000000' },

  // Big 12 Conference
  'Kansas': { primary: '#0051BA', secondary: '#E8000D' },
  'Kansas State': { primary: '#512888', secondary: '#D1D1D1' },
  'Oklahoma State': { primary: '#FF7300', secondary: '#000000' },
  'TCU': { primary: '#4D1979', secondary: '#FFFFFF' },
  'Baylor': { primary: '#154734', secondary: '#FFBC35' },
  'Texas Tech': { primary: '#CC0000', secondary: '#000000' },
  'West Virginia': { primary: '#002855', secondary: '#EAAA00' },
  'Iowa State': { primary: '#C8102E', secondary: '#FFC62F' },
  'Cincinnati': { primary: '#E00122', secondary: '#000000' },
  'Houston': { primary: '#C8102E', secondary: '#FFFFFF' },
  'UCF': { primary: '#FFC904', secondary: '#000000' },
  'BYU': { primary: '#002E5D', secondary: '#FFFFFF' },
  'Colorado': { primary: '#CFB87C', secondary: '#000000' },
  'Arizona': { primary: '#CC0033', secondary: '#003366' },
  'Arizona State': { primary: '#8C1D40', secondary: '#FFC627' },  // ASU maroon and gold
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
  'Virginia Tech': { primary: '#630031', secondary: '#CF4420' },  // VT maroon and burnt orange
  'Georgia Tech': { primary: '#B3A369', secondary: '#003057' },
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
    console.log('No team name provided');
    return { primary: '#666666', secondary: '#FFFFFF' };
  }
  
  console.log('Getting colors for:', teamName);
  
  // Clean the team name
  const cleanTeamName = teamName.trim();
  
  // Check for exact match first
  if (TEAM_COLORS[cleanTeamName]) {
    console.log('Exact match found:', cleanTeamName);
    return TEAM_COLORS[cleanTeamName];
  }
  
  // Extract just the school name (first part before mascot)
  // e.g., "Michigan Wolverines" -> "Michigan"
  const schoolName = cleanTeamName.split(' ')[0];
  
  // Check for school name match
  if (TEAM_COLORS[schoolName]) {
    console.log('School name match found:', schoolName);
    return TEAM_COLORS[schoolName];
  }
  
  // Special cases for team names that need special handling
  const teamNameMappings: Record<string, string> = {
    // Full names to proper keys
    'Ohio State Buckeyes': 'Ohio State',
    'Penn State Nittany Lions': 'Penn State',
    'Michigan State Spartans': 'Michigan State',
    'Oklahoma State Cowboys': 'Oklahoma State',
    'Kansas State Wildcats': 'Kansas State',
    'Iowa State Cyclones': 'Iowa State',
    'Arizona State Sun Devils': 'Arizona State',
    'Florida State Seminoles': 'Florida State',
    'North Carolina Tar Heels': 'North Carolina',
    'NC State Wolfpack': 'NC State',
    'Virginia Tech Hokies': 'Virginia Tech',
    'Texas A&M Aggies': 'Texas A&M',
    'Ole Miss Rebels': 'Ole Miss',
    'Mississippi State Bulldogs': 'Mississippi State',
    'West Virginia Mountaineers': 'West Virginia',
    'Texas Tech Red Raiders': 'Texas Tech',
    'Boston College Eagles': 'Boston College',
    'Georgia Tech Yellow Jackets': 'Georgia Tech',
    'Wake Forest Demon Deacons': 'Wake Forest',
    'Notre Dame Fighting Irish': 'Notre Dame',
    'Michigan Wolverines': 'Michigan',
    'Indiana Hoosiers': 'Indiana',
    'Maryland Terrapins': 'Maryland',
    'Rutgers Scarlet Knights': 'Rutgers',
    'UCLA Bruins': 'UCLA',
    'Washington Huskies': 'Washington',
    'Oregon Ducks': 'Oregon',
    'USC Trojans': 'USC',
    'Wisconsin Badgers': 'Wisconsin',
    'Iowa Hawkeyes': 'Iowa',
    'Minnesota Golden Gophers': 'Minnesota',
    'Nebraska Cornhuskers': 'Nebraska',
    'Illinois Fighting Illini': 'Illinois',
    'Northwestern Wildcats': 'Northwestern',
    'Purdue Boilermakers': 'Purdue',
    'Georgia Bulldogs': 'Georgia',
    'Alabama Crimson Tide': 'Alabama',
    'LSU Tigers': 'LSU',
    'Florida Gators': 'Florida',
    'Tennessee Volunteers': 'Tennessee',
    'Kentucky Wildcats': 'Kentucky',
    'South Carolina Gamecocks': 'South Carolina',
    'Missouri Tigers': 'Missouri',
    'Arkansas Razorbacks': 'Arkansas',
    'Auburn Tigers': 'Auburn',
    'Vanderbilt Commodores': 'Vanderbilt',
    'Kansas Jayhawks': 'Kansas',
    'TCU Horned Frogs': 'TCU',
    'Baylor Bears': 'Baylor',
    'Cincinnati Bearcats': 'Cincinnati',
    'Houston Cougars': 'Houston',
    'UCF Knights': 'UCF',
    'BYU Cougars': 'BYU',
    'Colorado Buffaloes': 'Colorado',
    'Arizona Wildcats': 'Arizona',
    'Utah Utes': 'Utah',
    'Clemson Tigers': 'Clemson',
    'Miami Hurricanes': 'Miami',
    'Louisville Cardinals': 'Louisville',
    'Duke Blue Devils': 'Duke',
    'Virginia Cavaliers': 'Virginia',
    'Syracuse Orange': 'Syracuse',
    'Pitt Panthers': 'Pitt',
    'California Golden Bears': 'California',
    'Stanford Cardinal': 'Stanford',
    'SMU Mustangs': 'SMU'
  };
  
  // Check full name mappings
  if (teamNameMappings[cleanTeamName]) {
    const mappedName = teamNameMappings[cleanTeamName];
    if (TEAM_COLORS[mappedName]) {
      console.log('Full name mapping found:', mappedName);
      return TEAM_COLORS[mappedName];
    }
  }
  
  // Try to find by checking if the key starts with the search name
  for (const [key, colors] of Object.entries(TEAM_COLORS)) {
    if (key.toLowerCase().includes(cleanTeamName.toLowerCase()) || 
        cleanTeamName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase() === schoolName.toLowerCase()) {
      console.log('Partial match found:', key);
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
    'LOU': 'Louisville',
    'GT': 'Georgia Tech',
    'TAMU': 'Texas A&M',
    'OU': 'Oklahoma',
    'UK': 'Kentucky',
    'UF': 'Florida',
    'TENN': 'Tennessee',
    'ARK': 'Arkansas',
    'MISS': 'Ole Miss',
    'MSST': 'Mississippi State',
    'SC': 'South Carolina',
    'MIZ': 'Missouri',
    'AUB': 'Auburn',
    'VAN': 'Vanderbilt'
  };
  
  if (specialCases[cleanTeamName.toUpperCase()]) {
    const fullName = specialCases[cleanTeamName.toUpperCase()];
    if (TEAM_COLORS[fullName]) {
      console.log('Abbreviation match found:', fullName);
      return TEAM_COLORS[fullName];
    }
  }
  
  // Default colors if team not found
  console.log('No match found for:', teamName, '- using default colors');
  return { primary: '#666666', secondary: '#FFFFFF' };
}