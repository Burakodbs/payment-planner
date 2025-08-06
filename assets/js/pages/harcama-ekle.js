// Harcama Ekleme sayfasına özel JavaScript kodları

console.log('Harcama ekleme sayfası yüklendi');

// Kısayol bilgisini güncelle
function updateKisayolBilgi() {
    const kisayolElement = document.getElementById('kisayolBilgi');
    if (!kisayolElement || !kisiler || kisiler.length === 0) {
        return;
    }

    const kisayollar = kisiler.map((kisi, index) => `${index + 1}=${kisi}`).join(', ');
    kisayolElement.textContent = `Kısayollar: ${kisayollar}`;
}

// Auth sistem yüklendikten sonra kısayol bilgisini güncelle
document.addEventListener('DOMContentLoaded', function() {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('harcama-ekle');
    }
    
    // Kısa bir gecikme ile kısayol bilgisini güncelle
    setTimeout(updateKisayolBilgi, 500);
    
    // Auth sistem data yükledikten sonra da güncelle
    if (typeof authSystem !== 'undefined') {
        const originalTrigger = authSystem.triggerPageUpdates;
        authSystem.triggerPageUpdates = function() {
            originalTrigger.call(this);
            setTimeout(updateKisayolBilgi, 100);
        };
    }
});