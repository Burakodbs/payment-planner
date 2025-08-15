// Gelişmiş Kullanıcı Yetkilendirme Sistemi
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('app_users') || '{}');
        this.sessions = JSON.parse(localStorage.getItem('app_sessions') || '{}');
        this.loginAttempts = JSON.parse(localStorage.getItem('login_attempts') || '{}');
        this.isFirstTime = !localStorage.getItem('app_initialized');
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 saat
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 dakika
    // Global debug bayrağı (window.APP_DEBUG true ise ayrıntılı log açılır)
    this.debug = !!window.APP_DEBUG;
        this.init();
    }

    init() {
        this.migrateOldUserData();
        this.createAdminUser();
        this.cleanExpiredSessions();
        this.checkAuth();
    }

    createAdminUser() {
        if (!this.users['admin']) {
            const adminPassword = this.generateSecureHash('admin123', 'admin');
            this.users['admin'] = {
                password: adminPassword,
                email: 'admin@paymentplanner.com',
                role: 'admin',
                createdAt: new Date().toISOString(),
                settings: {
                    theme: 'light'
                },
                data: {
                    expenses: [],
                    regularPayments: [],
                    creditCards: [],
                    people: []
                }
            };
            localStorage.setItem('app_users', JSON.stringify(this.users));
        }
    }

    // Eski kullanıcı datalerini yeni sisteme geçir
    migrateOldUserData() {
        // Eski current_user kontrolü
        const oldCurrentUser = localStorage.getItem('current_user');
        
        if (oldCurrentUser && this.users[oldCurrentUser]) {
            // debug: mevcut kullanıcı datasi bulundu
            
            // Eski kullanıcı datasi varsa yeni formata çevir
            const user = this.users[oldCurrentUser];
            
            // Eski format kontrolü - role yoksa ekle
            if (!user.role) {
                user.role = 'user';
                // debug: rol eklendi
            }
            
            // CreatedBy alanını add(migration)
            if (!user.createdBy) {
                user.createdBy = 'migration';
            }
            
            // Setup tamamlanmış olarak işaretle
            user.setupCompleted = true;
            
            // Eski şifre formatını kontrol et (btoa ile hash'lenmişse)
            if (user.password && !user.password.includes('payment_planner_secret_key')) {
                // Eski btoa formatından yeni güvenli formata geçir
                // Not: Eski şifre bilinmediği için varsayılan şifre atayacağız
                console.warn('⚠️ Eski şifre formatı tespit edildi. Varsayılan şifre atanıyor.');
                user.password = this.generateSecureHash('123456', oldCurrentUser);
                // debug: default şifre atandı
            }
            
            // Eksik alanları tamamla
            if (!user.createdAt) {
                user.createdAt = new Date().toISOString();
            }
            
            if (!user.settings) {
                user.settings = { theme: 'light' };
            }
            
            // Verileri kaydet
            this.users[oldCurrentUser] = user;
            localStorage.setItem('app_users', JSON.stringify(this.users));
            
            // Eski current_user kaydını temizle
            localStorage.removeItem('current_user');
            
            // debug: kullanıcı datasi güncellendi
            
            // Kullanıcıya bilgi ver
            setTimeout(() => {
                if (document.getElementById('authContainer').style.display !== 'none') {
                    alert(`🎉 Mevcut kullanıcınız (${oldCurrentUser}) yeni sisteme aktarıldı!\n\n` +
                          `🔑 Yeni şifreniz: 123456\n\n` +
                          `Güvenlik için lütfen şifrenizi değiştirin.`);
                }
            }, 1000);
        }
        
        // Diğer eski dataleri kontrol et
        this.checkAndMigrateGlobalData();
    }

    // Global dataleri kontrol et ve kullanıcı hesabına aktar
    checkAndMigrateGlobalData() {
        // Eğer global dataler varsa ve hiçbir kullanıcı bunlara sahip değilse
        const globalHarcamalar = JSON.parse(localStorage.getItem('expenses') || '[]');
        const globalDuzenliOdemeler = JSON.parse(localStorage.getItem('regularPayments') || '[]');
        const globalKredicardsi = JSON.parse(localStorage.getItem('creditCards') || '[]');
        const globalKisiler = JSON.parse(localStorage.getItem('people') || '[]');
        
    // debug: migration kontrolü
    // if (this.debug) console.log('migration-check', { globalHarcamalar: globalHarcamalar.length, globalDuzenliOdemeler: globalDuzenliOdemeler.length, globalKredicardsi: globalKredicardsi.length, globalKisiler: globalKisiler.length });
        
        const hasGlobalData = globalHarcamalar.length > 0 || 
                            globalDuzenliOdemeler.length > 0 || 
                            globalKredicardsi.length > 0 || 
                            globalKisiler.length > 0;
        
        if (hasGlobalData) {
            // debug: global dataler migration başlıyor
            
            // İlk kullanıcı bulunursa ona aktar, yoksa 'migrated_user' oluştur
            let targetUser = Object.keys(this.users).find(u => u !== 'admin');
            
            if (!targetUser) {
                // Yeni kullanıcı oluştur
                targetUser = 'migrated_user';
                this.users[targetUser] = {
                    password: this.generateSecureHash('123456', targetUser),
                    email: 'migrated@paymentplanner.com',
                    role: 'user',
                    createdAt: new Date().toISOString(),
                    settings: { theme: 'light' },
                    data: {
                        expenses: [],
                        regularPayments: [],
                        creditCards: [],
                        people: []
                    }
                };
                // debug: migration user oluşturuldu
            }
            
            // Verileri aktar - bütün dataler akıtırılsın
            // debug: data aktarımı başlıyor
            this.users[targetUser].data = {
                expenses: globalHarcamalar,
                regularPayments: globalDuzenliOdemeler,
                creditCards: globalKredicardsi,
                people: globalKisiler
            };
            
            // debug: aktarılan data özeti
            // if (this.debug) console.log('migration-transfer', { expenses: globalHarcamalar.length, regularPayments: globalDuzenliOdemeler.length, creditCards: globalKredicardsi.length, people: globalKisiler.length });
            
            // Global dataleri temizle
            localStorage.removeItem('expenses');
            localStorage.removeItem('regularPayments');
            localStorage.removeItem('creditCards');
            localStorage.removeItem('people');
            
            // Güncellenmiş kullanıcı datalerini kaydet
            localStorage.setItem('app_users', JSON.stringify(this.users));
            
            // Harcamalardan card ve kişi bilgilerini çıkar
            this.extractDataFromHarcamalar(targetUser);
            
            // debug: migration tamamlandı
            
            setTimeout(() => {
                alert(`📊 Mevcut dataleriniz "${targetUser}" hesabına aktarıldı!\n\n` +
                      `🔑 Giriş bilgileri: ${targetUser} / 123456\n\n` +
                      `Lütfen bu bilgilerle giriş yapın ve şifrenizi değiştirin.`);
            }, 1500);
        } else {
            // debug: migration yapılacak data yok
            
            // Global data yoksa da mevcut kullanıcının expensesını kontrol et
            if (this.currentUser) {
                this.extractDataFromHarcamalar(this.currentUser);
            }
        }
    }

    // Harcamalardan card ve kişi bilgilerini çıkar
    extractDataFromHarcamalar(username) {
        const userKey = `app_user_${username}`;
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        
        if (userData.expenses && userData.expenses.length > 0) {
            // debug: expense taraması
            
            // Kredi cardsını çıkar
            const uniqueCards = [...new Set(userData.expenses
                .filter(h => h.card && h.card.trim() !== '' && h.card !== 'Nakit')
                .map(h => h.card.trim()))];
            
            // Kişileri çıkar
            const uniquePeople = [...new Set(userData.expenses
                .filter(h => h.person && h.person.trim() !== '')
                .map(h => h.person.trim()))];
            
            // debug: çıkarılan card/kullanıcı listeleri
            
            // Mevcut dataleri güncelle
            if (!userData.creditCards || userData.creditCards.length === 0) {
                userData.creditCards = uniqueCards;
            }
            if (!userData.people || userData.people.length === 0) {
                userData.people = uniquePeople;
            }
            
            // Kaydet
            localStorage.setItem(userKey, JSON.stringify(userData));
            
            // Global dataleri de güncelle
            if (this.currentUser === username) {
                this.currentUserData = userData;
                // debug: current user data güncellendi
                
                // Dropdown'ları güncelle
                setTimeout(() => {
                    if (typeof updateCardOptions === 'function') {
                        updateCardOptions();
                    }
                    if (typeof updateUserOptions === 'function') {
                        updateUserOptions();
                    }
                }, 100);
            }
        }
    }

    // Güvenli hash fonksiyonu
    generateSecureHash(password, salt) {
        // Basit ama güvenli hash (gerçek uygulamada bcrypt kullanılmalı)
        let hash = 0;
        const combined = password + salt + 'payment_planner_secret_key_2025';
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit integer'a dönüştür
        }
        return btoa(hash.toString() + salt);
    }

    // Session temizliği
    cleanExpiredSessions() {
        const now = new Date().getTime();
        for (const sessionId in this.sessions) {
            if (now - this.sessions[sessionId].timestamp > this.sessionTimeout) {
                delete this.sessions[sessionId];
            }
        }
        localStorage.setItem('app_sessions', JSON.stringify(this.sessions));
    }

    // Oturum kontrolü
    checkAuth() {
        const sessionId = localStorage.getItem('session_id');
        if (sessionId && this.sessions[sessionId]) {
            const session = this.sessions[sessionId];
            const now = new Date().getTime();
            
            if (now - session.timestamp < this.sessionTimeout) {
                this.currentUser = session.username;
                // Session'ı yenile
                session.timestamp = now;
                localStorage.setItem('app_sessions', JSON.stringify(this.sessions));
                this.loadUserData();
                
                if (this.users[this.currentUser].role === 'admin') {
                    this.showAdminPanel();
                } else {
                    this.showAuthenticatedContent();
                }
                return;
            } else {
                // Session süresi dolmuş
                this.logout();
                return;
            }
        }
        this.showAuth();
    }

    // Giriş denemesi kontrolü
    isAccountLocked(username) {
        const attempts = this.loginAttempts[username];
        if (!attempts) return false;
        
        const now = new Date().getTime();
        if (attempts.count >= this.maxLoginAttempts && 
            now - attempts.lastAttempt < this.lockoutDuration) {
            const remainingTime = Math.ceil((this.lockoutDuration - (now - attempts.lastAttempt)) / 60000);
            return { locked: true, remainingMinutes: remainingTime };
        }
        return { locked: false };
    }

    // Giriş denemesi kaydet
    recordLoginAttempt(username, success) {
        if (!this.loginAttempts[username]) {
            this.loginAttempts[username] = { count: 0, lastAttempt: 0 };
        }
        
        if (success) {
            delete this.loginAttempts[username];
        } else {
            this.loginAttempts[username].count++;
            this.loginAttempts[username].lastAttempt = new Date().getTime();
        }
        
        localStorage.setItem('login_attempts', JSON.stringify(this.loginAttempts));
    }

    // Admin kullanıcısı oluşturma (sadece admin yapabilir)
    createUser(username, password, email = '', role = 'user') {
        if (!this.currentUser || this.users[this.currentUser].role !== 'admin') {
            throw new Error('Bu işlem için admin yetperson gerekli');
        }

        if (!username || !password) {
            throw new Error('Kullanıcı adı ve şifre gereklidir');
        }

        if (this.users[username]) {
            throw new Error('Bu kullanıcı adı zaten kullanılıyor');
        }

        if (username.length < 3) {
            throw new Error('Kullanıcı adı en az 3 karakter olmalıdır');
        }

        if (password.length < 8) {
            throw new Error('Şifre en az 8 karakter olmalıdır');
        }

        // Şifre karmaşıklık kontrolü
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
            throw new Error('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir');
        }

        const hashedPassword = this.generateSecureHash(password, username);

        this.users[username] = {
            password: hashedPassword,
            email: email,
            role: role,
            createdAt: new Date().toISOString(),
            createdBy: 'admin',
            setupCompleted: false,
            settings: {
                theme: 'light'
            },
            data: {
                expenses: [],
                regularPayments: [],
                creditCards: [],
                people: []
            }
        };

        localStorage.setItem('app_users', JSON.stringify(this.users));
        return true;
    }

    // Kullanıcı kaydı (eski fonksiyon - devre dışı)
    register(username, password, email = '') {
        throw new Error('Yeni kullanıcı kaydı sadece admin tarafından yapılabilir');
    }

    // Kullanıcı girişi
    async login(username, password) {
        if (!username || !password) {
            throw new Error('Kullanıcı adı ve şifre gereklidir');
        }

        // Hesap kilitli mi kontrol et
        const lockStatus = this.isAccountLocked(username);
        if (lockStatus.locked) {
            throw new Error(`Hesap geçici olarak kilitli. ${lockStatus.remainingMinutes} dakika sonra tekrar deneyin.`);
        }

        if (!this.users[username]) {
            this.recordLoginAttempt(username, false);
            throw new Error('Kullanıcı bulunamadı');
        }

        const hashedPassword = this.generateSecureHash(password, username);
        if (this.users[username].password !== hashedPassword) {
            this.recordLoginAttempt(username, false);
            const attempts = this.loginAttempts[username]?.count || 0;
            const remaining = this.maxLoginAttempts - attempts;
            throw new Error(`Hatalı şifre. ${remaining} deneme hakkınız kaldı.`);
        }

        // Başarılı giriş
        this.recordLoginAttempt(username, true);
        this.currentUser = username;
        
        // Session oluştur
        const sessionId = this.generateSessionId();
        this.sessions[sessionId] = {
            username: username,
            timestamp: new Date().getTime(),
            userAgent: navigator.userAgent,
            ip: 'localhost' // Gerçek uygulamada IP adresi alınmalı
        };
        
        localStorage.setItem('session_id', sessionId);
        localStorage.setItem('app_sessions', JSON.stringify(this.sessions));
        
        // File storage sistemini başlat
        if (window.fileStorage) {
            await window.fileStorage.initUser(username);
        } else {
            // Fallback: localStorage'dan yükle
            this.loadUserData();
        }
        return true;
    }

    // Session ID oluştur
    generateSessionId() {
        return btoa(Date.now() + Math.random() + navigator.userAgent).replace(/[^a-zA-Z0-9]/g, '');
    }

    // Çıkış
    logout() {
        // File storage'dan çıkış yap
        if (window.fileStorage) {
            window.fileStorage.logout();
        } else {
            // Fallback: localStorage'a kaydet
            this.saveUserData();
        }
        
        // Session'ı temizle
        const sessionId = localStorage.getItem('session_id');
        if (sessionId && this.sessions[sessionId]) {
            delete this.sessions[sessionId];
            localStorage.setItem('app_sessions', JSON.stringify(this.sessions));
        }
        
        localStorage.removeItem('session_id');
        this.currentUser = null;
        this.showAuth();
    }

    // Kullanıcı datalerini yükle
    loadUserData() {
        if (!this.currentUser || !this.users[this.currentUser]) return;

        const userData = this.users[this.currentUser].data;

        // Global değişkenleri güncelle - güvenli şekilde
        if (typeof expenses !== 'undefined') {
            expenses = userData.expenses || [];
        } else {
            // Global değişken henüz tanımlı değilse window'da tanımla
            window.expenses = userData.expenses || [];
        }
        
        if (typeof regularPayments !== 'undefined') {
            regularPayments = userData.regularPayments || [];
        } else {
            window.regularPayments = userData.regularPayments || [];
        }
        
        if (typeof creditCards !== 'undefined') {
            creditCards = userData.creditCards || [];
        } else {
            window.creditCards = userData.creditCards || [];
        }
        
        if (typeof people !== 'undefined') {
            people = userData.people || [];
        } else {
            window.people = userData.people || [];
        }

        // currentUserData property'sini de güncelle (uyumluluk için)
        this.currentUserData = userData;
        if (this.debug) {
            console.log('user-data-loaded', {
                expenses: userData.expenses?.length || 0,
                regularPayments: userData.regularPayments?.length || 0,
                creditCards: userData.creditCards?.length || 0,
                people: userData.people?.length || 0
            });
        }

        // Simple light theme - no theme loading needed
        // Theme management disabled - using simple default theme

        // Mevcut expensesdan card ve kullanıcı çıkar (eksikse)
        try {
            this.ensureCardUserExtraction();
        } catch (e) {
            console.warn('Kart/kullanıcı çıkarma hatası:', e);
        }
    }

    // Kullanıcı datalerini kaydet
    saveUserData() {
        if (!this.currentUser || !this.users[this.currentUser]) return;

        // File storage varsa onu kullan
        if (window.fileStorage && window.fileStorage.currentUser) {
            // File storage kendi kaydetme sistemini kullanacak
            window.fileStorage.scheduleAutoSave('user_action');
            return;
        }

        // Fallback: localStorage'a kaydet
        this.users[this.currentUser].data = {
            expenses: expenses || [],
            regularPayments: regularPayments || [],
            creditCards: creditCards || [],
            people: people || []
        };

        this.users[this.currentUser].settings = {
            theme: 'light' // Simple light theme
        };

        localStorage.setItem('app_users', JSON.stringify(this.users));
    }

    // Harcamalardan eksik card ve kullanıcıları otomatik çıkar
    ensureCardUserExtraction() {
        if (!Array.isArray(expenses)) return;

        const existingCards = new Set(creditCards || []);
        const existingUsers = new Set(people || []);
        let added = false;

        expenses.forEach(h => {
            if (h && h.card) {
                const k = String(h.card).trim();
                if (k && k !== 'Nakit' && !existingCards.has(k)) {
                    existingCards.add(k);
                    creditCards.push(k);
                    added = true;
                }
            }
            if (h && h.person) {
                const u = String(h.person).trim();
                if (u && !existingUsers.has(u)) {
                    existingUsers.add(u);
                    people.push(u);
                    added = true;
                }
            }
        });

        if (added) {
            // debug: yeni card/kullanıcı çıkarıldı
            this.saveUserData();
            if (typeof updateCardOptions === 'function') updateCardOptions();
            if (typeof updateUserOptions === 'function') updateUserOptions();
            if (typeof updateCardAndUserManagement === 'function') updateCardAndUserManagement();
        }
    }

    // Admin panelini göster
    showAdminPanel() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';

        // Admin kullanıcı bilgisini göster
        const adminInfo = document.getElementById('currentAdminInfo');
        if (adminInfo) {
            adminInfo.textContent = this.currentUser;
        }

        // Kullanıcı listesini güncelle
        this.updateUsersList();
    }

    // Kimlik doğrulanmış içeriği göster (tüm sayfalar için)
    showAuthenticatedContent() {
        // Auth container'ı gizle
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.style.display = 'none';
        }

        // Admin panelini gizle
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'none';
        }

        // Ana sayfa mı kontrol et (sadece index.html'de adminPanel var)
        const mainApp = document.getElementById('mainApp');
        
        if (mainApp && adminPanel) {
            this.showMainApp();
            return;
        } else if (mainApp) {
            this.showNormalPageContent();
            return;
        }
    }

    // Normal sayfa içeriğini göster (index.html dışındaki sayfalar)
    showNormalPageContent() {
        // Ana uygulamayı göster
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.display = 'block';
        }

        // Kullanıcı bilgisini güncelle (eğer header varsa)
        const userInfo = document.getElementById('currentUserInfo');
        if (userInfo) {
            userInfo.textContent = this.currentUser;
        }

        // Tema sistemini başlat
        if (typeof initializeTheme === 'function') {
            initializeTheme();
        }

        // UI güncellemeleri - önce hemen, sonra geciktirilmiş
        this.updateUIElements();

        // Sayfa-özel içerik güncellemelerini tetikle
        setTimeout(() => {
            this.triggerPageUpdates();
            // Dropdown'ları yeniden güncelle
            this.updateUIElements();
        }, 100);
    }

    // UI elementlerini güncelle
    updateUIElements() {
        if (typeof updateCardOptions === 'function') {
            updateCardOptions();
        }
        if (typeof updateUserOptions === 'function') {
            updateUserOptions();
        }
    }

    // Kullanıcıları listele
    updateUsersList() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        const users = Object.keys(this.users).filter(username => username !== 'admin');
        
        if (users.length === 0) {
            usersList.innerHTML = '<div class="no-data">Henüz kullanıcı bulunmuyor</div>';
            return;
        }

        usersList.innerHTML = users.map(username => {
            const user = this.users[username];
            const isOnline = Object.values(this.sessions).some(session => session.username === username);
            const loginAttempts = this.loginAttempts[username] || { count: 0 };
            
            return `
                <div class="user-item">
                    <div class="user-info">
                        <h4>${username} ${isOnline ? '🟢' : '⚫'}</h4>
                        <p>${user.email || 'E-posta yok'}</p>
                        <small>Oluşturulma: ${new Date(user.createdAt).toLocaleDateString('tr-TR')}</small>
                        ${loginAttempts.count > 0 ? `<small style="color: var(--danger);">Başarısız giriş: ${loginAttempts.count}</small>` : ''}
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-warning btn-sm" onclick="resetUserPassword('${username}')">
                            🔑 Şifre Sıfırla
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="authSystem.deleteUser('${username}')">
                            🗑️ Sil
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Kullanıcı sil
    deleteUser(username) {
        if (!this.currentUser || this.users[this.currentUser].role !== 'admin') {
            throw new Error('Bu işlem için admin yetperson gerekli');
        }

        if (username === 'admin') {
            throw new Error('Admin kullanıcısı silinemez');
        }

        if (confirm(`${username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
            delete this.users[username];
            localStorage.setItem('app_users', JSON.stringify(this.users));
            this.updateUsersList();
        }
    }

    // Ana uygulamayı göster  
    showMainApp() {
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.style.display = 'none';
        }
        
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'none';
        }
        
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.display = 'block';
        }

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
        this.updateUIElements();

        // Dashboard özel güncellemeleri
        setTimeout(() => {
            this.triggerPageUpdates();
            this.updateUIElements(); // Dropdown'ları yeniden güncelle
        }, 100);

        // Eğer yeni kullanıcıysa setup wizard'ı göster
        if (this.isFirstTimeUser()) {
            this.showSetupWizard();
        }
    }

    // Sayfa-özel güncellemeleri tetikle
    triggerPageUpdates() {

        // Data migration işlemi
        if (typeof migrateRegularPaymentData === 'function') {
            try {
                migrateRegularPaymentData();
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
        if (typeof updateExpenseTable === 'function') {
            updateExpenseTable();
        }

        // Hesaplar güncellemeleri
        if (typeof updateAccounts === 'function') {
            updateAccounts();
        }

        // Aylık özet güncellemeleri
        if (typeof updateMonthlySummary === 'function') {
            try {
                const summaryTarih = document.getElementById('summaryDate');
                if (summaryTarih && !summaryTarih.value) {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    summaryTarih.value = currentMonth;
                }
                updateMonthlySummary();
            } catch (error) {
                console.error('❌ Aylık özet güncelleme hatası:', error);
            }
        }

        // Veri yönetimi güncellemeleri (statistics kaldırıldı)
        if (typeof updateRegularPaymentsList === 'function') {
            try {
                updateRegularPaymentsList();
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
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('setupWizard').style.display = 'none';
    }

    // İlk kez kullanıcı kontrolü (sadece yeni oluşturulan kullanıcılar için)
    isFirstTimeUser() {
        if (!this.currentUser || !this.users[this.currentUser]) return false;
        
        const user = this.users[this.currentUser];
        
        // Admin kullanıcısı için setup wizard gösterme
        if (user.role === 'admin') return false;
        
        // Migration ile gelen kullanıcılar için setup wizard gösterme
        if (user.createdBy === 'migration' || user.email === 'migrated@paymentplanner.com') return false;
        
        // Sadece admin tarafından yeni oluşturulan ve hiç card/kişi eklememış kullanıcılar
        return user.createdBy === 'admin' && 
               user.data.creditCards.length === 0 && 
               user.data.people.length === 0 &&
               !user.setupCompleted;
    }

    // Setup wizard'ı göster
    showSetupWizard() {
        document.getElementById('setupWizard').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
    }

    // Setup'ı tamamla
    completeSetup(cards, users) {
        if (!this.currentUser) return;

        this.users[this.currentUser].data.creditCards = cards;
        this.users[this.currentUser].data.people = users;
        this.users[this.currentUser].setupCompleted = true;

        creditCards = cards;
        people = users;

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

    // Şifre değiştir (kullanıcı kendi şifresini değiştirebilir)
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('Giriş yapılmamış');
        }

        const user = this.users[this.currentUser];
        const currentHash = this.generateSecureHash(currentPassword, this.currentUser);
        
        if (user.password !== currentHash) {
            throw new Error('Mevcut şifre yanlış');
        }

        if (newPassword.length < 8) {
            throw new Error('Yeni şifre en az 8 karakter olmalıdır');
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword)) {
            throw new Error('Yeni şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir');
        }

        user.password = this.generateSecureHash(newPassword, this.currentUser);
        localStorage.setItem('app_users', JSON.stringify(this.users));
        
        return true;
    }

    // Admin şifre sıfırlama
    resetUserPassword(username, newPassword) {
        if (!this.currentUser || this.users[this.currentUser].role !== 'admin') {
            throw new Error('Bu işlem için admin yetperson gerekli');
        }

        if (!this.users[username]) {
            throw new Error('Kullanıcı bulunamadı');
        }

        if (newPassword.length < 8) {
            throw new Error('Yeni şifre en az 8 karakter olmalıdır');
        }

        this.users[username].password = this.generateSecureHash(newPassword, username);
        localStorage.setItem('app_users', JSON.stringify(this.users));
        
        return true;
    }

    // Session bilgilerini temizle
    clearAllSessions() {
        if (!this.currentUser || this.users[this.currentUser].role !== 'admin') {
            throw new Error('Bu işlem için admin yetperson gerekli');
        }

        this.sessions = {};
        localStorage.setItem('app_sessions', JSON.stringify(this.sessions));
        
        return true;
    }

    // Otomatik kaydetme için interval
    startAutoSave() {
        // Veri kaydetme
        setInterval(() => {
            if (this.currentUser) {
                this.saveUserData();
            }
        }, 30000); // 30 saniyede bir kaydet

        // Session temizleme
        setInterval(() => {
            this.cleanExpiredSessions();
        }, 60000); // 1 dakikada bir temizle
    }
}

// Auth UI Handler Functions - Merged from auth-ui.js
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        await authSystem.login(username, password);
        
        if (authSystem.users[username].role === 'admin') {
            authSystem.showAdminPanel();
            NotificationService.success('Admin olarak giriş yapıldı!');
        } else {
            authSystem.showAuthenticatedContent();
            NotificationService.success('Başarıyla giriş yapıldı!');
        }
    } catch (error) {
        NotificationService.error(error.message);
    }
}

