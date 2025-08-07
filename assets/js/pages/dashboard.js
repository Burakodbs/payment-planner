// Dashboard sayfasına özel JavaScript kodları

// console.log('Dashboard sayfası yüklendi');

// Dashboard sayfasına özel fonksiyonlar ve event listener'lar
document.addEventListener('DOMContentLoaded', function() {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('dashboard');
    }
    
    // Dashboard için özel initialization
    // console.log('Dashboard initialized');
});