// Auth System Data Inspector
console.log('=== AUTH SYSTEM DETAILED INSPECTION ===');

if (typeof authSystem !== 'undefined' && authSystem.currentUser) {
    console.log('Current user:', authSystem.currentUser);
    console.log('Current user data object:', authSystem.currentUserData);
    
    if (authSystem.currentUserData) {
        console.log('User data contents:');
        console.log('- expenses exists:', !!authSystem.currentUserData.expenses);
        console.log('- expenses length:', authSystem.currentUserData.expenses?.length || 0);
        console.log('- expenses sample:', authSystem.currentUserData.expenses?.slice(0, 2));
        
        console.log('- creditCards exists:', !!authSystem.currentUserData.creditCards);
        console.log('- creditCards length:', authSystem.currentUserData.creditCards?.length || 0);
        console.log('- creditCards sample:', authSystem.currentUserData.creditCards?.slice(0, 2));
        
        console.log('- people exists:', !!authSystem.currentUserData.people);
        console.log('- people length:', authSystem.currentUserData.people?.length || 0);
        console.log('- people sample:', authSystem.currentUserData.people?.slice(0, 2));
        
        console.log('- regularPayments exists:', !!authSystem.currentUserData.regularPayments);
        console.log('- regularPayments length:', authSystem.currentUserData.regularPayments?.length || 0);
        console.log('- regularPayments sample:', authSystem.currentUserData.regularPayments?.slice(0, 2));
        
        // Auth sistemdeki raw user data
        console.log('Raw users object:', authSystem.users);
        console.log('Current user raw data:', authSystem.users[authSystem.currentUser]);
    } else {
        console.log('❌ currentUserData is null/undefined');
        
        // Raw user data kontrol
        if (authSystem.users && authSystem.users[authSystem.currentUser]) {
            console.log('Raw user exists in users object');
            console.log('Raw user data:', authSystem.users[authSystem.currentUser]);
        } else {
            console.log('❌ No raw user data found');
        }
    }
    
    // Force reload user data
    console.log('🔄 Force reloading user data...');
    authSystem.loadUserData();
    
    // Check again
    console.log('After force reload:');
    console.log('- Global expenses length:', expenses?.length || 0);
    console.log('- Global creditCards length:', creditCards?.length || 0);
    console.log('- Global people length:', people?.length || 0);
    console.log('- Global regularPayments length:', regularPayments?.length || 0);
    
} else {
    console.log('❌ Auth system not found or no current user');
}

// Also check localStorage directly
console.log('=== DIRECT LOCALSTORAGE CHECK ===');
const appUsers = localStorage.getItem('app_users');
if (appUsers) {
    console.log('app_users localStorage found');
    const users = JSON.parse(appUsers);
    console.log('Users object:', users);
    
    if (users.burakodbs && users.burakodbs.data) {
        console.log('burakodbs user data found:');
        console.log('- expenses:', users.burakodbs.data.expenses?.length || 0);
        console.log('- creditCards:', users.burakodbs.data.creditCards?.length || 0);
        console.log('- people:', users.burakodbs.data.people?.length || 0);
        console.log('- regularPayments:', users.burakodbs.data.regularPayments?.length || 0);
    }
} else {
    console.log('❌ No app_users in localStorage');
}
