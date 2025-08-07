# 💳 Kredi Kartı Harcama Takip Sistemi

Modern, profesyonel ve kullanıcı dostu kredi kartı harcama takip uygulaması.

## ✨ Özellikler

### 🔐 Güvenlik
- Kullanıcı girişi ve kayıt sistemi
- Şifreli veri saklama
- İlk kurulum sihirbazı

### 💰 Harcama Yönetimi
- Çoklu kredi kartı desteği
- Taksitli ödeme takibi
- Düzenli ödeme yönetimi
- Gelişmiş filtreleme ve sıralama

### 📊 Analiz ve Raporlama
- Detaylı aylık özetler
- Kullanıcı bazında hesap durumu
- Görsel grafikler ve istatistikler
- Kart ve kullanıcı bazında analiz

### 🔧 Veri Yönetimi
- JSON formatında veri dışa/içe aktarma
- Otomatik yedekleme sistemi
- Kart ve kullanıcı yönetimi
- Test araçları

### 📱 Modern Teknoloji
- Progressive Web App (PWA) desteği
- Mobil uyumlu responsive tasarım
- Offline çalışma kapasitesi
- Temiz ve modern arayüz

## 🏗️ Teknik Yapı

### Dosya Organizasyonu
```
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
│   │   ├── utils.js          # Yardımcı fonksiyonlar
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

### Mimari Prensipleri
- ✅ **Modüler Yapı**: Her fonksiyon ayrı dosyalarda
- ✅ **Separation of Concerns**: CSS, JS, HTML ayrımı
- ✅ **Progressive Enhancement**: Temel özellikler önce
- ✅ **Mobile First**: Responsive tasarım
- ✅ **Performance Optimized**: Lazy loading, caching

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

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   # veya
   npm run serve
   ```

4. **Tarayıcıda açın:**
   ```
   http://localhost:8000
   ```

### NPM Komutları
```bash
npm run dev        # Geliştirme sunucusunu başlat
npm run serve      # Sunucuyu başlat (alternatif)
npm run preview    # Preview sunucusunu başlat
npm run build      # Build bilgisi (statik proje)
npm run lint       # Linting kurulum bilgisi
npm run format     # Formatlama kurulum bilgisi
```

### Manuel Çalıştırma
```bash
python -m http.server 8000
# veya herhangi bir HTTP server
```

## 📖 Kullanım Kılavuzu

### İlk Kurulum
1. Uygulamayı açın ve kayıt olun
2. Kurulum sihirbazını takip edin:
   - Kredi kartlarınızı ekleyin
   - Kullanıcıları tanımlayın
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

## 🔧 Geliştirici Notları

### Kod Stil Rehberi
- ES6+ JavaScript kullanın
- CSS custom properties tercih edin
- Modüler dosya organizasyonu
- Semantic HTML yapısı

### Debugging
- Browser DevTools Console logları
- Network tab için XHR requests
- Application tab için localStorage

### Performans İyileştirmeleri
- Lazy loading implemented
- CSS containment kullanımı
- Service Worker caching
- Debounced input handlers

## 🛡️ Güvenlik

- Şifreler browser'da şifrelenerek saklanır
- Veriler sadece localStorage'da tutulur
- No server-side data transmission
- XSS korumaları mevcuttur

## 📱 PWA Özellikleri

- **Offline Çalışma**: Service Worker ile
- **Install Edilebilir**: Desktop ve mobile
- **Push Notifications**: Ödeme hatırlatmaları
- **Background Sync**: Offline veri senkronizasyonu

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

**💡 İpucu**: Bu uygulama tamamen client-side çalışır, hiçbir sunucu kurulumuna ihtiyaç duymaz!