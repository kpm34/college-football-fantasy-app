import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

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

const missingBigTenTeams = [
  // Purdue Boilermakers
  { name: 'Ryan Browne', position: 'QB', team: 'Purdue', team_abbreviation: 'PUR', year: 'SO', jersey: '15' },
  { name: 'Evans Chuba', position: 'QB', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '1' },
  { name: 'Bennett Meredith', position: 'QB', team: 'Purdue', team_abbreviation: 'PUR', year: 'JR', jersey: '18' },
  { name: 'Garyt Odom', position: 'QB', team: 'Purdue', team_abbreviation: 'PUR', year: 'SO', jersey: '7' },
  { name: 'Malachi Singleton', position: 'QB', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '3' },
  { name: 'Antonio Harris', position: 'RB', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '22' },
  { name: 'Carter Holsworth', position: 'RB', team: 'Purdue', team_abbreviation: 'PUR', year: 'JR', jersey: '31' },
  { name: 'Addai Lewellen', position: 'RB', team: 'Purdue', team_abbreviation: 'PUR', year: 'SO', jersey: '28' },
  { name: 'Jaron Thomas', position: 'RB', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '20' },
  { name: 'Malachi Thomas', position: 'RB', team: 'Purdue', team_abbreviation: 'PUR', year: 'JR', jersey: '24' },
  { name: 'Devin Mockobee', position: 'RB', team: 'Purdue', team_abbreviation: 'PUR', year: 'SR', jersey: '45' },
  { name: 'Jaheim Merriweather', position: 'RB', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '23' },
  { name: 'Andrew Adkison', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'SO', jersey: '83' },
  { name: 'Arhmad Branch', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '6' },
  { name: 'Nolan Buckman', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '84' },
  { name: 'Jalil Hall', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '9' },
  { name: 'Tra\'Mar Harris', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '11' },
  { name: 'EJ Horton Jr.', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'SR', jersey: '13' },
  { name: 'Michael Jackson III', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'SR', jersey: '2' },
  { name: 'Chauncey Magwood', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'JR', jersey: '5' },
  { name: 'Corey Smith', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'JR', jersey: '12' },
  { name: 'De\'Nylon Morrissette', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'SO', jersey: '8' },
  { name: 'AJ Richardson', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '86' },
  { name: 'Quinn Rosenkranz', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '33' },
  { name: 'Charles Ross', position: 'WR', team: 'Purdue', team_abbreviation: 'PUR', year: 'JR', jersey: '4' },
  { name: 'George Burhenn', position: 'TE', team: 'Purdue', team_abbreviation: 'PUR', year: 'JR', jersey: '81' },
  { name: 'Christian Earls', position: 'TE', team: 'Purdue', team_abbreviation: 'PUR', year: 'SO', jersey: '87' },
  { name: 'Jon Grimmett', position: 'TE', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '41' },
  { name: 'Luke Klare', position: 'TE', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '89' },
  { name: 'Christian Moore', position: 'TE', team: 'Purdue', team_abbreviation: 'PUR', year: 'SO', jersey: '44' },
  { name: 'Luca Puccinelli', position: 'TE', team: 'Purdue', team_abbreviation: 'PUR', year: 'SO', jersey: '85' },
  { name: 'Rico Walker', position: 'TE', team: 'Purdue', team_abbreviation: 'PUR', year: 'FR', jersey: '17' },
  { name: 'Spencer Porath', position: 'K', team: 'Purdue', team_abbreviation: 'PUR', year: 'SR', jersey: '35' },
  { name: 'Jack Weter', position: 'K', team: 'Purdue', team_abbreviation: 'PUR', year: 'SO', jersey: '26' },

  // Rutgers Scarlet Knights
  { name: 'Austin Albericci', position: 'QB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '19' },
  { name: 'Sean Ashenfelder', position: 'QB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'FR', jersey: '6' },
  { name: 'Athan Kaliakmanis', position: 'QB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '16' },
  { name: 'John Langan', position: 'QB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'GR', jersey: '21' },
  { name: 'Gavin Rupp', position: 'QB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'GR', jersey: '17' },
  { name: 'AJ Surace', position: 'QB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '10' },
  { name: 'Noah Vedral', position: 'QB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'GR', jersey: '0' },
  { name: 'Jashon Benjamin', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '20' },
  { name: 'Samuel Brown', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'JR', jersey: '27' },
  { name: 'CJ Campbell Jr.', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '5' },
  { name: 'Parker Day', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'FR', jersey: '33' },
  { name: 'Edd Guerrier', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '23' },
  { name: 'Terrell Mitchell', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'FR', jersey: '26' },
  { name: 'Piotr Partyla', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '27' },
  { name: 'Antwan Raymond', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'FR', jersey: '21' },
  { name: 'Al-Shadee Salaam', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '26' },
  { name: 'Gabe Winowich', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'FR', jersey: '22' },
  { name: 'Jamier Wright-Collins', position: 'RB', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '8' },
  { name: 'Vernon Allen III', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'JR', jersey: '13' },
  { name: 'Ben Black', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '2' },
  { name: 'Dylan Braithwaite', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '7' },
  { name: 'Naseim Brantley', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '—' },
  { name: 'Sage Clawges', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'FR', jersey: '27' },
  { name: 'Aron Cruickshank', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '1' },
  { name: 'Sah\'nye Degraffenreidt', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'FR', jersey: '14' },
  { name: 'Christian Dremel', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '6' },
  { name: 'Brayden Fox', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '82' },
  { name: 'Jourdin Houston', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'JR', jersey: '4' },
  { name: 'JaQuae Jackson', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '9' },
  { name: 'Shameen Jones', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '7' },
  { name: 'Dino Kalikmanis', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '83' },
  { name: 'Famah Toure', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'JR', jersey: '1' },
  { name: 'Isaiah Washington', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '14' },
  { name: 'Josh Youngblood', position: 'WR', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '83' },
  { name: 'Matt Alaimo', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'GR', jersey: '10' },
  { name: 'Logan Blake', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '11' },
  { name: 'Shawn Bowman', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SR', jersey: '—' },
  { name: 'KJ Duff', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '8' },
  { name: 'Mike Higgins', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'JR', jersey: '88' },
  { name: 'Victor Konopka', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'JR', jersey: '89' },
  { name: 'Tahjay Moore', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '87' },
  { name: 'Brandon Myers', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'FR', jersey: '45' },
  { name: 'Ben Rothhaar', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '24' },
  { name: 'Colin Weber', position: 'TE', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '18' },
  { name: 'David Broncati', position: 'K', team: 'Rutgers', team_abbreviation: 'RUT', year: 'JR', jersey: '91' },
  { name: 'Justin Davidovicz', position: 'K', team: 'Rutgers', team_abbreviation: 'RUT', year: 'GR', jersey: '95' },
  { name: 'Gavin Haggerty', position: 'K', team: 'Rutgers', team_abbreviation: 'RUT', year: 'SO', jersey: '99' },
  { name: 'Jai Patel', position: 'K', team: 'Rutgers', team_abbreviation: 'RUT', year: 'JR', jersey: '—' },

  // Michigan State Spartans
  { name: 'Aidan Chiles', position: 'QB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'JR', jersey: '2' },
  { name: 'Leo Hannan', position: 'QB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '15' },
  { name: 'Ryland Jessee', position: 'QB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '16' },
  { name: 'Alessio Milivojevic', position: 'QB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '11' },
  { name: 'Jace Clarizio', position: 'RB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'JR', jersey: '25' },
  { name: 'Makhi Frazier', position: 'RB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '5' },
  { name: 'Zion Gist', position: 'RB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '28' },
  { name: 'Jaxon McCaig', position: 'RB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '33' },
  { name: 'Darrin Jones Jr.', position: 'RB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '27' },
  { name: 'Elijah Tau-Tolliver', position: 'RB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'JR', jersey: '4' },
  { name: 'Chris Williams', position: 'RB', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '26' },
  { name: 'Evan Boyd', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '8' },
  { name: 'Alante Brown', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SR', jersey: '0' },
  { name: 'Rodney Bullard Jr.', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '3' },
  { name: 'Grant Calcagno', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '85' },
  { name: 'Atticus Carridine', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '18' },
  { name: 'Braylon Collier', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '17' },
  { name: 'Shawn Foster', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'JR', jersey: '20' },
  { name: 'Nick Hardy', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '89' },
  { name: 'Omari Kelly', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'JR', jersey: '1' },
  { name: 'Charles Taplin', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '19' },
  { name: 'Bryson Williams', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '14' },
  { name: 'Jack Yanachik', position: 'WR', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '22' },
  { name: 'Charlie Baker', position: 'TE', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '48' },
  { name: 'Michael Masunas', position: 'TE', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SR', jersey: '81' },
  { name: 'Wyatt Hook', position: 'TE', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '84' },
  { name: 'Brennan Parachek', position: 'TE', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '82' },
  { name: 'Kai Rios', position: 'TE', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '88' },
  { name: 'Jayden Savoury', position: 'TE', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '31' },
  { name: 'Jack Velling', position: 'TE', team: 'Michigan State', team_abbreviation: 'MSU', year: 'JR', jersey: '12' },
  { name: 'Tarik Ahmetbasic', position: 'K', team: 'Michigan State', team_abbreviation: 'MSU', year: 'JR', jersey: '40' },
  { name: 'Martin Connington', position: 'K', team: 'Michigan State', team_abbreviation: 'MSU', year: 'SO', jersey: '29' },
  { name: 'Blake Sislo', position: 'K', team: 'Michigan State', team_abbreviation: 'MSU', year: 'FR', jersey: '86' },

  // Nebraska Cornhuskers
  { name: 'Marcos Davila', position: 'QB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '16' },
  { name: 'Jaylynn Gramstad', position: 'QB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SR', jersey: '12' },
  { name: 'TJ Lateef', position: 'QB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '14' },
  { name: 'Luke Longval', position: 'QB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'JR', jersey: '17' },
  { name: 'Dylan Raiola', position: 'QB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '15' },
  { name: 'Bode Soukup', position: 'QB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '11' },
  { name: 'Conor Booth', position: 'RB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '23' },
  { name: 'Izaac Dickey', position: 'RB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '45' },
  { name: 'Vincent Genantone', position: 'RB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'JR', jersey: '30' },
  { name: 'Kenneth Williams', position: 'RB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '25' },
  { name: 'Jamarion Parker', position: 'RB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '24' },
  { name: 'Isaiah Mozee', position: 'RB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '22' },
  { name: 'Mekhi Nelson', position: 'RB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '35' },
  { name: 'Emmett Johnson', position: 'RB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'JR', jersey: '21' },
  { name: 'Kwinten Ives', position: 'RB', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '28' },
  { name: 'Jacory Barney Jr.', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '17' },
  { name: 'Demitrius Bell', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '0' },
  { name: 'Janiran Bonner', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'JR', jersey: '16' },
  { name: 'Jackson Carpenter', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '88' },
  { name: 'Quinn Clark', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '89' },
  { name: 'Keelan Smith', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '85' },
  { name: 'DJ Singleton', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '30' },
  { name: 'Nyziah Hunter', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '13' },
  { name: 'Roman Mangini', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'JR', jersey: '26' },
  { name: 'Hayes Miller', position: 'WR', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SR', jersey: '81' },
  { name: 'Mac Markway', position: 'TE', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '87' },
  { name: 'Carter Nelson', position: 'TE', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '29' },
  { name: 'Eric Ingwerson', position: 'TE', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '82' },
  { name: 'Danny King', position: 'TE', team: 'Nebraska', team_abbreviation: 'NEB', year: 'FR', jersey: '49' },
  { name: 'Luke Lindenmeyer', position: 'TE', team: 'Nebraska', team_abbreviation: 'NEB', year: 'JR', jersey: '44' },
  { name: 'Heinrich Haarberg', position: 'TE', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SR', jersey: '10' },
  { name: 'John Hohl', position: 'K', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '90' },
  { name: 'Tristan Alvano', position: 'K', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '30' },
  { name: 'Kyle Cunanan', position: 'K', team: 'Nebraska', team_abbreviation: 'NEB', year: 'SO', jersey: '91' }
];

async function addMissingBigTenTeams() {
  console.log('🏈 Adding Missing Big Ten Teams...');
  console.log('===================================');
  console.log('📋 Adding 4 missing Big Ten teams with current roster data');
  console.log('');

  let totalAdded = 0;
  let totalErrors = 0;

  for (const player of missingBigTenTeams) {
    try {
      const projections = generateProjections(player.position, player.year);

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
      console.log(`  ✅ ${player.name} (${player.position}) - ${player.team} - ${player.year}`);
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

  console.log('\n🎉 Missing Big Ten Teams Summary:');
  console.log(`  ✅ Total players added: ${totalAdded}`);
  console.log(`  ❌ Total errors: ${totalErrors}`);
  console.log(`  📋 Teams processed: 4 (Purdue, Rutgers, Michigan State, Nebraska)`);
  console.log('🏈 Missing Big Ten teams completed!');
}

addMissingBigTenTeams(); 