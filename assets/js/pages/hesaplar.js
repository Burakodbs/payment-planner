// Hesaplar sayfasına özel JavaScript kodları

// console.log('Hesaplar sayfası yüklendi');

// Hesaplar sayfasına özel fonksiyonlar ve event listener'lar
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('hesaplar');
    }

    // Hesaplar tablosunu güncelle
    setTimeout(() => {
        if (typeof updateHesaplar === 'function') {
            updateHesaplar();
        }
    }, 500);
});