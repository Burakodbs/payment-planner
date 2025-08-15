// AylÄ±k Ã–zet sayfasÄ±na Ã¶zel JavaScript kodlarÄ±
// 
// Sayfa yÃ¼klendiÄŸinde mevcut ayÄ± varsayÄ±lan olarak ayarla
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('monthly-summary');
    }
    const summaryDate = document.getElementById('summaryDate');
    if (summaryDate) {
        summaryDate.value = new Date().toISOString().slice(0, 7);
        // KÄ±sa bir gecikme sonra Ã¶zeti gÃ¼ncelle
        setTimeout(() => {
            if (typeof updateMonthlySummary === 'function') {
                updateMonthlySummary();
            }
        }, 500);
    }
});
