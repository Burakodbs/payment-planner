// Hesaplama Fonksiyonları

function calculateDebts() {
    const hesaplar = {};
    
    kisiler.forEach(kisi => {
        hesaplar[kisi] = 0;
    });

    harcamalar.forEach(harcama => {
        if (!hesaplar[harcama.kullanici]) {
            hesaplar[harcama.kullanici] = 0;
        }
        hesaplar[harcama.kullanici] += harcama.tutar;
    });

    const gelecekTaksitler = {};
    Object.keys(hesaplar).forEach(kullanici => {
        gelecekTaksitler[kullanici] = 0;
    });

    harcamalar.forEach(harcama => {
        if (harcama.isTaksit) {
            const kalanTaksit = harcama.toplamTaksit - harcama.taksitNo;
            gelecekTaksitler[harcama.kullanici] += harcama.tutar * kalanTaksit;
        }
    });

    return { hesaplar, gelecekTaksitler };
}

function getMonthlyFutureTaksits() {
    const monthlyTaksits = {};
    
    harcamalar.forEach(harcama => {
        if (harcama.isTaksit && harcama.toplamTaksit && harcama.taksitNo) {
            const [harcamaYear, harcamaMonth, harcamaDay] = harcama.tarih.split('-').map(Number);
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
                
                if (!monthlyTaksits[monthKey][harcama.kullanici]) {
                    monthlyTaksits[monthKey][harcama.kullanici] = [];
                }
                
                monthlyTaksits[monthKey][harcama.kullanici].push({
                    aciklama: harcama.aciklama || 'Taksit',
                    tutar: harcama.tutar,
                    taksitNo: harcama.taksitNo + i,
                    toplamTaksit: harcama.toplamTaksit,
                    kart: harcama.kart,
                    orijinalTarih: harcama.tarih
                });
            }
        }
    });
    
    return monthlyTaksits;
}

function getFutureTaksits(selectedMonth) {
    const futureTaksits = [];
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
    
    harcamalar.forEach(harcama => {
        if (harcama.isTaksit && harcama.toplamTaksit && harcama.taksitNo) {
            const [harcamaYear, harcamaMonth, harcamaDay] = harcama.tarih.split('-').map(Number);
            
            const kalanTaksit = harcama.toplamTaksit - harcama.taksitNo;
            
            console.log(`Harcama: ${harcama.aciklama}, Taksit: ${harcama.taksitNo}/${harcama.toplamTaksit}, Kalan: ${kalanTaksit}`);
            
            for (let i = 1; i <= kalanTaksit; i++) {
                let taksitYear = harcamaYear;
                let taksitMonth = harcamaMonth + i;
                
                while (taksitMonth > 12) {
                    taksitMonth -= 12;
                    taksitYear += 1;
                }
                
                console.log(`Taksit ${i}: ${taksitYear}-${taksitMonth}, Aranan: ${selectedYear}-${selectedMonthNum}`);
                
                if (taksitYear === selectedYear && taksitMonth === selectedMonthNum) {
                    console.log(`Eşleşti! Taksit ekleniyor: ${harcama.taksitNo + i}/${harcama.toplamTaksit}`);
                    futureTaksits.push({
                        ...harcama,
                        taksitNo: harcama.taksitNo + i,
                        tarih: `${taksitYear}-${taksitMonth.toString().padStart(2, '0')}-${harcamaDay.toString().padStart(2, '0')}`,
                        isFuture: true
                    });
                }
            }
        }
    });
    
    console.log(`${selectedMonth} için bulunan gelecek taksit sayısı:`, futureTaksits.length);
    return futureTaksits;
}

// Hesaplar Güncelleme
function updateHesaplar() {
    const { hesaplar, gelecekTaksitler } = calculateDebts();
    const tbody = document.querySelector('#hesaplarTable tbody');
    
    tbody.innerHTML = '';
    
    Object.keys(hesaplar).forEach(kisi => {
        const row = tbody.insertRow();
        const mevcutHarcama = hesaplar[kisi];
        const gelecekOdeme = gelecekTaksitler[kisi] || 0;
        const toplam = mevcutHarcama + gelecekOdeme;
        
        const debtClass = toplam > 0 ? 'debt-positive' : toplam < 0 ? 'debt-negative' : '';
        
        row.innerHTML = `
            <td>${kisi}</td>
            <td class="text-right">${mevcutHarcama.toFixed(2)} TL</td>
            <td class="text-right">${gelecekOdeme.toFixed(2)} TL</td>
            <td class="text-right ${debtClass}">${toplam.toFixed(2)} TL</td>
        `;
    });
}