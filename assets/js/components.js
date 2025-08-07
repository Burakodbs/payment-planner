// Ortak UI Component Sistemi

// Sayfa başlatma fonksiyonu
function initializePage(pageId) {
    // Ortak başlatma işlemleri
    // // console.log(`Sayfa başlatılıyor: ${pageId}`);
    
    // Header'ı güncelle
    updateHeader();
    
    // Navigation'ı güncelle  
    updateNavigation(pageId);
    
    // Tema butonlarını kaldır (eğer varsa)
    removeThemeButtons();
}

// Header'ı güncelle - tema butonunu kaldır
function updateHeader() {
    const headerLeft = document.querySelector('.header-left');
    if (headerLeft) {
        // Theme switcher'ı kaldır
        const themeSwitcher = headerLeft.querySelector('.theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.remove();
        }
        
        // Header-left'i boş bırak
        headerLeft.innerHTML = '';
    }
}

// Navigation'ı güncelle - alt çizgiyi kaldır
function updateNavigation(activePageId) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        // Alt çizgiyi kaldır
        tab.style.textDecoration = 'none';
        
        // Aktif sayfayı işaretle
        const href = tab.getAttribute('href');
        if (href) {
            const fileName = href.split('/').pop().split('.')[0];
            if (fileName === activePageId || 
                (fileName === 'index' && activePageId === 'dashboard')) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        }
    });
}

// Tema butonlarını kaldır
function removeThemeButtons() {
    const themeSwitchers = document.querySelectorAll('.theme-switcher');
    themeSwitchers.forEach(switcher => switcher.remove());
    
    const themeButtons = document.querySelectorAll('.theme-btn');  
    themeButtons.forEach(btn => btn.remove());
}

// Header Component
function renderHeader(currentPageTitle = 'Harcama Takip') {
    return `
        <div class="header">
            <div class="header-content">
                <a href="index.html" class="header-brand">
                    <div class="header-icon">💳</div>
                    <div>
                        <h1>Harcama Takip</h1>
                        <div class="header-subtitle">Kredi kartı harcamalarınızı profesyonelce yönetin</div>
                    </div>
                </a>
            </div>
            
            <div class="header-actions">
                <div class="header-user">
                    <span>👤</span>
                    <span id="currentUserInfo">Kullanıcı</span>
                </div>
                <button class="theme-toggle" onclick="toggleTheme()" title="Tema Değiştir">
                    🌙
                </button>
            </div>
        </div>
    `;
}

// Navigation Component
function renderNavigation(activePage = '') {
    const navItems = [
        { href: 'index.html', icon: '📊', text: 'Gösterge Paneli', id: 'dashboard' },
        { href: 'harcama-ekle.html', icon: '➕', text: 'Harcama Ekle', id: 'harcama-ekle' },
        { href: 'harcama-listesi.html', icon: '📋', text: 'Harcama Listesi', id: 'harcama-listesi' },
        { href: 'hesaplar.html', icon: '💰', text: 'Hesaplar', id: 'hesaplar' },
        { href: 'aylik-ozet.html', icon: '📅', text: 'Aylık Özet', id: 'aylik-ozet' },
        { href: 'veri-yonetimi.html', icon: '⚙️', text: 'Veri Yönetimi', id: 'veri-yonetimi' }
    ];

    const navHTML = navItems.map(item => {
        const activeClass = activePage === item.id ? ' active' : '';
        return `<a href="${item.href}" class="tab${activeClass}">${item.icon} ${item.text}</a>`;
    }).join('');

    return `
        <div class="tabs">
            ${navHTML}
        </div>
    `;
}

