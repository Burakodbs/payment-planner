// Utility Fonksiyonları

// Dashboard Updates
function updateDashboard() {
    updateDashboardStats();
    updateDashboardCharts();
    updateDashboardRecentExpenses();
    updateDashboardUpcomingInstallments();
}

function updateDashboardStats() {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthExpenses = harcamalar.filter(h => h.tarih.startsWith(thisMonth));
    const thisMonthTotal = thisMonthExpenses.reduce((sum, h) => sum + h.tutar, 0);
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    const lastMonthExpenses = harcamalar.filter(h => h.tarih.startsWith(lastMonthStr));
    const lastMonthTotal = lastMonthExpenses.reduce((sum, h) => sum + h.tutar, 0);
    
    const { hesaplar, gelecekTaksitler } = calculateDebts();
    const totalCurrentDebt = Object.values(hesaplar).reduce((sum, debt) => sum + debt, 0);
    const totalFuturePayments = Object.values(gelecekTaksitler).reduce((sum, debt) => sum + debt, 0);
    
    document.getElementById('thisMonthTotal').textContent = thisMonthTotal.toFixed(2) + ' TL';
    document.getElementById('totalCurrentDebt').textContent = totalCurrentDebt.toFixed(2) + ' TL';
    document.getElementById('totalFuturePayments').textContent = totalFuturePayments.toFixed(2) + ' TL';
}

function updateDashboardRecentExpenses() {
    const recentExpenses = harcamalar
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
        .slice(0, 5);

    let html = '';
    recentExpenses.forEach(expense => {
        const date = new Date(expense.tarih).toLocaleDateString('tr-TR');
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${expense.aciklama || 'Açıklama yok'}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${date} - ${expense.kullanici} - ${expense.kart}</div>
                </div>
                <div style="font-weight: 600; color: var(--primary);">${expense.tutar.toFixed(2)} TL</div>
            </div>
        `;
    });

    document.getElementById('recentExpensesList').innerHTML = html || '<p style="color: var(--text-secondary); text-align: center;">Henüz harcama yok</p>';
}

function updateDashboardUpcomingInstallments() {
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
                <div style="font-weight: 600; color: var(--warning);">${installment.tutar.toFixed(2)} TL</div>
            </div>
        `;
    });

    document.getElementById('upcomingInstallmentsList').innerHTML = html || '<p style="color: var(--text-secondary); text-align: center;">Gelecek ay taksit yok</p>';
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
    
    // Form reset
    event.target.reset();
    document.getElementById('harcamaTarih').value = currentDate;
    document.getElementById('kart').focus();
    
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
    const data = {
        harcamalar,
        duzenliOdemeler,
        kredikartlari,
        kisiler,
        exportDate: new Date().toISOString()
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
    showToast('Veriler başarıyla dışa aktarıldı!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Veri kontrolü ve geri yükleme
            if (data.harcamalar && Array.isArray(data.harcamalar)) {
                harcamalar = data.harcamalar;
                localStorage.setItem('harcamalar', JSON.stringify(harcamalar));
            }
            
            if (data.duzenliOdemeler && Array.isArray(data.duzenliOdemeler)) {
                duzenliOdemeler = data.duzenliOdemeler;
                localStorage.setItem('duzenliOdemeler', JSON.stringify(duzenliOdemeler));
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
    const kartSelects = document.querySelectorAll('#kart, #filtreKart');
    kartSelects.forEach(select => {
        const currentValue = select.value;
        const options = select.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());
        
        kredikartlari.forEach(kart => {
            const option = document.createElement('option');
            option.value = kart;
            option.textContent = kart;
            select.appendChild(option);
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
        
        kisiler.forEach(kisi => {
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
            localStorage.clear();
            location.reload();
        }
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}