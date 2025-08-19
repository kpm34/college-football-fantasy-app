import fs from 'fs';
import path from 'path';

// Load backup data
const backupPath = path.join(process.cwd(), 'exports/college_players_2025.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

console.log(`Converting ${backupData.length} players to CSV format...`);

// CSV Headers based on the CollegePlayers schema
const headers = [
  'name',
  'position',
  'team',
  'conference',
  'jerseyNumber',
  'height',
  'weight',
  'year',
  'eligible',
  'fantasy_points',
  'season_fantasy_points',
  'depth_chart_order',
  'external_id',
  'image_url',
  'stats'
];

// Helper function to escape CSV values
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // If contains comma, quote, or newline, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

// Create CSV content
let csvContent = headers.join(',') + '\n';

for (const player of backupData) {
  const row = [
    escapeCSV(player.name || 'Unknown'),
    escapeCSV(player.position || 'RB'),
    escapeCSV(player.team || player.school || 'Unknown'),
    escapeCSV(player.conference || 'SEC'),
    escapeCSV(player.jersey_number || player.jerseyNumber || ''),
    escapeCSV(player.height || ''),
    escapeCSV(player.weight || ''),
    escapeCSV(player.year || ''),
    escapeCSV('true'), // eligible - always true
    escapeCSV(player.fantasy_points || 0),
    escapeCSV(player.season_fantasy_points || 0),
    escapeCSV(player.depth_chart_order || ''),
    escapeCSV(player.cfbd_id || player.external_id || ''),
    escapeCSV(player.image_url || ''),
    escapeCSV(player.statline_simple_json || player.stats || '')
  ];
  
  csvContent += row.join(',') + '\n';
}

// Save CSV file
const csvPath = path.join(process.cwd(), 'exports/college_players_import.csv');
fs.writeFileSync(csvPath, csvContent);

console.log(`✅ CSV file created: exports/college_players_import.csv`);
console.log(`   Total rows: ${backupData.length + 1} (including header)`);

// Also create a smaller test CSV with first 100 players
const testCsvContent = headers.join(',') + '\n' + 
  csvContent.split('\n').slice(1, 101).join('\n');

const testCsvPath = path.join(process.cwd(), 'exports/college_players_test_100.csv');
fs.writeFileSync(testCsvPath, testCsvContent);

console.log(`✅ Test CSV created: exports/college_players_test_100.csv`);
console.log(`   Total rows: 101 (100 players + header)`);

// Show sample of the CSV
console.log('\n📄 Sample of CSV content:');
console.log('─'.repeat(60));
console.log(csvContent.split('\n').slice(0, 6).join('\n'));
console.log('─'.repeat(60));

// Validate conference distribution
const conferences: Record<string, number> = {};
for (const player of backupData) {
  const conf = player.conference || 'Unknown';
  conferences[conf] = (conferences[conf] || 0) + 1;
}

console.log('\n📊 Conference distribution in CSV:');
for (const [conf, count] of Object.entries(conferences).sort()) {
  console.log(`   ${conf}: ${count} players`);
}

console.log('\n📌 Next steps:');
console.log('1. Go to Appwrite Console');
console.log('2. Navigate to your database → college_players collection');
console.log('3. Look for an Import option (usually in the menu or toolbar)');
console.log('4. Upload the CSV file: exports/college_players_import.csv');
console.log('5. Map the CSV columns to the collection attributes');
console.log('6. Start the import');
console.log('\nAlternatively, test with the smaller file first:');
console.log('   exports/college_players_test_100.csv (100 players only)');
