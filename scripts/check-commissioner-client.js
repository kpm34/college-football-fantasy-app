// Run this in the browser console to check commissioner status

async function checkCommissionerStatus() {
  const leagueId = '6894db4a0001ad84e4b0';
  
  console.log('Checking commissioner status for league:', leagueId);
  
  // Check the current user
  const currentUser = await (await fetch('/api/auth/user')).json();
  console.log('Current user:', currentUser);
  
  // Get league data directly from Appwrite
  const { Client, Databases } = window.Appwrite;
  const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('college-football-fantasy-app');
    
  const databases = new Databases(client);
  
  try {
    const league = await databases.getDocument(
      'college-football-fantasy',
      'leagues',
      leagueId
    );
    
    console.log('League data:', league);
    console.log('Commissioner ID:', league.commissionerId);
    console.log('Commissioner Name:', league.commissioner);
    console.log('Current User ID:', currentUser.user?.$id);
    console.log('Current User Name:', currentUser.user?.name);
    console.log('Match on ID:', league.commissionerId === currentUser.user?.$id);
    console.log('Match on Name:', league.commissioner === currentUser.user?.name);
    
    // Check if the navbar will show the button
    const userCandidates = [
      currentUser.user?.$id,
      currentUser.user?.email,
      currentUser.user?.name
    ].filter(Boolean);
    
    const leagueCandidates = [
      league.commissionerId,
      league.commissioner,
      league.commissioner_id
    ].filter(Boolean);
    
    console.log('User candidates:', userCandidates);
    console.log('League candidates:', leagueCandidates);
    
    const isCommissioner = leagueCandidates.some(val => 
      userCandidates.map(s => s.toLowerCase()).includes(val.toLowerCase())
    );
    
    console.log('Is Commissioner:', isCommissioner);
    
  } catch (error) {
    console.error('Error getting league:', error);
  }
}

// Copy and paste this into the browser console
checkCommissionerStatus();
