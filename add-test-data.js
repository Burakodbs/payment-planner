// Emergency Data Restore - Test Data
function addTestData() {
    console.log('🚨 ADDING TEST DATA FOR DEBUGGING');
    
    if (typeof authSystem !== 'undefined' && authSystem.currentUser) {
        // Add test data to GLOBAL variables (not userData directly)
        
        // Add test expenses if empty
        if (!expenses || expenses.length === 0) {
            window.expenses = [
                {
                    id: Date.now() + 1,
                    date: '2025-08-01',
                    card: 'Test Kartı',
                    person: 'Test User',
                    description: 'Test Harcama 1',
                    amount: 100.50,
                    category: 'Test'
                },
                {
                    id: Date.now() + 2,
                    date: '2025-08-10',
                    card: 'Test Kartı',
                    person: 'Test User',
                    description: 'Test Harcama 2',
                    amount: 75.25,
                    category: 'Test'
                }
            ];
            console.log('✅ Test expenses added to global var:', window.expenses.length);
        }
        
        // Add test credit cards if empty
        if (!creditCards || creditCards.length === 0) {
            window.creditCards = ['Test Kartı', 'Test Kartı 2'];
            console.log('✅ Test credit cards added to global var:', window.creditCards.length);
        }
        
        // Add test people if empty
        if (!people || people.length === 0) {
            window.people = ['Test User', 'Test User 2'];
            console.log('✅ Test people added to global var:', window.people.length);
        }
        
        // Add test regular payments if empty
        if (!regularPayments || regularPayments.length === 0) {
            window.regularPayments = [
                {
                    id: Date.now() + 100,
                    description: 'Test Düzenli Ödeme',
                    amount: 50,
                    card: 'Test Kartı',
                    person: 'Test User',
                    startDate: '2025-08-01',
                    active: true
                }
            ];
            console.log('✅ Test regular payments added to global var:', window.regularPayments.length);
        }
        
        console.log('📤 Global variables updated, now saving...');
        
        // Save and reload
        authSystem.saveUserData();
        authSystem.loadUserData();
        
        console.log('🔄 Data saved and reloaded');
        
        // Update dashboard
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        
        console.log('📊 Dashboard updated');
        
    } else {
        console.error('❌ Auth system not available');
    }
}

// Wait a bit then add test data if needed
setTimeout(() => {
    if (typeof authSystem !== 'undefined' && authSystem.currentUser) {
        const userData = authSystem.users[authSystem.currentUser].data;
        
        // Only add test data if everything is empty
        const hasNoData = (!expenses || expenses.length === 0) &&
                         (!creditCards || creditCards.length === 0) &&
                         (!people || people.length === 0);
        
        if (hasNoData) {
            console.log('🔧 No data found, adding test data...');
            addTestData();
        } else {
            console.log('✅ User already has data, skipping test data');
        }
    }
}, 2000);

// Make function available globally for manual testing
window.addTestData = addTestData;
