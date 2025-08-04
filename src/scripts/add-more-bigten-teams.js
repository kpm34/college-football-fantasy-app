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

// Additional Big Ten Teams Data
const additionalBigTenTeams = [
  // Penn State Nittany Lions
  { name: 'Drew Allar', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '15' },
  { name: 'Ethan Grunkemeyer', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '17' },
  { name: 'Bekkem Kritza', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '16' },
  { name: 'Jack Lambert', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '19' },
  { name: 'Jaxon Smolik', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'JR', jersey: '14' },
  { name: 'Kaytron Allen', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '13' },
  { name: 'Jabree Coleman', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '21' },
  { name: 'Amiel Davis', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '30' },
  { name: 'Tikey Hayes', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '23' },
  { name: 'Tyler Holzworth', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '34' },
  { name: 'Quinton Martin Jr.', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '25' },
  { name: 'Nicholas Singleton', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '10' },
  { name: 'Corey Smith', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '24' },
  { name: 'Ethan Black', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '82' },
  { name: 'Josiah Brown', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '19' },
  { name: 'Liam Clifford', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '2' },
  { name: 'Logan Cunningham', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'JR', jersey: '31' },
  { name: 'Tyseer Denmark', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '4' },
  { name: 'Aaron Enterline', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '86' },
  { name: 'Jeff Exinor Jr.', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '80' },
  { name: 'Peter Gonzalez', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '84' },
  { name: 'Koby Howard', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '3' },
  { name: 'Kyron Hudson', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '1' },
  { name: 'Anthony Ivey', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'JR', jersey: '12' },
  { name: 'Matt Outten', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '6' },
  { name: 'Trebor Pena', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '8' },
  { name: 'Devonte Ross', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '5' },
  { name: 'Lyriq Samuel', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '11' },
  { name: 'Kaden Saunders', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'JR', jersey: '7' },
  { name: 'Khalil Dinkins', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '16' },
  { name: 'Finn Furmanek', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '89' },
  { name: 'Matt Henderson', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '44' },
  { name: 'Andrew Rappleyea', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '87' },
  { name: 'Luke Reynolds', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '85' },
  { name: 'Joey Schlaffer', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '18' },
  { name: 'Brian Kortovich', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '83' },
  { name: 'Ryan Barker', position: 'K', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '94' },
  { name: 'Matthew Parker', position: 'K', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '98' },

  // Ohio State Buckeyes
  { name: 'Lincoln Kienholz', position: 'QB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '3' },
  { name: 'Mason Maggs', position: 'QB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '16' },
  { name: 'Julian Sayin', position: 'QB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '10' },
  { name: 'Tavien St. Clair', position: 'QB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '9' },
  { name: 'Sam Dixon', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '24' },
  { name: 'C.J. Donaldson', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '12' },
  { name: 'Bo Jackson', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '25' },
  { name: 'James Peoples', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '20' },
  { name: 'Isaiah West', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '32' },
  { name: 'David Adolph', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '82' },
  { name: 'Nolan Baudo', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '23' },
  { name: 'Phillip Bell', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '7' },
  { name: 'Mylan Graham', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '5' },
  { name: 'Brandon Inniss', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '1' },
  { name: 'De\'Zie Jones', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '8' },
  { name: 'Shawn Lodge', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '80' },
  { name: 'Bodpegn Miller', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '18' },
  { name: 'Quincy Porter', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '11' },
  { name: 'Bryson Rodgers', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '13' },
  { name: 'Jeremiah Smith', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '4' },
  { name: 'Carnell Tate', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '17' },
  { name: 'Dorian Williams', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '84' },
  { name: 'Damarion Witten', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '81' },
  { name: 'Bennett Christian', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '85' },
  { name: 'Will Kacmarek', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '89' },
  { name: 'Max Klare', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '86' },
  { name: 'Maxence LeBlanc', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '88' },
  { name: 'Nate Roberts', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '83' },
  { name: 'Jelani Thurman', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '15' },
  { name: 'Jayden Fielding', position: 'K', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '38' },

  // Northwestern Wildcats
  { name: 'Ryan Boe', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '2' },
  { name: 'Gavin Frakes', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '13' },
  { name: 'Preston Stone', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '8' },
  { name: 'Marcus Romain', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '12' },
  { name: 'Sean Winton', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '15' },
  { name: 'Daniel Anderson', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '27' },
  { name: 'Joseph Himon II', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '6' },
  { name: 'Aidan Hubbard', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '41' },
  { name: 'Ronny Johnson', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '33' },
  { name: 'Caleb Komolafe', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '5' },
  { name: 'Albert Kunciks III', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '26' },
  { name: 'Cam Porter', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '4' },
  { name: 'Dashun Reeder', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '24' },
  { name: 'Ricky Ahumaraeze', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '10' },
  { name: 'Braden Bluiett', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '82' },
  { name: 'Frank Covey IV', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '3' },
  { name: 'Tate Crane', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '35' },
  { name: 'Hayden Eligon II', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '14' },
  { name: 'Chase Farrell', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '20' },
  { name: 'Carson Grove', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '87' },
  { name: 'Brennan Saxe', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '16' },
  { name: 'Drew Wagner', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '19' },
  { name: 'Griffin Wilde', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '17' },
  { name: 'Lawson Albright', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '16' },
  { name: 'Tyler Kielmeyer', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '48' },
  { name: 'Noah LaPorte', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '43' },
  { name: 'Alex Lines', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '18' },
  { name: 'Camp Magee', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '19' },
  { name: 'Chris Petrucci', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '81' },
  { name: 'Robby Preckel', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '41' },
  { name: 'Patrick Schaller', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '85' },
  { name: 'Blake Van Buren', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '83' },
  { name: 'Henry Helms', position: 'K', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '94' },
  { name: 'Jack Olsen', position: 'K', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '82' },

  // Maryland Terrapins
  { name: 'Jackson Hamilton', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '15' },
  { name: 'Roman Jensen', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '18' },
  { name: 'Justyn Martin', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '6' },
  { name: 'Khristian Martin', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '12' },
  { name: 'Malik Washington', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '7' },
  { name: 'Bud Coombs', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '19' },
  { name: 'Iverson Howard', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '24' },
  { name: 'Eli Mason', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '27' },
  { name: 'Josiah McLaurin', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '17' },
  { name: 'Nolan Ray', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '25' },
  { name: 'Colin Reynolds', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '29' },
  { name: 'DeJuan Williams', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '20' },
  { name: 'Justin DeVaughn', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '88' },
  { name: 'Jalil Farooq', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SR', jersey: '1' },
  { name: 'Shaleak Knotts', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SR', jersey: '4' },
  { name: 'Ryan Manning', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SR', jersey: '11' },
  { name: 'Jahmari Powell‑Wonson', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '81' },
  { name: 'Jordan Scott', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '14' },
  { name: 'Emerson Smith', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '83' },
  { name: 'Zymear Smith', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '10' },
  { name: 'Octavian Smith Jr.', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SR', jersey: '5' },
  { name: 'Kaleb Webb', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '84' },
  { name: 'Mekhai White', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '8' },
  { name: 'Sean Williams', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '21' },
  { name: 'Dorian Fleming', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '9' },
  { name: 'Leon Haughton Jr.', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '16' },
  { name: 'Thomas McCluskey', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '48' },
  { name: 'AJ Szymanski', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '89' },
  { name: 'JT Taggart', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '85' },
  { name: 'Ryan Capriotti', position: 'K', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '98' },
  { name: 'Gavin Marshall', position: 'K', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '46' },
  { name: 'Sean O\'Haire', position: 'K', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '36' }
];

async function addMoreBigTenTeams() {
  console.log('🏈 Adding More Big Ten Teams from 247Sports Data...');
  console.log('============================================================');
  console.log('📋 Adding 4 more Big Ten teams with current roster data');
  console.log('');

  let totalAdded = 0;
  let totalErrors = 0;

  for (const player of additionalBigTenTeams) {
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

  console.log('\n🎉 Additional Big Ten Teams Summary:');
  console.log(`  ✅ Total players added: ${totalAdded}`);
  console.log(`  ❌ Total errors: ${totalErrors}`);
  console.log(`  📋 Teams processed: 4 (Penn State, Ohio State, Northwestern, Maryland)`);
  console.log('🏈 Additional Big Ten teams completed!');
}

addMoreBigTenTeams(); 

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

// Additional Big Ten Teams Data
const additionalBigTenTeams = [
  // Penn State Nittany Lions
  { name: 'Drew Allar', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '15' },
  { name: 'Ethan Grunkemeyer', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '17' },
  { name: 'Bekkem Kritza', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '16' },
  { name: 'Jack Lambert', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '19' },
  { name: 'Jaxon Smolik', position: 'QB', team: 'Penn State', team_abbreviation: 'PSU', year: 'JR', jersey: '14' },
  { name: 'Kaytron Allen', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '13' },
  { name: 'Jabree Coleman', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '21' },
  { name: 'Amiel Davis', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '30' },
  { name: 'Tikey Hayes', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '23' },
  { name: 'Tyler Holzworth', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '34' },
  { name: 'Quinton Martin Jr.', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '25' },
  { name: 'Nicholas Singleton', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '10' },
  { name: 'Corey Smith', position: 'RB', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '24' },
  { name: 'Ethan Black', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '82' },
  { name: 'Josiah Brown', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '19' },
  { name: 'Liam Clifford', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '2' },
  { name: 'Logan Cunningham', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'JR', jersey: '31' },
  { name: 'Tyseer Denmark', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '4' },
  { name: 'Aaron Enterline', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '86' },
  { name: 'Jeff Exinor Jr.', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '80' },
  { name: 'Peter Gonzalez', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '84' },
  { name: 'Koby Howard', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '3' },
  { name: 'Kyron Hudson', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '1' },
  { name: 'Anthony Ivey', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'JR', jersey: '12' },
  { name: 'Matt Outten', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '6' },
  { name: 'Trebor Pena', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '8' },
  { name: 'Devonte Ross', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '5' },
  { name: 'Lyriq Samuel', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '11' },
  { name: 'Kaden Saunders', position: 'WR', team: 'Penn State', team_abbreviation: 'PSU', year: 'JR', jersey: '7' },
  { name: 'Khalil Dinkins', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SR', jersey: '16' },
  { name: 'Finn Furmanek', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '89' },
  { name: 'Matt Henderson', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '44' },
  { name: 'Andrew Rappleyea', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '87' },
  { name: 'Luke Reynolds', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '85' },
  { name: 'Joey Schlaffer', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '18' },
  { name: 'Brian Kortovich', position: 'TE', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '83' },
  { name: 'Ryan Barker', position: 'K', team: 'Penn State', team_abbreviation: 'PSU', year: 'SO', jersey: '94' },
  { name: 'Matthew Parker', position: 'K', team: 'Penn State', team_abbreviation: 'PSU', year: 'FR', jersey: '98' },

  // Ohio State Buckeyes
  { name: 'Lincoln Kienholz', position: 'QB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '3' },
  { name: 'Mason Maggs', position: 'QB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '16' },
  { name: 'Julian Sayin', position: 'QB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '10' },
  { name: 'Tavien St. Clair', position: 'QB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '9' },
  { name: 'Sam Dixon', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '24' },
  { name: 'C.J. Donaldson', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '12' },
  { name: 'Bo Jackson', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '25' },
  { name: 'James Peoples', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '20' },
  { name: 'Isaiah West', position: 'RB', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '32' },
  { name: 'David Adolph', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '82' },
  { name: 'Nolan Baudo', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '23' },
  { name: 'Phillip Bell', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '7' },
  { name: 'Mylan Graham', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '5' },
  { name: 'Brandon Inniss', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '1' },
  { name: 'De\'Zie Jones', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '8' },
  { name: 'Shawn Lodge', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '80' },
  { name: 'Bodpegn Miller', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '18' },
  { name: 'Quincy Porter', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '11' },
  { name: 'Bryson Rodgers', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '13' },
  { name: 'Jeremiah Smith', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '4' },
  { name: 'Carnell Tate', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '17' },
  { name: 'Dorian Williams', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '84' },
  { name: 'Damarion Witten', position: 'WR', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '81' },
  { name: 'Bennett Christian', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '85' },
  { name: 'Will Kacmarek', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '89' },
  { name: 'Max Klare', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '86' },
  { name: 'Maxence LeBlanc', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SO', jersey: '88' },
  { name: 'Nate Roberts', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'FR', jersey: '83' },
  { name: 'Jelani Thurman', position: 'TE', team: 'Ohio State', team_abbreviation: 'OSU', year: 'JR', jersey: '15' },
  { name: 'Jayden Fielding', position: 'K', team: 'Ohio State', team_abbreviation: 'OSU', year: 'SR', jersey: '38' },

  // Northwestern Wildcats
  { name: 'Ryan Boe', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '2' },
  { name: 'Gavin Frakes', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '13' },
  { name: 'Preston Stone', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '8' },
  { name: 'Marcus Romain', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '12' },
  { name: 'Sean Winton', position: 'QB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '15' },
  { name: 'Daniel Anderson', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '27' },
  { name: 'Joseph Himon II', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '6' },
  { name: 'Aidan Hubbard', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '41' },
  { name: 'Ronny Johnson', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '33' },
  { name: 'Caleb Komolafe', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '5' },
  { name: 'Albert Kunciks III', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '26' },
  { name: 'Cam Porter', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '4' },
  { name: 'Dashun Reeder', position: 'RB', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '24' },
  { name: 'Ricky Ahumaraeze', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '10' },
  { name: 'Braden Bluiett', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '82' },
  { name: 'Frank Covey IV', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '3' },
  { name: 'Tate Crane', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '35' },
  { name: 'Hayden Eligon II', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '14' },
  { name: 'Chase Farrell', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '20' },
  { name: 'Carson Grove', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '87' },
  { name: 'Brennan Saxe', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '16' },
  { name: 'Drew Wagner', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '19' },
  { name: 'Griffin Wilde', position: 'WR', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '17' },
  { name: 'Lawson Albright', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '16' },
  { name: 'Tyler Kielmeyer', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '48' },
  { name: 'Noah LaPorte', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '43' },
  { name: 'Alex Lines', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '18' },
  { name: 'Camp Magee', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'SO', jersey: '19' },
  { name: 'Chris Petrucci', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '81' },
  { name: 'Robby Preckel', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '41' },
  { name: 'Patrick Schaller', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '85' },
  { name: 'Blake Van Buren', position: 'TE', team: 'Northwestern', team_abbreviation: 'NU', year: 'JR', jersey: '83' },
  { name: 'Henry Helms', position: 'K', team: 'Northwestern', team_abbreviation: 'NU', year: 'FR', jersey: '94' },
  { name: 'Jack Olsen', position: 'K', team: 'Northwestern', team_abbreviation: 'NU', year: 'SR', jersey: '82' },

  // Maryland Terrapins
  { name: 'Jackson Hamilton', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '15' },
  { name: 'Roman Jensen', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '18' },
  { name: 'Justyn Martin', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '6' },
  { name: 'Khristian Martin', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '12' },
  { name: 'Malik Washington', position: 'QB', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '7' },
  { name: 'Bud Coombs', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '19' },
  { name: 'Iverson Howard', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '24' },
  { name: 'Eli Mason', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '27' },
  { name: 'Josiah McLaurin', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '17' },
  { name: 'Nolan Ray', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '25' },
  { name: 'Colin Reynolds', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '29' },
  { name: 'DeJuan Williams', position: 'RB', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '20' },
  { name: 'Justin DeVaughn', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '88' },
  { name: 'Jalil Farooq', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SR', jersey: '1' },
  { name: 'Shaleak Knotts', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SR', jersey: '4' },
  { name: 'Ryan Manning', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SR', jersey: '11' },
  { name: 'Jahmari Powell‑Wonson', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '81' },
  { name: 'Jordan Scott', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '14' },
  { name: 'Emerson Smith', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '83' },
  { name: 'Zymear Smith', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '10' },
  { name: 'Octavian Smith Jr.', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SR', jersey: '5' },
  { name: 'Kaleb Webb', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '84' },
  { name: 'Mekhai White', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '8' },
  { name: 'Sean Williams', position: 'WR', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '21' },
  { name: 'Dorian Fleming', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '9' },
  { name: 'Leon Haughton Jr.', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '16' },
  { name: 'Thomas McCluskey', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'SO', jersey: '48' },
  { name: 'AJ Szymanski', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '89' },
  { name: 'JT Taggart', position: 'TE', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '85' },
  { name: 'Ryan Capriotti', position: 'K', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '98' },
  { name: 'Gavin Marshall', position: 'K', team: 'Maryland', team_abbreviation: 'MD', year: 'JR', jersey: '46' },
  { name: 'Sean O\'Haire', position: 'K', team: 'Maryland', team_abbreviation: 'MD', year: 'FR', jersey: '36' }
];

async function addMoreBigTenTeams() {
  console.log('🏈 Adding More Big Ten Teams from 247Sports Data...');
  console.log('============================================================');
  console.log('📋 Adding 4 more Big Ten teams with current roster data');
  console.log('');

  let totalAdded = 0;
  let totalErrors = 0;

  for (const player of additionalBigTenTeams) {
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

  console.log('\n🎉 Additional Big Ten Teams Summary:');
  console.log(`  ✅ Total players added: ${totalAdded}`);
  console.log(`  ❌ Total errors: ${totalErrors}`);
  console.log(`  📋 Teams processed: 4 (Penn State, Ohio State, Northwestern, Maryland)`);
  console.log('🏈 Additional Big Ten teams completed!');
}

addMoreBigTenTeams(); 