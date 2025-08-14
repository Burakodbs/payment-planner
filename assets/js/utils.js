// Utility Fonksiyonları

// Data Migration Functions
function migrateDuzenliOdemeData() {
    // console.log('Düzenli ödeme migration başlatılıyor...');

    let migrationCount = 0;
    harcamalar.forEach(harcama => {
        // Eski isDuzenliOtomatik özelliğini isRegular'a çevir
        if (harcama.isDuzenliOtomatik && !harcama.isRegular) {
            harcama.isRegular = true;
            delete harcama.isDuzenliOtomatik;

            // "(Otomatik)" yazısını "(Düzenli)" ile değiştir
            if (harcama.aciklama && harcama.aciklama.includes('(Otomatik)')) {
                harcama.aciklama = harcama.aciklama.replace('(Otomatik)', '(Düzenli)');
            }

            migrationCount++;
        }
    });

    if (migrationCount > 0) {
        // console.log(`${migrationCount} düzenli ödeme migration yapıldı`);
        // Verileri kaydet
        if (typeof saveData === 'function') {
            saveData();
        } else if (authSystem && authSystem.currentUser) {
            authSystem.saveUserData();
        }

        // UI güncellemeleri
        if (typeof updateHarcamaTable === 'function') {
            updateHarcamaTable();
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }

        showToast(`${migrationCount} düzenli ödeme güncellendi`, 'success');
    }
}

// Dashboard Updates
function updateDashboard() {
    updateDashboardStats();
    updateDashboardCharts();
    updateDashboardRecentExpenses();
    updateDashboardUpcomingInstallments();
}

