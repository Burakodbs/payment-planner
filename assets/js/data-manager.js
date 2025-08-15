// Centralized Data Manager
class DataManager {
    static save() {
        if (authSystem && authSystem.currentUser) {
            authSystem.saveUserData();
        }
    }

    static getCards() {
        if (authSystem && authSystem.currentUserData) {
            return authSystem.currentUserData.creditCards || [];
        }
        return creditCards || [];
    }

    static getUsers() {
        if (authSystem && authSystem.currentUserData) {
            return authSystem.currentUserData.people || [];
        }
        return people || [];
    }

    static updateAllViews() {
        // Update table if exists
        if (typeof updateExpenseTable === 'function') updateExpenseTable();
        
        // Update dashboard if exists
        if (typeof updateDashboard === 'function') updateDashboard();
        
        // Update accounts if exists
        if (typeof updateAccounts === 'function') updateAccounts();
        
        // Update regular payments list if exists
        if (typeof updateRegularPaymentsList === 'function') updateRegularPaymentsList();
        
        // Update statistics if exists
        if (typeof updateDataStats === 'function') updateDataStats();
        
        // Update card/user management if exists
        if (typeof updateCardAndUserManagement === 'function') updateCardAndUserManagement();
    }
}

// Regular Payments Management - Merged from regular-payments.js
class RegularPayments {
    static editingId = null;

    static showForm() {
        const form = document.getElementById('regularOdemeForm');
        if (!form) return;
        form.style.display = 'block';
        const dateField = document.getElementById('regularStart');
        if (dateField) dateField.value = new Date().toISOString().slice(0, 10);
    }

