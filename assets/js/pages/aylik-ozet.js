// Aylık Özet sayfasına özel JavaScript kodları

console.log('Aylık özet sayfası yüklendi');

// Sayfa yüklendiğinde mevcut ayı varsayılan olarak ayarla
document.addEventListener('DOMContentLoaded', function() {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('aylik-ozet');
    }
    
    const ozetTarih = document.getElementById('ozet_tarih');
    if (ozetTarih) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        ozetTarih.value = currentMonth;
        
        // Kısa bir gecikme sonra özeti güncelle
        setTimeout(() => {
            if (typeof updateAylikOzet === 'function') {
                updateAylikOzet();
            }
        }, 500);
    }
});