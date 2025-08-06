// Hesaplar sayfasına özel JavaScript kodları

console.log('Hesaplar sayfası yüklendi');

// Hesaplar sayfasına özel fonksiyonlar ve event listener'lar
document.addEventListener('DOMContentLoaded', function() {
    // Hesaplar tablosunu güncelle
    setTimeout(() => {
        if (typeof updateHesaplar === 'function') {
            updateHesaplar();
        }
    }, 500);
});