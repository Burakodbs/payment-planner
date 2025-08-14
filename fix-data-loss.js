// Veri Kurtarma ve Migration Scripti
console.log('=== VERİ KURTARMA BAŞLADI ===');

// Eski localStorage anahtarlarını kontrol et
const oldExpenses = localStorage.getItem('harcamalar');
const oldCards = localStorage.getItem('kredicardsi');
const oldPeople = localStorage.getItem('people');
const oldRegularPayments = localStorage.getItem('duzenliOdemeler');

if (oldExpenses || oldCards || oldPeople || oldRegularPayments) {
    console.log('ESKİ VERİLER BULUNDU! Kurtarma işlemi başlıyor...');
    
    // Auth system varsa ve kullanıcı giriş yaptıysa
    if (typeof authSystem !== 'undefined' && authSystem.currentUser) {
        console.log('Auth system var, kullanıcı:', authSystem.currentUser);
        
        // Eski verileri parse et
        const expenses = oldExpenses ? JSON.parse(oldExpenses) : [];
        const creditCards = oldCards ? JSON.parse(oldCards) : [];
        const people = oldPeople ? JSON.parse(oldPeople) : [];
        const regularPayments = oldRegularPayments ? JSON.parse(oldRegularPayments) : [];
        
        console.log('Kurtarılan veriler:');
        console.log('- Harcamalar:', expenses.length);
        console.log('- Kartlar:', creditCards.length);
        console.log('- Kişiler:', people.length);
        console.log('- Düzenli ödemeler:', regularPayments.length);
        
        // Current user'ın datasını güncelle
        if (!authSystem.users[authSystem.currentUser].data) {
            authSystem.users[authSystem.currentUser].data = {};
        }
        
        const userData = authSystem.users[authSystem.currentUser].data;
        
        // Sadece boşsa doldur (mevcut veriyi üzerine yazma)
        if (!userData.expenses || userData.expenses.length === 0) {
            userData.expenses = expenses;
        }
        if (!userData.creditCards || userData.creditCards.length === 0) {
            userData.creditCards = creditCards;
        }
        if (!userData.people || userData.people.length === 0) {
            userData.people = people;
        }
        if (!userData.regularPayments || userData.regularPayments.length === 0) {
            userData.regularPayments = regularPayments;
        }
        
        // Kaydet
        authSystem.saveUserData();
        
        // Global değişkenleri güncelle
        window.expenses = userData.expenses;
        window.creditCards = userData.creditCards;
        window.people = userData.people;
        window.regularPayments = userData.regularPayments;
        
        console.log('VERİLER BAŞARIYLA KURTARILDI VE KAYDEDILDI!');
        
        // Eski anahtarları temizle (isteğe bağlı)
        // localStorage.removeItem('harcamalar');
        // localStorage.removeItem('kredicardsi');
        // localStorage.removeItem('people');
        // localStorage.removeItem('duzenliOdemeler');
        
        // Sayfayı yenile ki veriler görünsün
        console.log('Sayfa yenileniyor...');
        setTimeout(() => location.reload(), 1000);
        
    } else {
        console.log('Auth system yok veya kullanıcı giriş yapmamış');
        
        // Direct migration - auth system olmadan
        if (!localStorage.getItem('expenses') && oldExpenses) {
            localStorage.setItem('expenses', oldExpenses);
            console.log('Harcamalar direkt kopyalandı');
        }
        if (!localStorage.getItem('creditCards') && oldCards) {
            localStorage.setItem('creditCards', oldCards);
            console.log('Kartlar direkt kopyalandı');
        }
        if (!localStorage.getItem('users') && oldPeople) {
            localStorage.setItem('users', oldPeople);
            console.log('Kişiler direkt kopyalandı');
        }
        if (!localStorage.getItem('regularPayments') && oldRegularPayments) {
            localStorage.setItem('regularPayments', oldRegularPayments);
            console.log('Düzenli ödemeler direkt kopyalandı');
        }
        
        location.reload();
    }
} else {
    console.log('Eski veriler bulunamadı veya zaten migration yapılmış');
    
    // Mevcut auth system durumunu kontrol et
    if (typeof authSystem !== 'undefined') {
        console.log('Auth system durumu:');
        console.log('- Current user:', authSystem.currentUser);
        console.log('- User data:', authSystem.currentUserData);
        
        if (authSystem.currentUser && authSystem.currentUserData) {
            console.log('Auth user data içeriği:');
            console.log('- Expenses:', authSystem.currentUserData.expenses?.length || 0);
            console.log('- Credit cards:', authSystem.currentUserData.creditCards?.length || 0);
            console.log('- People:', authSystem.currentUserData.people?.length || 0);
            console.log('- Regular payments:', authSystem.currentUserData.regularPayments?.length || 0);
        }
    }
}
