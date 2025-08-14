// Conference Team Data with Preserved Colors
// This file consolidates all conference team data while preserving the exact colors from the original APIs

export interface ConferenceTeam {
  name: string;
  school?: string; // Some use school, some use name
  abbreviation: string;
  conference: string;
  division?: string;
  location?: string;
  stadium?: string;
  capacity?: number;
  colors: string[] | { color: string; altColor: string };
  mascot: string;
  coach?: string;
  established?: number;
  conference_id: string;
  power_4: boolean;
}

// ACC Teams - Preserved from /api/acc/route.ts
export const ACC_TEAMS: ConferenceTeam[] = [
  // Atlantic Division
  { name: "Florida State Seminoles", abbreviation: "FSU", conference: "ACC", division: "Atlantic", location: "Tallahassee, FL", stadium: "Doak Campbell Stadium", capacity: 79560, colors: ["#782F40", "#CEB888"], mascot: "Seminoles", coach: "Mike Norvell", established: 1851, conference_id: "acc", power_4: true },
  { name: "Clemson Tigers", abbreviation: "CLEM", conference: "ACC", division: "Atlantic", location: "Clemson, SC", stadium: "Memorial Stadium", capacity: 81500, colors: ["#F56600", "#522D80"], mascot: "Tigers", coach: "Dabo Swinney", established: 1889, conference_id: "acc", power_4: true },
  { name: "Louisville Cardinals", abbreviation: "LOU", conference: "ACC", division: "Atlantic", location: "Louisville, KY", stadium: "L&N Federal Credit Union Stadium", capacity: 60000, colors: ["#AD0000", "#000000"], mascot: "Cardinals", coach: "Jeff Brohm", established: 1798, conference_id: "acc", power_4: true },
  { name: "NC State Wolfpack", abbreviation: "NCST", conference: "ACC", division: "Atlantic", location: "Raleigh, NC", stadium: "Carter-Finley Stadium", capacity: 57400, colors: ["#CC0000", "#000000"], mascot: "Wolfpack", coach: "Dave Doeren", established: 1887, conference_id: "acc", power_4: true },
  { name: "Boston College Eagles", abbreviation: "BC", conference: "ACC", division: "Atlantic", location: "Chestnut Hill, MA", stadium: "Alumni Stadium", capacity: 44500, colors: ["#880000", "#B8860B"], mascot: "Eagles", coach: "Bill O'Brien", established: 1863, conference_id: "acc", power_4: true },
  { name: "Syracuse Orange", abbreviation: "SYR", conference: "ACC", division: "Atlantic", location: "Syracuse, NY", stadium: "JMA Wireless Dome", capacity: 49057, colors: ["#FF4500", "#000000"], mascot: "Orange", coach: "Fran Brown", established: 1870, conference_id: "acc", power_4: true },
  { name: "Wake Forest Demon Deacons", abbreviation: "WAKE", conference: "ACC", division: "Atlantic", location: "Winston-Salem, NC", stadium: "Truist Field", capacity: 31500, colors: ["#9D2235", "#000000"], mascot: "Demon Deacons", coach: "Dave Clawson", established: 1834, conference_id: "acc", power_4: true },
  
  // Coastal Division
  { name: "Miami Hurricanes", abbreviation: "MIA", conference: "ACC", division: "Coastal", location: "Coral Gables, FL", stadium: "Hard Rock Stadium", capacity: 65326, colors: ["#00A3E0", "#00A651"], mascot: "Hurricanes", coach: "Mario Cristobal", established: 1925, conference_id: "acc", power_4: true },
  { name: "Virginia Tech Hokies", abbreviation: "VT", conference: "ACC", division: "Coastal", location: "Blacksburg, VA", stadium: "Lane Stadium", capacity: 66233, colors: ["#862633", "#FF6600"], mascot: "Hokies", coach: "Brent Pry", established: 1872, conference_id: "acc", power_4: true },
  { name: "North Carolina Tar Heels", abbreviation: "UNC", conference: "ACC", division: "Coastal", location: "Chapel Hill, NC", stadium: "Kenan Memorial Stadium", capacity: 50900, colors: ["#7BA7BC", "#FFFFFF"], mascot: "Tar Heels", coach: "Mack Brown", established: 1789, conference_id: "acc", power_4: true },
  { name: "Duke Blue Devils", abbreviation: "DUKE", conference: "ACC", division: "Coastal", location: "Durham, NC", stadium: "Wallace Wade Stadium", capacity: 40004, colors: ["#003087", "#FFFFFF"], mascot: "Blue Devils", coach: "Manny Diaz", established: 1838, conference_id: "acc", power_4: true },
  { name: "Georgia Tech Yellow Jackets", abbreviation: "GT", conference: "ACC", division: "Coastal", location: "Atlanta, GA", stadium: "Bobby Dodd Stadium", capacity: 55000, colors: ["#B3A369", "#003057"], mascot: "Yellow Jackets", coach: "Brent Key", established: 1885, conference_id: "acc", power_4: true },
  { name: "Pittsburgh Panthers", abbreviation: "PITT", conference: "ACC", division: "Coastal", location: "Pittsburgh, PA", stadium: "Acrisure Stadium", capacity: 68400, colors: ["#FFB81C", "#003263"], mascot: "Panthers", coach: "Pat Narduzzi", established: 1787, conference_id: "acc", power_4: true },
  { name: "Virginia Cavaliers", abbreviation: "UVA", conference: "ACC", division: "Coastal", location: "Charlottesville, VA", stadium: "Scott Stadium", capacity: 61500, colors: ["#232D4B", "#E57200"], mascot: "Cavaliers", coach: "Tony Elliott", established: 1819, conference_id: "acc", power_4: true },
  
  // New Additions
  { name: "SMU Mustangs", abbreviation: "SMU", conference: "ACC", division: "Atlantic", location: "Dallas, TX", stadium: "Gerald J. Ford Stadium", capacity: 32000, colors: ["#C8102E", "#000000"], mascot: "Mustangs", coach: "Rhett Lashlee", established: 1911, conference_id: "acc", power_4: true },
  { name: "California Golden Bears", abbreviation: "CAL", conference: "ACC", division: "Coastal", location: "Berkeley, CA", stadium: "California Memorial Stadium", capacity: 63000, colors: ["#C4820E", "#003262"], mascot: "Golden Bears", coach: "Justin Wilcox", established: 1868, conference_id: "acc", power_4: true },
  { name: "Stanford Cardinal", abbreviation: "STAN", conference: "ACC", division: "Coastal", location: "Stanford, CA", stadium: "Stanford Stadium", capacity: 50424, colors: ["#8C1515", "#FFFFFF"], mascot: "Cardinal", coach: "Troy Taylor", established: 1885, conference_id: "acc", power_4: true }
];

