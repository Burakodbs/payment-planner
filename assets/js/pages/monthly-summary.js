// Aylık Özet sayfasına özel JavaScript kodları
// 
// Sayfa yüklendiğinde mevcut ayı varsayılan olarak ayarla
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('monthly-summary');
    }
    const summaryDate = document.getElementById('summaryDate');
    if (summaryDate) {
        summaryDate.value = new Date().toISOString().slice(0, 7);
        // Kısa bir gecikme sonra özeti güncelle
        setTimeout(() => {
            if (typeof updateMonthlySummary === 'function') {
                updateMonthlySummary();
            }
        }, 500);
    }
});
