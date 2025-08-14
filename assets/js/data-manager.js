// Centralized Data Manager
class DataManager {
    static save() {
        if (authSystem && authSystem.currentUser) {
            authSystem.saveUserData();
        }
    }

    static getCards() {
        if (authSystem && authSystem.currentUserData) {
            return authSystem.currentUserData.kredikartlari || [];
        }
        return kredikartlari || [];
    }

    static getUsers() {
        if (authSystem && authSystem.currentUserData) {
            return authSystem.currentUserData.kisiler || [];
        }
        return kisiler || [];
    }

    static updateAllViews() {
        // Update table if exists
        if (typeof updateHarcamaTable === 'function') updateHarcamaTable();
        
        // Update dashboard if exists
        if (typeof updateDashboard === 'function') updateDashboard();
        
        // Update accounts if exists
        if (typeof updateHesaplar === 'function') updateHesaplar();
        
        // Update regular payments list if exists
        if (typeof updateDuzenliOdemelerListesi === 'function') updateDuzenliOdemelerListesi();
        
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
        const form = document.getElementById('duzenliOdemeForm');
        if (!form) return;
        form.style.display = 'block';
        const dateField = document.getElementById('duzenliBaslangic');
        if (dateField) dateField.value = new Date().toISOString().slice(0, 10);
    }

