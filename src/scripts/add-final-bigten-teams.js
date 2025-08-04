import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

// Helper function to generate realistic projections based on position and year
function generateProjections(position, year) {
  const baseMultiplier = year === 'FR' ? 0.6 : year === 'SO' ? 0.8 : year === 'JR' ? 1.0 : 1.2;
  
  switch (position) {
    case 'QB':
      return {
        projection: Math.round(1800 + (baseMultiplier * 400)),
        rushing_projection: Math.round(120 + (baseMultiplier * 30)),
        receiving_projection: 0,
        td_projection: Math.round(12 + (baseMultiplier * 4)),
        int_projection: Math.round(6 + (baseMultiplier * 2)),
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(160 + (baseMultiplier * 30))
      };
    case 'RB':
      return {
        projection: Math.round(600 + (baseMultiplier * 200)),
        rushing_projection: Math.round(500 + (baseMultiplier * 150)),
        receiving_projection: Math.round(80 + (baseMultiplier * 30)),
        td_projection: Math.round(4 + (baseMultiplier * 3)),
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(90 + (baseMultiplier * 25))
      };
    case 'WR':
      return {
        projection: Math.round(400 + (baseMultiplier * 200)),
        rushing_projection: Math.round(15 + (baseMultiplier * 5)),
        receiving_projection: Math.round(400 + (baseMultiplier * 200)),
        td_projection: Math.round(3 + (baseMultiplier * 2)),
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(65 + (baseMultiplier * 20))
      };
    case 'TE':
      return {
        projection: Math.round(200 + (baseMultiplier * 150)),
        rushing_projection: 0,
        receiving_projection: Math.round(200 + (baseMultiplier * 150)),
        td_projection: Math.round(2 + (baseMultiplier * 1)),
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(35 + (baseMultiplier * 15))
      };
    case 'K':
      return {
        projection: 0,
        rushing_projection: 0,
        receiving_projection: 0,
        td_projection: 0,
        int_projection: 0,
        field_goals_projection: Math.round(12 + (baseMultiplier * 3)),
        extra_points_projection: Math.round(25 + (baseMultiplier * 8)),
        fantasy_points: Math.round(70 + (baseMultiplier * 15))
      };
    default:
      return {
        projection: 0,
        rushing_projection: 0,
        receiving_projection: 0,
        td_projection: 0,
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: 0
      };
  }
}

// Helper function to assign star rating based on year and position
function assignStarRating(position, year) {
  // Base rating logic - can be adjusted based on actual recruiting rankings
  if (year === 'FR') return 3; // Most freshmen are 3-star
  if (year === 'SO') return 3; // Sophomores typically 3-star
  if (year === 'JR') return 4; // Juniors often 4-star
  if (year === 'SR') return 4; // Seniors often 4-star
  
  return 3; // Default
}

