// Veri Kaydetme ve Yükleme
function saveData() {
    localStorage.setItem('harcamalar', JSON.stringify(harcamalar));
    localStorage.setItem('duzenliOdemeler', JSON.stringify(duzenliOdemeler));
    localStorage.setItem('kredikartlari', JSON.stringify(kredikartlari));
    localStorage.setItem('kisiler', JSON.stringify(kisiler));
}

// Harcama Tablosu Güncelleme
function updateHarcamaTable() {
    const tbody = document.querySelector('#harcamaTable tbody');
    const filteredHarcamalar = applyAllFilters();
    
    updateSonucSayisi(filteredHarcamalar);
    
    tbody.innerHTML = '';
    
    console.log('Filtrelenmiş harcama sayısı:', filteredHarcamalar.length);
    console.log('İlk 5 harcama:', filteredHarcamalar.slice(0, 5));
    console.log('Tüm harcamalar:', harcamalar.length);
    
    filteredHarcamalar.forEach((harcama, index) => {
        const row = tbody.insertRow();
        const taksitBilgi = harcama.isTaksit ? `${harcama.taksitNo}/${harcama.toplamTaksit}` : '-';
        
        const rowStyle = harcama.isFuture ? 'background-color: #fff3cd; color: #856404;' : '';
        const taksitEtiket = harcama.isFuture ? ' (Gelecek Taksit)' : '';
        
        const tutarValue = harcama.tutar ? Number(harcama.tutar).toFixed(2) : '0.00';
        
        row.innerHTML = `
            <td style="${rowStyle}">${new Date(harcama.tarih).toLocaleDateString('tr-TR')}</td>
            <td style="${rowStyle}">${harcama.kart || '-'}</td>
            <td style="${rowStyle}">${harcama.kullanici || '-'}</td>
            <td style="${rowStyle}">${harcama.aciklama || '-'}${taksitEtiket}</td>
            <td style="${rowStyle}">${taksitBilgi}</td>
            <td class="text-right" style="${rowStyle}">${tutarValue} TL</td>
            <td style="${rowStyle}">
                ${harcama.isFuture ? 
                    '<span style="color: #856404; font-size: 12px;">Gelecek Taksit</span>' : 
                    `<button class="btn btn-danger" onclick="deleteHarcama(${harcama.id || 'undefined'})">Sil</button>`
                }
            </td>
        `;
    });
}

function updateSonucSayisi(filteredHarcamalar) {
    const toplamHarcama = harcamalar.length;
    const gosterilenSayi = filteredHarcamalar.length;
    
    const gercekHarcamalar = filteredHarcamalar.filter(h => !h.isFuture).length;
    const gelecekTaksitler = filteredHarcamalar.filter(h => h.isFuture).length;
    
    let mesaj = `${gosterilenSayi} kayıt gösteriliyor`;
    
    if (gosterilenSayi < toplamHarcama) {
        mesaj += ` (Toplam ${toplamHarcama} harcamadan)`;
    }
    
    if (gelecekTaksitler > 0) {
        mesaj += ` | ${gercekHarcamalar} harcama + ${gelecekTaksitler} gelecek taksit`;
    }
    
    const toplamTutar = filteredHarcamalar.reduce((sum, h) => sum + (Number(h.tutar) || 0), 0);
    mesaj += ` | Toplam: ${toplamTutar.toFixed(2)} TL`;
    
    document.getElementById('sonucSayisi').textContent = mesaj;
}

