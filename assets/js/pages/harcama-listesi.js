// Harcama Listesi sayfasına özel JavaScript kodları

// console.log('Harcama listesi sayfası yüklendi');

// Mevcut ayı filtre olarak ayarla
function setCurrentMonthFilter() {
    const filtreTarih = document.getElementById('filtreTarih');
    if (filtreTarih) {
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
        filtreTarih.value = currentMonth;
        // console.log('Varsayılan ay filtresi ayarlandı:', currentMonth);
    }
}

// Filtreleri temizle fonksiyonu
function clearAllFilters() {
    document.getElementById('filtreTarih').value = '';
    document.getElementById('filtreKullanici').value = '';
    document.getElementById('filtreKart').value = '';
    document.getElementById('minTutar').value = '';
    document.getElementById('maxTutar').value = '';
    document.getElementById('siralamaKriteri').value = 'tarih-desc';
    updateHarcamaTable();
}

// Sayfa yüklendiğinde mevcut ayı ayarla
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('harcama-listesi');
    }

    // Kısa bir gecikme ile mevcut ayı ayarla
    setTimeout(setCurrentMonthFilter, 200);

    // Auth sistem veri yükledikten sonra tabloyu güncelle
    setTimeout(() => {
        if (typeof updateHarcamaTable === 'function') {
            updateHarcamaTable();
        }
    }, 1000);

    // Edit form event listener
    const editForm = document.getElementById('editHarcamaForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditHarcamaSubmit);
    }
});