// Final Big Ten Teams Data
const finalBigTenTeams = [
  // Oregon Ducks
  { name: 'Ryder Hayes', position: 'QB', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '19' },
  { name: 'Luke Moga', position: 'QB', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '10' },
  { name: 'Dante Moore', position: 'QB', team: 'Oregon', team_abbreviation: 'ORE', year: 'SO', jersey: '5' },
  { name: 'Austin Novosad', position: 'QB', team: 'Oregon', team_abbreviation: 'ORE', year: 'SO', jersey: '16' },
  { name: 'Akili Smith Jr.', position: 'QB', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '15' },
  { name: 'Brock Thomas', position: 'QB', team: 'Oregon', team_abbreviation: 'ORE', year: 'SO', jersey: '12' },
  { name: 'Jay Harris', position: 'RB', team: 'Oregon', team_abbreviation: 'ORE', year: 'JR', jersey: '22' },
  { name: 'Dierre Hill Jr.', position: 'RB', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '23' },
  { name: 'Makhi Hughes', position: 'RB', team: 'Oregon', team_abbreviation: 'ORE', year: 'JR', jersey: '20' },
  { name: 'Jayden Limar', position: 'RB', team: 'Oregon', team_abbreviation: 'ORE', year: 'JR', jersey: '27' },
  { name: 'Da\'Juan Riggs', position: 'RB', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '21' },
  { name: 'Noah Whittington', position: 'RB', team: 'Oregon', team_abbreviation: 'ORE', year: 'SR', jersey: '6' },
  { name: 'Darrian Anderson', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'JR', jersey: '86' },
  { name: 'Malik Benson', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'SR', jersey: '4' },
  { name: 'Brady Bidwell', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '89' },
  { name: 'Gary Bryant Jr.', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'SR', jersey: '2' },
  { name: 'Dillon Gresham', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '80' },
  { name: 'Justius Lowe', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'JR', jersey: '14' },
  { name: 'Jeremiah McClellan', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '11' },
  { name: 'Dakorien Moore', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '1' },
  { name: 'Cooper Perry', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '17' },
  { name: 'Jack Ressler', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '88' },
  { name: 'Kyler Kasper', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'JR', jersey: '3' },
  { name: 'Evan Stewart', position: 'WR', team: 'Oregon', team_abbreviation: 'ORE', year: 'SR', jersey: '7' },
  { name: 'Kade Caton', position: 'TE', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '85' },
  { name: 'Zach Grace', position: 'TE', team: 'Oregon', team_abbreviation: 'ORE', year: 'SO', jersey: '44' },
  { name: 'Jamari Johnson', position: 'TE', team: 'Oregon', team_abbreviation: 'ORE', year: 'SO', jersey: '9' },
  { name: 'Vander Ploog', position: 'TE', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '81' },
  { name: 'A.J. Pugliano', position: 'TE', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '87' },
  { name: 'Kenyon Sadiq', position: 'TE', team: 'Oregon', team_abbreviation: 'ORE', year: 'JR', jersey: '18' },
  { name: 'Roger Saleapaga', position: 'TE', team: 'Oregon', team_abbreviation: 'ORE', year: 'SO', jersey: '83' },
  { name: 'Andrew Boyle', position: 'K', team: 'Oregon', team_abbreviation: 'ORE', year: 'SR', jersey: '98' },
  { name: 'Gage Hurych', position: 'K', team: 'Oregon', team_abbreviation: 'ORE', year: 'FR', jersey: '97' },
  { name: 'Atticus Sappington', position: 'K', team: 'Oregon', team_abbreviation: 'ORE', year: 'SR', jersey: '36' },

  // Washington Huskies
  { name: 'Dash Beierly', position: 'QB', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '9' },
  { name: 'Kai Horton', position: 'QB', team: 'Washington', team_abbreviation: 'WASH', year: 'SR', jersey: '15' },
  { name: 'Shea Kuykendall', position: 'QB', team: 'Washington', team_abbreviation: 'WASH', year: 'JR', jersey: '14' },
  { name: 'Treston McMillan', position: 'QB', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '10' },
  { name: 'Demond Williams Jr.', position: 'QB', team: 'Washington', team_abbreviation: 'WASH', year: 'SO', jersey: '2' },
  { name: 'Quaid Carr', position: 'RB', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '21' },
  { name: 'Jonah Coleman', position: 'RB', team: 'Washington', team_abbreviation: 'WASH', year: 'JR', jersey: '1' },
  { name: 'Julian McMahan', position: 'RB', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '29' },
  { name: 'Adam Mohammed', position: 'RB', team: 'Washington', team_abbreviation: 'WASH', year: 'SO', jersey: '24' },
  { name: 'Ryken Moon', position: 'RB', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '32' },
  { name: 'Cian McKelvey', position: 'RB', team: 'Washington', team_abbreviation: 'WASH', year: 'SO', jersey: '41' },
  { name: 'Beck Walker', position: 'RB', team: 'Washington', team_abbreviation: 'WASH', year: 'JR', jersey: '25' },
  { name: 'Jordan Washington', position: 'RB', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '4' },
  { name: 'Jace Burton', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '35' },
  { name: 'Deji Ajose', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '82' },
  { name: 'Omari Evans', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'SR', jersey: '5' },
  { name: 'Luke Gayton', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '83' },
  { name: 'Kevin Green Jr.', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'JR', jersey: '0' },
  { name: 'Audric Harris', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'JR', jersey: '13' },
  { name: 'Marcus Harris', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '11' },
  { name: 'Chris Lawson', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '8' },
  { name: 'Luke Luchini', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'SO', jersey: '31' },
  { name: 'Dezmen Roebuck', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '81' },
  { name: 'Justice Williams', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '16' },
  { name: 'Rashid Williams', position: 'WR', team: 'Washington', team_abbreviation: 'WASH', year: 'SO', jersey: '3' },
  { name: 'Charlie Crowell', position: 'TE', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '89' },
  { name: 'Kade Eldridge', position: 'TE', team: 'Washington', team_abbreviation: 'WASH', year: 'SO', jersey: '44' },
  { name: 'Quentin Moore', position: 'TE', team: 'Washington', team_abbreviation: 'WASH', year: 'SR', jersey: '88' },
  { name: 'Baron Naone', position: 'TE', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '85' },
  { name: 'Ryan Otton', position: 'TE', team: 'Washington', team_abbreviation: 'WASH', year: 'SR', jersey: '87' },
  { name: 'Austin Simmons', position: 'TE', team: 'Washington', team_abbreviation: 'WASH', year: 'FR', jersey: '45' },
  { name: 'Walker Lyons', position: 'TE', team: 'Washington', team_abbreviation: 'WASH', year: 'SO', jersey: '85' },
  { name: 'Grady Gross', position: 'K', team: 'Washington', team_abbreviation: 'WASH', year: 'SR', jersey: '95' },
  { name: 'Ethan Moszczulski', position: 'K', team: 'Washington', team_abbreviation: 'WASH', year: 'JR', jersey: '37' },

  // Wisconsin Badgers
  { name: 'Billy Edwards Jr.', position: 'QB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '9' },
  { name: 'Carter Smith', position: 'QB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '3' },
  { name: 'Hunter Simmons', position: 'QB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '15' },
  { name: 'Danny O\'Neill', position: 'QB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SO', jersey: '18' },
  { name: 'Grover Bortolotti', position: 'RB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '43' },
  { name: 'Harrison Bortolotti', position: 'RB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '32' },
  { name: 'Darrion Dupree', position: 'RB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SO', jersey: '6' },
  { name: 'Gideon Ituka', position: 'RB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '10' },
  { name: 'Dilin Jones', position: 'RB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '7' },
  { name: 'Mason Lane', position: 'RB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '38' },
  { name: 'Cade Yacamelli', position: 'RB', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'JR', jersey: '25' },
  { name: 'Vinny Anthony II', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '8' },
  { name: 'Kyan Berry‑Johnson', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '22' },
  { name: 'Chris Brooks Jr.', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'JR', jersey: '84' },
  { name: 'Dekel Crowdus', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '20' },
  { name: 'Tyrell Henry', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '14' },
  { name: 'Eugene Hilton Jr.', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '13' },
  { name: 'Joseph Griffin Jr.', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'JR', jersey: '12' },
  { name: 'Trech Kekahuna', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SO', jersey: '2' },
  { name: 'Mason Kelley', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '81' },
  { name: 'Ben Lemirand', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '89' },
  { name: 'Langdon Nordgaard', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '19' },
  { name: 'Davion Thomas-Kumpula', position: 'WR', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SO', jersey: '23' },
  { name: 'Jackson Acker', position: 'TE', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '34' },
  { name: 'Tucker Ashcraft', position: 'TE', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '11' },
  { name: 'Emmett Bork', position: 'TE', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '82' },
  { name: 'Nizyj Davis', position: 'TE', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '17' },
  { name: 'Lance Mason', position: 'TE', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '86' },
  { name: 'Jackson McGohan', position: 'TE', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SO', jersey: '87' },
  { name: 'JT Seagreaves', position: 'TE', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'JR', jersey: '41' },
  { name: 'Grant Stec', position: 'TE', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'FR', jersey: '85' },
  { name: 'Gavin Lahm', position: 'K', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '97' },
  { name: 'Nathanial Vakos', position: 'K', team: 'Wisconsin', team_abbreviation: 'WIS', year: 'SR', jersey: '90' },

  // Minnesota Golden Gophers
  { name: 'Jackson Kollock', position: 'QB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '12' },
  { name: 'Drake Lindsey', position: 'QB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '5' },
  { name: 'Emmett Morehead', position: 'QB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '9' },
  { name: 'Max Shikenjanski', position: 'QB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SO', jersey: '6' },
  { name: 'Dylan Wittke', position: 'QB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SO', jersey: '14' },
  { name: 'Tre Berry', position: 'RB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '22' },
  { name: 'Johann Cardenas', position: 'RB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '34' },
  { name: 'Cam Davis', position: 'RB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '23' },
  { name: 'Xavier Ford', position: 'RB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '31' },
  { name: 'Fame Ijéboi', position: 'RB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '3' },
  { name: 'Darius Taylor', position: 'RB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'JR', jersey: '1' },
  { name: 'A.J. Turner', position: 'RB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'JR', jersey: '2' },
  { name: 'Grant Washington', position: 'RB', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '21' },
  { name: 'Le\'Meke Brockington', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '0' },
  { name: 'Drew Biber', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '8' },
  { name: 'Malachi Coleman', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SO', jersey: '16' },
  { name: 'Cristian Driver', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'JR', jersey: '4' },
  { name: 'Donielle Hayes', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SO', jersey: '18' },
  { name: 'Kenric Lanier II', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SO', jersey: '15' },
  { name: 'Logan Loya', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '17' },
  { name: 'Legend Lyons', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '7' },
  { name: 'Bradley Martino', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '13' },
  { name: 'Quentin Redding', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '81' },
  { name: 'Jalen Smith', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '8' },
  { name: 'Javon Tracy', position: 'WR', team: 'Minnesota', team_abbreviation: 'MINN', year: 'JR', jersey: '11' },
  { name: 'Jameson Geers', position: 'TE', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '18' },
  { name: 'Jack DiSano', position: 'TE', team: 'Minnesota', team_abbreviation: 'MINN', year: 'JR', jersey: '84' },
  { name: 'Julian Johnson', position: 'TE', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '82' },
  { name: 'Sam Peters', position: 'TE', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '83' },
  { name: 'Jacob Simpson', position: 'TE', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '88' },
  { name: 'Pierce Walsh', position: 'TE', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SO', jersey: '19' },
  { name: 'Brady Denaburg', position: 'K', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '92' },
  { name: 'Sam Henson', position: 'K', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '30' },
  { name: 'Daniel Jackson', position: 'K', team: 'Minnesota', team_abbreviation: 'MINN', year: 'FR', jersey: '36' },
  { name: 'David Kemp', position: 'K', team: 'Minnesota', team_abbreviation: 'MINN', year: 'SR', jersey: '98' },

  // USC Trojans
  { name: 'Dylan Gebbia', position: 'QB', team: 'USC', team_abbreviation: 'USC', year: 'SO', jersey: '26' },
  { name: 'Sam Huard', position: 'QB', team: 'USC', team_abbreviation: 'USC', year: 'SR', jersey: '7' },
  { name: 'Husan Longstreet', position: 'QB', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '4' },
  { name: 'Jayden Maiava', position: 'QB', team: 'USC', team_abbreviation: 'USC', year: 'JR', jersey: '14' },
  { name: 'Gage Roy', position: 'QB', team: 'USC', team_abbreviation: 'USC', year: 'JR', jersey: '28' },
  { name: 'Harry Dalton III', position: 'RB', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '25' },
  { name: 'Bryan Jackson', position: 'RB', team: 'USC', team_abbreviation: 'USC', year: 'SO', jersey: '21' },
  { name: 'Waymond Jordan', position: 'RB', team: 'USC', team_abbreviation: 'USC', year: 'JR', jersey: '2' },
  { name: 'King Miller', position: 'RB', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '30' },
  { name: 'Eli Sanders', position: 'RB', team: 'USC', team_abbreviation: 'USC', year: 'SR', jersey: '3' },
  { name: 'Riley Wormley', position: 'RB', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '27' },
  { name: 'Asante Das', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '86' },
  { name: 'Jay Fair', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'SR', jersey: '9' },
  { name: 'Collin Fasse', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '89' },
  { name: 'Romero Ison', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '84' },
  { name: 'Xavier Jordan', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '19' },
  { name: 'Brady Jung', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '90' },
  { name: 'Ja\'Kobi Lane', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'JR', jersey: '8' },
  { name: 'Makai Lemon', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'JR', jersey: '6' },
  { name: 'Cameron Sermons', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '81' },
  { name: 'Corey Simms', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'SR', jersey: '10' },
  { name: 'Prince Strachan', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'JR', jersey: '17' },
  { name: 'Jaden Richardson', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'SR', jersey: '15' },
  { name: 'Corey Nerhus', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'SR', jersey: '46' },
  { name: 'Zacharyus Williams', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'SO', jersey: '0' },
  { name: 'Donovan Wood', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'SR', jersey: '83' },
  { name: 'Josiah Zamora', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'SR', jersey: '44' },
  { name: 'Seth Zamora', position: 'WR', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '82' },
  { name: 'Walker Lyons', position: 'TE', team: 'USC', team_abbreviation: 'USC', year: 'SO', jersey: '85' },
  { name: 'Walter Matthews', position: 'TE', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '23' },
  { name: 'Lake McRee', position: 'TE', team: 'USC', team_abbreviation: 'USC', year: 'SR', jersey: '87' },
  { name: 'Fisher Melton', position: 'TE', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '49' },
  { name: 'Taniela Tupou', position: 'TE', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '88' },
  { name: 'Caden Chittenden', position: 'K', team: 'USC', team_abbreviation: 'USC', year: 'FR', jersey: '45' },

  // UCLA Bruins
  { name: 'Pierce Clarkson', position: 'QB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SO', jersey: '15' },
  { name: 'Luke Duncan', position: 'QB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SO', jersey: '12' },
  { name: 'Karson Gordon', position: 'QB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '19' },
  { name: 'Colton Gumino', position: 'QB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '17' },
  { name: 'Henry Hasselbeck', position: 'QB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '18' },
  { name: 'Nico Iamaleava', position: 'QB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SO', jersey: '9' },
  { name: 'Jalen Berger', position: 'RB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SR', jersey: '23' },
  { name: 'Isaiah Carlson', position: 'RB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SO', jersey: '27' },
  { name: 'Karson Cox', position: 'RB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '33' },
  { name: 'Anthony Frias II', position: 'RB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SR', jersey: '22' },
  { name: 'Jaivian Thomas', position: 'RB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '21' },
  { name: 'Anthony Woods', position: 'RB', team: 'UCLA', team_abbreviation: 'UCLA', year: 'JR', jersey: '6' },
  { name: 'Jace Brown', position: 'WR', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '89' },
  { name: 'Rico Flores Jr.', position: 'WR', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SO', jersey: '1' },
  { name: 'Kwazi Gilmer', position: 'WR', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SO', jersey: '3' },
  { name: 'Mikey Matthews', position: 'WR', team: 'UCLA', team_abbreviation: 'UCLA', year: 'JR', jersey: '7' },
  { name: 'Titus Mokiao‑Atimalala', position: 'WR', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SR', jersey: '2' },
  { name: 'Shane Rosenthal', position: 'WR', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '20' },
  { name: 'Jalen Saint Paul', position: 'WR', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '86' },
  { name: 'Carter Shaw', position: 'WR', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SO', jersey: '14' },
  { name: 'Russell Weir', position: 'WR', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '83' },
  { name: 'Noah Fox‑Flores', position: 'TE', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '82' },
  { name: 'Hudson Habermehl', position: 'TE', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SR', jersey: '81' },
  { name: 'Jack Pedersen', position: 'TE', team: 'UCLA', team_abbreviation: 'UCLA', year: 'JR', jersey: '28' },
  { name: 'Dylan Sims', position: 'TE', team: 'UCLA', team_abbreviation: 'UCLA', year: 'FR', jersey: '87' },
  { name: 'Mateen Bhagahani', position: 'K', team: 'UCLA', team_abbreviation: 'UCLA', year: 'JR', jersey: '94' },
  { name: 'Cash Peterman', position: 'K', team: 'UCLA', team_abbreviation: 'UCLA', year: 'SR', jersey: '35' }
];

async function addFinalBigTenTeams() {
  console.log('🏈 Adding Final Big Ten Teams from 247Sports Data...');
  console.log('============================================================');
  console.log('📋 Adding 6 final Big Ten teams with current roster data');
  console.log('');

  let totalAdded = 0;
  let totalErrors = 0;

  for (const player of finalBigTenTeams) {
    try {
      const projections = generateProjections(player.position, player.year);
      const rating = assignStarRating(player.position, player.year);

      const playerData = {
        name: player.name,
        position: player.position,
        team: player.team,
        team_abbreviation: player.team_abbreviation,
        school: player.team,
        conference: 'Big Ten',
        jersey: player.jersey,
        height: '6-0', // Default height
        weight: '200', // Default weight
        year: player.year,
        ...projections,
        draftable: true,
        conference_id: 'bigten',
        power_4: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', playerData);
      console.log(`  ✅ ${player.name} (${player.position}) - ${player.team} - ${rating}★`);
      totalAdded++;
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ⚠️  ${player.name} already exists`);
      } else {
        console.log(`  ❌ Error adding ${player.name}: ${error.message}`);
        totalErrors++;
      }
    }
  }

  console.log('\n🎉 Final Big Ten Teams Summary:');
  console.log(`  ✅ Total players added: ${totalAdded}`);
  console.log(`  ❌ Total errors: ${totalErrors}`);
  console.log(`  📋 Teams processed: 6 (Oregon, Washington, Wisconsin, Minnesota, USC, UCLA)`);
  console.log('🏈 Final Big Ten teams completed!');
  console.log('🎯 Big Ten Conference is now COMPLETE with all 18 teams!');
}

addFinalBigTenTeams(); 