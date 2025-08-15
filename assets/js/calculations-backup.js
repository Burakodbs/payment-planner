// Hesaplama Fonksiyonları
function calculateDebts() {
    const accounts = {};
    people.forEach(person => {
        accounts[person] = 0;
    });
    expenses.forEach(expense => {
        if (!accounts[exp    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];se.person]) {
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
    const monthlyTaksits = {};
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
                const monthKey = `${taksitYear}-${taksitMonth.toString().padStart(2, '0')}`;
                if (!monthlyTaksits[monthKey]) {
                    monthlyTaksits[monthKey] = {};
                }
                if (!monthlyTaksits[monthKey][expense.person]) {
                    monthlyTaksits[monthKey][expense.person] = [];
                }
                monthlyTaksits[monthKey][expense.person].push({
                    description: expense.description || 'Taksit',
                    amount: expense.amount,
                    taksitNo: installmentNumber + i,
                    toplamTaksit: totalInstallments,
                    card: expense.card,
                    orijinalTarih: expense.date
                });
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
// Seçilen aya düşen düzenli ödemeleri getir
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
        const description = odeme.description || odeme.ad || 'Düzenli Ã–deme';
        const person = odeme.person || odeme.user || 'Unknown'; // Standardize to person
        // Bu aya ait düzenli ödemeyi expense formatına dönüştür
        const recurringExpense = {
            id: `recurring-${odeme.id}-${selectedMonth}`,
            date: `${selectedYear}-${selectedMonthNum.toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`,
            card: odeme.card,
            person: person,
            kategori: odeme.kategori || odeme.category || 'Düzenli Ã–deme',
            description: `${description} (Düzenli)`,
            amount: parseFloat(odeme.amount) || 0,
            isRegular: true,
            regularOdemeId: odeme.id
        };
        // Eğer bu ödeme bu ay için zaten expenses listesinde yoksa ekle
        const existingExpense = expenses.find(h => {
            // Ã–nce regularOdemeId kontrolü
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
// Hesaplar Güncelleme
function updateAccounts() {
    const tbody = document.querySelector('#accountsTable tbody');
    if (!tbody) return;
    const { accounts, futurePayments } = calculateDebts();
    tbody.innerHTML = '';
    // Tüm kişileri dahil et (mevcut expense olmayanlar da)
    const tumKisiler = [...new Set([...Object.keys(accounts), ...Object.keys(futurePayments), ...people])];
    tumKisiler.forEach(person => {
        if (!person) return; // Boş kişi adlarını atla
        const row = tbody.insertRow();
        const mevcutHarcama = accounts[person] || 0;
        const gelecekOdeme = futurePayments[person] || 0;
        const toplam = mevcutHarcama + gelecekOdeme;
        let debtClass = '';
        if (toplam > 0) debtClass = 'debt-positive';
        else if (toplam < 0) debtClass = 'debt-negative';
        row.innerHTML = `
            <td style="color: var(--text); font-weight: 500;">${person}</td>
            <td class="text-right" style="color: var(--text-secondary);">${mevcutHarcama.toFixed(2)} TL</td>
            <td class="text-right" style="color: var(--text-secondary);">${gelecekOdeme.toFixed(2)} TL</td>
            <td class="text-right ${debtClass}" style="font-weight: 600;">${toplam.toFixed(2)} TL</td>
        `;
    });
}
// Aylık Ã–zet Güncelleme
function updateMonthlySummary() {
    const summaryTarih = document.getElementById('summaryDate');
    const monthlySummaryContent = document.getElementById('monthlySummaryContent');
    if (!summaryTarih || !monthlySummaryContent) return;
    const selectedMonth = summaryTarih.value;
    if (!selectedMonth) {
        monthlySummaryContent.innerHTML = '<p style="color: var(--text-muted);">Tarih seçin ve özet gösterilsin.</p>';
        return;
    }
    // Seçilen ayın mevcut expensesını filtrele
    const monthlyExpenses = expenses.filter(expense => {
        return expense.date && expense.date.startsWith(selectedMonth);
    });
    // Seçilen aya düşen gelecek taksitleri al
    const futureTaksits = getFutureTaksits(selectedMonth);
    // Seçilen aya düşen düzenli ödemeleri al
    const monthlyRecurringPayments = getRecurringPaymentsForMonth(selectedMonth);
    // Tüm expensesı birleştir (mevcut + gelecek taksitler + düzenli ödemeler)
    const allMonthlyExpenses = [...monthlyExpenses, ...futureTaksits, ...monthlyRecurringPayments];
    if (allMonthlyExpenses.length === 0) {
        monthlySummaryContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <h3>Bu ay için expense bulunamadı</h3>
                <p>${selectedMonth} ayında henüz expense kaydı veya gelecek taksit yok.</p>
            </div>
        `;
        return;
    }
    // Ay bilgisini güzel formatta göster
    const [year, month] = selectedMonth.split('-');
    const monthNames = ['Ocak', 'Åubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const monthName = monthNames[parseInt(month) - 1];
    // Toplam hesaplama (mevcut + gelecek taksitler + düzenli ödemeler)
    const toplamTutar = allMonthlyExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const mevcutTutar = monthlyExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const gelecekTutar = futureTaksits.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const regularTutar = monthlyRecurringPayments.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    // Kullanıcı bazında toplam
    const userToplamlar = {};
    allMonthlyExpenses.forEach(exp => {
        const user = exp.person || 'Bilinmeyen';
        userToplamlar[user] = (userToplamlar[user] || 0) + (parseFloat(exp.amount) || 0);
    });
    // Kart bazında toplam
    const cardToplamlar = {};
    allMonthlyExpenses.forEach(exp => {
        const card = exp.card || 'Bilinmeyen';
        cardToplamlar[card] = (cardToplamlar[card] || 0) + (parseFloat(exp.amount) || 0);
    });
    // HTML oluştur
    let html = `
        <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius); margin-bottom: 24px;">
            <h3 style="color: var(--text); margin: 0 0 16px 0;">${monthName} ${year} Ã–zeti</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px;">
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: var(--text-secondary);">Total Expenses</div>
                    <div style="font-size: 28px; font-weight: 700; color: var(--primary);">${toplamTutar.toFixed(2)} TL</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: var(--text-secondary);">Mevcut Harcama</div>
                    <div style="font-size: 20px; font-weight: 600; color: var(--success);">${mevcutTutar.toFixed(2)} TL</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: var(--text-secondary);">Gelecek Taksit</div>
                    <div style="font-size: 20px; font-weight: 600; color: var(--warning);">${gelecekTutar.toFixed(2)} TL</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: var(--text-secondary);">Düzenli Ã–deme</div>
                    <div style="font-size: 20px; font-weight: 600; color: var(--info);">${regularTutar.toFixed(2)} TL</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: var(--text-secondary);">Toplam İşlem</div>
                    <div style="font-size: 20px; font-weight: 600; color: var(--text-muted);">${allMonthlyExpenses.length}</div>
                </div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 24px;">
            <div style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
                <h4 style="color: var(--text); margin: 0 0 16px 0;">ğŸ‘¥ Kullanıcı Bazında</h4>
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
                <h4 style="color: var(--text); margin: 0 0 16px 0;">ğŸ’³ Kart Bazında</h4>
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
            <h4 style="color: var(--text); margin: 0 0 16px 0;">ğŸ“‹ Detaylı Harcama Listesi</h4>
            <div style="display: grid; gap: 8px;">
                ${allMonthlyExpenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(exp => {
                const taksitBilgi = exp.isTaksit ? `${exp.taksitNo}/${exp.toplamTaksit}` : '';
                const futureLabel = exp.isFuture ? ' (Gelecek Taksit)' : '';
                const regularLabel = exp.isRegular ? ' (Düzenli)' : '';
                let bgColor = 'var(--bg-secondary)';
                let textColor = 'var(--text)';
                if (exp.isFuture) {
                    bgColor = 'var(--warning-bg)';
                    textColor = 'var(--warning)';
                } else if (exp.isRegular) {
                    bgColor = 'var(--info-bg)';
                    textColor = 'var(--info)';
                }
                return `
                            <div style="display: grid; grid-template-columns: auto 1fr auto auto auto; gap: 12px; padding: 12px; background: ${bgColor}; border-radius: var(--radius-sm); align-items: center;">
                                <div style="font-size: 12px; color: var(--text-muted);">${exp.date.split('-').reverse().join('.')}</div>
                                <div style="color: ${textColor}; font-weight: 500;">
                                    ${exp.description || 'Açıklama yok'}${futureLabel}${regularLabel}
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
