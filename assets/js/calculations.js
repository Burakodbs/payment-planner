// Hesaplama Fonksiyonları

function calculateDebts() {
    const hesaplar = {};

    people.forEach(kisi => {
        hesaplar[kisi] = 0;
    });

    expenses.forEach(harcama => {
        if (!hesaplar[harcama.person]) {
            hesaplar[harcama.person] = 0;
        }
        hesaplar[harcama.person] += harcama.amount;
    });

    const gelecekTaksitler = {};
    Object.keys(hesaplar).forEach(kullanici => {
        gelecekTaksitler[kullanici] = 0;
    });

    expenses.forEach(harcama => {
        if (harcama.isTaksit) {
            const kalanTaksit = harcama.toplamTaksit - harcama.taksitNo;
            gelecekTaksitler[harcama.person] += harcama.amount * kalanTaksit;
        }
    });

    return { hesaplar, gelecekTaksitler };
}

function getMonthlyFutureTaksits() {
    const monthlyTaksits = {};

    expenses.forEach(harcama => {
        if (harcama.isTaksit && harcama.toplamTaksit && harcama.taksitNo) {
            const [harcamaYear, harcamaMonth, harcamaDay] = harcama.date.split('-').map(Number);
            const kalanTaksit = harcama.toplamTaksit - harcama.taksitNo;

            for (let i = 1; i <= kalanTaksit; i++) {
                let taksitYear = harcamaYear;
                let taksitMonth = harcamaMonth + i;

                while (taksitMonth > 12) {
                    taksitMonth -= 12;
                    taksitYear += 1;
                }

                const monthKey = `${taksitYear}-${taksitMonth.toString().padStart(2, '0')}`;

                if (!monthlyTaksits[monthKey]) {
                    monthlyTaksits[monthKey] = {};
                }

                if (!monthlyTaksits[monthKey][harcama.person]) {
                    monthlyTaksits[monthKey][harcama.person] = [];
                }

                monthlyTaksits[monthKey][harcama.person].push({
                    description: harcama.description || 'Taksit',
                    amount: harcama.amount,
                    taksitNo: harcama.taksitNo + i,
                    toplamTaksit: harcama.toplamTaksit,
                    card: harcama.card,
                    orijinalTarih: harcama.date
                });
            }
        }
    });

    return monthlyTaksits;
}

function getFutureTaksits(selectedMonth) {
    const futureTaksits = [];
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);

    expenses.forEach(harcama => {
        if (harcama.isTaksit && harcama.toplamTaksit && harcama.taksitNo) {
            const [harcamaYear, harcamaMonth, harcamaDay] = harcama.date.split('-').map(Number);

            const kalanTaksit = harcama.toplamTaksit - harcama.taksitNo;

            // console.log(`Harcama: ${harcama.description}, Taksit: ${harcama.taksitNo}/${harcama.toplamTaksit}, Kalan: ${kalanTaksit}`);

            for (let i = 1; i <= kalanTaksit; i++) {
                let taksitYear = harcamaYear;
                let taksitMonth = harcamaMonth + i;

                while (taksitMonth > 12) {
                    taksitMonth -= 12;
                    taksitYear += 1;
                }

                // console.log(`Taksit ${i}: ${taksitYear}-${taksitMonth}, Aranan: ${selectedYear}-${selectedMonthNum}`);

                if (taksitYear === selectedYear && taksitMonth === selectedMonthNum) {
                    // console.log(`Eşleşti! Taksit ekleniyor: ${harcama.taksitNo + i}/${harcama.toplamTaksit}`);
                    futureTaksits.push({
                        ...harcama,
                        taksitNo: harcama.taksitNo + i,
                        date: `${taksitYear}-${taksitMonth.toString().padStart(2, '0')}-${harcamaDay.toString().padStart(2, '0')}`,
                        isFuture: true
                    });
                }
            }
        }
    });

    // console.log(`${selectedMonth} için bulunan gelecek taksit sayısı:`, futureTaksits.length);
    return futureTaksits;
}

