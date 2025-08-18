// Expense List page specific JavaScript code
// Set current month as filter
function setCurrentMonthFilter() {
    const filterDate = document.getElementById('filtreTarih'); // HTML'deki doğru ID
    if (filterDate) {
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
        filterDate.value = currentMonth;
        
        console.log('📅 Current month filter set to:', currentMonth);
        
        // Filtreyi ayarladıktan sonra tabloyu güncelle
        setTimeout(() => {
            console.log('⏰ Calling updateExpenseTable from setCurrentMonthFilter...');
            if (typeof updateExpenseTable === 'function') {
                updateExpenseTable();
            }
        }, 300);
    }
}
// Debug function to check data state
function debugExpenseTable() {
    console.log('🔍 DEBUG: Expense Table State');
    console.log('🔍 Auth System:', {
        exists: typeof authSystem !== 'undefined',
        currentUser: authSystem?.currentUser,
        isLoggedIn: authSystem?.isLoggedIn,
        currentUserData: !!authSystem?.currentUserData,
        userData: authSystem?.currentUserData
    });
    
    console.log('🔍 Global Variables:', {
        expenses: {
            defined: typeof expenses !== 'undefined',
            length: expenses?.length || 0,
            sample: expenses?.slice(0, 3)
        },
        windowExpenses: {
            exists: !!window.expenses,
            length: window.expenses?.length || 0
        }
    });
    
    console.log('🔍 DOM Elements:', {
        table: !!document.querySelector('#expenseTable tbody'),
        filters: {
            date: document.getElementById('filtreTarih')?.value,
            user: document.getElementById('filterUser')?.value,
            card: document.getElementById('filterCard')?.value
        }
    });
    
    // Force refresh auth data and table
    if (authSystem && authSystem.currentUserData) {
        console.log('🔄 Forcing data refresh...');
        window.expenses = authSystem.currentUserData.expenses || [];
        expenses = window.expenses;
        
        console.log('📊 After refresh:', {
            expenses: expenses?.length || 0,
            windowExpenses: window.expenses?.length || 0
        });
        
        if (typeof updateExpenseTable === 'function') {
            updateExpenseTable();
        }
    }
    
    alert('Debug bilgileri konsola yazdırıldı! F12 ile Developer Tools\'u açın.');
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
// Sayfa yüklendiğinde mevcut ayı ayarla
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('expense-listesi');
    }
    // Auth sistem yüklendikten sonra filtre ve tablo güncelle
    let attempts = 0;
    const maxAttempts = 20; // 10 saniye
    const waitForData = () => {
        attempts++;
        console.log('Waiting for data, attempt:', attempts, typeof authSystem !== 'undefined' ? {
            isLoggedIn: authSystem?.isLoggedIn,
            currentUser: authSystem?.currentUser,
            hasCurrentUserData: !!authSystem?.currentUserData
        } : 'undefined');
        // Check both global and window expenses, and also check if we have user data
        const hasExpenses = (window.expenses && window.expenses.length >= 0) || 
                          (typeof expenses !== 'undefined' && expenses?.length >= 0);
        const hasUserData = authSystem?.currentUser && authSystem?.currentUserData;
        if (hasExpenses || hasUserData) {
            // Data hazır, filtreyi ayarla ve tabloyu güncelle
            setCurrentMonthFilter();
        } else if (attempts < maxAttempts) {
            setTimeout(waitForData, 500);
        } else {
            // Timeout, yine de filtreyi ayarla
            console.log('Timeout waiting for data:', {
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
    
    // Initialize page with correct ID
    if (typeof initializePage === 'function') {
        initializePage('expense-list');
    }
});