function updateDashboardStats() {
    // Dashboard elementlerini kontrol et - sadece dashboard sayfasında mevcut
    const thisMonthElement = document.getElementById('thisMonthTotal');
    const totalCurrentDebtElement = document.getElementById('totalCurrentDebt');
    const totalFuturePaymentsElement = document.getElementById('totalFuturePayments');

    if (!thisMonthElement || !totalCurrentDebtElement || !totalFuturePaymentsElement) {
        // console.log('Dashboard stat elements not found, skipping update');
        return;
    }

    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthExpenses = harcamalar.filter(h => h.tarih && h.tarih.startsWith(thisMonth));
    const thisMonthTotal = thisMonthExpenses.reduce((sum, h) => sum + (parseFloat(h.tutar) || 0), 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    const lastMonthExpenses = harcamalar.filter(h => h.tarih && h.tarih.startsWith(lastMonthStr));
    const lastMonthTotal = lastMonthExpenses.reduce((sum, h) => sum + (parseFloat(h.tutar) || 0), 0);

    const { hesaplar, gelecekTaksitler } = calculateDebts();
    const totalCurrentDebt = Object.values(hesaplar).reduce((sum, debt) => sum + debt, 0);
    const totalFuturePayments = Object.values(gelecekTaksitler).reduce((sum, debt) => sum + debt, 0);

    thisMonthElement.textContent = thisMonthTotal.toFixed(2) + ' TL';
    totalCurrentDebtElement.textContent = totalCurrentDebt.toFixed(2) + ' TL';
    totalFuturePaymentsElement.textContent = totalFuturePayments.toFixed(2) + ' TL';
}

function updateDashboardRecentExpenses() {
    const recentExpensesElement = document.getElementById('recentExpensesList');
    if (!recentExpensesElement) {
        // console.log('Recent expenses element not found, skipping update');
        return;
    }

    const recentExpenses = harcamalar
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
        .slice(0, 5);

    let html = '';
    recentExpenses.forEach(expense => {
        if (expense.tarih) {
            const date = new Date(expense.tarih).toLocaleDateString('tr-TR');
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border);">
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${expense.aciklama || 'Açıklama yok'}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${date} - ${expense.kullanici} - ${expense.kart}</div>
                    </div>
                    <div style="font-weight: 600; color: var(--primary);">${(parseFloat(expense.tutar) || 0).toFixed(2)} TL</div>
                </div>
            `;
        }
    });

    recentExpensesElement.innerHTML = html || '<p style="color: var(--text-secondary); text-align: center;">Henüz harcama yok</p>';
}

function updateDashboardUpcomingInstallments() {
    const upcomingInstallmentsElement = document.getElementById('upcomingInstallmentsList');
    if (!upcomingInstallmentsElement) {
        // console.log('Upcoming installments element not found, skipping update');
        return;
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().slice(0, 7);

    const upcomingInstallments = getFutureTaksits(nextMonthStr);

    let html = '';
    upcomingInstallments.slice(0, 5).forEach(installment => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${installment.aciklama || 'Taksit'}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${installment.taksitNo}/${installment.toplamTaksit} - ${installment.kullanici} - ${installment.kart}</div>
                </div>
                <div style="font-weight: 600; color: var(--warning);">${(parseFloat(installment.tutar) || 0).toFixed(2)} TL</div>
            </div>
        `;
    });

    upcomingInstallmentsElement.innerHTML = html || '<p style="color: var(--text-secondary); text-align: center;">Gelecek ay taksit yok</p>';
}

// Form Submission Handlers
function handleHarcamaSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const harcama = {
        id: Date.now(),
        tarih: formData.get('tarih'),
        kart: formData.get('kart'),
        kullanici: formData.get('kullanici'),
        kategori: formData.get('kategori'),
        aciklama: formData.get('aciklama'),
        tutar: parseFloat(formData.get('tutar')),
        taksitNo: formData.get('taksitNo') ? parseInt(formData.get('taksitNo')) : null,
        toplamTaksit: formData.get('toplamTaksit') ? parseInt(formData.get('toplamTaksit')) : null,
        isTaksit: formData.get('taksitNo') && formData.get('toplamTaksit')
    };

    harcamalar.push(harcama);
    saveData();

    // Sticky values kaydet
    if (typeof preserveStickyValues === 'function') {
        preserveStickyValues();
    }

    // Form reset
    event.target.reset();

    // Sticky values uygula
    if (typeof applyStickyValues === 'function') {
        applyStickyValues();
    } else {
        // Fallback - default date
        document.getElementById('harcamaTarih').value = currentDate;
    }

    // Odağı tutar alanına getir
    const tutarInput = document.getElementById('tutar');
    if (tutarInput) {
        tutarInput.focus();
        tutarInput.select();
    }

    // Update displays
    updateHarcamaTable();
    updateDashboard();

    // Success message
    showToast('Harcama başarıyla eklendi!', 'success');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Data Export/Import
function exportData() {
    // Auth sistem verisini kaynağından al (güncel değilse önce çıkarım yap)
    if (typeof authSystem !== 'undefined' && authSystem && typeof authSystem.ensureCardUserExtraction === 'function') {
        try { authSystem.ensureCardUserExtraction(); } catch (_) {}
    }

    const data = {
        version: 2,
        user: (authSystem && authSystem.currentUser) || null,
        exportDate: new Date().toISOString(),
        counts: {
            harcamalar: harcamalar.length,
            duzenliOdemeler: duzenliOdemeler.length,
            kredikartlari: kredikartlari.length,
            kisiler: kisiler.length
        },
        harcamalar: harcamalar,
        duzenliOdemeler: duzenliOdemeler,
        kredikartlari: kredikartlari,
        kisiler: kisiler
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `kredi-karti-verileri-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    showToast('Veriler (kart & kullanıcı dahil) dışa aktarıldı', 'success');
}

// Button tıklamasında çalışacak şekilde düzenlendi
function importData() {
    const input = document.getElementById('fileInput');
    if (!input || !input.files || input.files.length === 0) {
        showToast('Lütfen önce bir yedek dosyası seçin', 'error');
        return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            // Veri kontrolü ve geri yükleme
            if (Array.isArray(data.harcamalar)) {
                harcamalar = data.harcamalar;
            }
            if (Array.isArray(data.duzenliOdemeler)) {
                duzenliOdemeler = data.duzenliOdemeler;
            }
            if (Array.isArray(data.kredikartlari)) {
                kredikartlari = data.kredikartlari;
            }
            if (Array.isArray(data.kisiler)) {
                kisiler = data.kisiler;
            }

            if (data.kredikartlari && Array.isArray(data.kredikartlari)) {
                kredikartlari = data.kredikartlari;
                localStorage.setItem('kredikartlari', JSON.stringify(kredikartlari));
                updateCardOptions();
            }

            if (data.kisiler && Array.isArray(data.kisiler)) {
                kisiler = data.kisiler;
                localStorage.setItem('kisiler', JSON.stringify(kisiler));
                updateUserOptions();
            }

            // UI'ları güncelle
            updateHarcamaTable();
            updateDashboard();
            updateHesaplar();

            const importCount = {
                harcamalar: data.harcamalar ? data.harcamalar.length : 0,
                kredikartlari: data.kredikartlari ? data.kredikartlari.length : 0,
                kisiler: data.kisiler ? data.kisiler.length : 0
            };

            showToast(`Veriler başarıyla içe aktarıldı! ${importCount.harcamalar} harcama, ${importCount.kredikartlari} kart, ${importCount.kisiler} kişi yüklendi.`, 'success');
        } catch (error) {
            showToast('Dosya okuma hatası: ' + error.message, 'error');
        }
    };

    reader.readAsText(file);
}

// Kart ve kullanıcı seçeneklerini güncelle
function updateCardOptions() {
    console.log('🔄 updateCardOptions çağırıldı');
    
    const kartSelects = document.querySelectorAll('#kart, #filtreKart');
    console.log('📋 Bulunan select elementleri:', kartSelects.length);
    
    kartSelects.forEach(select => {
        const currentValue = select.value;
        const options = select.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());

        // AuthSystem'den kart listesini al - birden fazla yol dene
        let kartListesi = [];
        
        // 1. AuthSystem'den al
        if (typeof authSystem !== 'undefined' && authSystem && authSystem.currentUserData) {
            kartListesi = authSystem.currentUserData.kredikartlari || [];
            console.log('✅ AuthSystem.currentUserData.kredikartlari:', kartListesi);
        }
        // 2. Global değişkenden al (fallback)
        else if (typeof kredikartlari !== 'undefined' && kredikartlari) {
            kartListesi = kredikartlari;
            console.log('✅ Global kredikartlari:', kartListesi);
        }
        // 3. Window objesi kontrol et
        else if (typeof window.kredikartlari !== 'undefined' && window.kredikartlari) {
            kartListesi = window.kredikartlari;
            console.log('✅ Window.kredikartlari:', kartListesi);
        }
        // 4. localStorage'dan doğrudan al (eski sistem uyumluluk)
        else {
            const storedKartlar = JSON.parse(localStorage.getItem('kredikartlari') || '[]');
            if (storedKartlar.length > 0) {
                kartListesi = storedKartlar;
                console.log('✅ localStorage kredikartlari:', kartListesi);
            }
        }

        console.log('📊 Final kart listesi:', kartListesi);

        kartListesi.forEach(kart => {
            const option = document.createElement('option');
            option.value = kart;
            option.textContent = kart;
            select.appendChild(option);
            console.log('➕ Kart eklendi:', kart);
        });

        select.value = currentValue;
    });
}

function updateUserOptions() {
    console.log('🔄 updateUserOptions çağırıldı');
    
    const kullaniciSelects = document.querySelectorAll('#kullanici, #filtreKullanici');
    console.log('👥 Bulunan select elementleri:', kullaniciSelects.length);
    
    kullaniciSelects.forEach(select => {
        const currentValue = select.value;
        const options = select.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());

        // AuthSystem'den kişi listesini al - birden fazla yol dene
        let kisiListesi = [];
        
        // 1. AuthSystem'den al
        if (typeof authSystem !== 'undefined' && authSystem && authSystem.currentUserData) {
            kisiListesi = authSystem.currentUserData.kisiler || [];
            console.log('✅ AuthSystem.currentUserData.kisiler:', kisiListesi);
        }
        // 2. Global değişkenden al (fallback)
        else if (typeof kisiler !== 'undefined' && kisiler) {
            kisiListesi = kisiler;
            console.log('✅ Global kisiler:', kisiListesi);
        }
        // 3. Window objesi kontrol et
        else if (typeof window.kisiler !== 'undefined' && window.kisiler) {
            kisiListesi = window.kisiler;
            console.log('✅ Window.kisiler:', kisiListesi);
        }
        // 4. localStorage'dan doğrudan al (eski sistem uyumluluk)
        else {
            const storedKisiler = JSON.parse(localStorage.getItem('kisiler') || '[]');
            if (storedKisiler.length > 0) {
                kisiListesi = storedKisiler;
                console.log('✅ localStorage kisiler:', kisiListesi);
            }
        }

        console.log('📊 Final kişi listesi:', kisiListesi);

        kisiListesi.forEach(kisi => {
            const option = document.createElement('option');
            option.value = kisi;
            option.textContent = kisi;
            select.appendChild(option);
            console.log('➕ Kişi eklendi:', kisi);
        });

        select.value = currentValue;
    });
}

function updateUserOptions() {
    const kullaniciSelects = document.querySelectorAll('#kullanici, #filtreKullanici');
    kullaniciSelects.forEach(select => {
        const currentValue = select.value;
        const options = select.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());

        // AuthSystem'den kişi listesini al - birden fazla yol dene
        let kisiListesi = [];
        
        // 1. AuthSystem'den al
        if (typeof authSystem !== 'undefined' && authSystem && authSystem.currentUserData) {
            kisiListesi = authSystem.currentUserData.kisiler || [];
        }
        // 2. Global değişkenden al (fallback)
        else if (typeof kisiler !== 'undefined' && kisiler) {
            kisiListesi = kisiler;
        }
        // 3. localStorage'dan doğrudan al (eski sistem uyumluluk)
        else {
            const storedKisiler = JSON.parse(localStorage.getItem('kisiler') || '[]');
            if (storedKisiler.length > 0) {
                kisiListesi = storedKisiler;
            }
        }

        kisiListesi.forEach(kisi => {
            const option = document.createElement('option');
            option.value = kisi;
            option.textContent = kisi;
            select.appendChild(option);
        });

        select.value = currentValue;
    });
}

function clearAllData() {
    if (confirm('Tüm verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        if (confirm('Bu işlem GERİ ALINAMAZ! Emin misiniz?')) {
            if (authSystem && authSystem.currentUser) {
                // Auth sistemi üzerinden temizle
                harcamalar = [];
                duzenliOdemeler = [];
                kredikartlari = [];
                kisiler = [];
                authSystem.saveUserData();
                location.reload();
            } else {
                localStorage.clear();
                location.reload();
            }
        }
    }
}

function clearExpenseData() {
    if (confirm('Sadece harcama verilerini silmek istediğinizden emin misiniz?')) {
        harcamalar = [];
        if (authSystem && authSystem.currentUser) {
            authSystem.saveUserData();
        }
        showToast('Harcama verileri silindi', 'success');
        // Sayfayı yenile
        if (typeof updateHarcamaTable === 'function') updateHarcamaTable();
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof updateHesaplar === 'function') updateHesaplar();
    }
}

// Düzenli ödeme fonksiyonları
function showDuzenliOdemeForm() {
    document.getElementById('duzenliOdemeForm').style.display = 'block';
    document.getElementById('duzenliBaslangic').value = new Date().toISOString().slice(0, 10);
}

function cancelDuzenliOdeme() {
    // Düzenleme modunu sıfırla
    editingDuzenliOdemeId = null;

    // Form alanlarını temizle
    const form = document.getElementById('duzenliOdemeForm');
    if (form) {
        form.style.display = 'none';
        document.getElementById('duzenliAciklama').value = '';
        document.getElementById('duzenliTutar').value = '';
        document.getElementById('duzenliKart').value = '';
        document.getElementById('duzenliKullanici').value = '';
        document.getElementById('duzenliBaslangic').value = '';
    }

    // Form başlığını ve butonunu eski haline getir
    const formTitle = document.getElementById('duzenliFormTitle');
    if (formTitle) {
        formTitle.textContent = 'Yeni Düzenli Ödeme';
    }

    const submitBtn = document.getElementById('duzenliSubmitBtn');
    if (submitBtn) {
        submitBtn.textContent = 'Ekle';
        submitBtn.className = 'btn';
    }
}

function addDuzenliOdeme() {
    // Eğer düzenleme modundaysak güncelleme yap
    if (editingDuzenliOdemeId) {
        updateDuzenliOdeme();
        return;
    }

    const aciklama = document.getElementById('duzenliAciklama').value.trim();
    const tutar = document.getElementById('duzenliTutar').value;
    const kart = document.getElementById('duzenliKart').value;
    const kullanici = document.getElementById('duzenliKullanici').value;
    const baslangic = document.getElementById('duzenliBaslangic').value;
    const kategori = document.getElementById('duzenliKategori') ? document.getElementById('duzenliKategori').value : 'Düzenli Ödeme';

    if (!aciklama || !tutar || !kart || !kullanici || !baslangic) {
        showToast('Lütfen tüm zorunlu alanları doldurun', 'error');
        return;
    }

    const duzenliOdeme = {
        id: Date.now(),
        aciklama,
        tutar: parseFloat(tutar),
        kart,
        kullanici,
        baslangicTarihi: baslangic,
        kategori: kategori || 'Düzenli Ödeme'
    };

    duzenliOdemeler.push(duzenliOdeme);
    if (authSystem && authSystem.currentUser) {
        authSystem.saveUserData();
    }

    updateDuzenliOdemelerListesi();
    cancelDuzenliOdeme();
    showToast('Düzenli ödeme eklendi', 'success');

    // Harcama tablosunu da güncelle
    if (typeof updateHarcamaTable === 'function') {
        updateHarcamaTable();
    }
}

function updateDuzenliOdemelerListesi() {
    const container = document.getElementById('duzenliOdemelerListesi');
    if (!container) return;

    if (duzenliOdemeler.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">Henüz düzenli ödeme tanımlanmamış</p>';
        return;
    }

    let html = '';
    duzenliOdemeler.forEach(odeme => {
        const isActive = odeme.aktif !== false; // undefined veya true ise aktif
        const statusStyle = isActive ? '' : 'opacity: 0.6; background: var(--bg-muted);';
        const statusText = isActive ? '' : ' (Durduruldu)';
        const bitisTarihi = odeme.birisTarihi ? ` - Bitiş: ${odeme.birisTarihi}` : '';

        html += `
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: var(--radius); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; ${statusStyle}">
                <div>
                    <div style="font-weight: 600; color: var(--text);">${odeme.aciklama}${statusText}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${odeme.tutar} TL - ${odeme.kullanici} - ${odeme.kart}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">Başlangıç: ${odeme.baslangicTarihi}${bitisTarihi}</div>
                </div>
                <div>
                    ${isActive ? `
                        <button class="btn btn-sm btn-outline" onclick="editDuzenliOdeme(${odeme.id})" style="margin-right: 8px;">Düzenle</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDuzenliOdeme(${odeme.id})">Durdur</button>
                    ` : `
                        <button class="btn btn-sm btn-success" onclick="reactivateDuzenliOdeme(${odeme.id})" style="margin-right: 8px;">Yeniden Başlat</button>
                        <button class="btn btn-sm btn-danger" onclick="permanentDeleteDuzenliOdeme(${odeme.id})">Tamamen Sil</button>
                    `}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Düzenli ödeme düzenleme
let editingDuzenliOdemeId = null;

function editDuzenliOdeme(id) {
    const odeme = duzenliOdemeler.find(o => o.id === id);
    if (!odeme) {
        showToast('Düzenli ödeme bulunamadı', 'error');
        return;
    }

    // Formu düzenleme moduna al
    editingDuzenliOdemeId = id;

    // Formu göster
    document.getElementById('duzenliOdemeForm').style.display = 'block';

    // Form alanlarını doldur
    document.getElementById('duzenliAciklama').value = odeme.aciklama;
    document.getElementById('duzenliTutar').value = odeme.tutar;
    document.getElementById('duzenliKart').value = odeme.kart;
    document.getElementById('duzenliKullanici').value = odeme.kullanici;
    document.getElementById('duzenliBaslangic').value = odeme.baslangicTarihi;

    // Form başlığını güncelle
    const formTitle = document.getElementById('duzenliFormTitle');
    if (formTitle) {
        formTitle.textContent = 'Düzenli Ödemeyi Düzenle';
    }

    // Submit butonunu güncelle
    const submitBtn = document.getElementById('duzenliSubmitBtn');
    if (submitBtn) {
        submitBtn.textContent = 'Güncelle';
        submitBtn.className = 'btn btn-primary';
    }

    showToast('Düzenleme modu aktif', 'info');
}

function updateDuzenliOdeme() {
    const aciklama = document.getElementById('duzenliAciklama').value.trim();
    const tutar = document.getElementById('duzenliTutar').value;
    const kart = document.getElementById('duzenliKart').value;
    const kullanici = document.getElementById('duzenliKullanici').value;
    const baslangic = document.getElementById('duzenliBaslangic').value;

    if (!aciklama || !tutar || !kart || !kullanici || !baslangic) {
        showToast('Lütfen tüm zorunlu alanları doldurun', 'error');
        return;
    }

    // Düzenli ödemeyi güncelle
    const odemeIndex = duzenliOdemeler.findIndex(o => o.id === editingDuzenliOdemeId);
    if (odemeIndex !== -1) {
        const oldOdeme = { ...duzenliOdemeler[odemeIndex] };

        duzenliOdemeler[odemeIndex] = {
            ...duzenliOdemeler[odemeIndex],
            aciklama,
            tutar: parseFloat(tutar),
            kart,
            kullanici,
            baslangicTarihi: baslangic
        };

        // Global sync sistem - tüm ilgili verileri güncelle
        syncDataAfterDuzenliOdemeUpdate(oldOdeme, duzenliOdemeler[odemeIndex]);

        if (authSystem && authSystem.currentUser) {
            authSystem.saveUserData();
        }

        updateDuzenliOdemelerListesi();
        cancelDuzenliOdeme();
        showToast('Düzenli ödeme güncellendi', 'success');

        // Harcama tablosunu da güncelle
        if (typeof updateHarcamaTable === 'function') {
            updateHarcamaTable();
        }
    }
}

function deleteDuzenliOdeme(id) {
    const odeme = duzenliOdemeler.find(o => o.id === id);
    if (!odeme) {
        showToast('Düzenli ödeme bulunamadı', 'error');
        return;
    }

    if (confirm(`"${odeme.aciklama}" düzenli ödemeyi silmek istediğinizden emin misiniz?\n\nNot: Geçmişteki ödemeler korunacak, sadece gelecekteki otomatik kayıtlar durdurulacak.`)) {
        // Silme tarihini kaydet (bugünün tarihi)
        const today = new Date().toISOString().slice(0, 10);

        // Geçmiş kayıtları korumak için düzenli ödemeye bitiş tarihi ekle
        const odemeIndex = duzenliOdemeler.findIndex(o => o.id === id);
        if (odemeIndex !== -1) {
            duzenliOdemeler[odemeIndex].birisTarihi = today;
            duzenliOdemeler[odemeIndex].aktif = false;
        }

        // Alternatif olarak tamamen silmek istiyorsanız:
        // duzenliOdemeler = duzenliOdemeler.filter(o => o.id !== id);

        if (authSystem && authSystem.currentUser) {
            authSystem.saveUserData();
        }

        updateDuzenliOdemelerListesi();
        showToast(`Düzenli ödeme durduruldu. Geçmiş kayıtlar korundu.`, 'success');

        // Harcama tablosunu da güncelle
        if (typeof updateHarcamaTable === 'function') {
            updateHarcamaTable();
        }
    }
}

// Düzenli ödeme yeniden başlatma
function reactivateDuzenliOdeme(id) {
    const odeme = duzenliOdemeler.find(o => o.id === id);
    if (!odeme) {
        showToast('Düzenli ödeme bulunamadı', 'error');
        return;
    }

    if (confirm(`"${odeme.aciklama}" düzenli ödemeyi yeniden başlatmak istediğinizden emin misiniz?`)) {
        const odemeIndex = duzenliOdemeler.findIndex(o => o.id === id);
        if (odemeIndex !== -1) {
            // Aktif duruma getir ve bitiş tarihini kaldır
            duzenliOdemeler[odemeIndex].aktif = true;
            delete duzenliOdemeler[odemeIndex].birisTarihi;

            // Yeni başlangıç tarihi olarak bugünü ayarla
            duzenliOdemeler[odemeIndex].baslangicTarihi = new Date().toISOString().slice(0, 10);
        }

        if (authSystem && authSystem.currentUser) {
            authSystem.saveUserData();
        }

        updateDuzenliOdemelerListesi();
        showToast('Düzenli ödeme yeniden başlatıldı', 'success');

        // Harcama tablosunu da güncelle
        if (typeof updateHarcamaTable === 'function') {
            updateHarcamaTable();
        }
    }
}

// Düzenli ödeme tamamen silme
function permanentDeleteDuzenliOdeme(id) {
    const odeme = duzenliOdemeler.find(o => o.id === id);
    if (!odeme) {
        showToast('Düzenli ödeme bulunamadı', 'error');
        return;
    }

    if (confirm(`"${odeme.aciklama}" düzenli ödemeyi tamamen silmek istediğinizden emin misiniz?\n\nUYARI: Bu işlem geri alınamaz ve tüm geçmiş kayıtlar da silinecek!`)) {
        if (confirm('Bu işlem GERİ ALINAMAZ! Emin misiniz?')) {
            // Düzenli ödemeyi tamamen sil
            duzenliOdemeler = duzenliOdemeler.filter(o => o.id !== id);

            // Bu düzenli ödemeye ait olan harcamaları da sil
            harcamalar = harcamalar.filter(h => {
                if (h.isDuzenli && h.id && h.id.toString().includes(`duzenli_${id}_`)) {
                    return false; // Bu düzenli ödemeye ait kayıtları sil
                }
                return true; // Diğer kayıtları koru
            });

            if (authSystem && authSystem.currentUser) {
                authSystem.saveUserData();
            }

            updateDuzenliOdemelerListesi();
            showToast('Düzenli ödeme ve tüm kayıtları tamamen silindi', 'success');

            // Harcama tablosunu da güncelle
            if (typeof updateHarcamaTable === 'function') {
                updateHarcamaTable();
            }
        }
    }
}

// Global Data Sync System
function syncDataAfterDuzenliOdemeUpdate(oldOdeme, newOdeme) {
    // Düzenli ödeme güncellendiğinde harcama listesindeki ilgili kayıtları da güncelle
    // Bu özellik şu anda sadece tarihi günceller, kart/kullanıcı değişiklikleri için ayrı fonksiyon gerekli
    // console.log('Düzenli ödeme güncellendi, global sync tetiklendi');
}

function syncAllDataAfterNameChange(type, oldName, newName) {
    // type: 'kart' veya 'kullanici'
    // console.log(`Global sync: ${type} adı değiştirildi: ${oldName} -> ${newName}`);

    let updateCount = 0;

    // Harcamalardaki isimleri güncelle
    harcamalar.forEach(harcama => {
        if (type === 'kart' && harcama.kart === oldName) {
            harcama.kart = newName;
            updateCount++;
        } else if (type === 'kullanici' && harcama.kullanici === oldName) {
            harcama.kullanici = newName;
            updateCount++;
        }
    });

    // Düzenli ödemelerdeki isimleri güncelle
    duzenliOdemeler.forEach(odeme => {
        if (type === 'kart' && odeme.kart === oldName) {
            odeme.kart = newName;
            updateCount++;
        } else if (type === 'kullanici' && odeme.kullanici === oldName) {
            odeme.kullanici = newName;
            updateCount++;
        }
    });

    if (updateCount > 0) {
        // Verileri kaydet
        if (authSystem && authSystem.currentUser) {
            authSystem.saveUserData();
        }

        // Tüm tabloları güncelle
        if (typeof updateHarcamaTable === 'function') {
            updateHarcamaTable();
        }
        if (typeof updateDuzenliOdemelerListesi === 'function') {
            updateDuzenliOdemelerListesi();
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }

        showToast(`${updateCount} kayıt güncellendi: ${oldName} -> ${newName}`, 'success');
    }
}

// Import fonksiyonunu güncelleyelim
function importFromFile() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        showToast('Lütfen bir dosya seçin', 'error');
        return;
    }

    importData({ target: { files: fileInput.files } });
}

// Veri yönetimi sayfası için import fonksiyonu
function importData() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        showToast('Lütfen bir dosya seçin', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            // Veri kontrolü ve geri yükleme
            if (data.harcamalar && Array.isArray(data.harcamalar)) {
                harcamalar = data.harcamalar;
            }

            if (data.duzenliOdemeler && Array.isArray(data.duzenliOdemeler)) {
                duzenliOdemeler = data.duzenliOdemeler;
            }

            if (data.kredikartlari && Array.isArray(data.kredikartlari)) {
                kredikartlari = data.kredikartlari;
                updateCardOptions();
            }

            if (data.kisiler && Array.isArray(data.kisiler)) {
                kisiler = data.kisiler;
                updateUserOptions();
            }

            // Auth sistemi üzerinden kaydet
            if (authSystem && authSystem.currentUser) {
                authSystem.saveUserData();
            }

            // UI'ları güncelle
            if (typeof updateHarcamaTable === 'function') updateHarcamaTable();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof updateHesaplar === 'function') updateHesaplar();
            if (typeof updateDuzenliOdemelerListesi === 'function') updateDuzenliOdemelerListesi();
            if (typeof updateDataStats === 'function') updateDataStats();
            if (typeof updateCardAndUserManagement === 'function') updateCardAndUserManagement();

            const importCount = {
                harcamalar: data.harcamalar ? data.harcamalar.length : 0,
                kredikartlari: data.kredikartlari ? data.kredikartlari.length : 0,
                kisiler: data.kisiler ? data.kisiler.length : 0
            };

            showToast(`Veriler başarıyla içe aktarıldı! ${importCount.harcamalar} harcama, ${importCount.kredikartlari} kart, ${importCount.kisiler} kişi yüklendi.`, 'success');

            // Dosya input'unu temizle
            fileInput.value = '';
        } catch (error) {
            showToast('Dosya okuma hatası: ' + error.message, 'error');
        }
    };

    reader.readAsText(file);
}