// SEC Teams - Preserved from /api/sec/route.ts
export const SEC_TEAMS: ConferenceTeam[] = [
  // East Division
  { name: "Georgia Bulldogs", abbreviation: "UGA", conference: "SEC", division: "East", location: "Athens, GA", stadium: "Sanford Stadium", capacity: 92746, colors: ["#BA0C2F", "#000000"], mascot: "Bulldogs", coach: "Kirby Smart", established: 1785, conference_id: "sec", power_4: true },
  { name: "Florida Gators", abbreviation: "UF", conference: "SEC", division: "East", location: "Gainesville, FL", stadium: "Ben Hill Griffin Stadium", capacity: 88548, colors: ["#0021A5", "#FA4616"], mascot: "Gators", coach: "Billy Napier", established: 1853, conference_id: "sec", power_4: true },
  { name: "Tennessee Volunteers", abbreviation: "TENN", conference: "SEC", division: "East", location: "Knoxville, TN", stadium: "Neyland Stadium", capacity: 101915, colors: ["#FF8200", "#FFFFFF"], mascot: "Volunteers", coach: "Josh Heupel", established: 1794, conference_id: "sec", power_4: true },
  { name: "Kentucky Wildcats", abbreviation: "UK", conference: "SEC", division: "East", location: "Lexington, KY", stadium: "Kroger Field", capacity: 61000, colors: ["#003DA5", "#FFFFFF"], mascot: "Wildcats", coach: "Mark Stoops", established: 1865, conference_id: "sec", power_4: true },
  { name: "South Carolina Gamecocks", abbreviation: "SC", conference: "SEC", division: "East", location: "Columbia, SC", stadium: "Williams-Brice Stadium", capacity: 77559, colors: ["#73000A", "#000000"], mascot: "Gamecocks", coach: "Shane Beamer", established: 1801, conference_id: "sec", power_4: true },
  { name: "Missouri Tigers", abbreviation: "MIZ", conference: "SEC", division: "East", location: "Columbia, MO", stadium: "Memorial Stadium", capacity: 62000, colors: ["#000000", "#F1B82D"], mascot: "Tigers", coach: "Eli Drinkwitz", established: 1839, conference_id: "sec", power_4: true },
  { name: "Vanderbilt Commodores", abbreviation: "VAN", conference: "SEC", division: "East", location: "Nashville, TN", stadium: "FirstBank Stadium", capacity: 40350, colors: ["#000000", "#B8860B"], mascot: "Commodores", coach: "Clark Lea", established: 1873, conference_id: "sec", power_4: true },
  
  // West Division
  { name: "Alabama Crimson Tide", abbreviation: "ALA", conference: "SEC", division: "West", location: "Tuscaloosa, AL", stadium: "Bryant-Denny Stadium", capacity: 100077, colors: ["#9E1B32", "#FFFFFF"], mascot: "Crimson Tide", coach: "Kalen DeBoer", established: 1831, conference_id: "sec", power_4: true },
  { name: "LSU Tigers", abbreviation: "LSU", conference: "SEC", division: "West", location: "Baton Rouge, LA", stadium: "Tiger Stadium", capacity: 102321, colors: ["#461D7C", "#FDB927"], mascot: "Tigers", coach: "Brian Kelly", established: 1860, conference_id: "sec", power_4: true },
  { name: "Texas A&M Aggies", abbreviation: "TAMU", conference: "SEC", division: "West", location: "College Station, TX", stadium: "Kyle Field", capacity: 102733, colors: ["#500000", "#FFFFFF"], mascot: "Aggies", coach: "Mike Elko", established: 1876, conference_id: "sec", power_4: true },
  { name: "Ole Miss Rebels", abbreviation: "MISS", conference: "SEC", division: "West", location: "Oxford, MS", stadium: "Vaught-Hemingway Stadium", capacity: 64038, colors: ["#002147", "#C41E3A"], mascot: "Rebels", coach: "Lane Kiffin", established: 1848, conference_id: "sec", power_4: true },
  { name: "Mississippi State Bulldogs", abbreviation: "MSST", conference: "SEC", division: "West", location: "Starkville, MS", stadium: "Davis Wade Stadium", capacity: 61337, colors: ["#660000", "#FFFFFF"], mascot: "Bulldogs", coach: "Jeff Lebby", established: 1878, conference_id: "sec", power_4: true },
  { name: "Arkansas Razorbacks", abbreviation: "ARK", conference: "SEC", division: "West", location: "Fayetteville, AR", stadium: "Donald W. Reynolds Razorback Stadium", capacity: 76412, colors: ["#9D2235", "#FFFFFF"], mascot: "Razorbacks", coach: "Sam Pittman", established: 1871, conference_id: "sec", power_4: true },
  { name: "Auburn Tigers", abbreviation: "AUB", conference: "SEC", division: "West", location: "Auburn, AL", stadium: "Jordan-Hare Stadium", capacity: 87451, colors: ["#0C2340", "#E31837"], mascot: "Tigers", coach: "Hugh Freeze", established: 1856, conference_id: "sec", power_4: true },
  { name: "Oklahoma Sooners", abbreviation: "OU", conference: "SEC", division: "West", location: "Norman, OK", stadium: "Gaylord Family Oklahoma Memorial Stadium", capacity: 86312, colors: ["#841617", "#FFFFFF"], mascot: "Sooners", coach: "Brent Venables", established: 1890, conference_id: "sec", power_4: true },
  { name: "Texas Longhorns", abbreviation: "TEX", conference: "SEC", division: "West", location: "Austin, TX", stadium: "Darrell K Royal-Texas Memorial Stadium", capacity: 100119, colors: ["#BF5700", "#FFFFFF"], mascot: "Longhorns", coach: "Steve Sarkisian", established: 1883, conference_id: "sec", power_4: true }
];

