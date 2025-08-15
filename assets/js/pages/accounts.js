// Accounts page specific JavaScript code
// 
// Accounts page specific functions and event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('accounts');
    }
    
    // Wait for data to be loaded before updating accounts
    function waitForDataAndUpdate() {
        // Check if data is available
        if (typeof authSystem !== 'undefined' && authSystem && authSystem.currentUser) {
            // If user is logged in, check if data is loaded
            if (expenses && people && expenses.length > 0) {
                if (typeof updateAccounts === 'function') {
                    updateAccounts();
                }
                return;
            }
        } else if (expenses && people) {
            // If no auth system, use global data
            if (typeof updateAccounts === 'function') {
                updateAccounts();
            }
            return;
        }
        
        // If data not ready, wait a bit and try again
        setTimeout(waitForDataAndUpdate, 500);
    }
    
    // Start waiting for data
    setTimeout(waitForDataAndUpdate, 100);
});
