# JSON File-Based Storage System

Bu sistem, LocalStorage yerine her kullanıcı için ayrı JSON dosyaları kullanarak veri yönetimi sağlar.

## 🆕 Yeni Özellikler

### FileStorage Sistemi
- **IndexedDB Tabanlı**: Veriler tarayıcının IndexedDB'sinde saklanır
- **Kullanıcı Bazlı**: Her kullanıcı için ayrı JSON dosya yapısı
- **Otomatik Kaydetme**: Veri değişiklikleri otomatik olarak algılanır ve kaydedilir
- **Otomatik Yedekleme**: Her kayıt işleminde otomatik yedek dosyası indirilir

### Öne Çıkan Özellikler

#### 🔄 Otomatik Kaydetme
```javascript
// Veri değişikliği algılandığında
fileStorage.scheduleAutoSave('expenses');
// 2 saniye sonra otomatik kayıt
```

#### 📁 JSON Dosya Formatı
```javascript
{
  "username": "admin",
  "lastUpdated": "2025-08-15T10:30:00.000Z",
  "expenses": [...],
  "regularPayments": [...],
  "creditCards": [...],
  "people": [...],
  "settings": {
    "theme": "light"
  }
}
```

#### 💾 Otomatik Yedek İndirme
Her kaydetme işleminde `username-backup-YYYY-MM-DD.json` dosyası otomatik olarak Downloads klasörüne indirilir.

#### 🚑 Acil Kurtarma
Veri kaybı durumunda hardcoded yedek verilerden geri yükleme imkanı.

## 📋 Kullanım

### Giriş Yapma
```javascript
await authSystem.login('admin', 'admin123');
// FileStorage otomatik olarak başlatılır
```

### Veri Değişiklikleri
```javascript
// Herhangi bir veri değişikliği
expenses.push(newExpense);
// FileStorage otomatik olarak algılar ve kaydeder
```

### Manuel Kaydetme
```javascript
await fileStorage.saveUserData();
```

### İçe/Dışa Aktarma
- **Dışa Aktarma**: `exportData()` fonksiyonu otomatik yedek dosyası oluşturur
- **İçe Aktarma**: `importData()` fonksiyonu JSON dosyalarını okur ve verileri yükler

## 🔧 Teknik Detaylar

### IndexedDB Yapısı
- **Database**: `PaymentPlannerFiles`
- **Store**: `userFiles`
- **Key**: `username`
- **Value**: Tam kullanıcı verisi

### Veri İzleme
Proxy pattern kullanılarak array değişiklikleri gerçek zamanlı olarak izlenir:

```javascript
expenses = new Proxy(expenses, {
    set: (target, property, value) => {
        target[property] = value;
        fileStorage.scheduleAutoSave('expenses');
        return true;
    }
});
```

### Kaydetme Durumu
Sağ üst köşede gerçek zamanlı kaydetme durumu gösterilir:
- 🟡 **Değişiklikler kaydediliyor...** (Pending)
- 🟢 **Veriler kaydedildi** (Success)  
- 🔴 **Kaydetme hatası!** (Error)

## 🔄 Geriye Uyumluluk

Sistem hem yeni FileStorage hem de eski localStorage sistemini destekler:

```javascript
// FileStorage varsa kullan
if (window.fileStorage && window.fileStorage.currentUser) {
    await window.fileStorage.initUser(username);
} else {
    // Fallback: localStorage
    this.loadUserData();
}
```

## 📱 Sayfalar Arası Entegrasyon

Tüm HTML sayfalarında `file-storage.js` otomatik olarak yüklenir:
- `index.html`
- `templates/base.html` (diğer tüm sayfalar için)

## ⚡ Performans

- **Debounced Save**: Sürekli değişikliklerde kaydetme 2 saniye geciktirilir
- **Background Sync**: 30 saniyede bir otomatik kontrol
- **Lazy Loading**: Veriler sadece ihtiyaç duyulduğunda yüklenir

## 🛡️ Güvenlik

- **Session Kontrolü**: Sadece oturum açmış kullanıcılar veri kaydedebilir
- **Veri Validasyonu**: İçe aktarılan veriler doğrulanır
- **Format Conversion**: Eski Türkçe formatlar otomatik olarak dönüştürülür

## 🚀 Kullanım Senaryoları

### Yeni Kullanıcı
1. Giriş yap → FileStorage otomatik başlar
2. Veri gir → Otomatik kaydedilir
3. Sayfa kapat → Veriler güvende

### Mevcut Kullanıcı  
1. Giriş yap → Veriler IndexedDB'den yüklenir
2. Değişiklik yap → Otomatik algılanır ve kaydedilir
3. Yedek indirme → Her kayıtta otomatik

### Veri Transferi
1. **Dışa Aktar** → JSON dosyası indirilir
2. **İçe Aktar** → Başka cihazda dosyayı yükle
3. **Acil Durum** → Hardcoded yedekten kurtar

## 📊 Monitoring

Konsol logları ile detaylı monitoring:
```javascript
// Sistem başlatma
console.log('✅ FileStorage initialized for user:', username);

// Veri yükleme  
console.log('📊 User data loaded:', {
    expenses: 45,
    regularPayments: 4,
    creditCards: 5,
    people: 3
});

// Kaydetme
console.log('💾 Data saved successfully');

// Hata durumu
console.error('❌ Save error:', error);
```

Bu sistem sayesinde artık veriler daha güvenli, taşınabilir ve sürekli güncel tutulur! 🎉
