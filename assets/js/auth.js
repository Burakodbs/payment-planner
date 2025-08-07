// Kullanıcı Yetkilendirme Sistemi
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('app_users') || '{}');
        this.isFirstTime = !localStorage.getItem('app_initialized');
        this.init();
    }

    init() {
        this.checkAuth();
    }

    // Oturum kontrolü
    checkAuth() {
        const savedUser = localStorage.getItem('current_user');
        if (savedUser && this.users[savedUser]) {
            this.currentUser = savedUser;
            this.loadUserData();
            this.showMainApp();
        } else {
            this.showAuth();
        }
    }

    // Kullanıcı kaydı
    register(username, password, email = '') {
        if (!username || !password) {
            throw new Error('Kullanıcı adı ve şifre gereklidir');
        }

        if (this.users[username]) {
            throw new Error('Bu kullanıcı adı zaten kullanılıyor');
        }

        if (username.length < 3) {
            throw new Error('Kullanıcı adı en az 3 karakter olmalıdır');
        }

        if (password.length < 6) {
            throw new Error('Şifre en az 6 karakter olmalıdır');
        }

        // Basit şifre hash'i (gerçek uygulamada daha güvenli olmalı)
        const hashedPassword = btoa(password + username);

        this.users[username] = {
            password: hashedPassword,
            email: email,
            createdAt: new Date().toISOString(),
            settings: {
                theme: 'light' // Simple light theme
            },
            data: {
                harcamalar: [],
                duzenliOdemeler: [],
                kredikartlari: [],
                kisiler: []
            }
        };

        localStorage.setItem('app_users', JSON.stringify(this.users));
        return true;
    }

    // Kullanıcı girişi
    login(username, password) {
        if (!this.users[username]) {
            throw new Error('Kullanıcı bulunamadı');
        }

        const hashedPassword = btoa(password + username);
        if (this.users[username].password !== hashedPassword) {
            throw new Error('Hatalı şifre');
        }

        this.currentUser = username;
        localStorage.setItem('current_user', username);
        this.loadUserData();
        return true;
    }

    // Çıkış
    logout() {
        this.saveUserData();
        this.currentUser = null;
        localStorage.removeItem('current_user');
        this.showAuth();
    }

    // Kullanıcı verilerini yükle
    loadUserData() {
        if (!this.currentUser || !this.users[this.currentUser]) return;

        const userData = this.users[this.currentUser].data;
        
        // Global değişkenleri güncelle
        harcamalar = userData.harcamalar || [];
        duzenliOdemeler = userData.duzenliOdemeler || [];
        kredikartlari = userData.kredikartlari || [];
        kisiler = userData.kisiler || [];

        // Simple light theme - no theme loading needed
        // Theme management disabled - using simple default theme
    }

    // Kullanıcı verilerini kaydet
    saveUserData() {
        if (!this.currentUser || !this.users[this.currentUser]) return;

        this.users[this.currentUser].data = {
            harcamalar: harcamalar || [],
            duzenliOdemeler: duzenliOdemeler || [],
            kredikartlari: kredikartlari || [],
            kisiler: kisiler || []
        };

        this.users[this.currentUser].settings = {
            theme: 'light' // Simple light theme
        };

        localStorage.setItem('app_users', JSON.stringify(this.users));
    }

    // Ana uygulamayı göster
    showMainApp() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // Kullanıcı bilgisini göster
        const userInfo = document.getElementById('currentUserInfo');
        if (userInfo) {
            userInfo.textContent = this.currentUser;
        }

        // Tema sistemini başlat
        if (typeof initializeTheme === 'function') {
            initializeTheme();
        }
        
        // UI güncellemeleri
        if (typeof updateCardOptions === 'function') updateCardOptions();
        if (typeof updateUserOptions === 'function') updateUserOptions();

        // Sayfa-özel içerik güncellemelerini tetikle
        setTimeout(() => {
            this.triggerPageUpdates();
        }, 100);

        // Eğer yeni kullanıcıysa setup wizard'ı göster
        if (this.isFirstTimeUser()) {
            this.showSetupWizard();
        }
    }

    // Sayfa-özel güncellemeleri tetikle
    triggerPageUpdates() {
        
        // Data migration işlemi
        if (typeof migrateDuzenliOdemeData === 'function') {
            try {
                migrateDuzenliOdemeData();
            } catch (error) {
                console.error('❌ Migration hatası:', error);
            }
        }
        
        // Dashboard güncellemeleri
        if (typeof updateDashboard === 'function') {
            try {
                updateDashboard();
            } catch (error) {
                console.error('❌ Dashboard güncelleme hatası:', error);
            }
        }
        
        // Harcama tablosu güncellemeleri
        if (typeof updateHarcamaTable === 'function') {
            updateHarcamaTable();
        }
        
        // Hesaplar güncellemeleri
        if (typeof updateHesaplar === 'function') {
            updateHesaplar();
        }
        
        // Aylık özet güncellemeleri
        if (typeof updateAylikOzet === 'function') {
            try {
                const ozetTarih = document.getElementById('ozet_tarih');
                if (ozetTarih && !ozetTarih.value) {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    ozetTarih.value = currentMonth;
                }
                updateAylikOzet();
            } catch (error) {
                console.error('❌ Aylık özet güncelleme hatası:', error);
            }
        }
        
        // Veri yönetimi güncellemeleri (istatistikler kaldırıldı)
        if (typeof updateDuzenliOdemelerListesi === 'function') {
            try {
                updateDuzenliOdemelerListesi();
            } catch (error) {
                console.error('❌ Düzenli ödemeler güncelleme hatası:', error);
            }
        }
        if (typeof updateCardAndUserManagement === 'function') {
            try {
                updateCardAndUserManagement();
            } catch (error) {
                console.error('❌ Kart ve kullanıcı yönetimi güncelleme hatası:', error);
            }
        }

        
    }

    // Auth ekranını göster
    showAuth() {
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('setupWizard').style.display = 'none';
    }

    // İlk kez kullanıcı kontrolü
    isFirstTimeUser() {
        return this.currentUser && 
               this.users[this.currentUser] && 
               this.users[this.currentUser].data.kredikartlari.length === 0 &&
               this.users[this.currentUser].data.kisiler.length === 0;
    }

    // Setup wizard'ı göster
    showSetupWizard() {
        document.getElementById('setupWizard').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
    }

    // Setup'ı tamamla
    completeSetup(cards, users) {
        if (!this.currentUser) return;

        this.users[this.currentUser].data.kredikartlari = cards;
        this.users[this.currentUser].data.kisiler = users;
        
        kredikartlari = cards;
        kisiler = users;
        
        this.saveUserData();
        localStorage.setItem('app_initialized', 'true');
        
        document.getElementById('setupWizard').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // UI'ları güncelle
        updateCardOptions();
        updateUserOptions();
    }

    // Mevcut kullanıcı adını al
    getCurrentUser() {
        return this.currentUser;
    }

    // Otomatik kaydetme için interval
    startAutoSave() {
        setInterval(() => {
            if (this.currentUser) {
                this.saveUserData();
            }
        }, 30000); // 30 saniyede bir kaydet
    }
}

// Global auth instance
let authSystem;

// Sayfa yüklendiğinde auth sistemini başlat
document.addEventListener('DOMContentLoaded', function() {
    authSystem = new AuthSystem();
    authSystem.startAutoSave();
});

// Sayfa kapanmadan önce verileri kaydet
window.addEventListener('beforeunload', function() {
    if (authSystem && authSystem.currentUser) {
        authSystem.saveUserData();
    }
});