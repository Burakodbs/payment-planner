// LocalStorage Debug ve Manuel Fix
console.log('=== LOCALSTORAGE DEBUG ===');

// Mevcut durumu kontrol et
console.log('Current user:', localStorage.getItem('session_id'));
console.log('App users:', JSON.parse(localStorage.getItem('app_users') || '{}'));

// Eski global dataleri kontrol et
console.log('Old kredicardsi:', JSON.parse(localStorage.getItem('kredicardsi') || '[]'));
console.log('Old people:', JSON.parse(localStorage.getItem('people') || '[]'));

// Manuel fix fonksiyonu
window.manualFixCardAndPersonData = function() {
    // Bu örnekleri gerçek datalerle değiştir
    const sampleCards = ['Garanti BBVA', 'İş Bankası Maximum', 'Yapı Kredi World'];
    const samplePersons = ['Burak', 'Ali', 'Ayşe'];
    
    const appUsers = JSON.parse(localStorage.getItem('app_users') || '{}');
    
    // Mevcut kullanıcıları bul
    const userKeys = Object.keys(appUsers).filter(u => u !== 'admin');
    
    if (userKeys.length > 0) {
        const targetUser = userKeys[0]; // İlk kullanıcı
        
        if (!appUsers[targetUser].data.kredicardsi || appUsers[targetUser].data.kredicardsi.length === 0) {
            appUsers[targetUser].data.kredicardsi = sampleCards;
            console.log('✅ Örnek cards eklendi:', sampleCards);
        }
        
        if (!appUsers[targetUser].data.people || appUsers[targetUser].data.people.length === 0) {
            appUsers[targetUser].data.people = samplePersons;
            console.log('✅ Örnek kişiler eklendi:', samplePersons);
        }
        
        localStorage.setItem('app_users', JSON.stringify(appUsers));
        console.log('✅ Veriler kaydedildi. Sayfayı yenileyin.');
        
        alert('Örnek card ve kişi dataleri eklendi! Sayfayı yenileyin.');
    }
};

console.log('Manuel fix için: manualFixCardAndPersonData()');