// Big 12 Teams - Preserved from /api/big12/route.ts with color format normalized
export const BIG12_TEAMS: ConferenceTeam[] = [
  { name: "Arizona Wildcats", school: "Arizona Wildcats", abbreviation: "ARIZ", conference: "Big 12", colors: ["#CC0033", "#003366"], mascot: "Wildcats", conference_id: "big12", power_4: true },
  { name: "Arizona State Sun Devils", school: "Arizona State Sun Devils", abbreviation: "ASU", conference: "Big 12", colors: ["#8C1D40", "#FFC627"], mascot: "Sun Devils", conference_id: "big12", power_4: true },
  { name: "Baylor Bears", school: "Baylor Bears", abbreviation: "BAYL", conference: "Big 12", colors: ["#1F4E79", "#C8102E"], mascot: "Bears", conference_id: "big12", power_4: true },
  { name: "BYU Cougars", school: "BYU Cougars", abbreviation: "BYU", conference: "Big 12", colors: ["#002E5D", "#FFFFFF"], mascot: "Cougars", conference_id: "big12", power_4: true },
  { name: "Cincinnati Bearcats", school: "Cincinnati Bearcats", abbreviation: "CIN", conference: "Big 12", colors: ["#E00122", "#000000"], mascot: "Bearcats", conference_id: "big12", power_4: true },
  { name: "Colorado Buffaloes", school: "Colorado Buffaloes", abbreviation: "COLO", conference: "Big 12", colors: ["#CFB87C", "#000000"], mascot: "Buffaloes", conference_id: "big12", power_4: true },
  { name: "Houston Cougars", school: "Houston Cougars", abbreviation: "HOU", conference: "Big 12", colors: ["#C8102E", "#FFFFFF"], mascot: "Cougars", conference_id: "big12", power_4: true },
  { name: "Iowa State Cyclones", school: "Iowa State Cyclones", abbreviation: "ISU", conference: "Big 12", colors: ["#C8102E", "#FDBB30"], mascot: "Cyclones", conference_id: "big12", power_4: true },
  { name: "Kansas Jayhawks", school: "Kansas Jayhawks", abbreviation: "KU", conference: "Big 12", colors: ["#0051BA", "#E8000D"], mascot: "Jayhawks", conference_id: "big12", power_4: true },
  { name: "Kansas State Wildcats", school: "Kansas State Wildcats", abbreviation: "KSU", conference: "Big 12", colors: ["#512888", "#FFFFFF"], mascot: "Wildcats", conference_id: "big12", power_4: true },
  { name: "Oklahoma State Cowboys", school: "Oklahoma State Cowboys", abbreviation: "OKST", conference: "Big 12", colors: ["#FF7300", "#000000"], mascot: "Cowboys", conference_id: "big12", power_4: true },
  { name: "TCU Horned Frogs", school: "TCU Horned Frogs", abbreviation: "TCU", conference: "Big 12", colors: ["#4D1979", "#FFFFFF"], mascot: "Horned Frogs", conference_id: "big12", power_4: true },
  { name: "Texas Tech Red Raiders", school: "Texas Tech Red Raiders", abbreviation: "TTU", conference: "Big 12", colors: ["#CC0000", "#000000"], mascot: "Red Raiders", conference_id: "big12", power_4: true },
  { name: "UCF Knights", school: "UCF Knights", abbreviation: "UCF", conference: "Big 12", colors: ["#000000", "#FFC904"], mascot: "Knights", conference_id: "big12", power_4: true },
  { name: "Utah Utes", school: "Utah Utes", abbreviation: "UTAH", conference: "Big 12", colors: ["#CC0000", "#FFFFFF"], mascot: "Utes", conference_id: "big12", power_4: true },
  { name: "West Virginia Mountaineers", school: "West Virginia Mountaineers", abbreviation: "WVU", conference: "Big 12", colors: ["#002855", "#EAAA00"], mascot: "Mountaineers", conference_id: "big12", power_4: true }
];