// Harcama düzenleme fonksiyonları
let editingHarcamaId = null;

function editHarcama(id) {
    const harcama = harcamalar.find(h => h.id === id);
    if (!harcama) {
        showToast('Harcama bulunamadı', 'error');
        return;
    }

    editingHarcamaId = id;

    // Modal alanlarını doldur
    document.getElementById('editTarih').value = harcama.tarih;
    document.getElementById('editAciklama').value = harcama.aciklama || '';
    document.getElementById('editTutar').value = harcama.tutar;
    document.getElementById('editTaksitNo').value = harcama.taksitNo || '';
    document.getElementById('editToplamTaksit').value = harcama.toplamTaksit || '';

    // Kart ve kullanıcı seçeneklerini doldur
    populateEditModalSelects();

    // Değerleri ayarla
    document.getElementById('editKart').value = harcama.kart;
    document.getElementById('editKullanici').value = harcama.kullanici;

    // Modal'ı göster
    document.getElementById('editHarcamaModal').style.display = 'block';

    showToast('Düzenleme modu aktif', 'info');
}

function populateEditModalSelects() {
    // Kart seçenekleri
    const kartSelect = document.getElementById('editKart');
    if (kartSelect) {
        const options = kartSelect.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());

        kredikartlari.forEach(kart => {
            const option = document.createElement('option');
            option.value = kart;
            option.textContent = kart;
            kartSelect.appendChild(option);
        });
    }

    // Kullanıcı seçenekleri
    const kullaniciSelect = document.getElementById('editKullanici');
    if (kullaniciSelect) {
        const options = kullaniciSelect.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());

        kisiler.forEach(kisi => {
            const option = document.createElement('option');
            option.value = kisi;
            option.textContent = kisi;
            kullaniciSelect.appendChild(option);
        });
    }
}

