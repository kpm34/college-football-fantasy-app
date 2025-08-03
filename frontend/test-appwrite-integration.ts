import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function testAppwriteIntegration() {
  console.log('🧪 Testing Appwrite Integration...\n');
  
  // Test environment variables
  console.log('📋 Environment Variables:');
  console.log('- APPWRITE_ENDPOINT:', process.env.APPWRITE_ENDPOINT ? '✅' : '❌');
  console.log('- APPWRITE_PROJECT_ID:', process.env.APPWRITE_PROJECT_ID ? '✅' : '❌');
  console.log('- APPWRITE_API_KEY:', process.env.APPWRITE_API_KEY ? '✅' : '❌');
  console.log('- DATABASE_ID:', process.env.DATABASE_ID || 'college-football-fantasy');
  
  // Test API routes
  console.log('\n🌐 Testing API Routes:');
  
  try {
    // Start Next.js dev server instructions
    console.log('\n⚠️  Make sure Next.js dev server is running:');
    console.log('   cd frontend && npm run dev\n');
    
    // Test players API
    console.log('Testing /api/players/draftable...');
    const playersResponse = await fetch('http://localhost:3001/api/players/draftable?week=1');
    if (playersResponse.ok) {
      const data = await playersResponse.json();
      console.log(`✅ Players API: ${data.players?.length || 0} players returned`);
    } else {
      console.log('❌ Players API failed:', playersResponse.status);
    }
    
    // Test draft status API
    console.log('\nTesting /api/draft/[leagueId]/status...');
    const draftResponse = await fetch('http://localhost:3001/api/draft/test-league/status');
    if (draftResponse.ok) {
      const data = await draftResponse.json();
      console.log(`✅ Draft API: Status = ${data.draftStatus}`);
    } else {
      console.log('❌ Draft API failed:', draftResponse.status);
    }
    
  } catch (error: any) {
    console.error('\n❌ API Test Error:', error.message);
    console.log('   Make sure the Next.js dev server is running on port 3001');
  }
  
  // Test page access
  console.log('\n📄 Test Pages:');
  console.log('- Test Appwrite UI: http://localhost:3001/test-appwrite');
  console.log('- Create League: http://localhost:3001/league/create');
  console.log('- Draft Page: http://localhost:3001/draft/test-league');
  
  console.log('\n✨ Integration test complete!');
}

// Run the test
testAppwriteIntegration().catch(console.error);