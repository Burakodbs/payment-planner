// Expense List page specific JavaScript code
// Set current month as filter
function setCurrentMonthFilter() {
    const filterDate = document.getElementById('filtreTarih'); // HTML'deki doÄŸru ID
    if (filterDate) {
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
        filterDate.value = currentMonth;
        // Filtreyi ayarladÄ±ktan sonra tabloyu gÃ¼ncelle
        setTimeout(() => {
            if (typeof updateExpenseTable === 'function') {
                updateExpenseTable();
            }
        }, 300);
    }
}
// Clear all filters function
function clearAllFilters() {
    document.getElementById('filtreTarih').value = '';
    document.getElementById('filterUser').value = '';
    document.getElementById('filterCard').value = '';
    document.getElementById('minAmount').value = '';
    document.getElementById('maxAmount').value = '';
    document.getElementById('sortCriteria').value = 'date-desc';
    updateExpenseTable();
}
// Sayfa yÃ¼klendiÄŸinde mevcut ayÄ± ayarla
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('expense-listesi');
    }
    // Auth sistem yÃ¼klendikten sonra filtre ve tablo gÃ¼ncelle
    let attempts = 0;
    const maxAttempts = 20; // 10 saniye
    const waitForData = () => {
        attempts++;
            isLoggedIn: authSystem?.isLoggedIn,
            currentUser: authSystem?.currentUser,
            hasCurrentUserData: !!authSystem?.currentUserData
        } : 'undefined');
        // Check both global and window expenses, and also check if we have user data
        const hasExpenses = (window.expenses && window.expenses.length >= 0) || 
                          (typeof expenses !== 'undefined' && expenses?.length >= 0);
        const hasUserData = authSystem?.currentUser && authSystem?.currentUserData;
        if (hasExpenses || hasUserData) {
            // Data hazÄ±r, filtreyi ayarla ve tabloyu gÃ¼ncelle
            setCurrentMonthFilter();
        } else if (attempts < maxAttempts) {
            setTimeout(waitForData, 500);
        } else {
            // Timeout, yine de filtreyi ayarla
                authSystemExists: typeof authSystem !== 'undefined',
                isLoggedIn: authSystem?.isLoggedIn,
                currentUser: authSystem?.currentUser,
                windowExpenses: window.expenses,
                globalExpenses: typeof expenses !== 'undefined' ? expenses : 'undefined'
            });
            setCurrentMonthFilter();
        }
    };
    setTimeout(waitForData, 500);
    // Edit form event listener
    const editForm = document.getElementById('editExpenseForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditExpenseSubmit);
    }
});