function closeEditHarcamaModal() {
    document.getElementById('editHarcamaModal').style.display = 'none';
    editingHarcamaId = null;
}

function handleEditHarcamaSubmit(event) {
    event.preventDefault();

    if (!editingHarcamaId) {
        showToast('Düzenlenecek harcama bulunamadı', 'error');
        return;
    }

    const harcamaIndex = harcamalar.findIndex(h => h.id === editingHarcamaId);
    if (harcamaIndex === -1) {
        showToast('Harcama bulunamadı', 'error');
        return;
    }

    // Form verilerini al
    const tarih = document.getElementById('editTarih').value;
    const kart = document.getElementById('editKart').value;
    const kullanici = document.getElementById('editKullanici').value;
    const aciklama = document.getElementById('editAciklama').value;
    const tutar = document.getElementById('editTutar').value;
    const taksitNo = document.getElementById('editTaksitNo').value;
    const toplamTaksit = document.getElementById('editToplamTaksit').value;

    if (!tarih || !kart || !kullanici || !tutar) {
        showToast('Lütfen tüm zorunlu alanları doldurun', 'error');
        return;
    }

    // Harcamayı güncelle
    harcamalar[harcamaIndex] = {
        ...harcamalar[harcamaIndex],
        tarih,
        kart,
        kullanici,
        aciklama,
        tutar: parseFloat(tutar),
        taksitNo: taksitNo ? parseInt(taksitNo) : null,
        toplamTaksit: toplamTaksit ? parseInt(toplamTaksit) : null,
        isTaksit: taksitNo && toplamTaksit
    };

    // Veriyi kaydet
    if (authSystem && authSystem.currentUser) {
        authSystem.saveUserData();
    }

    // UI'ları güncelle
    if (typeof updateHarcamaTable === 'function') {
        updateHarcamaTable();
    }
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }

    closeEditHarcamaModal();
    showToast('Harcama güncellendi', 'success');
}

