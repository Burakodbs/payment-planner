# 💳 Kredi Kartı Harcama Takip Sistemi

Modern, profesyonel ve kullanıcı dostu kredi kartı harcama takip uygulaması.

## 🏗️ Teknik Yapı

### Dosya Organizasyonu
```
payment-planner/

```text
payment-planner/
├── assets/
│   ├── css/
│   │   ├── variables.css      # CSS değişkenleri ve tema
│   │   ├── base.css          # Temel stiller ve reset
│   │   ├── layout.css        # Layout ve grid sistemler
│   │   ├── components.css    # UI bileşen stilleri
│   │   ├── utilities.css     # Yardımcı sınıflar
│   │   └── auth.css          # Kimlik doğrulama stilleri
│   ├── js/
│   │   ├── app.js            # Ana uygulama mantığı
│   │   ├── auth.js           # Kimlik doğrulama sistemi
│   │   ├── auth-ui.js        # Kimlik doğrulama UI
│   │   ├── data-manager.js   # Veri yönetimi ve filtreleme
│   │   ├── calculations.js   # Hesaplamalar ve finansal işlemler
│   │   ├── chart-manager.js  # Grafik ve görselleştirme
│   │   ├── utils.js          # Genel yardımcı + dashboard vb (düzenli ödeme logic'i ayrıldı)
│   │   ├── regular-payments.js # Düzenli ödeme yönetimi (CRUD, liste, otomatik üretim)
│   │   └── pages/           # Sayfa-özel JavaScript dosyaları
│   │       ├── dashboard.js
│   │       ├── harcama-ekle.js
│   │       ├── harcama-listesi.js
│   │       ├── hesaplar.js
│   │       ├── aylik-ozet.js
│   │       └── veri-yonetimi.js
│   └── icons/               # Uygulama ikonları
├── index.html               # Ana dashboard sayfası
├── harcama-ekle.html       # Harcama ekleme sayfası
├── harcama-listesi.html    # Harcama listesi ve filtreleme
├── hesaplar.html           # Hesap durumları
├── aylik-ozet.html         # Aylık özetler
├── veri-yonetimi.html      # Veri yönetimi ve ayarlar
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
└── package.json            # NPM yapılandırması
```
├── assets/
│   ├── css/
│   │   ├── variables.css      # CSS değişkenleri ve tema
│   ├── js/
│   │   ├── app.js            # Ana uygulama mantığı
│   │   ├── auth.js           # Kimlik doğrulama sistemi
│   │   ├── auth-ui.js        # Kimlik doğrulama UI
│   │   ├── data-manager.js   # Veri yönetimi ve filtreleme
│   │   ├── utils.js          # Genel yardımcı + dashboard vb (düzenli ödeme logic'i ayrıldı)
│   │   ├── regular-payments.js # Düzenli ödeme yönetimi (CRUD, liste, otomatik üretim)
│   │   └── pages/           # Sayfa-özel JavaScript dosyaları
│   │       ├── dashboard.js
│   │       ├── harcama-ekle.js
│   │       ├── harcama-listesi.js
│   │       ├── hesaplar.js
│   │       ├── aylik-ozet.js
│   │       └── veri-yonetimi.js
│   └── icons/               # Uygulama ikonları
├── index.html               # Ana dashboard sayfası
├── harcama-ekle.html       # Harcama ekleme sayfası
├── harcama-listesi.html    # Harcama listesi ve filtreleme
├── hesaplar.html           # Hesap durumları
├── aylik-ozet.html         # Aylık özetler
├── veri-yonetimi.html      # Veri yönetimi ve ayarlar
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
└── package.json            # NPM yapılandırması
```

### Teknoloji Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Charts**: Chart.js v4.4.1
- **PWA**: Service Worker, Web App Manifest
- **Development**: Python HTTP Server
- **Data Storage**: Browser localStorage

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- Node.js (v14+)
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)

### Kurulum Adımları

1. **Repository'yi klonlayın:**

   ```bash
   git clone [repository-url]
   cd payment-planner
   ```

1. **Bağımlılıkları yükleyin:**

   ```bash
   npm install
   ```

1. **Geliştirme sunucusunu başlatın:**

   ```bash
   npm run dev
   # veya
   npm run serve
   ```

1. **Tarayıcıda açın:**

   Tarayıcıda: <http://localhost:8000>

### NPM Komutları

```bash
npm run dev        # Geliştirme sunucusu
npm run serve      # Alternatif sunucu
npm run preview    # Preview
npm run build      # Statik build (bilgi amaçlı)
npm run lint       # Lint (konfig gereken)
npm run format     # Format (konfig gereken)
```

### Manuel Çalıştırma

```bash
python -m http.server 8000
# veya herhangi bir HTTP server
```

## 📖 Kullanım Kılavuzu

### İlk Kurulum

1. Uygulamayı açın ve kayıt olun
2. Kredi kartlarınızı ve kullanıcıları ekleyin
3. Kurulumu tamamlayın

### Harcama Ekleme

- **Hızlı Girdi**: Klavye kısayolları (1-5 tuşları)
- **Taksitli Ödemeler**: Taksit sayısını belirtin
- **Düzenli Ödemeler**: Otomatik tekrar eden ödemeler

### Raporlama

- **Aylık Özet**: Ay seçerek detaylı analiz
- **Hesap Durumu**: Kişi bazında borç-alacak
- **Filtreleme**: Tarih, kullanıcı, kart bazında filtreleme

### Veri Yönetimi

- **Yedekleme**: JSON formatında dışa aktarma
- **Geri Yükleme**: Yedek dosyalarını içe aktarma
- **Düzenli Ödemeler**: Elektrik, su, internet faturası

## 🤝 Katkı Sağlama

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

MIT License - detaylar için `LICENSE` dosyasını inceleyin.

## 🆘 Destek

Sorunlar için GitHub Issues kullanın veya iletişime geçin.

---

**💡 İpucu**: Bu uygulama tamamen client-side çalışır