// Seçilen aya düşen düzenli ödemeleri getir
function getRecurringPaymentsForMonth(selectedMonth) {
    const recurringPayments = [];
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);

    regularPayments.forEach(odeme => {
        if (!odeme.aktif || !odeme.baslangicTarihi) return;

        const baslangic = new Date(odeme.baslangicTarihi);
        const baslangicYear = baslangic.getFullYear();
        const baslangicMonth = baslangic.getMonth() + 1;

        // Eğer seçilen ay başlangıç tarihinden önceyse, düzenli ödeme henüz başlamamış
        if (selectedYear < baslangicYear || (selectedYear === baslangicYear && selectedMonthNum < baslangicMonth)) {
            return;
        }

        // Eğer bitiş tarihi varsa ve seçilen ay bitiş tarihinden sonraysa, düzenli ödeme bitmiş
        if (odeme.bitisTarihi || odeme.birisTarihi) {
            const bitis = new Date(odeme.bitisTarihi || odeme.birisTarihi);
            const bitisYear = bitis.getFullYear();
            const bitisMonth = bitis.getMonth() + 1;

            if (selectedYear > bitisYear || (selectedYear === bitisYear && selectedMonthNum > bitisMonth)) {
                return;
            }
        }

        // Bu aya ait düzenli ödemeyi harcama formatına dönüştür
        const recurringExpense = {
            id: `recurring-${odeme.id}-${selectedMonth}`,
            date: `${selectedYear}-${selectedMonthNum.toString().padStart(2, '0')}-${baslangic.getDate().toString().padStart(2, '0')}`,
            card: odeme.card,
            person: odeme.person,
            kategori: odeme.kategori || 'Düzenli Ödeme',
            description: `${odeme.ad} (Düzenli)`,
            amount: parseFloat(odeme.amount) || 0,
            isRegular: true,
            duzenliOdemeId: odeme.id
        };

        // Eğer bu ödeme bu ay için zaten expenses listesinde yoksa ekle
        const existingExpense = expenses.find(h =>
            h.duzenliOdemeId === odeme.id &&
            h.date &&
            h.date.startsWith(selectedMonth)
        );

        if (!existingExpense) {
            recurringPayments.push(recurringExpense);
        }
    });

    return recurringPayments;
}

// Hesaplar Güncelleme
function updateHesaplar() {
    const tbody = document.querySelector('#hesaplarTable tbody');
    if (!tbody) return;

    const { hesaplar, gelecekTaksitler } = calculateDebts();
    tbody.innerHTML = '';

    // Tüm kişileri dahil et (mevcut harcama olmayanlar da)
    const tumKisiler = [...new Set([...Object.keys(hesaplar), ...Object.keys(gelecekTaksitler), ...people])];

    tumKisiler.forEach(kisi => {
        if (!kisi) return; // Boş kişi adlarını atla

        const row = tbody.insertRow();
        const mevcutHarcama = hesaplar[kisi] || 0;
        const gelecekOdeme = gelecekTaksitler[kisi] || 0;
        const toplam = mevcutHarcama + gelecekOdeme;

        let debtClass = '';
        if (toplam > 0) debtClass = 'debt-positive';
        else if (toplam < 0) debtClass = 'debt-negative';

        row.innerHTML = `
            <td style="color: var(--text); font-weight: 500;">${kisi}</td>
            <td class="text-right" style="color: var(--text-secondary);">${mevcutHarcama.toFixed(2)} TL</td>
            <td class="text-right" style="color: var(--text-secondary);">${gelecekOdeme.toFixed(2)} TL</td>
            <td class="text-right ${debtClass}" style="font-weight: 600;">${toplam.toFixed(2)} TL</td>
        `;
    });
}

