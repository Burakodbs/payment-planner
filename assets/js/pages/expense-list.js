// Expense List page specific JavaScript code

// console.log('Expense list page loaded');

// Set current month as filter
function setCurrentMonthFilter() {
    const filterDate = document.getElementById('filterDate');
    if (filterDate) {
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
        filterDate.value = currentMonth;
        // console.log('Default month filter set:', currentMonth);
    }
}

// Clear all filters function
function clearAllFilters() {
    document.getElementById('filterDate').value = '';
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

    // Kısa bir gecikme ile mevcut ayı ayarla
    setTimeout(setCurrentMonthFilter, 200);

    // Auth sistem data yükledikten sonra tabloyu güncelle
    setTimeout(() => {
        if (typeof updateExpenseTable === 'function') {
            updateExpenseTable();
        }
    }, 1000);

    // Edit form event listener
    const editForm = document.getElementById('editExpenseForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditExpenseSubmit);
    }
});