function handleCreateUser(event) {
    event.preventDefault();

    const username = document.getElementById('newUsername').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const confirmPassword = document.getElementById('confirmNewUserPassword').value;

    if (password !== confirmPassword) {
        NotificationService.error('Şifreler eşleşmiyor!');
        return;
    }

    try {
        authSystem.createUser(username, password, email, 'user');
        NotificationService.success('Kullanıcı başarıyla oluşturuldu!');
        
        event.target.reset();
        authSystem.updateUsersList();
    } catch (error) {
        NotificationService.error(error.message);
    }
}

function toggleAdminForm() {
    const form = document.getElementById('createUserForm');
    const button = document.querySelector('[onclick="toggleAdminForm()"]');
    
    if (form.style.display === 'none' || !form.style.display) {
        form.style.display = 'block';
        button.textContent = 'Formu Gizle';
    } else {
        form.style.display = 'none';
        button.textContent = 'Yeni Kullanıcı Ekle';
    }
}

// Setup wizard functions - simplified
let currentStep = 1;
let tempCards = [];
let tempUsers = [];

function nextStep() {
    if (currentStep === 1) {
        document.getElementById('setupStep1').classList.remove('active');
        document.getElementById('setupStep2').classList.add('active');
        document.getElementById('prevStep').style.display = 'inline-block';
        document.getElementById('nextStep').style.display = 'none';
        document.getElementById('finishSetup').style.display = 'inline-block';
        currentStep = 2;
    }
}

