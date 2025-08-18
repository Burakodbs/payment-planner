// Hesaplama Fonksiyonları
function calculateDebts() {
    const accounts = {};
    people.forEach(person => {
        accounts[person] = 0;
    });
    expenses.forEach(expense => {
        if (!accounts[expense.person]) {
            accounts[expense.person] = 0;
        }
        accounts[expense.person] += expense.amount;
    });
    const futurePayments = {};
    Object.keys(accounts).forEach(user => {
        futurePayments[user] = 0;
    });
    expenses.forEach(expense => {
        // Yeni İngilizce alanları ve eski Türkçe alanları destekle
        const isInstallment = expense.isInstallment || expense.isTaksit;
        const totalInstallments = expense.totalInstallments || expense.toplamTaksit;
        const installmentNumber = expense.installmentNumber || expense.taksitNo;
        if (isInstallment && totalInstallments && installmentNumber) {
            const kalanTaksit = totalInstallments - installmentNumber;
            futurePayments[expense.person] += expense.amount * kalanTaksit;
        }
    });
    return { accounts, futurePayments };
}

function getMonthlyFutureTaksits() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const monthlyTaksits = {};
    expenses.forEach(expense => {
        // Yeni İngilizce alanları ve eski Türkçe alanları destekle
        const isInstallment = expense.isInstallment || expense.isTaksit;
        const totalInstallments = expense.totalInstallments || expense.toplamTaksit;
        const installmentNumber = expense.installmentNumber || expense.taksitNo;
        if (isInstallment && totalInstallments && installmentNumber) {
            const startDate = new Date(expense.date);
            for (let i = 0; i < totalInstallments; i++) {
                const taksitDate = new Date(startDate);
                taksitDate.setMonth(startDate.getMonth() + i);
                const taksitYear = taksitDate.getFullYear();
                const taksitMonth = taksitDate.getMonth() + 1;
                if (taksitYear > currentYear || (taksitYear === currentYear && taksitMonth > currentMonth)) {
                    const key = `${taksitYear}-${taksitMonth.toString().padStart(2, '0')}`;
                    if (!monthlyTaksits[key]) {
                        monthlyTaksits[key] = {};
                    }
                    if (!monthlyTaksits[key][expense.person]) {
                        monthlyTaksits[key][expense.person] = 0;
                    }
                    monthlyTaksits[key][expense.person] += expense.amount;
                }
            }
        }
    });
    return monthlyTaksits;
}

function getFutureTaksits(selectedMonth) {
    const futureTaksits = [];
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
    expenses.forEach(expense => {
        // Yeni İngilizce alanları ve eski Türkçe alanları destekle
        const isInstallment = expense.isInstallment || expense.isTaksit;
        const totalInstallments = expense.totalInstallments || expense.toplamTaksit;
        const installmentNumber = expense.installmentNumber || expense.taksitNo;
        if (isInstallment && totalInstallments && installmentNumber) {
            const [expenseYear, expenseMonth, expenseDay] = expense.date.split('-').map(Number);
            const kalanTaksit = totalInstallments - installmentNumber;
            for (let i = 1; i <= kalanTaksit; i++) {
                let taksitYear = expenseYear;
                let taksitMonth = expenseMonth + i;
                while (taksitMonth > 12) {
                    taksitMonth -= 12;
                    taksitYear += 1;
                }
                if (taksitYear === selectedYear && taksitMonth === selectedMonthNum) {
                    futureTaksits.push({
                        ...expense,
                        taksitNo: installmentNumber + i,
                        installmentNumber: installmentNumber + i,
                        date: `${taksitYear}-${taksitMonth.toString().padStart(2, '0')}-${expenseDay.toString().padStart(2, '0')}`,
                        isFuture: true
                    });
                }
            }
        }
    });
    return futureTaksits;
}

function getMonthlyRegularPayments() {
    const monthlyRegular = {};
    regularPayments.forEach(payment => {
        if (payment.isActive !== false) {
            if (!monthlyRegular[payment.person]) {
                monthlyRegular[payment.person] = 0;
            }
            monthlyRegular[payment.person] += payment.amount;
        }
    });
    return monthlyRegular;
}