    static cancel() {
        this.editingId = null;
        const form = document.getElementById('regularOdemeForm');
        if (form) {
            form.style.display = 'none';
            ['regularDescription', 'regularAmount', 'regularCard', 'regularUser', 'regularStart'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
        }
        const formTitle = document.getElementById('regularFormTitle');
        if (formTitle) formTitle.textContent = 'Yeni Düzenli Ödeme';
        const submitBtn = document.getElementById('regularSubmitBtn');
        if (submitBtn) {
            submitBtn.textContent = 'Ekle';
            submitBtn.className = 'btn';
        }
    }

    static add() {
        if (this.editingId) return this.update();
        
        const description = document.getElementById('regularDescription')?.value?.trim();
        const amountVal = document.getElementById('regularAmount')?.value;
        const card = document.getElementById('regularCard')?.value;
        const user = document.getElementById('regularUser')?.value;
        const start = document.getElementById('regularStart')?.value;
        
        if (!description || !amountVal || !card || !user || !start) {
            NotificationService.error('Lütfen tüm zorunlu alanları doldurun');
            return;
        }
        
        const regularPayment = {
            id: Date.now(),
            description,
            amount: parseFloat(amountVal),
            card,
            user,
            startDate: start,
            category: 'Regular Payment',
            active: true
        };
        
        regularPayments.push(regularPayment);
        DataManager.save();
        this.updateList();
        this.cancel();
        NotificationService.success('Düzenli ödeme eklendi');
        DataManager.updateAllViews();
    }

    static updateList() {
        const container = document.getElementById('regularPaymentsList');
        if (!container) return;
        
        if (!regularPayments.length) {
            container.innerHTML = '<p style="color: var(--text-muted);">Henüz düzenli ödeme tanımlanmamış</p>';
            return;
        }
        
        let html = '';
        regularPayments.forEach(payment => {
            const isActive = payment.aktif !== false;
            const statusStyle = isActive ? '' : 'opacity:0.6; background: var(--bg-muted);';
            const statusText = isActive ? '' : ' (Durduruldu)';
            const endDate = payment.endDate ? ` - End: ${payment.endDate}` : '';
            
            html += `
                <div style="background: var(--bg-secondary); padding:12px; border-radius: var(--radius); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; ${statusStyle}">
                    <div>
                        <div style="font-weight:600; color:var(--text);">${payment.description}${statusText}</div>
                        <div style="font-size:12px; color:var(--text-secondary);">${payment.amount} TL - ${payment.person} - ${payment.card}</div>
                        <div style="font-size:12px; color:var(--text-muted);">Başlangıç: ${payment.startDate}${endDate}</div>
                    </div>
                    <div>
                        ${isActive ? 
                            `<button class="btn btn-sm btn-outline" onclick="RegularPayments.edit(${payment.id})" style="margin-right:8px;">Düzenle</button>
                             <button class="btn btn-sm btn-danger" onclick="RegularPayments.delete(${payment.id})">Durdur</button>` :
                            `<button class="btn btn-sm btn-success" onclick="RegularPayments.reactivate(${payment.id})" style="margin-right:8px;">Yeniden Başlat</button>
                             <button class="btn btn-sm btn-danger" onclick="RegularPayments.permanentDelete(${payment.id})">Tamamen Sil</button>`
                        }
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    static edit(id) {
        const payment = regularPayments.find(o => o.id === id);
        if (!payment) {
            NotificationService.error('Düzenli ödeme bulunamadı');
            return;
        }
        
        this.editingId = id;
        const form = document.getElementById('regularOdemeForm');
        if (form) form.style.display = 'block';
        
        document.getElementById('regularDescription').value = payment.description;
        document.getElementById('regularAmount').value = payment.amount;
        document.getElementById('regularCard').value = payment.card;
        document.getElementById('regularUser').value = payment.person;
        document.getElementById('regularStart').value = payment.startDate;
        
        const formTitle = document.getElementById('regularFormTitle');
        if (formTitle) formTitle.textContent = 'Düzenli Ödemeyi Düzenle';
        const submitBtn = document.getElementById('regularSubmitBtn');
        if (submitBtn) {
            submitBtn.textContent = 'Güncelle';
            submitBtn.className = 'btn btn-primary';
        }
        
        NotificationService.info('Düzenleme modu aktif');
    }

    static update() {
        const description = document.getElementById('regularDescription')?.value?.trim();
        const amountVal = document.getElementById('regularAmount')?.value;
        const card = document.getElementById('regularCard')?.value;
        const user = document.getElementById('regularUser')?.value;
        const start = document.getElementById('regularStart')?.value;
        
        if (!description || !amountVal || !card || !user || !start) {
            NotificationService.error('Lütfen tüm zorunlu alanları doldurun');
            return;
        }
        
        const idx = regularPayments.findIndex(o => o.id === this.editingId);
        if (idx !== -1) {
            regularPayments[idx] = {
                ...regularPayments[idx],
                description,
                amount: parseFloat(amountVal),
                card,
                user,
                startDate: start
            };
            
            DataManager.save();
            this.updateList();
            this.cancel();
            NotificationService.success('Düzenli ödeme güncellendi');
            DataManager.updateAllViews();
        }
    }

    static delete(id) {
        const payment = regularPayments.find(o => o.id === id);
        if (!payment) {
            NotificationService.error('Düzenli ödeme bulunamadı');
            return;
        }
        
        if (confirm(`"${payment.description}" düzenli ödemeyi durdurmak istediğinizden emin misiniz?\n\nGeçmişteki ödemeler korunacak, sadece gelecekteki otomatik kayıtlar durdurulacak.`)) {
            const today = new Date().toISOString().slice(0, 10);
            const idx = regularPayments.findIndex(o => o.id === id);
            if (idx !== -1) {
                regularPayments[idx].endDate = today;
                regularPayments[idx].aktif = false;
            }
            
            DataManager.save();
            this.updateList();
            NotificationService.success('Düzenli ödeme durduruldu. Geçmiş kayıtlar korundu.');
            DataManager.updateAllViews();
        }
    }

    static reactivate(id) {
        const idx = regularPayments.findIndex(o => o.id === id);
        if (idx !== -1) {
            regularPayments[idx].aktif = true;
            delete regularPayments[idx].endDate;
            
            DataManager.save();
            this.updateList();
            NotificationService.success('Düzenli ödeme yeniden başlatıldı');
        }
    }

    static permanentDelete(id) {
        const payment = regularPayments.find(o => o.id === id);
        if (!payment) return;
        
        if (confirm(`"${payment.description}" düzenli ödemeyi tamamen silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
            const idx = regularPayments.findIndex(o => o.id === id);
            if (idx !== -1) {
                regularPayments.splice(idx, 1);
                DataManager.save();
                this.updateList();
                NotificationService.success('Düzenli ödeme tamamen silindi');
            }
        }
    }
}

// Backward compatibility functions
function showRegularPaymentForm() { RegularPayments.showForm(); }
function cancelRegularPayment() { RegularPayments.cancel(); }
function addRegularPayment() { RegularPayments.add(); }
function updateRegularPaymentsList() { RegularPayments.updateList(); }
function editRegularPayment(id) { RegularPayments.edit(id); }
function deleteRegularPayment(id) { RegularPayments.delete(id); }

// Backward compatibility
function saveData() {
    DataManager.save();
}

// Expense Table Update
function updateExpenseTable() {
    const tbody = document.querySelector('#expenseTable tbody');

    // Check if table exists (only on expense-listesi page)
    if (!tbody) {
        // console.log('Expense table not found, skipping table update');
        return;
    }

    const filteredExpenses = applyAllFilters();

    updateResultCount(filteredExpenses);

    tbody.innerHTML = '';

    // console.log('Filtrelenmiş expense sayısı:', filteredExpenses.length);
    // console.log('İlk 5 expense:', filteredExpenses.slice(0, 5));
    // console.log('Tüm expenses:', expenses.length);

    filteredExpenses.forEach((expense, index) => {
        const row = tbody.insertRow();
        
        // Hem eski hem yeni taksit alanlarını destekle
        const isInstallment = expense.isInstallment || expense.isTaksit;
        const installmentNumber = expense.installmentNumber || expense.taksitNo;
        const totalInstallments = expense.totalInstallments || expense.toplamTaksit;
        
        const taksitBilgi = isInstallment ? `${installmentNumber}/${totalInstallments}` : '-';

        let rowStyle = '';
        let taksitEtiket = '';
        let actionButton = '';

        if (expense.isFuture) {
            rowStyle = 'background-color: #fff3cd; color: #856404;';
            taksitEtiket = '';
            actionButton = '<span style="color: #856404; font-size: 12px;">Gelecek Taksit</span>';
        } else if (expense.isRegular) {
            rowStyle = 'background-color: #e3f2fd; color: #1565c0;';
            taksitEtiket = '';
            actionButton = `
                <button class="btn btn-sm btn-outline" onclick="editExpense(${expense.id || 'undefined'})" style="margin-right: 4px;">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id || 'undefined'})">Delete</button>
            `;
        } else {
            actionButton = `
                <button class="btn btn-sm btn-outline" onclick="editExpense(${expense.id || 'undefined'})" style="margin-right: 4px;">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id || 'undefined'})">Delete</button>
            `;
        }

        const amountValue = expense.amount ? Number(expense.amount).toFixed(2) : '0.00';

        row.innerHTML = `
            <td style="${rowStyle}">${new Date(expense.date).toLocaleDateString('tr-TR')}</td>
            <td style="${rowStyle}">${expense.card || '-'}</td>
            <td style="${rowStyle}">${expense.person || '-'}</td>
            <td style="${rowStyle}">${expense.description || '-'}${taksitEtiket}</td>
            <td style="${rowStyle}">${taksitBilgi}</td>
            <td class="text-right" style="${rowStyle}">${amountValue} TL</td>
            <td style="${rowStyle}">
                ${actionButton}
            </td>
        `;
    });
}

function updateResultCount(filteredExpenses) {
    const totalExpenses = expenses.length;
    const shownCount = filteredExpenses.length;

    const actualExpenses = filteredExpenses.filter(h => !h.isFuture && !h.isRegular).length;
    const futurePayments = filteredExpenses.filter(h => h.isFuture).length;
    const regularPaymentCount = filteredExpenses.filter(h => h.isRegular).length;

    let message = `${shownCount} records shown`;

    if (shownCount < totalExpenses) {
        message += ` (Total of ${totalExpenses} records)`;
    }

    if (futurePayments > 0 || regularPaymentCount > 0) {
        let detail = [];
        if (actualExpenses > 0) detail.push(`${actualExpenses} expense`);
        if (regularPaymentCount > 0) detail.push(`${regularPaymentCount} regular payment`);
        if (futurePayments > 0) detail.push(`${futurePayments} future installment`);
        message += ` | ${detail.join(' + ')}`;
    }

    const totalAmount = filteredExpenses.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
    message += ` | Total: ${totalAmount.toFixed(2)} TL`;

    const resultCountElement = document.getElementById('resultCount');
    if (resultCountElement) {
        resultCountElement.textContent = message;
    }
}

// Filtreleme ve Sıralama
// Düzenli ödemeleri expense formatına dönüştür
function getDuzenliOdemelerAsHarcamalar() {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
    const today = currentDate.toISOString().slice(0, 10);

    // Sadece aktif düzenli ödemeleri dahil et
    const aktiveDuzenliOdemeler = regularPayments.filter(odeme => {
        // Aktif olmayan ödemeleri hariç tut
        if (odeme.aktif === false) {
            return false;
        }

        // If end date exists and is before today, exclude it
    if ((payment.endDate || payment.endDate) && (payment.endDate || payment.endDate) <= today) {
            return false;
        }

        // Başlangıç tarihi bugünden sonra ise henüz başlamamış, hariç tut
        if (odeme.startDate && odeme.startDate > today) {
            return false;
        }

        return true;
    });

    return aktiveDuzenliOdemeler.map(odeme => {
        return {
            id: `duzenli_${odeme.id}_${currentMonth}`,
            date: `${currentMonth}-15`, // Ayın ortasına koy
            card: odeme.card,
            person: odeme.person,
            kategori: 'Düzenli Ödeme',
            description: `${odeme.description} (Düzenli Ödeme)`,
            amount: odeme.amount,
            taksitNo: null,
            toplamTaksit: null,
            isTaksit: false,
            isDuzenli: true // Düzenli ödeme olduğunu belirten flag
        };
    });
}

function applyAllFilters() {
    // console.log('--- FILTRE BAŞLANGICI ---');
    // console.log('Toplam expense sayısı:', expenses.length);
    // console.log('Düzenli ödeme sayısı:', regularPayments.length);

    // Harcamaları ve düzenli ödemeleri birleştir
    let filtered = [...expenses];

    // Check if filter elements exist (only on expense-listesi page)
    const filtreDateElement = document.getElementById('filtreTarih');
    if (!filtreDateElement) {
        // console.log('Filter elements not found, skipping filtering');
        return filtered;
    }

    const selectedMonth = filtreDateElement.value;
    // console.log('Seçilen ay:', selectedMonth);

    if (selectedMonth) {
        const monthFiltered = filtered.filter(expense => expense.date.startsWith(selectedMonth));
        // console.log('Ay filtresinden sonra:', monthFiltered.length);

        const futureTaksits = getFutureTaksits(selectedMonth);
        const recurringPayments = getRecurringPaymentsForMonth(selectedMonth);
        // console.log('Gelecek taksit sayısı:', futureTaksits.length);
        // console.log('Düzenli ödeme sayısı:', recurringPayments.length);

        filtered = [...monthFiltered, ...futureTaksits, ...recurringPayments];
    } else {
        filtered = [...expenses];
        // console.log('Tarih filtresi yok, tüm expenses:', filtered.length);
    }

    // console.log('Tarih filtresinden sonra toplam:', filtered.length);

    const filterUserElement = document.getElementById('filterUser');
    const selectedUser = filterUserElement ? filterUserElement.value : '';
    // console.log('Seçilen kullanıcı:', selectedUser);
    if (selectedUser) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(expense => expense.person === selectedUser);
        // console.log(`Kullanıcı filtresinden sonra: ${beforeCount} -> ${filtered.length}`);
    }

    const filterCardElement = document.getElementById('filterCard');
    const selectedCard = filterCardElement ? filterCardElement.value : '';
    // console.log('Seçilen card:', selectedCard);
    if (selectedCard) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(expense => expense.card === selectedCard);
        // console.log(`Kart filtresinden sonra: ${beforeCount} -> ${filtered.length}`);
    }

