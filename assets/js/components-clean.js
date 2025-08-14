// Essential UI Components - Simplified and Clean

// Header Component - Clean and minimal
function renderHeader() {
    return `
        <div class="header">
            <div class="header-content">
                <a href="index.html" class="header-brand">
                    <div class="header-icon">💳</div>
                    <div>
                        <h1>Harcama Takip</h1>
                        <div class="header-subtitle">Kredi kartı harcama yönetimi</div>
                    </div>
                </a>
                
                <div class="header-actions">
                    <div class="header-user">
                        <span>👤</span>
                        <span id="currentUserInfo">Kullanıcı</span>
                    </div>
                    <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
                </div>
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
        const isActive = item.id === activePage || 
                        (item.id === 'dashboard' && (activePage === 'index' || activePage === ''));
        return `
            <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-text">${item.text}</span>
            </a>
        `;
    }).join('');

    return `
        <nav class="navigation">
            <div class="nav-container">
                ${navHTML}
            </div>
        </nav>
    `;
}

// Auth Container Component - Simplified
function renderAuthContainer() {
    return `
        <div id="authContainer" style="display: none;">
            <div class="auth-wrapper">
                <div class="auth-container">
                    <div class="auth-header">
                        <h1>💳 Harcama Takip Sistemi</h1>
                        <p>Kredi kartı harcamalarınızı güvenle takip edin</p>
                    </div>

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
                        <div class="auth-info">
                            <p><strong>Admin Giriş:</strong> admin / admin123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Setup Wizard Component - Simplified
function renderSetupWizard() {
    return `
        <div id="setupWizard" style="display: none;">
            <div class="setup-wrapper">
                <div class="setup-container">
                    <div class="setup-header">
                        <h1>🎉 Hoş Geldiniz!</h1>
                        <p>Sisteminizi yapılandırmak için birkaç adım</p>
                    </div>

                    <div class="setup-steps">
                        <div id="setupStep1" class="setup-step active">
                            <h2>1. Kredi Kartlarınızı Ekleyin</h2>
                            <div class="setup-form">
                                <div class="form-group">
                                    <input type="text" id="newCardName" placeholder="Kart adı girin...">
                                </div>
                                <button type="button" class="btn btn-secondary" onclick="addCard()">Kart Ekle</button>
                                <div id="cardsList" class="setup-list">
                                    <p class="setup-help">En az bir kart eklemeniz önerilir.</p>
                                </div>
                            </div>
                        </div>

                        <div id="setupStep2" class="setup-step">
                            <h2>2. Kullanıcıları Ekleyin</h2>
                            <div class="setup-form">
                                <div class="form-group">
                                    <input type="text" id="newUserName" placeholder="Kişi adı girin...">
                                </div>
                                <button type="button" class="btn btn-secondary" onclick="addUser()">Kişi Ekle</button>
                                <div id="usersList" class="setup-list">
                                    <p class="setup-help">En az bir kişi eklemeniz önerilir.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="setup-navigation">
                        <button id="prevStep" class="btn btn-outline" onclick="previousStep()" style="display: none;">Önceki</button>
                        <button id="nextStep" class="btn btn-primary" onclick="nextStep()">Sonraki</button>
                        <button id="finishSetup" class="btn btn-success" onclick="finishSetup()" style="display: none;">Tamamla</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Global exports for backward compatibility
window.renderHeader = renderHeader;
window.renderNavigation = renderNavigation;
window.renderAuthContainer = renderAuthContainer;
window.renderSetupWizard = renderSetupWizard;
