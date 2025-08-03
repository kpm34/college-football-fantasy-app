import { API_KEYS, API_ENDPOINTS, checkAPIStatus } from '../config/api-keys';

// Test CFBD API
async function testCFBD() {
  try {
    const response = await fetch(`${API_ENDPOINTS.CFBD}/teams`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.CFBD_API_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json() as any[];
      console.log('✅ CFBD API: Working - Found', data.length, 'teams');
      return true;
    } else {
      console.log('❌ CFBD API: Failed -', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ CFBD API: Error -', error);
    return false;
  }
}

// Test Odds API
async function testOddsAPI() {
  if (!API_KEYS.ODDS_API_KEY) {
    console.log('⚠️  Odds API: No key configured');
    return false;
  }
  
  try {
    const response = await fetch(`${API_ENDPOINTS.ODDS}/sports`, {
      headers: {
        'apiKey': API_KEYS.ODDS_API_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json() as any[];
      console.log('✅ Odds API: Working - Found', data.length, 'sports');
      return true;
    } else {
      console.log('❌ Odds API: Failed -', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Odds API: Error -', error);
    return false;
  }
}

// Test ESPN API
async function testESPN() {
  try {
    const response = await fetch(`${API_ENDPOINTS.ESPN}/scoreboard`);
    
    if (response.ok) {
      const data = await response.json() as any;
      console.log('✅ ESPN API: Working - Free API');
      return true;
    } else {
      console.log('❌ ESPN API: Failed -', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ ESPN API: Error -', error);
    return false;
  }
}

// Test Appwrite
async function testAppwrite() {
  if (!API_KEYS.APPWRITE_API_KEY) {
    console.log('⚠️  Appwrite: No API key configured');
    return false;
  }
  
  try {
    const response = await fetch(`${API_ENDPOINTS.APPWRITE}/databases/${API_KEYS.APPWRITE_PROJECT_ID}/collections`, {
      headers: {
        'X-Appwrite-Project': API_KEYS.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': API_KEYS.APPWRITE_API_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json() as any;
      console.log('✅ Appwrite: Working - Found', data.collections?.length || 0, 'collections');
      return true;
    } else {
      console.log('❌ Appwrite: Failed -', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Appwrite: Error -', error);
    return false;
  }
}

// Test Power 4 Teams specifically
async function testPower4Teams() {
  try {
    const response = await fetch(`${API_ENDPOINTS.CFBD}/teams/fbs`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.CFBD_API_KEY}`
      }
    });
    
    if (response.ok) {
      const teams = await response.json() as any[];
      const power4Teams = teams.filter(team => 
        team.conference === 'SEC' || 
        team.conference === 'ACC' || 
        team.conference === 'Big 12' || 
        team.conference === 'Big Ten'
      );
      
      console.log('✅ Power 4 Teams Found:');
      console.log(`   SEC: ${power4Teams.filter(t => t.conference === 'SEC').length} teams`);
      console.log(`   ACC: ${power4Teams.filter(t => t.conference === 'ACC').length} teams`);
      console.log(`   Big 12: ${power4Teams.filter(t => t.conference === 'Big 12').length} teams`);
      console.log(`   Big Ten: ${power4Teams.filter(t => t.conference === 'Big Ten').length} teams`);
      
      return true;
    } else {
      console.log('❌ Power 4 Teams: Failed -', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Power 4 Teams: Error -', error);
    return false;
  }
}

// Test AP Rankings
async function testAPRankings() {
  try {
    const response = await fetch(`${API_ENDPOINTS.CFBD}/rankings?year=2024&week=1`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.CFBD_API_KEY}`
      }
    });
    
    if (response.ok) {
      const rankings = await response.json() as any[];
      const apRankings = rankings.find(r => r.polls?.some((p: any) => p.poll === 'AP Top 25'));
      
      if (apRankings) {
        const apPoll = apRankings.polls.find((p: any) => p.poll === 'AP Top 25');
        console.log('✅ AP Rankings: Working - Found', apPoll.ranks.length, 'ranked teams');
        return true;
      } else {
        console.log('❌ AP Rankings: No AP poll found');
        return false;
      }
    } else {
      console.log('❌ AP Rankings: Failed -', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ AP Rankings: Error -', error);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🏈 Testing College Football Fantasy App APIs\n');
  
  // Test individual APIs
  await testCFBD();
  await testOddsAPI();
  await testESPN();
  await testAppwrite();
  
  console.log('\n📊 Testing Specific Data Sources:');
  await testPower4Teams();
  await testAPRankings();
  
  console.log('\n🎯 API Status Summary:');
  console.log(`   CFBD API Key: ${API_KEYS.CFBD_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Odds API Key: ${API_KEYS.ODDS_API_KEY ? '✅ Configured' : '❌ Need to get'}`);
  console.log(`   Rotowire API Key: ${API_KEYS.ROTOWIRE_API_KEY ? '✅ Configured' : '❌ Need to get'}`);
  console.log(`   ESPN API: ✅ Free API`);
  console.log(`   Appwrite API Key: ${API_KEYS.APPWRITE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
}

// Run tests
runAllTests().catch(console.error); 