    static cancel() {
        this.editingId = null;
        const form = document.getElementById('duzenliOdemeForm');
        if (form) {
            form.style.display = 'none';
            ['duzenliAciklama', 'duzenliTutar', 'duzenliKart', 'duzenliKullanici', 'duzenliBaslangic'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
        }
        const formTitle = document.getElementById('duzenliFormTitle');
        if (formTitle) formTitle.textContent = 'Yeni Düzenli Ödeme';
        const submitBtn = document.getElementById('duzenliSubmitBtn');
        if (submitBtn) {
            submitBtn.textContent = 'Ekle';
            submitBtn.className = 'btn';
        }
    }

    static add() {
        if (this.editingId) return this.update();
        
        const aciklama = document.getElementById('duzenliAciklama')?.value?.trim();
        const tutarVal = document.getElementById('duzenliTutar')?.value;
        const kart = document.getElementById('duzenliKart')?.value;
        const kullanici = document.getElementById('duzenliKullanici')?.value;
        const baslangic = document.getElementById('duzenliBaslangic')?.value;
        
        if (!aciklama || !tutarVal || !kart || !kullanici || !baslangic) {
            NotificationService.error('Lütfen tüm zorunlu alanları doldurun');
            return;
        }
        
        const regularPayment = {
            id: Date.now(),
            aciklama,
            tutar: parseFloat(tutarVal),
            kart,
            kullanici,
            baslangicTarihi: baslangic,
            kategori: 'Düzenli Ödeme',
            aktif: true
        };
        
        duzenliOdemeler.push(regularPayment);
        DataManager.save();
        this.updateList();
        this.cancel();
        NotificationService.success('Düzenli ödeme eklendi');
        DataManager.updateAllViews();
    }

    static updateList() {
        const container = document.getElementById('duzenliOdemelerListesi');
        if (!container) return;
        
        if (!duzenliOdemeler.length) {
            container.innerHTML = '<p style="color: var(--text-muted);">Henüz düzenli ödeme tanımlanmamış</p>';
            return;
        }
        
        let html = '';
        duzenliOdemeler.forEach(payment => {
            const isActive = payment.aktif !== false;
            const statusStyle = isActive ? '' : 'opacity:0.6; background: var(--bg-muted);';
            const statusText = isActive ? '' : ' (Durduruldu)';
            const endDate = payment.bitisTarihi ? ` - Bitiş: ${payment.bitisTarihi}` : '';
            
            html += `
                <div style="background: var(--bg-secondary); padding:12px; border-radius: var(--radius); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; ${statusStyle}">
                    <div>
                        <div style="font-weight:600; color:var(--text);">${payment.aciklama}${statusText}</div>
                        <div style="font-size:12px; color:var(--text-secondary);">${payment.tutar} TL - ${payment.kullanici} - ${payment.kart}</div>
                        <div style="font-size:12px; color:var(--text-muted);">Başlangıç: ${payment.baslangicTarihi}${endDate}</div>
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
        const payment = duzenliOdemeler.find(o => o.id === id);
        if (!payment) {
            NotificationService.error('Düzenli ödeme bulunamadı');
            return;
        }
        
        this.editingId = id;
        const form = document.getElementById('duzenliOdemeForm');
        if (form) form.style.display = 'block';
        
        document.getElementById('duzenliAciklama').value = payment.aciklama;
        document.getElementById('duzenliTutar').value = payment.tutar;
        document.getElementById('duzenliKart').value = payment.kart;
        document.getElementById('duzenliKullanici').value = payment.kullanici;
        document.getElementById('duzenliBaslangic').value = payment.baslangicTarihi;
        
        const formTitle = document.getElementById('duzenliFormTitle');
        if (formTitle) formTitle.textContent = 'Düzenli Ödemeyi Düzenle';
        const submitBtn = document.getElementById('duzenliSubmitBtn');
        if (submitBtn) {
            submitBtn.textContent = 'Güncelle';
            submitBtn.className = 'btn btn-primary';
        }
        
        NotificationService.info('Düzenleme modu aktif');
    }

    static update() {
        const aciklama = document.getElementById('duzenliAciklama')?.value?.trim();
        const tutarVal = document.getElementById('duzenliTutar')?.value;
        const kart = document.getElementById('duzenliKart')?.value;
        const kullanici = document.getElementById('duzenliKullanici')?.value;
        const baslangic = document.getElementById('duzenliBaslangic')?.value;
        
        if (!aciklama || !tutarVal || !kart || !kullanici || !baslangic) {
            NotificationService.error('Lütfen tüm zorunlu alanları doldurun');
            return;
        }
        
        const idx = duzenliOdemeler.findIndex(o => o.id === this.editingId);
        if (idx !== -1) {
            duzenliOdemeler[idx] = {
                ...duzenliOdemeler[idx],
                aciklama,
                tutar: parseFloat(tutarVal),
                kart,
                kullanici,
                baslangicTarihi: baslangic
            };
            
            DataManager.save();
            this.updateList();
            this.cancel();
            NotificationService.success('Düzenli ödeme güncellendi');
            DataManager.updateAllViews();
        }
    }

    static delete(id) {
        const payment = duzenliOdemeler.find(o => o.id === id);
        if (!payment) {
            NotificationService.error('Düzenli ödeme bulunamadı');
            return;
        }
        
        if (confirm(`"${payment.aciklama}" düzenli ödemeyi durdurmak istediğinizden emin misiniz?\n\nGeçmişteki ödemeler korunacak, sadece gelecekteki otomatik kayıtlar durdurulacak.`)) {
            const today = new Date().toISOString().slice(0, 10);
            const idx = duzenliOdemeler.findIndex(o => o.id === id);
            if (idx !== -1) {
                duzenliOdemeler[idx].bitisTarihi = today;
                duzenliOdemeler[idx].aktif = false;
            }
            
            DataManager.save();
            this.updateList();
            NotificationService.success('Düzenli ödeme durduruldu. Geçmiş kayıtlar korundu.');
            DataManager.updateAllViews();
        }
    }

    static reactivate(id) {
        const idx = duzenliOdemeler.findIndex(o => o.id === id);
        if (idx !== -1) {
            duzenliOdemeler[idx].aktif = true;
            delete duzenliOdemeler[idx].bitisTarihi;
            
            DataManager.save();
            this.updateList();
            NotificationService.success('Düzenli ödeme yeniden başlatıldı');
        }
    }

    static permanentDelete(id) {
        const payment = duzenliOdemeler.find(o => o.id === id);
        if (!payment) return;
        
        if (confirm(`"${payment.aciklama}" düzenli ödemeyi tamamen silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
            const idx = duzenliOdemeler.findIndex(o => o.id === id);
            if (idx !== -1) {
                duzenliOdemeler.splice(idx, 1);
                DataManager.save();
                this.updateList();
                NotificationService.success('Düzenli ödeme tamamen silindi');
            }
        }
    }
}

// Backward compatibility functions
function showDuzenliOdemeForm() { RegularPayments.showForm(); }
function cancelDuzenliOdeme() { RegularPayments.cancel(); }
function addDuzenliOdeme() { RegularPayments.add(); }
function updateDuzenliOdemelerListesi() { RegularPayments.updateList(); }
function editDuzenliOdeme(id) { RegularPayments.edit(id); }
function deleteDuzenliOdeme(id) { RegularPayments.delete(id); }

// Backward compatibility
function saveData() {
    DataManager.save();
}

// Harcama Tablosu Güncelleme
function updateHarcamaTable() {
    const tbody = document.querySelector('#harcamaTable tbody');

    // Check if table exists (only on harcama-listesi page)
    if (!tbody) {
        // console.log('Harcama table not found, skipping table update');
        return;
    }

    const filteredHarcamalar = applyAllFilters();

    updateSonucSayisi(filteredHarcamalar);

    tbody.innerHTML = '';

    // console.log('Filtrelenmiş harcama sayısı:', filteredHarcamalar.length);
    // console.log('İlk 5 harcama:', filteredHarcamalar.slice(0, 5));
    // console.log('Tüm harcamalar:', harcamalar.length);

    filteredHarcamalar.forEach((harcama, index) => {
        const row = tbody.insertRow();
        const taksitBilgi = harcama.isTaksit ? `${harcama.taksitNo}/${harcama.toplamTaksit}` : '-';

        let rowStyle = '';
        let taksitEtiket = '';
        let actionButton = '';

        if (harcama.isFuture) {
            rowStyle = 'background-color: #fff3cd; color: #856404;';
            taksitEtiket = '';
            actionButton = '<span style="color: #856404; font-size: 12px;">Gelecek Taksit</span>';
        } else if (harcama.isRegular) {
            rowStyle = 'background-color: #e3f2fd; color: #1565c0;';
            taksitEtiket = '';
            actionButton = `
                <button class="btn btn-sm btn-outline" onclick="editHarcama(${harcama.id || 'undefined'})" style="margin-right: 4px;">Düzenle</button>
                <button class="btn btn-sm btn-danger" onclick="deleteHarcama(${harcama.id || 'undefined'})">Sil</button>
            `;
        } else {
            actionButton = `
                <button class="btn btn-sm btn-outline" onclick="editHarcama(${harcama.id || 'undefined'})" style="margin-right: 4px;">Düzenle</button>
                <button class="btn btn-sm btn-danger" onclick="deleteHarcama(${harcama.id || 'undefined'})">Sil</button>
            `;
        }

        const tutarValue = harcama.tutar ? Number(harcama.tutar).toFixed(2) : '0.00';

        row.innerHTML = `
            <td style="${rowStyle}">${new Date(harcama.tarih).toLocaleDateString('tr-TR')}</td>
            <td style="${rowStyle}">${harcama.kart || '-'}</td>
            <td style="${rowStyle}">${harcama.kullanici || '-'}</td>
            <td style="${rowStyle}">${harcama.aciklama || '-'}${taksitEtiket}</td>
            <td style="${rowStyle}">${taksitBilgi}</td>
            <td class="text-right" style="${rowStyle}">${tutarValue} TL</td>
            <td style="${rowStyle}">
                ${actionButton}
            </td>
        `;
    });
}

function updateSonucSayisi(filteredHarcamalar) {
    const toplamHarcama = harcamalar.length;
    const gosterilenSayi = filteredHarcamalar.length;

    const gercekHarcamalar = filteredHarcamalar.filter(h => !h.isFuture && !h.isRegular).length;
    const gelecekTaksitler = filteredHarcamalar.filter(h => h.isFuture).length;
    const duzenliOdemeSayisi = filteredHarcamalar.filter(h => h.isRegular).length;

    let mesaj = `${gosterilenSayi} kayıt gösteriliyor`;

    if (gosterilenSayi < toplamHarcama) {
        mesaj += ` (Toplam ${toplamHarcama} kayıttan)`;
    }

    if (gelecekTaksitler > 0 || duzenliOdemeSayisi > 0) {
        let detay = [];
        if (gercekHarcamalar > 0) detay.push(`${gercekHarcamalar} harcama`);
        if (duzenliOdemeSayisi > 0) detay.push(`${duzenliOdemeSayisi} düzenli ödeme`);
        if (gelecekTaksitler > 0) detay.push(`${gelecekTaksitler} gelecek taksit`);
        mesaj += ` | ${detay.join(' + ')}`;
    }

    const toplamTutar = filteredHarcamalar.reduce((sum, h) => sum + (Number(h.tutar) || 0), 0);
    mesaj += ` | Toplam: ${toplamTutar.toFixed(2)} TL`;

    const sonucSayisiElement = document.getElementById('sonucSayisi');
    if (sonucSayisiElement) {
        sonucSayisiElement.textContent = mesaj;
    }
}

// Filtreleme ve Sıralama
// Düzenli ödemeleri harcama formatına dönüştür
function getDuzenliOdemelerAsHarcamalar() {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
    const today = currentDate.toISOString().slice(0, 10);

    // Sadece aktif düzenli ödemeleri dahil et
    const aktiveDuzenliOdemeler = duzenliOdemeler.filter(odeme => {
        // Aktif olmayan ödemeleri hariç tut
        if (odeme.aktif === false) {
            return false;
        }

        // Bitiş tarihi varsa ve bugünden önce ise hariç tut
    if ((odeme.bitisTarihi || odeme.birisTarihi) && (odeme.bitisTarihi || odeme.birisTarihi) <= today) {
            return false;
        }

        // Başlangıç tarihi bugünden sonra ise henüz başlamamış, hariç tut
        if (odeme.baslangicTarihi && odeme.baslangicTarihi > today) {
            return false;
        }

        return true;
    });

    return aktiveDuzenliOdemeler.map(odeme => {
        return {
            id: `duzenli_${odeme.id}_${currentMonth}`,
            tarih: `${currentMonth}-15`, // Ayın ortasına koy
            kart: odeme.kart,
            kullanici: odeme.kullanici,
            kategori: 'Düzenli Ödeme',
            aciklama: `${odeme.aciklama} (Düzenli Ödeme)`,
            tutar: odeme.tutar,
            taksitNo: null,
            toplamTaksit: null,
            isTaksit: false,
            isDuzenli: true // Düzenli ödeme olduğunu belirten flag
        };
    });
}

function applyAllFilters() {
    // console.log('--- FILTRE BAŞLANGICI ---');
    // console.log('Toplam harcama sayısı:', harcamalar.length);
    // console.log('Düzenli ödeme sayısı:', duzenliOdemeler.length);

    // Harcamaları ve düzenli ödemeleri birleştir
    let filtered = [...harcamalar];

    // Check if filter elements exist (only on harcama-listesi page)
    const filtreTarihElement = document.getElementById('filtreTarih');
    if (!filtreTarihElement) {
        // console.log('Filter elements not found, skipping filtering');
        return filtered;
    }

    const selectedMonth = filtreTarihElement.value;
    // console.log('Seçilen ay:', selectedMonth);

    if (selectedMonth) {
        const monthFiltered = filtered.filter(harcama => harcama.tarih.startsWith(selectedMonth));
        // console.log('Ay filtresinden sonra:', monthFiltered.length);

        const futureTaksits = getFutureTaksits(selectedMonth);
        const recurringPayments = getRecurringPaymentsForMonth(selectedMonth);
        // console.log('Gelecek taksit sayısı:', futureTaksits.length);
        // console.log('Düzenli ödeme sayısı:', recurringPayments.length);

        filtered = [...monthFiltered, ...futureTaksits, ...recurringPayments];
    } else {
        filtered = [...harcamalar];
        // console.log('Tarih filtresi yok, tüm harcamalar:', filtered.length);
    }

    // console.log('Tarih filtresinden sonra toplam:', filtered.length);

    const filtreKullaniciElement = document.getElementById('filtreKullanici');
    const selectedUser = filtreKullaniciElement ? filtreKullaniciElement.value : '';
    // console.log('Seçilen kullanıcı:', selectedUser);
    if (selectedUser) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(harcama => harcama.kullanici === selectedUser);
        // console.log(`Kullanıcı filtresinden sonra: ${beforeCount} -> ${filtered.length}`);
    }

    const filtreKartElement = document.getElementById('filtreKart');
    const selectedCard = filtreKartElement ? filtreKartElement.value : '';
    // console.log('Seçilen kart:', selectedCard);
    if (selectedCard) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(harcama => harcama.kart === selectedCard);
        // console.log(`Kart filtresinden sonra: ${beforeCount} -> ${filtered.length}`);
    }