// Kart düzenleme fonksiyonları
function editCard(oldCardName) {
    const newCardName = prompt(`"${oldCardName}" kartının yeni adını girin:`, oldCardName);
    if (newCardName && newCardName.trim() && newCardName.trim() !== oldCardName) {
        const newName = newCardName.trim();

        if (kredikartlari.includes(newName)) {
            showToast('Bu kart adı zaten mevcut', 'error');
            return;
        }

        // Kart adını güncelle
        const cardIndex = kredikartlari.indexOf(oldCardName);
        if (cardIndex !== -1) {
            kredikartlari[cardIndex] = newName;
        }

        // Global sync - tüm harcamalarda ve düzenli ödemelerde bu kart adını güncelle
        syncAllDataAfterNameChange('kart', oldCardName, newName);

        // UI'ları güncelle
        updateCardOptions();
        updateCardAndUserManagement();
        updateDataStats();

        showToast(`Kart adı güncellendi: ${oldCardName} → ${newName}`, 'success');
    }
}

// Kullanıcı düzenleme fonksiyonları
function editUser(oldUserName) {
    const newUserName = prompt(`"${oldUserName}" kullanıcısının yeni adını girin:`, oldUserName);
    if (newUserName && newUserName.trim() && newUserName.trim() !== oldUserName) {
        const newName = newUserName.trim();

        if (kisiler.includes(newName)) {
            showToast('Bu kullanıcı adı zaten mevcut', 'error');
            return;
        }

        // Kullanıcı adını güncelle
        const userIndex = kisiler.indexOf(oldUserName);
        if (userIndex !== -1) {
            kisiler[userIndex] = newName;
        }

        // Global sync - tüm harcamalarda ve düzenli ödemelerde bu kullanıcı adını güncelle
        syncAllDataAfterNameChange('kullanici', oldUserName, newName);

        // UI'ları güncelle
        updateUserOptions();
        updateCardAndUserManagement();
        updateDataStats();

        showToast(`Kullanıcı adı güncellendi: ${oldUserName} → ${newName}`, 'success');
    }
}

