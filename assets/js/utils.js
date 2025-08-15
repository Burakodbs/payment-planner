// Essential Legacy Utilities - Minimized
// Legacy migration - will be removed in future versions
function migrateRegularPaymentData() {
    let migrationCount = 0;
    expenses.forEach(expense => {
        if (expense.isRegularAutomatic && !expense.isRegular) {
            expense.isRegular = true;
            delete expense.isRegularAutomatic;
            if (expense.description && expense.description.includes('(Otomatik)')) {
                expense.description = expense.description.replace('(Otomatik)', '(Düzenli)');
            }
            migrationCount++;
        }
    });
    if (migrationCount > 0) {
        DataManager.save();
        DataManager.updateAllViews();
        NotificationService.success(`${migrationCount} düzenli ödeme güncellendi`);
    }
}
// Dashboard update functions - Essential only
function updateDashboard() {
    updateDashboardStats();
    if (typeof updateDashboardCharts === 'function') updateDashboardCharts();
    updateDashboardRecentExpenses();
    updateDashboardUpcomingInstallments();
}
function updateDashboardStats() {
    const thisMonthElement = document.getElementById('thisMonthTotal');
    const totalCurrentDebtElement = document.getElementById('totalCurrentDebt');
    const totalFuturePaymentsElement = document.getElementById('totalFuturePayments');
    if (!thisMonthElement || !totalCurrentDebtElement || !totalFuturePaymentsElement) {
        return;
    }
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthExpenses = expenses.filter(h => h.date && h.date.startsWith(thisMonth));
    const thisMonthTotal = thisMonthExpenses.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0);
    const { accounts, futurePayments } = calculateDebts();
    const totalCurrentDebt = Object.values(accounts).reduce((sum, debt) => sum + debt, 0);
    const totalFuturePayments = Object.values(futurePayments).reduce((sum, debt) => sum + debt, 0);
    thisMonthElement.textContent = thisMonthTotal.toFixed(2) + ' TL';
    totalCurrentDebtElement.textContent = totalCurrentDebt.toFixed(2) + ' TL';
    totalFuturePaymentsElement.textContent = totalFuturePayments.toFixed(2) + ' TL';
}
function updateDashboardRecentExpenses() {
    const container = document.getElementById('recentExpensesList');
    if (!container) return;
    const recentExpenses = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    if (recentExpenses.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Henüz expense yok</p>';
        return;
    }
    const html = recentExpenses.map(expense => {
        const date = new Date(expense.date).toLocaleDateString('tr-TR');
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${expense.description || 'Açıklama yok'}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${date} - ${expense.person} - ${expense.card}</div>
                </div>
                <div style="font-weight: 600; color: var(--primary);">${(parseFloat(expense.amount) || 0).toFixed(2)} TL</div>
            </div>
        `;
    }).join('');
    container.innerHTML = html;
}
function updateDashboardUpcomingInstallments() {
    const container = document.getElementById('upcomingInstallmentsList');
    if (!container) return;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().slice(0, 7);
    const upcomingInstallments = getFutureTaksits(nextMonthStr);
    if (upcomingInstallments.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Gelecek ay taksit yok</p>';
        return;
    }
    const html = upcomingInstallments.slice(0, 5).map(installment => {
        // Hem eski hem yeni taksit alanlarını destekle
        const installmentNumber = installment.installmentNumber || installment.taksitNo;
        const totalInstallments = installment.totalInstallments || installment.toplamTaksit;
        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border);">
            <div>
                <div style="font-weight: 600; color: var(--text-primary);">${installment.description || 'Taksit'}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">${installmentNumber}/${totalInstallments} - ${installment.person} - ${installment.card}</div>
            </div>
            <div style="font-weight: 600; color: var(--warning);">${(parseFloat(installment.amount) || 0).toFixed(2)} TL</div>
        </div>
        `;
    }).join('');
    container.innerHTML = html;
}
// Name synchronization across all data
function syncAllDataAfterNameChange(type, oldName, newName) {
    let updateCount = 0;
    expenses.forEach(expense => {
        if (type === 'card' && expense.card === oldName) {
            expense.card = newName;
            updateCount++;
        } else if (type === 'user' && expense.person === oldName) {
            expense.person = newName;
            updateCount++;
        }
    });
    regularPayments.forEach(payment => {
        if (type === 'card' && payment.card === oldName) {
            payment.card = newName;
            updateCount++;
        } else if (type === 'user' && payment.person === oldName) {
            payment.person = newName;
            updateCount++;
        }
    });
    if (updateCount > 0) {
        DataManager.save();
        DataManager.updateAllViews();
        NotificationService.success(`${updateCount} records updated: ${oldName} â†’ ${newName}`);
    }
}
// Card and User editing functions
function editCard(oldCardName) {
    const newCardName = prompt(`Enter new name for "${oldCardName}" card:`, oldCardName);
    if (newCardName && newCardName.trim() && newCardName.trim() !== oldCardName) {
        const newName = newCardName.trim();
        if (creditCards.includes(newName)) {
            NotificationService.error('This card name already exists');
            return;
        }
        const cardIndex = creditCards.indexOf(oldCardName);
        if (cardIndex !== -1) {
            creditCards[cardIndex] = newName;
        }
        syncAllDataAfterNameChange('card', oldCardName, newName);
        FormHandlers.updateCardOptions();
        if (typeof updateCardAndUserManagement === 'function') updateCardAndUserManagement();
        if (typeof updateDataStats === 'function') updateDataStats();
    }
}
function editUser(oldUserName) {
    const newUserName = prompt(`Enter new name for "${oldUserName}" user:`, oldUserName);
    if (newUserName && newUserName.trim() && newUserName.trim() !== oldUserName) {
        const newName = newUserName.trim();
        if (people.includes(newName)) {
            NotificationService.error('Bu kullanıcı adı zaten mevcut');
            return;
        }
        const userIndex = people.indexOf(oldUserName);
        if (userIndex !== -1) {
            people[userIndex] = newName;
        }
        syncAllDataAfterNameChange('user', oldUserName, newName);
        FormHandlers.updateUserOptions();
        if (typeof updateCardAndUserManagement === 'function') updateCardAndUserManagement();
        if (typeof updateDataStats === 'function') updateDataStats();
    }
}
// Currency formatting utility
function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return amount.toLocaleString('tr-TR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }) + ' TL';
}
// Date formatting utility
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    } catch (error) {
        return dateString;
    }
}
// Make utilities globally available
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
// Service Worker Registration - Essential for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js')
            .catch(() => {}); // Silent fail
    });
}
