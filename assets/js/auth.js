﻿// GeliÅŸmiÅŸ KullanÄ±cÄ± Yetkilendirme Sistemi
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
    // Global debug bayraÄŸÄ± (window.APP_DEBUG true ise ayrÄ±ntÄ±lÄ± log aÃ§Ä±lÄ±r)
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
    // Eski kullanÄ±cÄ± datalerini yeni sisteme geÃ§ir
    migrateOldUserData() {
        // Eski current_user kontrolÃ¼
        const oldCurrentUser = localStorage.getItem('current_user');
        if (oldCurrentUser && this.users[oldCurrentUser]) {
            // debug: mevcut kullanÄ±cÄ± datasi bulundu
            // Eski kullanÄ±cÄ± datasi varsa yeni formata Ã§evir
            const user = this.users[oldCurrentUser];
            // Eski format kontrolÃ¼ - role yoksa ekle
            if (!user.role) {
                user.role = 'user';
                // debug: rol eklendi
            }
            // CreatedBy alanÄ±nÄ± add(migration)
            if (!user.createdBy) {
                user.createdBy = 'migration';
            }
            // Setup tamamlanmÄ±ÅŸ olarak iÅŸaretle
            user.setupCompleted = true;
            // Eski ÅŸifre formatÄ±nÄ± kontrol et (btoa ile hash'lenmiÅŸse)
            if (user.password && !user.password.includes('payment_planner_secret_key')) {
                // Eski btoa formatÄ±ndan yeni gÃ¼venli formata geÃ§ir
                // Not: Eski ÅŸifre bilinmediÄŸi iÃ§in varsayÄ±lan ÅŸifre atayacaÄŸÄ±z
                console.warn('âš ï¸ Eski ÅŸifre formatÄ± tespit edildi. VarsayÄ±lan ÅŸifre atanÄ±yor.');
                user.password = this.generateSecureHash('123456', oldCurrentUser);
                // debug: default ÅŸifre atandÄ±
            }
            // Eksik alanlarÄ± tamamla
            if (!user.createdAt) {
                user.createdAt = new Date().toISOString();
            }
            if (!user.settings) {
                user.settings = { theme: 'light' };
            }
            // Verileri kaydet
            this.users[oldCurrentUser] = user;
            localStorage.setItem('app_users', JSON.stringify(this.users));
            // Eski current_user kaydÄ±nÄ± temizle
            localStorage.removeItem('current_user');
            // debug: kullanÄ±cÄ± datasi gÃ¼ncellendi
            // KullanÄ±cÄ±ya bilgi ver
            setTimeout(() => {
                if (document.getElementById('authContainer').style.display !== 'none') {
                    alert(`ğŸ‰ Mevcut kullanÄ±cÄ±nÄ±z (${oldCurrentUser}) yeni sisteme aktarÄ±ldÄ±!\n\n` +
                          `ğŸ”‘ Yeni ÅŸifreniz: 123456\n\n` +
                          `GÃ¼venlik iÃ§in lÃ¼tfen ÅŸifrenizi deÄŸiÅŸtirin.`);
                }
            }, 1000);
        }
        // DiÄŸer eski dataleri kontrol et
        this.checkAndMigrateGlobalData();
    }
    // Global dataleri kontrol et ve kullanÄ±cÄ± hesabÄ±na aktar
    checkAndMigrateGlobalData() {
        // EÄŸer global dataler varsa ve hiÃ§bir kullanÄ±cÄ± bunlara sahip deÄŸilse
        const globalHarcamalar = JSON.parse(localStorage.getItem('expenses') || '[]');
        const globalDuzenliOdemeler = JSON.parse(localStorage.getItem('regularPayments') || '[]');
        const globalKredicardsi = JSON.parse(localStorage.getItem('creditCards') || '[]');
        const globalKisiler = JSON.parse(localStorage.getItem('people') || '[]');
    // debug: migration kontrolÃ¼
        const hasGlobalData = globalHarcamalar.length > 0 || 
                            globalDuzenliOdemeler.length > 0 || 
                            globalKredicardsi.length > 0 || 
                            globalKisiler.length > 0;
        if (hasGlobalData) {
            // debug: global dataler migration baÅŸlÄ±yor
            // Ä°lk kullanÄ±cÄ± bulunursa ona aktar, yoksa 'migrated_user' oluÅŸtur
            let targetUser = Object.keys(this.users).find(u => u !== 'admin');
            if (!targetUser) {
                // Yeni kullanÄ±cÄ± oluÅŸtur
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
                // debug: migration user oluÅŸturuldu
            }
            // Verileri aktar - bÃ¼tÃ¼n dataler akÄ±tÄ±rÄ±lsÄ±n
            // debug: data aktarÄ±mÄ± baÅŸlÄ±yor
            this.users[targetUser].data = {
                expenses: globalHarcamalar,
                regularPayments: globalDuzenliOdemeler,
                creditCards: globalKredicardsi,
                people: globalKisiler
            };
            // debug: aktarÄ±lan data Ã¶zeti
            // Global dataleri temizle
            localStorage.removeItem('expenses');
            localStorage.removeItem('regularPayments');
            localStorage.removeItem('creditCards');
            localStorage.removeItem('people');
            // GÃ¼ncellenmiÅŸ kullanÄ±cÄ± datalerini kaydet
            localStorage.setItem('app_users', JSON.stringify(this.users));
            // Harcamalardan card ve kiÅŸi bilgilerini Ã§Ä±kar
            this.extractDataFromHarcamalar(targetUser);
            // debug: migration tamamlandÄ±
            setTimeout(() => {
                alert(`ğŸ“Š Mevcut dataleriniz "${targetUser}" hesabÄ±na aktarÄ±ldÄ±!\n\n` +
                      `ğŸ”‘ GiriÅŸ bilgileri: ${targetUser} / 123456\n\n` +
                      `LÃ¼tfen bu bilgilerle giriÅŸ yapÄ±n ve ÅŸifrenizi deÄŸiÅŸtirin.`);
            }, 1500);
        } else {
            // debug: migration yapÄ±lacak data yok
            // Global data yoksa da mevcut kullanÄ±cÄ±nÄ±n expensesÄ±nÄ± kontrol et
            if (this.currentUser) {
                this.extractDataFromHarcamalar(this.currentUser);
            }
        }
    }
    // Harcamalardan card ve kiÅŸi bilgilerini Ã§Ä±kar
    extractDataFromHarcamalar(username) {
        const userKey = `app_user_${username}`;
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        if (userData.expenses && userData.expenses.length > 0) {
            // debug: expense taramasÄ±
            // Kredi kartlarÄ±nÄ± Ã§Ä±kar
            const uniqueCards = [...new Set(userData.expenses
                .filter(h => h.card && h.card.trim() !== '' && h.card !== 'Nakit')
                .map(h => h.card.trim()))];
            // KiÅŸileri Ã§Ä±kar
            const uniquePeople = [...new Set(userData.expenses
                .filter(h => h.person && h.person.trim() !== '')
                .map(h => h.person.trim()))];
            // debug: Ã§Ä±karÄ±lan card/kullanÄ±cÄ± listeleri
            // Mevcut dataleri gÃ¼ncelle
            if (!userData.creditCards || userData.creditCards.length === 0) {
                userData.creditCards = uniqueCards;
            }
            if (!userData.people || userData.people.length === 0) {
                userData.people = uniquePeople;
            }
            // Kaydet
            localStorage.setItem(userKey, JSON.stringify(userData));
            // Global dataleri de gÃ¼ncelle
            if (this.currentUser === username) {
                this.currentUserData = userData;
                // debug: current user data gÃ¼ncellendi
                // Dropdown'larÄ± gÃ¼ncelle
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
    // GÃ¼venli hash fonksiyonu
    generateSecureHash(password, salt) {
        // Basit ama gÃ¼venli hash (gerÃ§ek uygulamada bcrypt kullanÄ±lmalÄ±)
        let hash = 0;
        const combined = password + salt + 'payment_planner_secret_key_2025';
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit integer'a dÃ¶nÃ¼ÅŸtÃ¼r
        }
        return btoa(hash.toString() + salt);
    }
    // Session temizliÄŸi
    cleanExpiredSessions() {
        const now = new Date().getTime();
        for (const sessionId in this.sessions) {
            if (now - this.sessions[sessionId].timestamp > this.sessionTimeout) {
                delete this.sessions[sessionId];
            }
        }
        localStorage.setItem('app_sessions', JSON.stringify(this.sessions));
    }
    // Oturum kontrolÃ¼
    checkAuth() {
        const sessionId = localStorage.getItem('session_id');
        if (sessionId && this.sessions[sessionId]) {
            const session = this.sessions[sessionId];
            const now = new Date().getTime();
            if (now - session.timestamp < this.sessionTimeout) {
                this.currentUser = session.username;
                // Session'Ä± yenile
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
                // Session sÃ¼resi dolmuÅŸ
                this.logout();
                return;
            }
        }
        this.showAuth();
    }
    // GiriÅŸ denemesi kontrolÃ¼
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
    // GiriÅŸ denemesi kaydet
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
    // Admin kullanÄ±cÄ±sÄ± oluÅŸturma (sadece admin yapabilir)
    createUser(username, password, email = '', role = 'user') {
        if (!this.currentUser || this.users[this.currentUser].role !== 'admin') {
            throw new Error('Bu iÅŸlem iÃ§in admin yetperson gerekli');
        }
        if (!username || !password) {
            throw new Error('KullanÄ±cÄ± adÄ± ve ÅŸifre gereklidir');
        }
        if (this.users[username]) {
            throw new Error('Bu kullanÄ±cÄ± adÄ± zaten kullanÄ±lÄ±yor');
        }
        if (username.length < 3) {
            throw new Error('KullanÄ±cÄ± adÄ± en az 3 karakter olmalÄ±dÄ±r');
        }
        if (password.length < 8) {
            throw new Error('Åifre en az 8 karakter olmalÄ±dÄ±r');
        }
        // Åifre karmaÅŸÄ±klÄ±k kontrolÃ¼
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
            throw new Error('Åifre en az bir kÃ¼Ã§Ã¼k harf, bir bÃ¼yÃ¼k harf ve bir rakam iÃ§ermelidir');
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
    // KullanÄ±cÄ± kaydÄ± (eski fonksiyon - devre dÄ±ÅŸÄ±)
    register(username, password, email = '') {
        throw new Error('Yeni kullanÄ±cÄ± kaydÄ± sadece admin tarafÄ±ndan yapÄ±labilir');
    }
    // KullanÄ±cÄ± giriÅŸi
    async login(username, password) {
        if (!username || !password) {
            throw new Error('KullanÄ±cÄ± adÄ± ve ÅŸifre gereklidir');
        }
        // Hesap kilitli mi kontrol et
        const lockStatus = this.isAccountLocked(username);
        if (lockStatus.locked) {
            throw new Error(`Hesap geÃ§ici olarak kilitli. ${lockStatus.remainingMinutes} dakika sonra tekrar deneyin.`);
        }
        if (!this.users[username]) {
            this.recordLoginAttempt(username, false);
            throw new Error('KullanÄ±cÄ± bulunamadÄ±');
        }
        const hashedPassword = this.generateSecureHash(password, username);
        if (this.users[username].password !== hashedPassword) {
            this.recordLoginAttempt(username, false);
            const attempts = this.loginAttempts[username]?.count || 0;
            const remaining = this.maxLoginAttempts - attempts;
            throw new Error(`HatalÄ± ÅŸifre. ${remaining} deneme hakkÄ±nÄ±z kaldÄ±.`);
        }
        // BaÅŸarÄ±lÄ± giriÅŸ
        this.recordLoginAttempt(username, true);
        this.currentUser = username;
        // Session oluÅŸtur
        const sessionId = this.generateSessionId();
        this.sessions[sessionId] = {
            username: username,
            timestamp: new Date().getTime(),
            userAgent: navigator.userAgent,
            ip: 'localhost' // GerÃ§ek uygulamada IP adresi alÄ±nmalÄ±
        };
        localStorage.setItem('session_id', sessionId);
        localStorage.setItem('app_sessions', JSON.stringify(this.sessions));
        // File storage sistemini baÅŸlat
        if (window.fileStorage) {
            await window.fileStorage.initUser(username);
        } else {
            // Fallback: localStorage'dan yÃ¼kle
            this.loadUserData();
        }
        return true;
    }
    // Session ID oluÅŸtur
    generateSessionId() {
        return btoa(Date.now() + Math.random() + navigator.userAgent).replace(/[^a-zA-Z0-9]/g, '');
    }
    // Ã‡Ä±kÄ±ÅŸ
    logout() {
        // File storage'dan Ã§Ä±kÄ±ÅŸ yap
        if (window.fileStorage) {
            window.fileStorage.logout();
        } else {
            // Fallback: localStorage'a kaydet
            this.saveUserData();
        }
        // Session'Ä± temizle
        const sessionId = localStorage.getItem('session_id');
        if (sessionId && this.sessions[sessionId]) {
            delete this.sessions[sessionId];
            localStorage.setItem('app_sessions', JSON.stringify(this.sessions));
        }
        localStorage.removeItem('session_id');
        this.currentUser = null;
        this.showAuth();
    }
    // KullanÄ±cÄ± datalerini yÃ¼kle
    loadUserData() {
        if (!this.currentUser || !this.users[this.currentUser]) return;
        const userData = this.users[this.currentUser].data;
        // Global deÄŸiÅŸkenleri gÃ¼ncelle - gÃ¼venli ÅŸekilde
        if (typeof expenses !== 'undefined') {
            expenses = userData.expenses || [];
        } else {
            // Global deÄŸiÅŸken henÃ¼z tanÄ±mlÄ± deÄŸilse window'da tanÄ±mla
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
        // currentUserData property'sini de gÃ¼ncelle (uyumluluk iÃ§in)
        this.currentUserData = userData;
        if (this.debug) {
                expenses: userData.expenses?.length || 0,
                regularPayments: userData.regularPayments?.length || 0,
                creditCards: userData.creditCards?.length || 0,
                people: userData.people?.length || 0
            });
        }
        // Simple light theme - no theme loading needed
        // Theme management disabled - using simple default theme
        // Mevcut expensesdan card ve kullanÄ±cÄ± Ã§Ä±kar (eksikse)
        try {
            this.ensureCardUserExtraction();
        } catch (e) {
            console.warn('Kart/kullanÄ±cÄ± Ã§Ä±karma hatasÄ±:', e);
        }
    }
    // KullanÄ±cÄ± datalerini kaydet
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
    // Harcamalardan eksik card ve kullanÄ±cÄ±larÄ± otomatik Ã§Ä±kar
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
            // debug: yeni card/kullanÄ±cÄ± Ã§Ä±karÄ±ldÄ±
            this.saveUserData();
            if (typeof updateCardOptions === 'function') updateCardOptions();
            if (typeof updateUserOptions === 'function') updateUserOptions();
            if (typeof updateCardAndUserManagement === 'function') updateCardAndUserManagement();
        }
    }
    // Admin panelini gÃ¶ster
    showAdminPanel() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        // Admin kullanÄ±cÄ± bilgisini gÃ¶ster
        const adminInfo = document.getElementById('currentAdminInfo');
        if (adminInfo) {
            adminInfo.textContent = this.currentUser;
        }
        // KullanÄ±cÄ± listesini gÃ¼ncelle
        this.updateUsersList();
    }
    // Kimlik doÄŸrulanmÄ±ÅŸ iÃ§eriÄŸi gÃ¶ster (tÃ¼m sayfalar iÃ§in)
    showAuthenticatedContent() {
        // Auth container'Ä± gizle
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.style.display = 'none';
        }
        // Admin panelini gizle
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'none';
        }
        // Ana sayfa mÄ± kontrol et (sadece index.html'de adminPanel var)
        const mainApp = document.getElementById('mainApp');
        if (mainApp && adminPanel) {
            this.showMainApp();
            return;
        } else if (mainApp) {
            this.showNormalPageContent();
            return;
        }
    }
    // Normal sayfa iÃ§eriÄŸini gÃ¶ster (index.html dÄ±ÅŸÄ±ndaki sayfalar)
    showNormalPageContent() {
        // Ana uygulamayÄ± gÃ¶ster
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.display = 'block';
        }
        // KullanÄ±cÄ± bilgisini gÃ¼ncelle (eÄŸer header varsa)
        const userInfo = document.getElementById('currentUserInfo');
        if (userInfo) {
            userInfo.textContent = this.currentUser;
        }
        // Tema sistemini baÅŸlat
        if (typeof initializeTheme === 'function') {
            initializeTheme();
        }
        // UI gÃ¼ncellemeleri - Ã¶nce hemen, sonra geciktirilmiÅŸ
        this.updateUIElements();
        // Sayfa-Ã¶zel iÃ§erik gÃ¼ncellemelerini tetikle
        setTimeout(() => {
            this.triggerPageUpdates();
            // Dropdown'larÄ± yeniden gÃ¼ncelle
            this.updateUIElements();
        }, 100);
    }
    // UI elementlerini gÃ¼ncelle
    updateUIElements() {
        if (typeof updateCardOptions === 'function') {
            updateCardOptions();
        }
        if (typeof updateUserOptions === 'function') {
            updateUserOptions();
        }
    }
    // KullanÄ±cÄ±larÄ± listele
    updateUsersList() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        const users = Object.keys(this.users).filter(username => username !== 'admin');
        if (users.length === 0) {
            usersList.innerHTML = '<div class="no-data">HenÃ¼z kullanÄ±cÄ± bulunmuyor</div>';
            return;
        }
        usersList.innerHTML = users.map(username => {
            const user = this.users[username];
            const isOnline = Object.values(this.sessions).some(session => session.username === username);
            const loginAttempts = this.loginAttempts[username] || { count: 0 };
            return `
                <div class="user-item">
                    <div class="user-info">
                        <h4>${username} ${isOnline ? 'ğŸŸ¢' : 'âš«'}</h4>
                        <p>${user.email || 'E-posta yok'}</p>
                        <small>OluÅŸturulma: ${new Date(user.createdAt).toLocaleDateString('tr-TR')}</small>
                        ${loginAttempts.count > 0 ? `<small style="color: var(--danger);">BaÅŸarÄ±sÄ±z giriÅŸ: ${loginAttempts.count}</small>` : ''}
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-warning btn-sm" onclick="resetUserPassword('${username}')">
                            ğŸ”‘ Åifre SÄ±fÄ±rla
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="authSystem.deleteUser('${username}')">
                            ğŸ—‘ï¸ Sil
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    // KullanÄ±cÄ± sil
    deleteUser(username) {
        if (!this.currentUser || this.users[this.currentUser].role !== 'admin') {
            throw new Error('Bu iÅŸlem iÃ§in admin yetperson gerekli');
        }
        if (username === 'admin') {
            throw new Error('Admin kullanÄ±cÄ±sÄ± silinemez');
        }
        if (confirm(`${username} kullanÄ±cÄ±sÄ±nÄ± silmek istediÄŸinizden emin misiniz?`)) {
            delete this.users[username];
            localStorage.setItem('app_users', JSON.stringify(this.users));
            this.updateUsersList();
        }
    }
    // Ana uygulamayÄ± gÃ¶ster  
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
        // KullanÄ±cÄ± bilgisini gÃ¶ster
        const userInfo = document.getElementById('currentUserInfo');
        if (userInfo) {
            userInfo.textContent = this.currentUser;
        }
        // Tema sistemini baÅŸlat
        if (typeof initializeTheme === 'function') {
            initializeTheme();
        }
        // UI gÃ¼ncellemeleri
        this.updateUIElements();
        // Dashboard Ã¶zel gÃ¼ncellemeleri
        setTimeout(() => {
            this.triggerPageUpdates();
            this.updateUIElements(); // Dropdown'larÄ± yeniden gÃ¼ncelle
        }, 100);
        // EÄŸer yeni kullanÄ±cÄ±ysa setup wizard'Ä± gÃ¶ster
        if (this.isFirstTimeUser()) {
            this.showSetupWizard();
        }
    }
    // Sayfa-Ã¶zel gÃ¼ncellemeleri tetikle
    triggerPageUpdates() {
        // Data migration iÅŸlemi
        if (typeof migrateRegularPaymentData === 'function') {
            try {
                migrateRegularPaymentData();
            } catch (error) {
                console.error('âŒ Migration hatasÄ±:', error);
            }
        }
        // Dashboard gÃ¼ncellemeleri
        if (typeof updateDashboard === 'function') {
            try {
                updateDashboard();
            } catch (error) {
                console.error('âŒ Dashboard gÃ¼ncelleme hatasÄ±:', error);
            }
        }
        // Harcama tablosu gÃ¼ncellemeleri
        if (typeof updateExpenseTable === 'function') {
            updateExpenseTable();
        }
        // Hesaplar gÃ¼ncellemeleri
        if (typeof updateAccounts === 'function') {
            updateAccounts();
        }
        // AylÄ±k Ã¶zet gÃ¼ncellemeleri
        if (typeof updateMonthlySummary === 'function') {
            try {
                const summaryTarih = document.getElementById('summaryDate');
                if (summaryTarih && !summaryTarih.value) {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    summaryTarih.value = currentMonth;
                }
                updateMonthlySummary();
            } catch (error) {
                console.error('âŒ AylÄ±k Ã¶zet gÃ¼ncelleme hatasÄ±:', error);
            }
        }
        // Veri yÃ¶netimi gÃ¼ncellemeleri (statistics kaldÄ±rÄ±ldÄ±)
        if (typeof updateRegularPaymentsList === 'function') {
            try {
                updateRegularPaymentsList();
            } catch (error) {
                console.error('âŒ DÃ¼zenli Ã¶demeler gÃ¼ncelleme hatasÄ±:', error);
            }
        }
        if (typeof updateCardAndUserManagement === 'function') {
            try {
                updateCardAndUserManagement();
            } catch (error) {
                console.error('âŒ Kart ve kullanÄ±cÄ± yÃ¶netimi gÃ¼ncelleme hatasÄ±:', error);
            }
        }
    }
    // Auth ekranÄ±nÄ± gÃ¶ster
    showAuth() {
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('setupWizard').style.display = 'none';
    }
    // Ä°lk kez kullanÄ±cÄ± kontrolÃ¼ (sadece yeni oluÅŸturulan kullanÄ±cÄ±lar iÃ§in)
    isFirstTimeUser() {
        if (!this.currentUser || !this.users[this.currentUser]) return false;
        const user = this.users[this.currentUser];
        // Admin kullanÄ±cÄ±sÄ± iÃ§in setup wizard gÃ¶sterme
        if (user.role === 'admin') return false;
        // Migration ile gelen kullanÄ±cÄ±lar iÃ§in setup wizard gÃ¶sterme
        if (user.createdBy === 'migration' || user.email === 'migrated@paymentplanner.com') return false;
        // Sadece admin tarafÄ±ndan yeni oluÅŸturulan ve hiÃ§ card/kiÅŸi eklememÄ±ÅŸ kullanÄ±cÄ±lar
        return user.createdBy === 'admin' && 
               user.data.creditCards.length === 0 && 
               user.data.people.length === 0 &&
               !user.setupCompleted;
    }
    // Setup wizard'Ä± gÃ¶ster
    showSetupWizard() {
        document.getElementById('setupWizard').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
    }
    // Setup'Ä± tamamla
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
        // UI'larÄ± gÃ¼ncelle
        updateCardOptions();
        updateUserOptions();
    }
    // Mevcut kullanÄ±cÄ± adÄ±nÄ± al
    getCurrentUser() {
        return this.currentUser;
    }
    // Åifre deÄŸiÅŸtir (kullanÄ±cÄ± kendi ÅŸifresini deÄŸiÅŸtirebilir)
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('GiriÅŸ yapÄ±lmamÄ±ÅŸ');
        }
        const user = this.users[this.currentUser];
        const currentHash = this.generateSecureHash(currentPassword, this.currentUser);
        if (user.password !== currentHash) {
            throw new Error('Mevcut ÅŸifre yanlÄ±ÅŸ');
        }
        if (newPassword.length < 8) {
            throw new Error('Yeni ÅŸifre en az 8 karakter olmalÄ±dÄ±r');
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword)) {
            throw new Error('Yeni ÅŸifre en az bir kÃ¼Ã§Ã¼k harf, bir bÃ¼yÃ¼k harf ve bir rakam iÃ§ermelidir');
        }
        user.password = this.generateSecureHash(newPassword, this.currentUser);
        localStorage.setItem('app_users', JSON.stringify(this.users));
        return true;
    }
    // Admin ÅŸifre sÄ±fÄ±rlama
    resetUserPassword(username, newPassword) {
        if (!this.currentUser || this.users[this.currentUser].role !== 'admin') {
            throw new Error('Bu iÅŸlem iÃ§in admin yetperson gerekli');
        }
        if (!this.users[username]) {
            throw new Error('KullanÄ±cÄ± bulunamadÄ±');
        }
        if (newPassword.length < 8) {
            throw new Error('Yeni ÅŸifre en az 8 karakter olmalÄ±dÄ±r');
        }
        this.users[username].password = this.generateSecureHash(newPassword, username);
        localStorage.setItem('app_users', JSON.stringify(this.users));
        return true;
    }
    // Session bilgilerini temizle
    clearAllSessions() {
        if (!this.currentUser || this.users[this.currentUser].role !== 'admin') {
            throw new Error('Bu iÅŸlem iÃ§in admin yetperson gerekli');
        }
        this.sessions = {};
        localStorage.setItem('app_sessions', JSON.stringify(this.sessions));
        return true;
    }
    // Otomatik kaydetme iÃ§in interval
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
            NotificationService.success('Admin olarak giriÅŸ yapÄ±ldÄ±!');
        } else {
            authSystem.showAuthenticatedContent();
            NotificationService.success('BaÅŸarÄ±yla giriÅŸ yapÄ±ldÄ±!');
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
        NotificationService.error('Åifreler eÅŸleÅŸmiyor!');
        return;
    }
    try {
        authSystem.createUser(username, password, email, 'user');
        NotificationService.success('KullanÄ±cÄ± baÅŸarÄ±yla oluÅŸturuldu!');
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
        button.textContent = 'Yeni KullanÄ±cÄ± Ekle';
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
        container.innerHTML = '<p class="setup-help">En az bir card eklemeniz Ã¶nerilir.</p>';
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
        container.innerHTML = '<p class="setup-help">En az bir kiÅŸi eklemeniz Ã¶nerilir.</p>';
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
    // Temporary data'yÄ± global arrays'e aktar
    if (tempCards.length > 0) {
        creditCards = [...tempCards];
    }
    if (tempUsers.length > 0) {
        people = [...tempUsers];
    }
    // Auth sistem Ã¼zerinden kaydet
    if (authSystem && authSystem.currentUser) {
        authSystem.saveUserData();
    }
    // Setup'Ä± gizle, ana uygulamayÄ± gÃ¶ster
    document.getElementById('setupWizard').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    NotificationService.success('Kurulum tamamlandÄ±!');
}
// Global auth instance
let authSystem;
// Sayfa yÃ¼klendiÄŸinde auth sistemini baÅŸlat
document.addEventListener('DOMContentLoaded', function () {
    authSystem = new AuthSystem();
    authSystem.startAutoSave();
});
// Sayfa kapanmadan Ã¶nce dataleri kaydet
window.addEventListener('beforeunload', function () {
    if (authSystem && authSystem.currentUser) {
        authSystem.saveUserData();
    }
});
