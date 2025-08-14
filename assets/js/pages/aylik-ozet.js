// Aylık Özet sayfasına özel JavaScript kodları

// console.log('Aylık özet sayfası yüklendi');

// Sayfa yüklendiğinde mevcut ayı varsayılan olarak ayarla
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('aylik-ozet');
    }

    const ozetTarih = document.getElementById('ozet_tarih');
    if (ozetTarih) {
        ozetTarih.value = new Date().toISOString().slice(0, 7);

        // Kısa bir gecikme sonra özeti güncelle
        setTimeout(() => {
            if (typeof updateAylikOzet === 'function') {
                updateAylikOzet();
            }
        }, 500);
    }
});