// Filtreleme ve Sıralama
function applyAllFilters() {
    console.log('--- FILTRE BAŞLANGICI ---');
    console.log('Toplam harcama sayısı:', harcamalar.length);
    
    let filtered = [...harcamalar];
    
    const selectedMonth = document.getElementById('filtreTarih').value;
    console.log('Seçilen ay:', selectedMonth);
    
    if (selectedMonth) {
        const monthFiltered = filtered.filter(harcama => harcama.tarih.startsWith(selectedMonth));
        console.log('Ay filtresinden sonra:', monthFiltered.length);
        
        const futureTaksits = getFutureTaksits(selectedMonth);
        console.log('Gelecek taksit sayısı:', futureTaksits.length);
        
        filtered = [...monthFiltered, ...futureTaksits];
    } else {
        filtered = [...harcamalar];
        console.log('Tarih filtresi yok, tüm harcamalar:', filtered.length);
    }
    
    console.log('Tarih filtresinden sonra toplam:', filtered.length);
    
    const selectedUser = document.getElementById('filtreKullanici').value;
    console.log('Seçilen kullanıcı:', selectedUser);
    if (selectedUser) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(harcama => harcama.kullanici === selectedUser);
        console.log(`Kullanıcı filtresinden sonra: ${beforeCount} -> ${filtered.length}`);
    }
    
    const selectedCard = document.getElementById('filtreKart').value;
    console.log('Seçilen kart:', selectedCard);
    if (selectedCard) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(harcama => harcama.kart === selectedCard);
        console.log(`Kart filtresinden sonra: ${beforeCount} -> ${filtered.length}`);
    }
    
    const minTutarValue = document.getElementById('minTutar').value;
    const maxTutarValue = document.getElementById('maxTutar').value;
    const minTutar = minTutarValue ? parseFloat(minTutarValue) : 0;
    const maxTutar = maxTutarValue ? parseFloat(maxTutarValue) : Infinity;
    
    console.log('Tutar aralığı:', minTutar, '-', maxTutar);
    if (minTutarValue || maxTutarValue) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(harcama => harcama.tutar >= minTutar && harcama.tutar <= maxTutar);
        console.log(`Tutar filtresinden sonra: ${beforeCount} -> ${filtered.length}`);
    }
    
    console.log('Sıralama öncesi kayıt sayısı:', filtered.length);
    
    const sortCriteria = document.getElementById('siralamaKriteri').value;
    const [field, direction] = sortCriteria.split('-');
    console.log('Sıralama kriteri:', field, direction);
    
    try {
        const beforeSort = filtered.length;
        filtered.sort((a, b) => {
            let valueA, valueB;
            
            switch(field) {
                case 'tarih':
                    valueA = new Date(a.tarih).getTime();
                    valueB = new Date(b.tarih).getTime();
                    break;
                case 'tutar':
                    valueA = Number(a.tutar);
                    valueB = Number(b.tutar);
                    break;
                case 'kullanici':
                    valueA = String(a.kullanici).toLowerCase();
                    valueB = String(b.kullanici).toLowerCase();
                    break;
                case 'kart':
                    valueA = String(a.kart).toLowerCase();
                    valueB = String(b.kart).toLowerCase();
                    break;
                default:
                    return 0;
            }
            
            if (field === 'tutar' || field === 'tarih') {
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
        console.log(`Sıralama sonrası: ${beforeSort} -> ${filtered.length}`);
    } catch (e) {
        console.error('Sıralama hatası:', e);
    }
    
    console.log('--- FINAL SONUÇ ---');
    console.log('Döndürülen kayıt sayısı:', filtered.length);
    console.log('İlk 3 kayıt:', filtered.slice(0, 3));
    
    return filtered;
}

// Harcama İşlemleri
function deleteHarcama(id) {
    if (confirm('Bu harcamayı silmek istediğinizden emin misiniz?')) {
        harcamalar = harcamalar.filter(h => h.id !== id);
        saveData();
        updateHarcamaTable();
        updateDashboard();
    }
}

// Form Event Listeners
document.addEventListener('keydown', function(e) {
    const activeElement = document.activeElement;
    const isInUserSelect = activeElement === document.getElementById('kullanici');
    const isInFormField = activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT';
    
    if (isInUserSelect || !isInFormField) {
        const kullaniciSelect = document.getElementById('kullanici');
        const keyNum = parseInt(e.key);
        
        if (keyNum >= 1 && keyNum <= 5 && keyNum <= kisiler.length) {
            e.preventDefault();
            const selectedPerson = kisiler[keyNum - 1];
            kullaniciSelect.value = selectedPerson;
            kullaniciSelect.dispatchEvent(new Event('change'));
            if (!isInUserSelect) {
                document.getElementById('aciklama').focus();
            }
        }
    }
});

document.getElementById('harcamaForm').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        this.dispatchEvent(new Event('submit'));
    }
});