function previousStep() {
    if (currentStep === 2) {
        document.getElementById('setupStep2').classList.remove('active');
        document.getElementById('setupStep1').classList.add('active');
        document.getElementById('prevStep').style.display = 'none';
        document.getElementById('nextStep').style.display = 'inline-block';
        document.getElementById('finishSetup').style.display = 'none';
        currentStep = 1;
    }
}

function addCard() {
    const input = document.getElementById('newCardName');
    const cardName = input.value.trim();
    
    if (cardName && !tempCards.includes(cardName)) {
        tempCards.push(cardName);
        updateCardsList();
        input.value = '';
    }
}

function addUser() {
    const input = document.getElementById('newUserName');
    const userName = input.value.trim();
    
    if (userName && !tempUsers.includes(userName)) {
        tempUsers.push(userName);
        updateUsersList();
        input.value = '';
    }
}

function removeCard(cardName) {
    tempCards = tempCards.filter(card => card !== cardName);
    updateCardsList();
}

function removeUser(userName) {
    tempUsers = tempUsers.filter(user => user !== userName);
    updateUsersList();
}

function updateCardsList() {
    const container = document.getElementById('cardsList');
    if (!container) return;
    
    if (tempCards.length === 0) {
        container.innerHTML = '<p class="setup-help">En az bir card eklemeniz önerilir.</p>';
        return;
    }
    
    container.innerHTML = tempCards.map(card => `
        <div class="setup-item">
            <span>${card}</span>
            <button type="button" onclick="removeCard('${card}')" class="btn btn-sm btn-danger">Sil</button>
        </div>
    `).join('');
}

