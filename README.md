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
│   │   ├── base.css          # Temel stiller ve reset
│   │   ├── layout.css        # Layout ve grid sistemler
│   │   ├── components.css    # UI bileşen stilleri
│   │   ├── utilities.css     # Yardımcı sınıflar
│   │   └── auth.css          # Kimlik doğrulama stilleri
│   ├── js/
│   │   ├── app.js            # Ana uygulama mantığı
│   │   ├── auth.js           # Kimlik doğrulama sistemi
│   │   ├── file-storage.js   # JSON dosya tabanlı veri depolama
│   │   ├── data-manager.js   # Veri yönetimi ve filtreleme
│   │   ├── calculations.js   # Hesaplamalar ve finansal işlemler
│   │   ├── chart-manager.js  # Grafik ve görselleştirme
│   │   ├── utils.js          # Genel yardımcı fonksiyonlar
│   │   └── pages/           # Sayfa-özel JavaScript dosyaları
│   │       ├── dashboard.js
│   │       ├── data-management.js
│   │       ├── expense-list.js
│   │       ├── accounts.js
│   │       └── monthly-summary.js
│   └── icons/               # Uygulama ikonları
├── backups/                 # Otomatik yedek dosyaları (gitignore'da)
│   ├── admin-backup-2025-08-15.json
│   ├── admin-backup-2025-08-14.json
│   └── README.md           # Backup sistemi açıklaması
├── index.html               # Ana dashboard sayfası
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
└── .gitignore              # Git ignore kuralları (backups dahil)
```

### Teknoloji Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Charts**: Chart.js v4.4.1
- **Data Storage**: IndexedDB + JSON file-based backup system
- **Authentication**: Multi-user system with session management
- **PWA**: Service Worker, Web App Manifest
- **Development**: Python HTTP Server

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

1. **GitHub'dan indirin:**
   ```bash
   git clone https://github.com/Burakodbs/payment-planner.git
   cd payment-planner
   ```

2. **Tarayıcıda açın ve giriş yapın:**
   - Admin kullanıcı: `admin` / `admin123`
   - Sistem otomatik olarak boş veri yapısı oluşturur

3. **İlk verilerinizi ekleyin:**
   - Kredi kartlarınızı ekleyin
   - Kişilerinizi tanımlayın
   - İlk harcamalarınızı kaydedin

### 💾 Yedekleme Sistemi

#### Otomatik Yedekleme
- Her giriş ve veri kaydetmede otomatik yedek oluşturulur
- Yedek dosyalar Downloads klasörüne indirilir
- `admin-backup-YYYY-MM-DD.json` formatında adlandırılır

#### Manuel Yedekleme
1. **Veri Yönetimi** sayfasına gidin
2. **"💾 Yedek Dosyası Oluştur"** butonuna tıklayın
3. Dosyayı `backups/` klasörüne taşıyın (önerilen)

#### Veri Geri Yükleme
1. **Veri Yönetimi** → **"📂 Yedeği Geri Yükle"**
2. JSON dosyasını seçin
3. Veriler otomatik olarak yüklenir

#### Bilgisayar Arası Taşıma
```bash
# Eski bilgisayar
1. Veri Yönetimi → Yedek Oluştur → JSON dosyasını kaydet

# Yeni bilgisayar  
1. GitHub'dan projeyi indir
2. JSON dosyasını backups/ klasörüne kopyala
3. Veri Yönetimi → Yedeği Geri Yükle → JSON seç
```

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