    const minTutarElement = document.getElementById('minTutar');
    const maxTutarElement = document.getElementById('maxTutar');
    const minTutarValue = minTutarElement ? minTutarElement.value : '';
    const maxTutarValue = maxTutarElement ? maxTutarElement.value : '';
    const minTutar = minTutarValue ? parseFloat(minTutarValue) : 0;
    const maxTutar = maxTutarValue ? parseFloat(maxTutarValue) : Infinity;

    // console.log('Tutar aralığı:', minTutar, '-', maxTutar);
    if (minTutarValue || maxTutarValue) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(harcama => harcama.tutar >= minTutar && harcama.tutar <= maxTutar);
        // console.log(`Tutar filtresinden sonra: ${beforeCount} -> ${filtered.length}`);
    }

    // console.log('Sıralama öncesi kayıt sayısı:', filtered.length);

    const siralamaKriteriElement = document.getElementById('siralamaKriteri');
    const sortCriteria = siralamaKriteriElement ? siralamaKriteriElement.value : 'tarih-desc';
    const [field, direction] = sortCriteria.split('-');
    // console.log('Sıralama kriteri:', field, direction);

    try {
        const beforeSort = filtered.length;
        filtered.sort((a, b) => {
            let valueA, valueB;

            switch (field) {
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
    const harcama = harcamalar.find(h => h.id === id);
    if (!harcama) {
        showToast('Harcama bulunamadı', 'error');
        return;
    }

    let confirmMessage = 'Bu harcamayı silmek istediğinizden emin misiniz?';

    // Otomatik oluşturulan düzenli ödeme ise uyarı ver
    if (harcama.isRegular) {
        confirmMessage = `Bu otomatik oluşturulan düzenli ödemeyi silmek istediğinizden emin misiniz?\n\n"${harcama.aciklama}"\n\nNot: Gelecek ay tekrar otomatik olarak oluşturulacaktır.`;
    }

    if (confirm(confirmMessage)) {
        harcamalar = harcamalar.filter(h => h.id !== id);
        saveData();
        updateHarcamaTable();
        updateDashboard();

        if (harcama.isRegular) {
            showToast('Düzenli ödeme silindi (gelecek ay yeniden oluşturulacak)', 'info');
        } else {
            showToast('Harcama silindi', 'success');
        }
    }
}

// Form Event Listeners
document.addEventListener('keydown', function (e) {
    const activeElement = document.activeElement;
    const isInUserSelect = activeElement === document.getElementById('kullanici');
    const isInFormField = activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT';

    if (isInUserSelect || !isInFormField) {
        const kullaniciSelect = document.getElementById('kullanici');
        const keyNum = parseInt(e.key);

        // Check if kullanici select exists (only on harcama-ekle page)
        if (!kullaniciSelect) {
            return;
        }

        if (keyNum >= 1 && keyNum <= 5 && keyNum <= kisiler.length) {
            e.preventDefault();
            const selectedPerson = kisiler[keyNum - 1];
            kullaniciSelect.value = selectedPerson;
            kullaniciSelect.dispatchEvent(new Event('change'));
            if (!isInUserSelect) {
                const aciklamaElement = document.getElementById('aciklama');
                if (aciklamaElement) {
                    aciklamaElement.focus();
                }
            }
        }
    }
});

// Form event listener - sadece form varsa ekle
const harcamaForm = document.getElementById('harcamaForm');
if (harcamaForm) {
    harcamaForm.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            this.dispatchEvent(new Event('submit'));
        }
    });
}