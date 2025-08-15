// Accounts page specific JavaScript code
// 
// Accounts page specific functions and event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('accounts');
    }
    // Update accounts table
    setTimeout(() => {
        if (typeof updateAccounts === 'function') {
            updateAccounts();
        }
    }, 500);
});