    const minAmountElement = document.getElementById('minAmount');
    const maxAmountElement = document.getElementById('maxAmount');
    const minAmountValue = minAmountElement ? minAmountElement.value : '';
    const maxAmountValue = maxAmountElement ? maxAmountElement.value : '';
    const minAmount = minAmountValue ? parseFloat(minAmountValue) : 0;
    const maxAmount = maxAmountValue ? parseFloat(maxAmountValue) : Infinity;

    // console.log('Tutar aralığı:', minAmount, '-', maxAmount);
    if (minAmountValue || maxAmountValue) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(expense => expense.amount >= minAmount && expense.amount <= maxAmount);
        // console.log(`Tutar filtresinden sonra: ${beforeCount} -> ${filtered.length}`);
    }

    // console.log('Sıralama öncesi kayıt sayısı:', filtered.length);

    const sortCriteriaElement = document.getElementById('sortCriteria');
    const sortCriteria = sortCriteriaElement ? sortCriteriaElement.value : 'date-desc';
    const [field, direction] = sortCriteria.split('-');
    // console.log('Sıralama kriteri:', field, direction);

    try {
        const beforeSort = filtered.length;
        filtered.sort((a, b) => {
            let valueA, valueB;

            switch (field) {
                case 'date':
                    valueA = new Date(a.date).getTime();
                    valueB = new Date(b.date).getTime();
                    break;
                case 'amount':
                    valueA = Number(a.amount);
                    valueB = Number(b.amount);
                    break;
                case 'user':
                    valueA = String(a.person).toLowerCase();
                    valueB = String(b.person).toLowerCase();
                    break;
                case 'card':
                    valueA = String(a.card).toLowerCase();
                    valueB = String(b.card).toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (field === 'amount' || field === 'date') {
                if (isNaN(valueA) && !isNaN(valueB)) return 1;
                if (!isNaN(valueA) && isNaN(valueB)) return -1;
                if (isNaN(valueA) && isNaN(valueB)) return 0;
            }

            if (direction === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
        // console.log(`Sıralama sonrası: ${beforeSort} -> ${filtered.length}`);
    } catch (e) {
        console.error('Sıralama hatası:', e);
    }

    // console.log('--- FINAL SONUÇ ---');
    // console.log('Döndürülen kayıt sayısı:', filtered.length);
    // console.log('İlk 3 kayıt:', filtered.slice(0, 3));

    return filtered;
}

// Harcama İşlemleri
function deleteHarcama(id) {
    const expense = expenses.find(h => h.id === id);
    if (!expense) {
        showToast('Expense not found', 'error');
        return;
    }

    let confirmMessage = 'Bu expenseyı silmek istediğinizden emin misiniz?';

    // Otomatik oluşturulan düzenli ödeme ise uyarı ver
    if (expense.isRegular) {
        confirmMessage = `Bu otomatik oluşturulan düzenli ödemeyi silmek istediğinizden emin misiniz?\n\n"${expense.description}"\n\nNot: Gelecek ay tekrar otomatik olarak oluşturulacaktır.`;
    }

    if (confirm(confirmMessage)) {
        expenses = expenses.filter(h => h.id !== id);
        saveData();
        updateExpenseTable();
        updateDashboard();

        if (expense.isRegular) {
            showToast('Düzenli ödeme silindi (gelecek ay yeniden oluşturulacak)', 'info');
        } else {
            showToast('Harcama silindi', 'success');
        }
    }
}

// Form Event Listeners
document.addEventListener('keydown', function (e) {
    const activeElement = document.activeElement;
    const isInUserSelect = activeElement === document.getElementById('user');
    const isInFormField = activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT';

    if (isInUserSelect || !isInFormField) {
        const userSelect = document.getElementById('user');
        const keyNum = parseInt(e.key);

        // Check if user select exists (only on expense-ekle page)
        if (!userSelect) {
            return;
        }

        if (keyNum >= 1 && keyNum <= 5 && keyNum <= people.length) {
            e.preventDefault();
            const selectedPerson = people[keyNum - 1];
            userSelect.value = selectedPerson;
            userSelect.dispatchEvent(new Event('change'));
            if (!isInUserSelect) {
                const descriptionElement = document.getElementById('description');
                if (descriptionElement) {
                    descriptionElement.focus();
                }
            }
        }
    }
});

// Form event listener - sadece form varsa ekle
const expenseForm = document.getElementById('expenseForm');
if (expenseForm) {
    expenseForm.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            this.dispatchEvent(new Event('submit'));
        }
    });
}