// Auth Container Component
function renderAuthContainer() {
    return `
        <!-- Authentication Container -->
        <div id="authContainer" style="display: none;">
            <div class="auth-wrapper">
                <div class="auth-container">
                    <div class="auth-header">
                        <h1>💳 Harcama Takip Sistemi</h1>
                        <p>Kredi kartı harcamalarınızı güvenle takip edin</p>
                    </div>

                    <!-- Login Form -->
                    <div id="loginForm" class="auth-form">
                        <h2>Giriş Yap</h2>
                        <form onsubmit="handleLogin(event)">
                            <div class="form-group">
                                <label for="loginUsername">Kullanıcı Adı</label>
                                <input type="text" id="loginUsername" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Şifre</label>
                                <input type="password" id="loginPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Giriş Yap</button>
                        </form>
                        <p class="auth-switch">
                            Hesabınız yok mu? <a href="#" onclick="showRegister()">Kayıt olun</a>
                        </p>
                    </div>

                    <!-- Register Form -->
                    <div id="registerForm" class="auth-form" style="display: none;">
                        <h2>Kayıt Ol</h2>
                        <form onsubmit="handleRegister(event)">
                            <div class="form-group">
                                <label for="registerUsername">Kullanıcı Adı</label>
                                <input type="text" id="registerUsername" required minlength="3">
                                <small>En az 3 karakter</small>
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">E-posta (Opsiyonel)</label>
                                <input type="email" id="registerEmail">
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Şifre</label>
                                <input type="password" id="registerPassword" required minlength="6">
                                <small>En az 6 karakter</small>
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Şifre Tekrar</label>
                                <input type="password" id="confirmPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Kayıt Ol</button>
                        </form>
                        <p class="auth-switch">
                            Zaten hesabınız var mı? <a href="#" onclick="showLogin()">Giriş yapın</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Setup Wizard Component
function renderSetupWizard() {
    return `
        <!-- Setup Wizard -->
        <div id="setupWizard" style="display: none;">
            <div class="setup-wrapper">
                <div class="setup-container">
                    <div class="setup-header">
                        <h1>🎉 Hoş Geldiniz!</h1>
                        <p>Harcama takip sisteminizi kişiselleştirmek için birkaç ayar yapalım</p>
                    </div>

                    <div class="setup-steps">
                        <!-- Step 1: Kart Ekleme -->
                        <div id="setupStep1" class="setup-step active">
                            <h2>1. Kredi Kartlarınızı Ekleyin</h2>
                            <p>Takip etmek istediğiniz kredi kartlarını ekleyin</p>
                            
                            <div class="setup-form">
                                <div class="form-group">
                                    <label for="newCardName">Kart Adı</label>
                                    <input type="text" id="newCardName" placeholder="örn: Axess, Maksimum, World...">
                                </div>
                                <button type="button" class="btn btn-secondary" onclick="addCard()">Kart Ekle</button>
                                
                                <div id="cardsList" class="setup-list">
                                    <p class="setup-help">Henüz kart eklenmedi. En az bir kart eklemeniz önerilir.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Kişi Ekleme -->
                        <div id="setupStep2" class="setup-step">
                            <h2>2. Kullanıcıları Ekleyin</h2>
                            <p>Harcama yapabilecek kişileri tanımlayın</p>
                            
                            <div class="setup-form">
                                <div class="form-group">
                                    <label for="newUserName">Kişi Adı</label>
                                    <input type="text" id="newUserName" placeholder="örn: Ben, Eşim, Çocuğum...">
                                </div>
                                <button type="button" class="btn btn-secondary" onclick="addUser()">Kişi Ekle</button>
                                
                                <div id="usersList" class="setup-list">
                                    <p class="setup-help">Henüz kişi eklenmedi. En az bir kişi eklemeniz önerilir.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="setup-navigation">
                        <button id="prevStep" class="btn btn-outline" onclick="previousStep()" style="display: none;">Önceki</button>
                        <button id="nextStep" class="btn btn-primary" onclick="nextStep()">Sonraki</button>
                        <button id="finishSetup" class="btn btn-success" onclick="finishSetup()" style="display: none;">Kurulumu Tamamla</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// App Layout Component
function renderAppLayout(pageId, pageContent) {
    return `
        ${renderAuthContainer()}
        ${renderSetupWizard()}
        
        <!-- Main Application -->
        <div id="mainApp" style="display: none;">
            <div class="container">
                ${renderHeader()}
                ${renderNavigation(pageId)}
                
                <div class="content">
                    ${pageContent}
                </div>
            </div>
        </div>
    `;
}

// Initialize Common Components
function initializeCommonComponents(pageId, pageContent) {
    // Body'ye ana layout'u ekle
    document.body.innerHTML = renderAppLayout(pageId, pageContent);
    
    // Common scripts'leri yükle
    loadCommonScripts();
}

function loadCommonScripts() {
    const scripts = [
        './assets/js/auth.js',
        './assets/js/auth-ui.js', 
        './assets/js/app.js',
        './assets/js/data-manager.js',
        './assets/js/calculations.js',
        './assets/js/chart-manager.js',
        './assets/js/utils.js'
    ];
    
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src + '?v=' + Date.now();
        document.head.appendChild(script);
    });
}

// Export functions for global use
window.renderHeader = renderHeader;
window.renderNavigation = renderNavigation;
window.initializeCommonComponents = initializeCommonComponents;