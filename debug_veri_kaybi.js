// Debug LocalStorage - Veri Kaybı Kontrolü
console.log('=== LOCALSTORAGE DEBUG ===');

// Tüm localStorage anahtarlarını listele
console.log('Tüm localStorage keys:', Object.keys(localStorage));

// Eski anahtarları kontrol et
const oldKeys = ['harcamalar', 'kredicardsi', 'people', 'duzenliOdemeler', 'regularPayments'];
oldKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
        console.log(`${key}:`, JSON.parse(data));
    } else {
        console.log(`${key}: YOK`);
    }
});

// Yeni anahtarları kontrol et
const newKeys = ['expenses', 'creditCards', 'users', 'app_users'];
newKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
        console.log(`${key}:`, JSON.parse(data));
    } else {
        console.log(`${key}: YOK`);
    }
});

// Auth system kontrolü
const authUsers = localStorage.getItem('app_users');
if (authUsers) {
    const users = JSON.parse(authUsers);
    console.log('Auth users:', users);
    Object.keys(users).forEach(username => {
        console.log(`User ${username} data:`, users[username]);
    });
}

console.log('=== DEBUG END ===');
