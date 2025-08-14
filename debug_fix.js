// LocalStorage Debug ve Manuel Fix
console.log('=== LOCALSTORAGE DEBUG ===');

// Mevcut durumu kontrol et
console.log('Current user:', localStorage.getItem('session_id'));
console.log('App users:', JSON.parse(localStorage.getItem('app_users') || '{}'));

// Eski global verileri kontrol et
console.log('Old kredikartlari:', JSON.parse(localStorage.getItem('kredikartlari') || '[]'));
console.log('Old kisiler:', JSON.parse(localStorage.getItem('kisiler') || '[]'));

// Manuel fix fonksiyonu
window.manualFixCardAndPersonData = function() {
    // Bu örnekleri gerçek verilerle değiştir
    const sampleCards = ['Garanti BBVA', 'İş Bankası Maximum', 'Yapı Kredi World'];
    const samplePersons = ['Burak', 'Ali', 'Ayşe'];
    
    const appUsers = JSON.parse(localStorage.getItem('app_users') || '{}');
    
    // Mevcut kullanıcıları bul
    const userKeys = Object.keys(appUsers).filter(u => u !== 'admin');
    
    if (userKeys.length > 0) {
        const targetUser = userKeys[0]; // İlk kullanıcı
        
        if (!appUsers[targetUser].data.kredikartlari || appUsers[targetUser].data.kredikartlari.length === 0) {
            appUsers[targetUser].data.kredikartlari = sampleCards;
            console.log('✅ Örnek kartlar eklendi:', sampleCards);
        }
        
        if (!appUsers[targetUser].data.kisiler || appUsers[targetUser].data.kisiler.length === 0) {
            appUsers[targetUser].data.kisiler = samplePersons;
            console.log('✅ Örnek kişiler eklendi:', samplePersons);
        }
        
        localStorage.setItem('app_users', JSON.stringify(appUsers));
        console.log('✅ Veriler kaydedildi. Sayfayı yenileyin.');
        
        alert('Örnek kart ve kişi verileri eklendi! Sayfayı yenileyin.');
    }
};

console.log('Manuel fix için: manualFixCardAndPersonData()');