// Big Ten Teams - Need to extract from /api/bigten/route.ts
export const BIGTEN_TEAMS: ConferenceTeam[] = [
  // East Division
  { name: "Indiana Hoosiers", abbreviation: "IND", conference: "Big Ten", division: "East", colors: ["#990000", "#FFFFFF"], mascot: "Hoosiers", conference_id: "bigten", power_4: true },
  { name: "Maryland Terrapins", abbreviation: "MD", conference: "Big Ten", division: "East", colors: ["#E03A3E", "#FFD520"], mascot: "Terrapins", conference_id: "bigten", power_4: true },
  { name: "Michigan Wolverines", abbreviation: "MICH", conference: "Big Ten", division: "East", colors: ["#00274C", "#FFCB05"], mascot: "Wolverines", conference_id: "bigten", power_4: true },
  { name: "Michigan State Spartans", abbreviation: "MSU", conference: "Big Ten", division: "East", colors: ["#18453B", "#FFFFFF"], mascot: "Spartans", conference_id: "bigten", power_4: true },
  { name: "Ohio State Buckeyes", abbreviation: "OSU", conference: "Big Ten", division: "East", colors: ["#BB0000", "#666666"], mascot: "Buckeyes", conference_id: "bigten", power_4: true },
  { name: "Oregon Ducks", abbreviation: "ORE", conference: "Big Ten", division: "East", colors: ["#154733", "#FEE11A"], mascot: "Ducks", conference_id: "bigten", power_4: true },
  { name: "Penn State Nittany Lions", abbreviation: "PSU", conference: "Big Ten", division: "East", colors: ["#041E42", "#FFFFFF"], mascot: "Nittany Lions", conference_id: "bigten", power_4: true },
  { name: "Rutgers Scarlet Knights", abbreviation: "RUTG", conference: "Big Ten", division: "East", colors: ["#CC0033", "#5F6A72"], mascot: "Scarlet Knights", conference_id: "bigten", power_4: true },
  { name: "Washington Huskies", abbreviation: "WASH", conference: "Big Ten", division: "East", colors: ["#4B2E83", "#B7A57A"], mascot: "Huskies", conference_id: "bigten", power_4: true },
  
  // West Division
  { name: "Illinois Fighting Illini", abbreviation: "ILL", conference: "Big Ten", division: "West", colors: ["#E84A27", "#13294B"], mascot: "Fighting Illini", conference_id: "bigten", power_4: true },
  { name: "Iowa Hawkeyes", abbreviation: "IOWA", conference: "Big Ten", division: "West", colors: ["#FFCD00", "#000000"], mascot: "Hawkeyes", conference_id: "bigten", power_4: true },
  { name: "Minnesota Golden Gophers", abbreviation: "MINN", conference: "Big Ten", division: "West", colors: ["#7A0019", "#FFCC33"], mascot: "Golden Gophers", conference_id: "bigten", power_4: true },
  { name: "Nebraska Cornhuskers", abbreviation: "NEB", conference: "Big Ten", division: "West", colors: ["#E41C38", "#FDF3E7"], mascot: "Cornhuskers", conference_id: "bigten", power_4: true },
  { name: "Northwestern Wildcats", abbreviation: "NW", conference: "Big Ten", division: "West", colors: ["#4E2A84", "#FFFFFF"], mascot: "Wildcats", conference_id: "bigten", power_4: true },
  { name: "Purdue Boilermakers", abbreviation: "PUR", conference: "Big Ten", division: "West", colors: ["#CEB888", "#000000"], mascot: "Boilermakers", conference_id: "bigten", power_4: true },
  { name: "UCLA Bruins", abbreviation: "UCLA", conference: "Big Ten", division: "West", colors: ["#2D68C4", "#F2A900"], mascot: "Bruins", conference_id: "bigten", power_4: true },
  { name: "USC Trojans", abbreviation: "USC", conference: "Big Ten", division: "West", colors: ["#990000", "#FFC72C"], mascot: "Trojans", conference_id: "bigten", power_4: true },
  { name: "Wisconsin Badgers", abbreviation: "WIS", conference: "Big Ten", division: "West", colors: ["#C5050C", "#FFFFFF"], mascot: "Badgers", conference_id: "bigten", power_4: true }
];

// Helper function to get all teams
export function getAllTeams(): ConferenceTeam[] {
  return [...ACC_TEAMS, ...SEC_TEAMS, ...BIG12_TEAMS, ...BIGTEN_TEAMS];
}

// Helper function to get teams by conference
export function getTeamsByConference(conference: string): ConferenceTeam[] {
  const conferenceUpper = conference.toUpperCase();
  switch (conferenceUpper) {
    case 'ACC':
      return ACC_TEAMS;
    case 'SEC':
      return SEC_TEAMS;
    case 'BIG12':
    case 'BIG 12':
      return BIG12_TEAMS;
    case 'BIGTEN':
    case 'BIG TEN':
    case 'BIG10':
      return BIGTEN_TEAMS;
    default:
      return [];
  }
}

// Helper to normalize team colors to array format
export function normalizeColors(team: ConferenceTeam): string[] {
  if (Array.isArray(team.colors)) {
    return team.colors;
  }
  // Handle Big 12 format { color, altColor }
  if (typeof team.colors === 'object' && 'color' in team.colors) {
    return [team.colors.color, team.colors.altColor];
  }
  return ['#000000', '#FFFFFF']; // Default fallback
}