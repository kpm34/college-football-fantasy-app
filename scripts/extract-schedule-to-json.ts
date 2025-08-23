import fs from 'fs';
import path from 'path';

// Extract schedule data from the API route
const SCHEDULE_DATA = [
  {
    week: 1,
    startDate: '2025-08-28',
    endDate: '2025-08-31',
    games: [
      // Thursday, August 28, 2025
      {
        id: 'south-florida-boise-state-w1',
        week: 1,
        date: '2025-08-28',
        time: '5:30 PM',
        homeTeam: 'South Florida',
        awayTeam: 'Boise State',
        homeConference: 'AAC',
        awayConference: 'Mountain West',
        tv: 'ESPN',
        location: 'Raymond James Stadium, Tampa, FL'
      },
      {
        id: 'east-carolina-nc-state-w1',
        week: 1,
        date: '2025-08-28',
        time: '7:00 PM',
        homeTeam: 'NC State',
        awayTeam: 'East Carolina',
        homeConference: 'ACC',
        awayConference: 'AAC',
        tv: 'ACC Network',
        location: 'Carter-Finley Stadium, Raleigh, NC',
        line: 'NC State -12.5'
      },
      {
        id: 'missouri-central-arkansas-w1',
        week: 1,
        date: '2025-08-28',
        time: '7:30 PM',
        homeTeam: 'Missouri',
        awayTeam: 'Central Arkansas',
        homeConference: 'SEC',
        awayConference: 'ASUN',
        tv: 'SEC Network',
        location: 'Memorial Stadium, Columbia, MO'
      },
      {
        id: 'duke-elon-w1',
        week: 1,
        date: '2025-08-28',
        time: '7:30 PM',
        homeTeam: 'Duke',
        awayTeam: 'Elon',
        homeConference: 'ACC',
        awayConference: 'CAA',
        tv: 'ESPN',
        location: 'Wallace Wade Stadium, Durham, NC',
        line: 'Duke -33.5'
      },
      {
        id: 'oklahoma-state-ut-martin-w1',
        week: 1,
        date: '2025-08-28',
        time: '7:30 PM',
        homeTeam: 'Oklahoma State',
        awayTeam: 'UT Martin',
        homeConference: 'Big 12',
        awayConference: 'OVC',
        tv: 'ESPN',
        location: 'Boone Pickens Stadium, Stillwater, OK',
        line: 'Oklahoma State -22.5'
      },
      {
        id: 'minnesota-buffalo-w1',
        week: 1,
        date: '2025-08-28',
        time: '8:00 PM',
        homeTeam: 'Minnesota',
        awayTeam: 'Buffalo',
        homeConference: 'Big Ten',
        awayConference: 'MAC',
        tv: 'FS1',
        location: 'Huntington Bank Stadium, Minneapolis, MN',
        line: 'Minnesota -15'
      },
      {
        id: 'houston-stephen-f-austin-w1',
        week: 1,
        date: '2025-08-28',
        time: '8:00 PM',
        homeTeam: 'Houston',
        awayTeam: 'Stephen F. Austin',
        homeConference: 'Big 12',
        awayConference: 'WAC',
        tv: 'ESPN',
        location: 'TDECU Stadium, Houston, TX',
        line: 'Houston -22.5'
      },
      {
        id: 'cincinnati-nebraska-w1',
        week: 1,
        date: '2025-08-28',
        time: '9:00 PM',
        homeTeam: 'Nebraska',
        awayTeam: 'Cincinnati',
        homeConference: 'Big Ten',
        awayConference: 'Big 12',
        tv: 'ESPN',
        location: 'GEHA Field at Arrowhead Stadium, Kansas City, MO',
        line: 'Nebraska -6.5'
      }
    ]
  },
  {
    week: 2,
    startDate: '2025-09-05',
    endDate: '2025-09-06',
    games: [
      // Friday, September 5, 2025
      {
        id: 'james-madison-louisville-w2',
        week: 2,
        date: '2025-09-05',
        time: '7:00 PM',
        homeTeam: 'Louisville',
        awayTeam: 'James Madison',
        homeConference: 'ACC',
        awayConference: 'Sun Belt',
        tv: 'ESPN',
        location: 'L&N Federal Credit Union Stadium, Louisville, KY'
      },
      {
        id: 'western-illinois-northwestern-w2',
        week: 2,
        date: '2025-09-05',
        time: '7:30 PM',
        homeTeam: 'Northwestern',
        awayTeam: 'Western Illinois',
        homeConference: 'Big Ten',
        awayConference: 'Missouri Valley',
        tv: 'BTN',
        location: 'Martin Stadium, Evanston, IL'
      },
      {
        id: 'northern-illinois-maryland-w2',
        week: 2,
        date: '2025-09-05',
        time: '7:30 PM',
        homeTeam: 'Maryland',
        awayTeam: 'Northern Illinois',
        homeConference: 'Big Ten',
        awayConference: 'MAC',
        tv: 'BTN',
        location: 'SECU Stadium, College Park, MD'
      },
      {
        id: 'eastern-washington-boise-state-w2',
        week: 2,
        date: '2025-09-05',
        time: '9:00 PM',
        homeTeam: 'Boise State',
        awayTeam: 'Eastern Washington',
        homeConference: 'Mountain West',
        awayConference: 'Big Sky',
        tv: 'FS1',
        location: 'Albertsons Stadium, Boise, ID'
      },
      // Saturday, September 6, 2025
      {
        id: 'texas-san-jose-state-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Texas',
        awayTeam: 'San Jose State',
        homeConference: 'SEC',
        awayConference: 'Mountain West',
        tv: 'FOX',
        location: 'DKR-Texas Memorial Stadium, Austin, TX'
      },
      {
        id: 'florida-international-penn-state-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Penn State',
        awayTeam: 'Florida International',
        homeConference: 'Big Ten',
        awayConference: 'Conference USA',
        tv: 'BTN',
        location: 'Beaver Stadium, University Park, PA'
      },
      {
        id: 'illinois-duke-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Duke',
        awayTeam: 'Illinois',
        homeConference: 'ACC',
        awayConference: 'Big Ten',
        tv: 'ACC Network',
        location: 'Wallace Wade Stadium, Durham, NC',
        line: 'ILL -2.5'
      },
      {
        id: 'baylor-smu-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'SMU',
        awayTeam: 'Baylor',
        homeConference: 'ACC',
        awayConference: 'Big 12',
        tv: 'The CW Network',
        location: 'Gerald J. Ford Stadium, Dallas, TX',
        line: 'SMU -3'
      }
    ]
  }
];

// Create directory if it doesn't exist
const scheduleDir = path.join(process.cwd(), 'data', '2025-schedule');
if (!fs.existsSync(scheduleDir)) {
  fs.mkdirSync(scheduleDir, { recursive: true });
}

// Write each week to a separate file
SCHEDULE_DATA.forEach(weekData => {
  const fileName = path.join(scheduleDir, `week-${weekData.week}.json`);
  fs.writeFileSync(fileName, JSON.stringify(weekData, null, 2));
  console.log(`✅ Created ${fileName}`);
});

console.log('\n📅 Schedule extraction complete!');
