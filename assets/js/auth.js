// Kullanıcı Yetkilendirme Sistemi
class AuthSystem {
    constructor() {
        console.log('AuthSystem: Initializing...');
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('app_users') || '{}');
        this.isFirstTime = !localStorage.getItem('app_initialized');
        this.init();
        console.log('AuthSystem: Constructor completed');
    }

    init() {
        console.log('AuthSystem: init() called');
        this.checkAuth();
    }

    // Oturum kontrolü
    checkAuth() {
        console.log('AuthSystem: checkAuth() called');
        const savedUser = localStorage.getItem('current_user');
        console.log('AuthSystem: savedUser =', savedUser);
        
        if (savedUser && this.users[savedUser]) {
            console.log('AuthSystem: Found saved user, loading main app');
            this.currentUser = savedUser;
            this.loadUserData();
            this.showMainApp();
        } else {
            console.log('AuthSystem: No saved user, showing auth screen');
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
        console.log('AuthSystem: showMainApp() called');
        
        // Hangi sayfada olduğumuzu kontrol et
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log('AuthSystem: Current page =', currentPage);
        
        // Sadece ana sayfa (index.html) için dashboard içeriği oluştur
        if (currentPage === 'index.html' || currentPage === '') {
            const dashboardContent = `
                <div class="summary-cards">
                    <div class="summary-card">
                        <h3>💳 Toplam Harcama</h3>
                        <div class="amount" id="totalExpense">0 TL</div>
                        <div class="sub-info">Toplam kredi kartı harcaması</div>
                    </div>
                    <div class="summary-card">
                        <h3>📅 Bu Ay</h3>
                        <div class="amount" id="thisMonthExpense">0 TL</div>
                        <div class="sub-info">Bu ayın toplam harcaması</div>
                    </div>
                    <div class="summary-card">
                        <h3>⏳ Gelecek Taksitler</h3>
                        <div class="amount" id="totalFuturePayments">0 TL</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 32px;">
                    <div class="summary-card">
                        <h3>📊 Son 6 Ay Trend</h3>
                        <canvas id="dashboardTrendChart"></canvas>
                    </div>
                    <div class="summary-card">
                        <h3>👥 Bu Ay Kişi Bazında Harcamalar</h3>
                        <canvas id="dashboardUserChart"></canvas>
                    </div>
                </div>

                <div class="summary-cards">
                    <div class="summary-card">
                        <h3>📋 Son Harcamalar</h3>
                        <div id="recentExpensesList"></div>
                    </div>
                    <div class="summary-card">
                        <h3>🔔 Yaklaşan Taksitler</h3>
                        <div id="upcomingInstallmentsList"></div>
                    </div>
                </div>
            `;
            
            // Component sistemi ile layout oluştur
            if (typeof initializeCommonComponents === 'function') {
                console.log('AuthSystem: Using component system for dashboard');
                initializeCommonComponents('dashboard', dashboardContent);
            }
        }
        
        const authContainer = document.getElementById('authContainer');
        const mainApp = document.getElementById('mainApp');
        
        if (authContainer) authContainer.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        
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
        
        // İstatistikler güncellemeleri
        if (typeof updateStatistics === 'function') {
            try {
                updateStatistics();
            } catch (error) {
                console.error('❌ İstatistikler güncelleme hatası:', error);
            }
        }

        
    }

    // Auth ekranını göster
    showAuth() {
        const authContainer = document.getElementById('authContainer');
        const mainApp = document.getElementById('mainApp');
        const setupWizard = document.getElementById('setupWizard');
        
        if (authContainer) authContainer.style.display = 'block';
        if (mainApp) mainApp.style.display = 'none';
        if (setupWizard) setupWizard.style.display = 'none';
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
        const setupWizard = document.getElementById('setupWizard');
        const mainApp = document.getElementById('mainApp');
        
        if (setupWizard) setupWizard.style.display = 'block';
        if (mainApp) mainApp.style.display = 'none';
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
        
        const setupWizard = document.getElementById('setupWizard');
        const mainApp = document.getElementById('mainApp');
        
        if (setupWizard) setupWizard.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        
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
    console.log('Auth.js: DOM loaded, starting auth system...');
    authSystem = new AuthSystem();
    authSystem.startAutoSave();
    console.log('Auth.js: Auth system started');
});

// Sayfa kapanmadan önce verileri kaydet
window.addEventListener('beforeunload', function() {
    if (authSystem && authSystem.currentUser) {
        authSystem.saveUserData();
    }
});