// Düzenli ödemeleri otomatik harcama olarak ekleme sistemi
function processDuzenliOdemeler() {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
    const currentDay = today.getDate(); // Ayın kaçıncı günü

    // console.log('Düzenli ödeme kontrolü başlıyor...', currentMonth);

    duzenliOdemeler.forEach(odeme => {
        // Sadece aktif ödemeleri kontrol et
        if (odeme.aktif === false) return;

        // Bitiş tarihi geçmişse skip
        if (odeme.birisTarihi && odeme.birisTarihi <= today.toISOString().slice(0, 10)) return;

        // Başlangıç tarihi gelecekteyse skip
        if (odeme.baslangicTarihi && odeme.baslangicTarihi > today.toISOString().slice(0, 10)) return;

        // Bu ay için ödeme zaten yapılmış mı kontrol et
        const aylikOdemeId = `duzenli_${odeme.id}_${currentMonth}`;
        const mevcutHarcama = harcamalar.find(h => h.id === aylikOdemeId);

        if (!mevcutHarcama) {
            // Ödeme gününü belirle (varsayılan 15, veya başlangıç tarihinden al)
            let odemeGunu = 15; // Varsayılan
            if (odeme.baslangicTarihi) {
                const baslangicGun = new Date(odeme.baslangicTarihi).getDate();
                odemeGunu = baslangicGun;
            }

            // Ödeme günü geldi mi kontrol et
            if (currentDay >= odemeGunu) {
                // console.log(`Düzenli ödeme oluşturuluyor: ${odeme.aciklama} - ${currentMonth}`);

                // Yeni harcama kaydı oluştur
                const yeniHarcama = {
                    id: aylikOdemeId,
                    tarih: `${currentMonth}-${odemeGunu.toString().padStart(2, '0')}`,
                    kart: odeme.kart,
                    kullanici: odeme.kullanici,
                    kategori: 'Düzenli Ödeme',
                    aciklama: `${odeme.aciklama} (Düzenli)`,
                    tutar: odeme.tutar,
                    taksitNo: null,
                    toplamTaksit: null,
                    isTaksit: false,
                    isRegular: true, // Bu otomatik oluşturulan düzenli ödeme
                    duzenliOdemeId: odeme.id // Hangi düzenli ödemeden geldiğini takip et
                };

                harcamalar.push(yeniHarcama);

                // Veri kaydet
                if (authSystem && authSystem.currentUser) {
                    authSystem.saveUserData();
                }

                showToast(`Düzenli ödeme eklendi: ${odeme.aciklama}`, 'info');
            }
        }
    });
}

// Sayfa yüklendiğinde ve günlük kontrol için düzenli ödeme kontrolü
function initDuzenliOdemeCheck() {
    // Sayfa yüklendiğinde kontrol et
    processDuzenliOdemeler();

    // Her 10 dakikada bir kontrol et (demo için, production'da daha uzun olabilir)
    setInterval(processDuzenliOdemeler, 10 * 60 * 1000); // 10 dakika

    // Gece yarısı kontrolü için timer ayarla
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Gece yarısı
    const msUntilMidnight = midnight - now;

    setTimeout(() => {
        processDuzenliOdemeler();
        // Sonrasında her gün gece yarısı kontrol et
        setInterval(processDuzenliOdemeler, 24 * 60 * 60 * 1000); // 24 saat
    }, msUntilMidnight);
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js')
            .then(function (registration) {
                // console.log('ServiceWorker registration successful');
            }, function (err) {
                // console.log('ServiceWorker registration failed: ', err);
            });

        // Düzenli ödeme kontrolünü başlat
        setTimeout(initDuzenliOdemeCheck, 2000); // 2 saniye sonra başlat
    });
}