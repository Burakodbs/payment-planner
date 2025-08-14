// Global Variables Check and Recovery
function checkGlobalVariables() {
    console.log('=== GLOBAL VARIABLES CHECK ===');
    
    // Global değişkenlerin durumunu kontrol et
    console.log('expenses:', typeof expenses, 'length:', expenses?.length || 0);
    console.log('creditCards:', typeof creditCards, 'length:', creditCards?.length || 0);
    console.log('people:', typeof people, 'length:', people?.length || 0);
    console.log('regularPayments:', typeof regularPayments, 'length:', regularPayments?.length || 0);
    
    // Auth system kontrolü
    if (typeof authSystem !== 'undefined' && authSystem.currentUser) {
        console.log('Auth system active, user:', authSystem.currentUser);
        console.log('Auth user data:', authSystem.currentUserData);
        
        // Global değişkenler boşsa auth'dan yükle
        if ((!expenses || expenses.length === 0) && authSystem.currentUserData?.expenses?.length > 0) {
            console.log('Loading expenses from auth system...');
            window.expenses = authSystem.currentUserData.expenses;
        }
        
        if ((!creditCards || creditCards.length === 0) && authSystem.currentUserData?.creditCards?.length > 0) {
            console.log('Loading credit cards from auth system...');
            window.creditCards = authSystem.currentUserData.creditCards;
        }
        
        if ((!people || people.length === 0) && authSystem.currentUserData?.people?.length > 0) {
            console.log('Loading people from auth system...');
            window.people = authSystem.currentUserData.people;
        }
        
        if ((!regularPayments || regularPayments.length === 0) && authSystem.currentUserData?.regularPayments?.length > 0) {
            console.log('Loading regular payments from auth system...');
            window.regularPayments = authSystem.currentUserData.regularPayments;
        }
    }
    
    // Son durum
    console.log('=== FINAL STATE ===');
    console.log('expenses:', expenses?.length || 0);
    console.log('creditCards:', creditCards?.length || 0);
    console.log('people:', people?.length || 0);
    console.log('regularPayments:', regularPayments?.length || 0);
    
    // Dashboard varsa güncelle
    if (typeof updateDashboard === 'function') {
        console.log('Updating dashboard...');
        updateDashboard();
    }
}

// Sayfa yüklendikten sonra çalıştır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkGlobalVariables, 500);
    });
} else {
    setTimeout(checkGlobalVariables, 500);
}