function updateUsersList() {
    const container = document.getElementById('usersList');
    if (!container) return;
    
    if (tempUsers.length === 0) {
        container.innerHTML = '<p class="setup-help">En az bir kişi eklemeniz önerilir.</p>';
        return;
    }
    
    container.innerHTML = tempUsers.map(user => `
        <div class="setup-item">
            <span>${user}</span>
            <button type="button" onclick="removeUser('${user}')" class="btn btn-sm btn-danger">Sil</button>
        </div>
    `).join('');
}

function finishSetup() {
    // Temporary data'yı global arrays'e aktar
    if (tempCards.length > 0) {
        creditCards = [...tempCards];
    }
    if (tempUsers.length > 0) {
        people = [...tempUsers];
    }
    
    // Auth sistem üzerinden kaydet
    if (authSystem && authSystem.currentUser) {
        authSystem.saveUserData();
    }
    
    // Setup'ı gizle, ana uygulamayı göster
    document.getElementById('setupWizard').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    NotificationService.success('Kurulum tamamlandı!');
}

// Global auth instance
let authSystem;

// Sayfa yüklendiğinde auth sistemini başlat
document.addEventListener('DOMContentLoaded', function () {
    authSystem = new AuthSystem();
    authSystem.startAutoSave();
});

// Sayfa kapanmadan önce dataleri kaydet
window.addEventListener('beforeunload', function () {
    if (authSystem && authSystem.currentUser) {
        authSystem.saveUserData();
    }
});