function getRecurringPaymentsForMonth(selectedMonth) {
    const recurringPayments = [];
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
    regularPayments.forEach((odeme, index) => {
        // Active field compatibility: support both 'active' and 'aktif' 
        const isActive = odeme.active !== false && odeme.aktif !== false;
        if (!isActive || !odeme.startDate) {
            return;
        }
        const start = new Date(odeme.startDate);
        const startYear = start.getFullYear();
        const startMonth = start.getMonth() + 1;
        // Eğer seçilen ay başlangıç tarihinden önceyse, düzenli ödeme henüz başlamamış
        if (selectedYear < startYear || (selectedYear === startYear && selectedMonthNum < startMonth)) {
            return;
        }
        // Eğer bitiş tarihi varsa ve seçilen ay bitiş tarihinden sonraysa, düzenli ödeme bitmiş
        const endDate = odeme.endDate || odeme.bitisTarihi || odeme.birisTarihi;
        if (endDate) {
            const bitis = new Date(endDate);
            const bitisYear = bitis.getFullYear();
            const bitisMonth = bitis.getMonth() + 1;
            if (selectedYear > bitisYear || (selectedYear === bitisYear && selectedMonthNum > bitisMonth)) {
                return;
            }
        }
        // Support both old and new field names for compatibility
        const description = odeme.description || odeme.ad || 'Düzenli Ödeme';
        const person = odeme.person || odeme.user || 'Unknown'; // Standardize to person
        const amount = parseFloat(odeme.amount) || 0;
        
        // Skip if amount is 0 or invalid
        if (amount <= 0) {
            console.warn('Skipping recurring payment with invalid amount:', {
                id: odeme.id,
                description: description,
                amount: odeme.amount,
                parsedAmount: amount
            });
            return;
        }
        // Bu aya ait düzenli ödemeyi expense formatına dönüştür
        const recurringExpense = {
            id: `recurring-${odeme.id}-${selectedMonth}`,
            date: `${selectedYear}-${selectedMonthNum.toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`,
            card: odeme.card,
            person: person,
            kategori: odeme.kategori || odeme.category || 'Düzenli Ödeme',
            description: `${description} (Düzenli)`,
            amount: amount,
            isRegular: true,
            regularOdemeId: odeme.id
        };
        // Eğer bu ödeme bu ay için zaten expenses listesinde yoksa ekle
        const existingExpense = expenses.find(h => {
            // Önce regularOdemeId kontrolü
            if (h.regularOdemeId === odeme.id && h.date && h.date.startsWith(selectedMonth)) {
                return true;
            }
            // Alternatif kontrol: Aynı açıklama, tutar ve ay
            if (h.description && h.description.includes(description) && 
                h.date && h.date.startsWith(selectedMonth) &&
                Math.abs(parseFloat(h.amount) - parseFloat(odeme.amount)) < 0.01) {
                return true;
            }
            return false;
        });
        
        if (!existingExpense) {
            recurringPayments.push(recurringExpense);
        }
    });
    return recurringPayments;
}

function calculateTotalBudget() {
    const accounts = {};
    people.forEach(person => {
        accounts[person] = 0;
    });
    // Harcamalar
    expenses.forEach(expense => {
        if (!accounts[expense.person]) {
            accounts[expense.person] = 0;
        }
        accounts[expense.person] += expense.amount;
    });
    // Düzenli ödemeler - aktif olan ay sayısı kadar ekle
    regularPayments.forEach(payment => {
        if (payment.isActive !== false) {
            if (!accounts[payment.person]) {
                accounts[payment.person] = 0;
            }
            accounts[payment.person] += payment.amount;
        }
    });
    return accounts;
}

