import { NextRequest, NextResponse } from 'next/server';

export interface Game {
  id: string;
  week: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeConference: string;
  awayConference: string;
  tv?: string;
  location?: string;
  line?: string;
}

export interface WeekSchedule {
  week: number;
  startDate: string;
  endDate: string;
  games: Game[];
}

// Power 4 conferences
const POWER_4_CONFERENCES = ['SEC', 'Big Ten', 'Big 12', 'ACC'];

// Real 2025 schedule data extracted from ESPN
const SCHEDULE_DATA: WeekSchedule[] = [
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
        id: 'uab-alabama-state-w1',
        week: 1,
        date: '2025-08-28',
        time: '8:30 PM',
        homeTeam: 'UAB',
        awayTeam: 'Alabama State',
        homeConference: 'AAC',
        awayConference: 'SWAC',
        tv: 'ESPN',
        location: 'Protective Stadium, Birmingham, AL'
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
      },
      {
        id: 'wisconsin-miami-oh-w1',
        week: 1,
        date: '2025-08-28',
        time: '9:00 PM',
        homeTeam: 'Wisconsin',
        awayTeam: 'Miami (OH)',
        homeConference: 'Big Ten',
        awayConference: 'MAC',
        tv: 'BTN',
        location: 'Camp Randall Stadium, Madison, WI',
        line: 'Wisconsin -17.5'
      },
      
      // Friday, August 29, 2025
      {
        id: 'michigan-state-western-michigan-w1',
        week: 1,
        date: '2025-08-29',
        time: '7:00 PM',
        homeTeam: 'Michigan State',
        awayTeam: 'Western Michigan',
        homeConference: 'Big Ten',
        awayConference: 'MAC',
        tv: 'FS1',
        location: 'Spartan Stadium, East Lansing, MI',
        line: 'Michigan State -18.5'
      },
      {
        id: 'wake-forest-kennesaw-state-w1',
        week: 1,
        date: '2025-08-29',
        time: '7:00 PM',
        homeTeam: 'Wake Forest',
        awayTeam: 'Kennesaw State',
        homeConference: 'ACC',
        awayConference: 'Conference USA',
        tv: 'ACC Network',
        location: 'Allegacy Federal Credit Union Stadium, Winston-Salem, NC',
        line: 'Wake Forest -17.5'
      },
      {
        id: 'charlotte-app-state-w1',
        week: 1,
        date: '2025-08-29',
        time: '7:00 PM',
        homeTeam: 'Charlotte',
        awayTeam: 'App State',
        homeConference: 'AAC',
        awayConference: 'Sun Belt',
        tv: 'ESPN2',
        location: 'Bank of America Stadium, Charlotte, NC',
        line: 'App State -7'
      },
      {
        id: 'illinois-western-illinois-w1',
        week: 1,
        date: '2025-08-29',
        time: '7:30 PM',
        homeTeam: 'Illinois',
        awayTeam: 'Western Illinois',
        homeConference: 'Big Ten',
        awayConference: 'Missouri Valley',
        tv: 'Peacock',
        location: 'Memorial Stadium (Champaign, IL), Champaign, IL',
        line: 'Illinois -46.5'
      },
      {
        id: 'kansas-wagner-w1',
        week: 1,
        date: '2025-08-29',
        time: '7:30 PM',
        homeTeam: 'Kansas',
        awayTeam: 'Wagner',
        homeConference: 'Big 12',
        awayConference: 'NEC',
        tv: 'ESPN',
        location: 'David Booth Kansas Memorial Stadium, Lawrence, KS'
      },
      {
        id: 'baylor-auburn-w1',
        week: 1,
        date: '2025-08-29',
        time: '8:00 PM',
        homeTeam: 'Auburn',
        awayTeam: 'Baylor',
        homeConference: 'SEC',
        awayConference: 'Big 12',
        tv: 'FOX',
        location: 'McLane Stadium, Waco, TX',
        line: 'Auburn -2.5'
      },
      {
        id: 'colorado-georgia-tech-w1',
        week: 1,
        date: '2025-08-29',
        time: '8:00 PM',
        homeTeam: 'Colorado',
        awayTeam: 'Georgia Tech',
        homeConference: 'Big 12',
        awayConference: 'ACC',
        tv: 'ESPN',
        location: 'Folsom Field, Boulder, CO',
        line: 'Georgia Tech -4'
      },
      
      // Saturday, August 30, 2025
      {
        id: 'texas-ohio-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:00 PM',
        homeTeam: 'Ohio State',
        awayTeam: 'Texas',
        homeConference: 'Big Ten',
        awayConference: 'SEC',
        tv: 'FOX',
        location: 'Ohio Stadium, Columbus, OH',
        line: 'Ohio State -2'
      },
      {
        id: 'tennessee-syracuse-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:00 PM',
        homeTeam: 'Tennessee',
        awayTeam: 'Syracuse',
        homeConference: 'SEC',
        awayConference: 'ACC',
        tv: 'ABC',
        location: 'Mercedes-Benz Stadium, Atlanta, GA',
        line: 'Tennessee -13.5'
      },
      {
        id: 'southern-miss-mississippi-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:00 PM',
        homeTeam: 'Mississippi State',
        awayTeam: 'Southern Miss',
        homeConference: 'SEC',
        awayConference: 'Sun Belt',
        tv: 'ESPN',
        location: 'M. M. Roberts Stadium, Hattiesburg, MS',
        line: 'Mississippi State -12'
      },
      {
        id: 'maryland-florida-atlantic-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:00 PM',
        homeTeam: 'Maryland',
        awayTeam: 'Florida Atlantic',
        homeConference: 'Big Ten',
        awayConference: 'AAC',
        tv: 'BTN',
        location: 'SECU Stadium, College Park, MD',
        line: 'Maryland -14.5'
      },
      {
        id: 'purdue-ball-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:00 PM',
        homeTeam: 'Purdue',
        awayTeam: 'Ball State',
        homeConference: 'Big Ten',
        awayConference: 'MAC',
        tv: 'BTN',
        location: 'Ross-Ade Stadium, West Lafayette, IN',
        line: 'Purdue -17.5'
      },
      {
        id: 'tulane-northwestern-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:00 PM',
        homeTeam: 'Northwestern',
        awayTeam: 'Tulane',
        homeConference: 'Big Ten',
        awayConference: 'AAC',
        tv: 'ESPN2',
        location: 'Yulman Stadium, New Orleans, LA',
        line: 'Tulane -6'
      },
      {
        id: 'pittsburgh-duquesne-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:00 PM',
        homeTeam: 'Pittsburgh',
        awayTeam: 'Duquesne',
        homeConference: 'ACC',
        awayConference: 'NEC',
        tv: 'ACC Network',
        location: 'Acrisure Stadium, Pittsburgh, PA'
      },
      {
        id: 'kent-state-merrimack-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:00 PM',
        homeTeam: 'Kent State',
        awayTeam: 'Merrimack',
        homeConference: 'MAC',
        awayConference: 'NEC',
        tv: 'ESPN',
        location: 'Dix Stadium, Kent, OH'
      },
      {
        id: 'kentucky-toledo-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:45 PM',
        homeTeam: 'Kentucky',
        awayTeam: 'Toledo',
        homeConference: 'SEC',
        awayConference: 'MAC',
        tv: 'SEC Network',
        location: 'Kroger Field, Lexington, KY',
        line: 'Kentucky -7.5'
      },
      {
        id: 'boston-college-fordham-w1',
        week: 1,
        date: '2025-08-30',
        time: '2:00 PM',
        homeTeam: 'Boston College',
        awayTeam: 'Fordham',
        homeConference: 'ACC',
        awayConference: 'Patriot',
        tv: 'ESPN',
        location: 'Alumni Stadium (Chestnut Hill, MA), Chestnut Hill, MA'
      },
      {
        id: 'west-virginia-robert-morris-w1',
        week: 1,
        date: '2025-08-30',
        time: '2:00 PM',
        homeTeam: 'West Virginia',
        awayTeam: 'Robert Morris',
        homeConference: 'Big 12',
        awayConference: 'Big South',
        tv: 'ESPN',
        location: 'Milan Puskar Stadium, Morgantown, WV'
      },
      {
        id: 'indiana-old-dominion-w1',
        week: 1,
        date: '2025-08-30',
        time: '2:30 PM',
        homeTeam: 'Indiana',
        awayTeam: 'Old Dominion',
        homeConference: 'Big Ten',
        awayConference: 'Sun Belt',
        tv: 'FS1',
        location: 'Memorial Stadium (Bloomington, IN), Bloomington, IN',
        line: 'Indiana -23'
      },
      {
        id: 'louisville-eastern-kentucky-w1',
        week: 1,
        date: '2025-08-30',
        time: '3:00 PM',
        homeTeam: 'Louisville',
        awayTeam: 'Eastern Kentucky',
        homeConference: 'ACC',
        awayConference: 'ASUN',
        tv: 'ACC Network',
        location: 'L&N Federal Credit Union Stadium, Louisville, KY'
      },
      {
        id: 'penn-state-nevada-w1',
        week: 1,
        date: '2025-08-30',
        time: '3:30 PM',
        homeTeam: 'Penn State',
        awayTeam: 'Nevada',
        homeConference: 'Big Ten',
        awayConference: 'Mountain West',
        tv: 'CBS Paramount+',
        location: 'Beaver Stadium, University Park, PA',
        line: 'Penn State -44'
      },
      {
        id: 'georgia-marshall-w1',
        week: 1,
        date: '2025-08-30',
        time: '3:30 PM',
        homeTeam: 'Georgia',
        awayTeam: 'Marshall',
        homeConference: 'SEC',
        awayConference: 'Sun Belt',
        tv: 'ESPN',
        location: 'Sanford Stadium, Athens, GA',
        line: 'Georgia -39.5'
      },
      {
        id: 'florida-state-alabama-w1',
        week: 1,
        date: '2025-08-30',
        time: '3:30 PM',
        homeTeam: 'Florida State',
        awayTeam: 'Alabama',
        homeConference: 'ACC',
        awayConference: 'SEC',
        tv: 'ABC',
        location: 'Doak Campbell Stadium, Tallahassee, FL',
        line: 'Alabama -13.5'
      },
      {
        id: 'iowa-state-south-dakota-w1',
        week: 1,
        date: '2025-08-30',
        time: '3:30 PM',
        homeTeam: 'Iowa State',
        awayTeam: 'South Dakota',
        homeConference: 'Big 12',
        awayConference: 'Missouri Valley',
        tv: 'FOX',
        location: 'Jack Trice Stadium, Ames, IA',
        line: 'Iowa State -15.5'
      },
      {
        id: 'oregon-montana-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '4:00 PM',
        homeTeam: 'Oregon',
        awayTeam: 'Montana State',
        homeConference: 'Big Ten',
        awayConference: 'Big Sky',
        tv: 'BTN',
        location: 'Autzen Stadium, Eugene, OR',
        line: 'Oregon -29.5'
      },
      {
        id: 'arkansas-alabama-am-w1',
        week: 1,
        date: '2025-08-30',
        time: '4:15 PM',
        homeTeam: 'Arkansas',
        awayTeam: 'Alabama A&M',
        homeConference: 'SEC',
        awayConference: 'SWAC',
        tv: 'SEC Network',
        location: 'Razorback Stadium, Fayetteville, AR'
      },
      {
        id: 'oklahoma-illinois-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '6:00 PM',
        homeTeam: 'Oklahoma',
        awayTeam: 'Illinois State',
        homeConference: 'SEC',
        awayConference: 'Missouri Valley',
        tv: 'ESPN',
        location: 'Memorial Stadium (Norman, OK), Norman, OK',
        line: 'Oklahoma -35.5'
      },
      {
        id: 'iowa-ualbany-w1',
        week: 1,
        date: '2025-08-30',
        time: '6:00 PM',
        homeTeam: 'Iowa',
        awayTeam: 'UAlbany',
        homeConference: 'Big Ten',
        awayConference: 'CAA',
        tv: 'FS1',
        location: 'Kinnick Stadium, Iowa City, IA',
        line: 'Iowa -37.5'
      },
      {
        id: 'virginia-coastal-carolina-w1',
        week: 1,
        date: '2025-08-30',
        time: '6:00 PM',
        homeTeam: 'Virginia',
        awayTeam: 'Coastal Carolina',
        homeConference: 'ACC',
        awayConference: 'Sun Belt',
        tv: 'ACC Network',
        location: 'Scott Stadium, Charlottesville, VA',
        line: 'Virginia -12.5'
      },
      {
        id: 'kansas-state-north-dakota-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:00 PM',
        homeTeam: 'Kansas State',
        awayTeam: 'North Dakota',
        homeConference: 'Big 12',
        awayConference: 'Missouri Valley',
        tv: 'ESPN',
        location: 'Bill Snyder Family Stadium, Manhattan, KS',
        line: 'Kansas State -28.5'
      },
      {
        id: 'texas-am-utsa-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:00 PM',
        homeTeam: 'Texas A&M',
        awayTeam: 'UTSA',
        homeConference: 'SEC',
        awayConference: 'AAC',
        tv: 'ESPN',
        location: 'Kyle Field, College Station, TX',
        line: 'Texas A&M -21.5'
      },
      {
        id: 'vanderbilt-charleston-southern-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:00 PM',
        homeTeam: 'Vanderbilt',
        awayTeam: 'Charleston Southern',
        homeConference: 'SEC',
        awayConference: 'Big South',
        tv: 'ESPN',
        location: 'FirstBank Stadium, Nashville, TN',
        line: 'Vanderbilt -36'
      },
      {
        id: 'middle-tennessee-austin-peay-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:00 PM',
        homeTeam: 'Middle Tennessee',
        awayTeam: 'Austin Peay',
        homeConference: 'Conference USA',
        awayConference: 'ASUN',
        tv: 'ESPN',
        location: 'Johnny "Red" Floyd Stadium, Murfreesboro, TN'
      },
      {
        id: 'arkansas-state-southeast-missouri-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:00 PM',
        homeTeam: 'Arkansas State',
        awayTeam: 'Southeast Missouri State',
        homeConference: 'Sun Belt',
        awayConference: 'OVC',
        tv: 'ESPN',
        location: 'Centennial Bank Stadium, Jonesboro, AR',
        line: 'Arkansas State -10.5'
      },
      {
        id: 'south-alabama-morgan-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:00 PM',
        homeTeam: 'South Alabama',
        awayTeam: 'Morgan State',
        homeConference: 'Sun Belt',
        awayConference: 'MEAC',
        tv: 'ESPN',
        location: 'Hancock Whitney Stadium, Mobile, AL'
      },
      {
        id: 'clemson-lsu-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:30 PM',
        homeTeam: 'Clemson',
        awayTeam: 'LSU',
        homeConference: 'ACC',
        awayConference: 'SEC',
        tv: 'ABC',
        location: 'Memorial Stadium (Clemson, SC), Clemson, SC',
        line: 'Clemson -4'
      },
      {
        id: 'michigan-new-mexico-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:30 PM',
        homeTeam: 'Michigan',
        awayTeam: 'New Mexico',
        homeConference: 'Big Ten',
        awayConference: 'Mountain West',
        tv: 'NBC Peacock',
        location: 'Michigan Stadium, Ann Arbor, MI',
        line: 'Michigan -37'
      },
      {
        id: 'texas-tech-arkansas-pine-bluff-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:30 PM',
        homeTeam: 'Texas Tech',
        awayTeam: 'Arkansas-Pine Bluff',
        homeConference: 'Big 12',
        awayConference: 'SWAC',
        tv: 'ESPN',
        location: 'Jones AT&T Stadium, Lubbock, TX'
      },
      {
        id: 'usc-missouri-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:30 PM',
        homeTeam: 'USC',
        awayTeam: 'Missouri State',
        homeConference: 'Big Ten',
        awayConference: 'Missouri Valley',
        tv: 'BTN',
        location: 'Los Angeles Memorial Coliseum, Los Angeles, CA',
        line: 'USC -35'
      },
      
      // Sunday, August 31, 2025
      {
        id: 'south-carolina-virginia-tech-w1',
        week: 1,
        date: '2025-08-31',
        time: '3:00 PM',
        homeTeam: 'South Carolina',
        awayTeam: 'Virginia Tech',
        homeConference: 'SEC',
        awayConference: 'ACC',
        tv: 'ESPN',
        location: 'Mercedes-Benz Stadium, Atlanta, GA',
        line: 'South Carolina -7.5'
      },
      {
        id: 'miami-notre-dame-w1',
        week: 1,
        date: '2025-08-31',
        time: '7:30 PM',
        homeTeam: 'Miami',
        awayTeam: 'Notre Dame',
        homeConference: 'ACC',
        awayConference: 'Independent',
        tv: 'ABC',
        location: 'Hard Rock Stadium, Miami Gardens, FL',
        line: 'Notre Dame -2.5'
      },
      
      // Monday, September 1, 2025
      {
        id: 'north-carolina-tcu-w1',
        week: 1,
        date: '2025-09-01',
        time: '8:00 PM',
        homeTeam: 'North Carolina',
        awayTeam: 'TCU',
        homeConference: 'ACC',
        awayConference: 'Big 12',
        tv: 'ESPN',
        location: 'Kenan Stadium, Chapel Hill, NC',
        line: 'TCU -3.5'
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
      },
      {
        id: 'kennesaw-state-indiana-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Indiana',
        awayTeam: 'Kennesaw State',
        homeConference: 'Big Ten',
        awayConference: 'Conference USA',
        tv: 'FS1',
        location: 'Memorial Stadium (Bloomington, IN), Bloomington, IN'
      },
      {
        id: 'iowa-iowa-state-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Iowa State',
        awayTeam: 'Iowa',
        homeConference: 'Big 12',
        awayConference: 'Big Ten',
        tv: 'FOX',
        location: 'Jack Trice Stadium, Ames, IA',
        line: 'ISU -2.5'
      },
      {
        id: 'kent-state-texas-tech-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Texas Tech',
        awayTeam: 'Kent State',
        homeConference: 'Big 12',
        awayConference: 'MAC',
        tv: 'TNT/HBO Max',
        location: 'Jones AT&T Stadium, Lubbock, TX'
      },
      {
        id: 'northwestern-state-minnesota-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Minnesota',
        awayTeam: 'Northwestern State',
        homeConference: 'Big Ten',
        awayConference: 'Southland',
        tv: 'BTN',
        location: 'Huntington Bank Stadium, Minneapolis, MN'
      },
      {
        id: 'virginia-nc-state-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'NC State',
        awayTeam: 'Virginia',
        homeConference: 'ACC',
        awayConference: 'ACC',
        tv: 'ESPN2',
        location: 'Carter-Finley Stadium, Raleigh, NC'
      },
      {
        id: 'central-michigan-pittsburgh-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Pittsburgh',
        awayTeam: 'Central Michigan',
        homeConference: 'ACC',
        awayConference: 'MAC',
        tv: 'ESPN2',
        location: 'Acrisure Stadium, Pittsburgh, PA'
      },
      {
        id: 'uconn-syracuse-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Syracuse',
        awayTeam: 'UConn',
        homeConference: 'ACC',
        awayConference: 'Independent',
        tv: 'ESPN',
        location: 'JMA Wireless Dome, Syracuse, NY'
      },
      {
        id: 'east-texas-am-florida-state-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Florida State',
        awayTeam: 'East Texas A&M',
        homeConference: 'ACC',
        awayConference: 'Southland',
        tv: 'ACC Network',
        location: 'Doak Campbell Stadium, Tallahassee, FL'
      },
      {
        id: 'utah-state-texas-am-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:45 PM',
        homeTeam: 'Texas A&M',
        awayTeam: 'Utah State',
        homeConference: 'SEC',
        awayConference: 'Mountain West',
        tv: 'SEC Network',
        location: 'Kyle Field, College Station, TX'
      },
      {
        id: 'western-carolina-wake-forest-w2',
        week: 2,
        date: '2025-09-06',
        time: '2:00 PM',
        homeTeam: 'Wake Forest',
        awayTeam: 'Western Carolina',
        homeConference: 'ACC',
        awayConference: 'Southern',
        tv: 'ESPN',
        location: 'Allegacy Federal Credit Union Stadium, Winston-Salem, NC'
      }
    ]
  }
  // Additional weeks to be added as more screenshots are provided
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');
    const team = searchParams.get('team');
    
    let scheduleData = SCHEDULE_DATA;
    
    // Filter by week if specified
    if (week) {
      const weekNum = parseInt(week);
      scheduleData = scheduleData.filter(w => w.week === weekNum);
    }
    
    // Filter by team if specified
    if (team) {
      scheduleData = scheduleData.map(weekData => ({
        ...weekData,
        games: weekData.games.filter(game => 
          game.homeTeam.toLowerCase().includes(team.toLowerCase()) ||
          game.awayTeam.toLowerCase().includes(team.toLowerCase())
        )
      })).filter(weekData => weekData.games.length > 0);
    }
    
    // Only include games with at least one Power 4 team
    const filteredSchedule = scheduleData.map(weekData => ({
      ...weekData,
      games: weekData.games.filter(game => 
        POWER_4_CONFERENCES.includes(game.homeConference) ||
        POWER_4_CONFERENCES.includes(game.awayConference)
      )
    }));
    
    return NextResponse.json({
      success: true,
      schedule: filteredSchedule,
      totalWeeks: 13 // Regular season weeks
    });
    
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}