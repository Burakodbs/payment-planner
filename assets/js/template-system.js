// Simple Template System

class TemplateSystem {
    constructor() {
        this.templates = {};
        this.loadBaseTemplate();
    }

    async loadBaseTemplate() {
        try {
            const response = await fetch('./templates/base.html');
            this.baseTemplate = await response.text();
        } catch (error) {
            console.warn('Base template not found, using fallback');
            this.baseTemplate = this.getFallbackTemplate();
        }
    }

    getFallbackTemplate() {
        return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{PAGE_TITLE}} - Kredi Kartı Harcama Takip Sistemi</title>
    <link rel="stylesheet" href="./assets/css/variables.css?v=25">
    <link rel="stylesheet" href="./assets/css/base.css?v=25">
    <link rel="stylesheet" href="./assets/css/layout.css?v=25">
    <link rel="stylesheet" href="./assets/css/components.css?v=25">
    <link rel="stylesheet" href="./assets/css/utilities.css?v=25">
    <link rel="stylesheet" href="./assets/css/auth.css?v=25">
</head>
<body>
    {{CONTENT}}
    {{PAGE_SCRIPTS}}
</body>
</html>`;
    }

    render(pageTitle, content, pageScripts = '') {
        if (!this.baseTemplate) {
            this.baseTemplate = this.getFallbackTemplate();
        }

        return this.baseTemplate
            .replace('{{PAGE_TITLE}}', pageTitle)
            .replace('{{CONTENT}}', content)
            .replace('{{PAGE_SCRIPTS}}', pageScripts);
    }

    // Common page layouts
    renderPageLayout(pageId, pageTitle, pageContent, pageScripts = '') {
        const authContainer = this.renderAuthContainer();
        const setupWizard = this.renderSetupWizard();
        const mainApp = `
            <div id="mainApp" style="display: none;">
                <div class="container">
                    ${this.renderHeader()}
                    ${this.renderNavigation(pageId)}
                    <div class="content">
                        ${pageContent}
                    </div>
                </div>
            </div>
        `;

        const fullContent = authContainer + setupWizard + mainApp;
        const scripts = `
            <script src="./assets/js/auth.js?v=25"></script>
            <script src="./assets/js/auth-ui.js?v=25"></script>
            <script src="./assets/js/app.js?v=25"></script>
            <script src="./assets/js/data-manager.js?v=25"></script>
            <script src="./assets/js/calculations.js?v=25"></script>
            <script src="./assets/js/chart-manager.js?v=25"></script>
            <script src="./assets/js/utils.js?v=25"></script>
            ${pageScripts}
        `;

        return this.render(pageTitle, fullContent, scripts);
    }

    renderHeader() {
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

    renderNavigation(activePage = '') {
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

    renderAuthContainer() {
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

    renderSetupWizard() {
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
}

// Global template system instance
window.templateSystem = new TemplateSystem();