// Essential Legacy Utilities - Minimized

// Legacy migration - will be removed in future versions
function migrateDuzenliOdemeData() {
    let migrationCount = 0;
    harcamalar.forEach(expense => {
        if (expense.isDuzenliOtomatik && !expense.isRegular) {
            expense.isRegular = true;
            delete expense.isDuzenliOtomatik;
            
            if (expense.aciklama && expense.aciklama.includes('(Otomatik)')) {
                expense.aciklama = expense.aciklama.replace('(Otomatik)', '(Düzenli)');
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
    const thisMonthExpenses = harcamalar.filter(h => h.tarih && h.tarih.startsWith(thisMonth));
    const thisMonthTotal = thisMonthExpenses.reduce((sum, h) => sum + (parseFloat(h.tutar) || 0), 0);

    const { hesaplar, gelecekTaksitler } = calculateDebts();
    const totalCurrentDebt = Object.values(hesaplar).reduce((sum, debt) => sum + debt, 0);
    const totalFuturePayments = Object.values(gelecekTaksitler).reduce((sum, debt) => sum + debt, 0);

    thisMonthElement.textContent = thisMonthTotal.toFixed(2) + ' TL';
    totalCurrentDebtElement.textContent = totalCurrentDebt.toFixed(2) + ' TL';
    totalFuturePaymentsElement.textContent = totalFuturePayments.toFixed(2) + ' TL';
}

function updateDashboardRecentExpenses() {
    const container = document.getElementById('recentExpensesList');
    if (!container) return;

    const recentExpenses = harcamalar
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
        .slice(0, 5);

    if (recentExpenses.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Henüz harcama yok</p>';
        return;
    }

    const html = recentExpenses.map(expense => {
        const date = new Date(expense.tarih).toLocaleDateString('tr-TR');
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${expense.aciklama || 'Açıklama yok'}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${date} - ${expense.kullanici} - ${expense.kart}</div>
                </div>
                <div style="font-weight: 600; color: var(--primary);">${(parseFloat(expense.tutar) || 0).toFixed(2)} TL</div>
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

    const html = upcomingInstallments.slice(0, 5).map(installment => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border);">
            <div>
                <div style="font-weight: 600; color: var(--text-primary);">${installment.aciklama || 'Taksit'}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">${installment.taksitNo}/${installment.toplamTaksit} - ${installment.kullanici} - ${installment.kart}</div>
            </div>
            <div style="font-weight: 600; color: var(--warning);">${(parseFloat(installment.tutar) || 0).toFixed(2)} TL</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Name synchronization across all data
function syncAllDataAfterNameChange(type, oldName, newName) {
    let updateCount = 0;

    harcamalar.forEach(expense => {
        if (type === 'kart' && expense.kart === oldName) {
            expense.kart = newName;
            updateCount++;
        } else if (type === 'kullanici' && expense.kullanici === oldName) {
            expense.kullanici = newName;
            updateCount++;
        }
    });

    duzenliOdemeler.forEach(payment => {
        if (type === 'kart' && payment.kart === oldName) {
            payment.kart = newName;
            updateCount++;
        } else if (type === 'kullanici' && payment.kullanici === oldName) {
            payment.kullanici = newName;
            updateCount++;
        }
    });

    if (updateCount > 0) {
        DataManager.save();
        DataManager.updateAllViews();
        NotificationService.success(`${updateCount} kayıt güncellendi: ${oldName} → ${newName}`);
    }
}

// Card and User editing functions
function editCard(oldCardName) {
    const newCardName = prompt(`"${oldCardName}" kartının yeni adını girin:`, oldCardName);
    if (newCardName && newCardName.trim() && newCardName.trim() !== oldCardName) {
        const newName = newCardName.trim();

        if (kredikartlari.includes(newName)) {
            NotificationService.error('Bu kart adı zaten mevcut');
            return;
        }

        const cardIndex = kredikartlari.indexOf(oldCardName);
        if (cardIndex !== -1) {
            kredikartlari[cardIndex] = newName;
        }

        syncAllDataAfterNameChange('kart', oldCardName, newName);
        FormHandlers.updateCardOptions();
        
        if (typeof updateCardAndUserManagement === 'function') updateCardAndUserManagement();
        if (typeof updateDataStats === 'function') updateDataStats();
    }
}

function editUser(oldUserName) {
    const newUserName = prompt(`"${oldUserName}" kullanıcısının yeni adını girin:`, oldUserName);
    if (newUserName && newUserName.trim() && newUserName.trim() !== oldUserName) {
        const newName = newUserName.trim();

        if (kisiler.includes(newName)) {
            NotificationService.error('Bu kullanıcı adı zaten mevcut');
            return;
        }

        const userIndex = kisiler.indexOf(oldUserName);
        if (userIndex !== -1) {
            kisiler[userIndex] = newName;
        }

        syncAllDataAfterNameChange('kullanici', oldUserName, newName);
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