// Aylık Özet Güncelleme
function updateMonthlySummary() {
    const ozetTarih = document.getElementById('summaryDate');
    const aylikOzetContent = document.getElementById('aylikOzetContent');

    if (!ozetTarih || !aylikOzetContent) return;

    const selectedMonth = ozetTarih.value;
    if (!selectedMonth) {
        aylikOzetContent.innerHTML = '<p style="color: var(--text-muted);">Tarih seçin ve özet gösterilsin.</p>';
        return;
    }

    // Seçilen ayın mevcut expensesını filtrele
    const monthlyExpenses = expenses.filter(harcama => {
        return harcama.date && harcama.date.startsWith(selectedMonth);
    });

    // Seçilen aya düşen gelecek taksitleri al
    const futureTaksits = getFutureTaksits(selectedMonth);

    // Seçilen aya düşen düzenli ödemeleri al
    const monthlyRecurringPayments = getRecurringPaymentsForMonth(selectedMonth);

    // Tüm expensesı birleştir (mevcut + gelecek taksitler + düzenli ödemeler)
    const allMonthlyExpenses = [...monthlyExpenses, ...futureTaksits, ...monthlyRecurringPayments];

    if (allMonthlyExpenses.length === 0) {
        aylikOzetContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <h3>Bu ay için harcama bulunamadı</h3>
                <p>${selectedMonth} ayında henüz harcama kaydı veya gelecek taksit yok.</p>
            </div>
        `;
        return;
    }

    // Ay bilgisini güzel formatta göster
    const [year, month] = selectedMonth.split('-');
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const monthName = monthNames[parseInt(month) - 1];

    // Toplam hesaplama (mevcut + gelecek taksitler + düzenli ödemeler)
    const toplamTutar = allMonthlyExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const mevcutTutar = monthlyExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const gelecekTutar = futureTaksits.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const duzenliTutar = monthlyRecurringPayments.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    // Kullanıcı bazında toplam
    const kullaniciToplamlar = {};
    allMonthlyExpenses.forEach(exp => {
        const kullanici = exp.person || 'Bilinmeyen';
        kullaniciToplamlar[kullanici] = (kullaniciToplamlar[kullanici] || 0) + (parseFloat(exp.amount) || 0);
    });

    // Kart bazında toplam
    const kartToplamlar = {};
    allMonthlyExpenses.forEach(exp => {
        const kart = exp.card || 'Bilinmeyen';
        kartToplamlar[kart] = (kartToplamlar[kart] || 0) + (parseFloat(exp.amount) || 0);
    });

    // HTML oluştur
    let html = `
        <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius); margin-bottom: 24px;">
            <h3 style="color: var(--text); margin: 0 0 16px 0;">${monthName} ${year} Özeti</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px;">
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: var(--text-secondary);">Toplam Harcama</div>
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
                    <div style="font-size: 14px; color: var(--text-secondary);">Düzenli Ödeme</div>
                    <div style="font-size: 20px; font-weight: 600; color: var(--info);">${duzenliTutar.toFixed(2)} TL</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: var(--text-secondary);">Toplam İşlem</div>
                    <div style="font-size: 20px; font-weight: 600; color: var(--text-muted);">${allMonthlyExpenses.length}</div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 24px;">
            <div style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
                <h4 style="color: var(--text); margin: 0 0 16px 0;">👥 Kullanıcı Bazında</h4>
                ${Object.entries(kullaniciToplamlar)
            .sort((a, b) => b[1] - a[1])
            .map(([kullanici, tutar]) => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
                            <span style="color: var(--text);">${kullanici}</span>
                            <span style="color: var(--primary); font-weight: 600;">${tutar.toFixed(2)} TL</span>
                        </div>
                    `).join('')}
            </div>
            
            <div style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
                <h4 style="color: var(--text); margin: 0 0 16px 0;">💳 Kart Bazında</h4>
                ${Object.entries(kartToplamlar)
            .sort((a, b) => b[1] - a[1])
            .map(([kart, tutar]) => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-subtle);">
                            <span style="color: var(--text);">${kart}</span>
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

    aylikOzetContent.innerHTML = html;
}