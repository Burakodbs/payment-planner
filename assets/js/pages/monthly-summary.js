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
        
        // Tarih değiştiğinde özeti güncelle
        summaryDate.addEventListener('change', function() {
            waitForDataAndUpdateSummary();
        });
    }
    
    // Wait for data to be loaded before updating summary
    function waitForDataAndUpdateSummary() {
        // Check if data is available
        if (typeof authSystem !== 'undefined' && authSystem && authSystem.currentUser) {
            // If user is logged in, check if data is loaded
            if (expenses && people) {
                updateSummaryIfExists();
                return;
            }
        } else if (expenses && people) {
            // If no auth system, use global data
            updateSummaryIfExists();
            return;
        }
        
        // If data not ready, wait a bit and try again
        setTimeout(waitForDataAndUpdateSummary, 500);
    }
    
    function updateSummaryIfExists() {
        if (typeof updateMonthlySummary === 'function') {
            const summaryDate = document.getElementById('summaryDate');
            const selectedMonth = summaryDate ? summaryDate.value : null;
            updateMonthlySummary(selectedMonth);
        }
    }
    
    // Start waiting for data
    setTimeout(waitForDataAndUpdateSummary, 100);
});
