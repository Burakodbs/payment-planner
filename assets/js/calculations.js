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
    const monthlyExpenses = expenses.filter(expense => isInCurrentMonth(expense, selectedMonth));
    const monthlyRegular = regularPayments.filter(payment => payment.isActive !== false);
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
    
    const { monthlyExpenses, monthlyRegular } = getMonthlyExpenses(selectedMonth);
    
    // Tüm aylık harcamaları birleştir (harcamalar + düzenli ödemeler)
    const allMonthlyExpenses = [...monthlyExpenses];
    
    // Düzenli ödemeleri de ekle
    monthlyRegular.forEach(payment => {
        allMonthlyExpenses.push({
            ...payment,
            date: selectedMonth + '-01',
            category: payment.category || 'Düzenli Ödeme',
            description: payment.description || payment.name,
            isDuzenli: true
        });
    });
    
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
        <div style="display: grid; gap: 20px;">
            <div style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
                <h3 style="color: var(--text); margin: 0 0 16px 0;">${monthName} ${year} Özeti</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--primary-subtle); border-radius: var(--radius);">
                    <span style="color: var(--primary); font-weight: 600;">Toplam Harcama:</span>
                    <span style="color: var(--primary); font-weight: 700; font-size: 18px;">${toplamTutar.toFixed(2)} TL</span>
                </div>
            </div>
            
            <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                
            <div style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
                <h4 style="color: var(--text); margin: 0 0 16px 0;">👥 Kullanıcı Bazında</h4>
                ${Object.entries(userToplamlar)
            .sort((a, b) => b[1] - a[1])
            .map(([user, tutar]) => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
                            <span style="color: var(--text);">${user}</span>
                            <span style="color: var(--primary); font-weight: 600;">${tutar.toFixed(2)} TL</span>
                        </div>
                    `).join('')}
            </div>
            
            <div style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
                <h4 style="color: var(--text); margin: 0 0 16px 0;">💳 Kart Bazında</h4>
                ${Object.entries(cardToplamlar)
            .sort((a, b) => b[1] - a[1])
            .map(([card, tutar]) => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
                            <span style="color: var(--text);">${card}</span>
                            <span style="color: var(--primary); font-weight: 600;">${tutar.toFixed(2)} TL</span>
                        </div>
                    `).join('')}
            </div>
            
        </div>
        
        <div style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
            <h4 style="color: var(--text); margin: 0 0 16px 0;">📋 Detaylı Harcama Listesi</h4>
            <div style="display: grid; gap: 8px;">
                ${allMonthlyExpenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(exp => {
                const isInstallment = exp.isInstallment || exp.isTaksit;
                const totalInstallments = exp.totalInstallments || exp.toplamTaksit;
                const installmentNumber = exp.installmentNumber || exp.taksitNo;
                
                let taksitBilgi = '';
                if (isInstallment && totalInstallments && installmentNumber) {
                    taksitBilgi = `(${installmentNumber}/${totalInstallments})`;
                } else if (exp.isDuzenli) {
                    taksitBilgi = '(Düzenli Ödeme)';
                }
                
                return `
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 12px; padding: 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); align-items: center;">
                                <div>
                                    <div style="font-weight: 500; color: var(--text);">${exp.description || exp.name || 'Harcama'}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${exp.category || 'Genel'}</div>
                                    ${taksitBilgi ? `<span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">${taksitBilgi}</span>` : ''}
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${exp.person}</div>  
                                <div style="font-size: 12px; color: var(--text-secondary);">${exp.card}</div>
                                <div style="color: var(--primary); font-weight: 600;">${(parseFloat(exp.amount) || 0).toFixed(2)} TL</div>
                            </div>
                        `;
            }).join('')}
            </div>
        </div>
    `;
    monthlySummaryContent.innerHTML = html;
}
