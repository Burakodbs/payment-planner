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

// Update accounts table with modern design
function updateAccounts() {
    const accountsTable = document.getElementById('accountsTable');
    if (!accountsTable) return;
    
    const tbody = accountsTable.querySelector('tbody');
    if (!tbody) return;
    
    // Clear existing content
    tbody.innerHTML = '';
    
    // Check if we have people data
    const peopleArray = (typeof people !== 'undefined' && people) ? people : [];
    const expensesArray = (typeof expenses !== 'undefined' && expenses) ? expenses : [];
    
    if (peopleArray.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    <div class="empty-state-small">
                        <div class="empty-icon">👥</div>
                        <div>Henüz kullanıcı yok</div>
                        <small>Önce veri yönetimi sayfasından kullanıcı ekleyin</small>
                    </div>
                </td>
            </tr>
        `;
        updateAccountsSummary(0, 0, 0, 0);
        return;
    }
    
    const { accounts, futurePayments } = calculateDebts();
    
    let totalExpenses = 0;
    let totalFuture = 0;
    let activeUsers = 0;
    
    // Create rows for each person
    peopleArray.forEach(person => {
        const currentExpenses = accounts[person] || 0;
        const futureInstallments = futurePayments[person] || 0;
        const totalDebt = currentExpenses + futureInstallments;
        
        totalExpenses += currentExpenses;
        totalFuture += futureInstallments;
        if (totalDebt > 0) activeUsers++;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">👤</span>
                    <strong>${person}</strong>
                </div>
            </td>
            <td class="${currentExpenses >= 0 ? 'debt-positive' : currentExpenses < 0 ? 'debt-negative' : 'debt-neutral'}">
                ${formatCurrency(currentExpenses)}
            </td>
            <td class="${futureInstallments >= 0 ? 'debt-positive' : futureInstallments < 0 ? 'debt-negative' : 'debt-neutral'}">
                ${formatCurrency(futureInstallments)}
            </td>
            <td class="${totalDebt >= 0 ? 'debt-positive' : totalDebt < 0 ? 'debt-negative' : 'debt-neutral'}">
                <strong>${formatCurrency(totalDebt)}</strong>
            </td>
            <td>
                <button class="detail-btn" onclick="showPersonDetails('${person}')">
                    📊 Detay
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Update summary cards
    updateAccountsSummary(totalExpenses, totalFuture, totalExpenses + totalFuture, activeUsers);
    
    // If no rows were added (no people with data), show appropriate message
    if (tbody.children.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    <div class="empty-state-small">
                        <div class="empty-icon">💳</div>
                        <div>Henüz harcama verisi yok</div>
                        <small>Harcama ekledikten sonra hesaplar burada görünecek</small>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Update summary cards
function updateAccountsSummary(totalExpenses, totalFuture, netAmount, activeUsers) {
    const totalExpensesEl = document.getElementById('totalExpensesAmount');
    const totalFutureEl = document.getElementById('totalFutureAmount');
    const accountBalanceEl = document.getElementById('accountBalance');
    const activeUsersEl = document.getElementById('activeUsersCount');
    
    if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(totalExpenses);
    if (totalFutureEl) totalFutureEl.textContent = formatCurrency(totalFuture);
    if (accountBalanceEl) accountBalanceEl.textContent = formatCurrency(netAmount);
    if (activeUsersEl) activeUsersEl.textContent = activeUsers.toString();
}

// Show person expense details
function showPersonDetails(personName) {
    // Filter expenses for this person
    const personExpenses = expenses.filter(exp => exp.person === personName);
    
    if (personExpenses.length === 0) {
        alert(`${personName} için henüz harcama kaydı bulunamadı.`);
        return;
    }
    
    // Create a simple modal or redirect to expense list with filter
    const message = `${personName} - Son 5 Harcama:\n\n` + 
        personExpenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(exp => `• ${exp.description}: ${formatCurrency(exp.amount)} (${exp.date})`)
            .join('\n') + 
        `\n\nToplam ${personExpenses.length} harcama kaydı var.`;
    
    alert(message);
}

// Export accounts data
function exportAccountsData() {
    const { accounts, futurePayments } = calculateDebts();
    const peopleArray = (typeof people !== 'undefined' && people) ? people : [];
    
    let csvContent = "Kullanıcı,Mevcut Harcama,Gelecek Taksitler,Toplam\n";
    
    peopleArray.forEach(person => {
        const current = accounts[person] || 0;
        const future = futurePayments[person] || 0;
        const total = current + future;
        
        csvContent += `${person},${current},${future},${total}\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hesaplar_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Make utilities globally available
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.updateAccounts = updateAccounts;
window.updateAccountsSummary = updateAccountsSummary;
window.showPersonDetails = showPersonDetails;
window.exportAccountsData = exportAccountsData;
// Service Worker Registration - Essential for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js')
            .catch(() => {}); // Silent fail
    });
}