function isInCurrentMonth(expense, selectedMonth) {
    if (!selectedMonth) {
        const now = new Date();
        selectedMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    const expenseDate = new Date(expense.date);
    const expenseMonth = `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}`;
    // Taksitli harcamalarda bu ayda taksiti var mı kontrol et
    const isInstallment = expense.isInstallment || expense.isTaksit;
    const totalInstallments = expense.totalInstallments || expense.toplamTaksit;
    const installmentNumber = expense.installmentNumber || expense.taksitNo;
    if (isInstallment && totalInstallments && installmentNumber) {
        const startDate = new Date(expense.date);
        for (let i = 0; i < totalInstallments; i++) {
            const taksitDate = new Date(startDate);
            taksitDate.setMonth(startDate.getMonth() + i);
            const taksitMonth = `${taksitDate.getFullYear()}-${(taksitDate.getMonth() + 1).toString().padStart(2, '0')}`;
            if (taksitMonth === selectedMonth) {
                return true;
            }
        }
        return false;
    } else {
        return expenseMonth === selectedMonth;
    }
}

function getMonthlyExpenses(selectedMonth) {
    if (!selectedMonth) {
        const now = new Date();
        selectedMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    
    // Sadece o aya ait harcamaları filtrele
    const monthlyExpenses = expenses.filter(expense => {
        return isInCurrentMonth(expense, selectedMonth);
    });
    
    // Aktif düzenli ödemeleri al
    const monthlyRegular = regularPayments.filter(payment => {
        const isActive = payment.active !== false && payment.aktif !== false && payment.isActive !== false;
        if (!isActive) return false;
        
        // Başlangıç tarihi kontrolü
        if (payment.startDate) {
            const startDate = new Date(payment.startDate);
            const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth() + 1;
            
            // Seçilen ay başlangıçtan önce mi?
            if (selectedYear < startYear || (selectedYear === startYear && selectedMonthNum < startMonth)) {
                return false;
            }
            
            // Bitiş tarihi kontrolü
            const endDate = payment.endDate || payment.bitisTarihi;
            if (endDate) {
                const bitis = new Date(endDate);
                const bitisYear = bitis.getFullYear();
                const bitisMonth = bitis.getMonth() + 1;
                if (selectedYear > bitisYear || (selectedYear === bitisYear && selectedMonthNum > bitisMonth)) {
                    return false;
                }
            }
        }
        
        return true;
    });
    
    return { monthlyExpenses, monthlyRegular };
}

function getMonthlyTotal(selectedMonth) {
    const { monthlyExpenses, monthlyRegular } = getMonthlyExpenses(selectedMonth);
    let total = 0;
    monthlyExpenses.forEach(expense => {
        total += expense.amount;
    });
    monthlyRegular.forEach(payment => {
        total += payment.amount;
    });
    return total;
}

function updateMonthlySummary(selectedMonth) {
    if (!selectedMonth) {
        const now = new Date();
        selectedMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    const monthlySummaryContent = document.getElementById('monthlySummaryContent');
    if (!monthlySummaryContent) return;
    
    // Check if data is available
    const expensesArray = (typeof expenses !== 'undefined' && expenses) ? expenses : [];
    const regularArray = (typeof regularPayments !== 'undefined' && regularPayments) ? regularPayments : [];
    
    if (expensesArray.length === 0 && regularArray.length === 0) {
        monthlySummaryContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <h3>Henüz veri yok</h3>
                <p>Bu ay için harcama verisi bulunamadı. Harcama ekleyerek başlayın.</p>
            </div>
        `;
        return;
    }
    
    // Seçilen aya ait harcamaları al (sadece o aya ait taksitler dahil)
    const monthlyExpenses = expensesArray.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Taksitli harcamalar için özel kontrol
        const isInstallment = expense.isInstallment || expense.isTaksit;
        const totalInstallments = expense.totalInstallments || expense.toplamTaksit;
        const installmentNumber = expense.installmentNumber || expense.taksitNo;
        
        if (isInstallment && totalInstallments && installmentNumber) {
            // Bu harcamanın hangi aylarda taksiti var kontrol et
            const startDate = new Date(expense.date);
            for (let i = 0; i < totalInstallments; i++) {
                const taksitDate = new Date(startDate);
                taksitDate.setMonth(startDate.getMonth() + i);
                const taksitMonth = `${taksitDate.getFullYear()}-${(taksitDate.getMonth() + 1).toString().padStart(2, '0')}`;
                if (taksitMonth === selectedMonth) {
                    return true;
                }
            }
            return false;
        } else {
            // Normal harcama - sadece harcama tarihine bak
            return expenseMonth === selectedMonth;
        }
    });
    
    // Seçilen aya ait düzenli ödemeleri al
    const recurringExpenses = getRecurringPaymentsForMonth(selectedMonth);
    
    // Tüm aylık harcamaları birleştir
    const allMonthlyExpenses = [...monthlyExpenses, ...recurringExpenses];
    
    // Kullanıcı bazında toplamlar
    const userToplamlar = {};
    // Kart bazında toplamlar
    const cardToplamlar = {};
    
    allMonthlyExpenses.forEach(exp => {
        // Kullanıcı toplamları
        if (!userToplamlar[exp.person]) {
            userToplamlar[exp.person] = 0;
        }
        userToplamlar[exp.person] += parseFloat(exp.amount) || 0;
        
        // Kart toplamları
        const cardName = exp.card || 'Diğer';
        if (!cardToplamlar[cardName]) {
            cardToplamlar[cardName] = 0;
        }
        cardToplamlar[cardName] += parseFloat(exp.amount) || 0;
    });
    
    // Ay bilgisini güzel formatta göster
    const [year, month] = selectedMonth.split('-');
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const monthName = monthNames[parseInt(month) - 1];
    
    // Toplam hesaplama (mevcut + gelecek taksitler + düzenli ödemeler)
    const toplamTutar = allMonthlyExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    
    const html = `
        <div class="monthly-summary-container">
            <!-- Üst Özet Kartı -->
            <div class="summary-header-card">
                <div class="summary-title">
                    <h3>📊 ${monthName} ${year} Özeti</h3>
                </div>
                <div class="total-amount-display">
                    <span class="total-label">Toplam Harcama</span>
                    <span class="total-value">${toplamTutar.toFixed(2)} TL</span>
                </div>
            </div>
            
            <!-- İstatistik Kartları -->
            <div class="stats-grid">
                <!-- Kullanıcı Bazında Stats -->
                <div class="stats-card">
                    <div class="stats-header">
                        <h4>👥 Kullanıcı Bazında</h4>
                        <span class="stats-count">${Object.keys(userToplamlar).length} kullanıcı</span>
                    </div>
                    <div class="stats-list">
                        ${Object.entries(userToplamlar)
            .sort((a, b) => b[1] - a[1])
            .map(([user, tutar]) => `
                            <div class="stats-item">
                                <div class="stats-item-info">
                                    <span class="stats-item-name">${user}</span>
                                    <div class="stats-item-bar">
                                        <div class="stats-item-fill" style="width: ${(tutar / toplamTutar * 100).toFixed(1)}%"></div>
                                    </div>
                                </div>
                                <span class="stats-item-value">${tutar.toFixed(2)} TL</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Kart Bazında Stats -->
                <div class="stats-card">
                    <div class="stats-header">
                        <h4>💳 Kart Bazında</h4>
                        <span class="stats-count">${Object.keys(cardToplamlar).length} kart</span>
                    </div>
                    <div class="stats-list">
                        ${Object.entries(cardToplamlar)
            .sort((a, b) => b[1] - a[1])
            .map(([card, tutar]) => `
                            <div class="stats-item">
                                <div class="stats-item-info">
                                    <span class="stats-item-name">${card}</span>
                                    <div class="stats-item-bar">
                                        <div class="stats-item-fill" style="width: ${(tutar / toplamTutar * 100).toFixed(1)}%"></div>
                                    </div>
                                </div>
                                <span class="stats-item-value">${tutar.toFixed(2)} TL</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Harcama Listesi -->
            <div class="expenses-list-card">
                <div class="expenses-header">
                    <h4>📋 Detaylı Harcama Listesi</h4>
                    <span class="expenses-count">${allMonthlyExpenses.length} harcama</span>
                </div>
                
                <div class="expenses-table">
                    <div class="expenses-table-header">
                        <div class="expense-col-description">Açıklama</div>
                        <div class="expense-col-person">Kullanıcı</div>
                        <div class="expense-col-card">Kart</div>
                        <div class="expense-col-amount">Tutar</div>
                    </div>
                    
                    <div class="expenses-table-body">
                        ${allMonthlyExpenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(exp => {
                const isInstallment = exp.isInstallment || exp.isTaksit;
                const totalInstallments = exp.totalInstallments || exp.toplamTaksit;
                const installmentNumber = exp.installmentNumber || exp.taksitNo;
                
                let taksitBilgi = '';
                let currentInstallmentNumber = installmentNumber;
                
                // Taksitli harcamalar için hangi taksit numarasında olduğumuzu hesapla
                if (isInstallment && totalInstallments && installmentNumber) {
                    const startDate = new Date(exp.date);
                    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
                    
                    // Kaç ay geçmiş hesapla
                    let monthsPassed = 0;
                    for (let i = 0; i < totalInstallments; i++) {
                        const taksitDate = new Date(startDate);
                        taksitDate.setMonth(startDate.getMonth() + i);
                        const taksitMonth = `${taksitDate.getFullYear()}-${(taksitDate.getMonth() + 1).toString().padStart(2, '0')}`;
                        if (taksitMonth === selectedMonth) {
                            currentInstallmentNumber = installmentNumber + i;
                            break;
                        }
                    }
                    
                    taksitBilgi = `${currentInstallmentNumber}/${totalInstallments} Taksit`;
                } else if (exp.isRegular || exp.isDuzenli) {
                    taksitBilgi = 'Düzenli Ödeme';
                }
                
                // Harcama tipine göre ikon belirle
                let typeIcon = '💳';
                if (exp.isRegular || exp.isDuzenli) {
                    typeIcon = '🔄';
                } else if (isInstallment) {
                    typeIcon = '📅';
                }
                
                return `
                            <div class="expense-row">
                                <div class="expense-col-description">
                                    <div class="expense-main-info">
                                        <span class="expense-icon">${typeIcon}</span>
                                        <div class="expense-details">
                                            <span class="expense-name">${exp.description || exp.name || 'Harcama'}</span>
                                            <span class="expense-category">${exp.category || exp.kategori || 'Genel'}</span>
                                        </div>
                                    </div>
                                    ${taksitBilgi ? `<span class="expense-badge">${taksitBilgi}</span>` : ''}
                                </div>
                                <div class="expense-col-person">
                                    <span class="expense-person">${exp.person}</span>
                                </div>  
                                <div class="expense-col-card">
                                    <span class="expense-card">${exp.card || 'Diğer'}</span>
                                </div>
                                <div class="expense-col-amount">
                                    <span class="expense-amount">${(parseFloat(exp.amount) || 0).toFixed(2)} TL</span>
                                </div>
                            </div>
                        `;
            }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    monthlySummaryContent.innerHTML = html;
}
