// Essential UI Components - Simplified and Clean
// Header Component - Clean and minimal
function renderHeader() {
    return `
        <div class="header">
            <div class="header-content">
                <a href="index.html" class="header-brand">
                    <span class="brand-icon">💳</span>
                    <span class="brand-text">Payment Planner</span>
                </a>
                <div class="header-actions">
                    <button class="btn btn-outline" onclick="authSystem.logout()">Çıkış</button>
                </div>
            </div>
        </div>
    `;
}

// Navigation Component - Improved
function renderNavigation(activePage = '') {
    const navItems = [
        { href: 'index.html', icon: '🏠', text: 'Ana Sayfa', id: 'dashboard' },
        { href: 'harcama-ekle.html', icon: '➕', text: 'Harcama Ekle', id: 'harcama-ekle' },
        { href: 'duzenli-odeme.html', icon: '🔄', text: 'Düzenli Ödeme', id: 'duzenli-odeme' },
        { href: 'istatistikler.html', icon: '📊', text: 'İstatistikler', id: 'istatistikler' },
        { href: 'expense-listesi.html', icon: '📋', text: 'Harcama Listesi', id: 'expense-listesi' },
        { href: 'accounts.html', icon: '💰', text: 'Hesaplar', id: 'accounts' },
        { href: 'aylik-ozet.html', icon: '📅', text: 'Aylık Özet', id: 'monthly-summary' },
        { href: 'data-yonetimi.html', icon: '⚙️', text: 'Veri Yönetimi', id: 'data-yonetimi' }
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
            <div class="nav-content">
                ${navHTML}
            </div>
        </nav>
    `;
}

// Footer Component - Simple
function renderFooter() {
    return `
        <footer class="footer">
            <div class="footer-content">
                <p>&copy; 2025 Payment Planner - Gelişmiş Harcama Takip Sistemi</p>
            </div>
        </footer>
    `;
}

// Common page initialization
function initializePage(pageId) {
    // Render header
    const headerContainer = document.querySelector('.header-container') || document.getElementById('header');
    if (headerContainer) {
        headerContainer.innerHTML = renderHeader();
    }
    
    // Render navigation
    const navContainer = document.querySelector('.nav-container') || document.getElementById('navigation');
    if (navContainer) {
        navContainer.innerHTML = renderNavigation(pageId);
    }
    
    // Render footer
    const footerContainer = document.querySelector('.footer-container') || document.getElementById('footer');
    if (footerContainer) {
        footerContainer.innerHTML = renderFooter();
    }
    
    // Update page title if needed
    const pageTitles = {
        'dashboard': 'Ana Sayfa',
        'harcama-ekle': 'Harcama Ekle',
        'duzenli-odeme': 'Düzenli Ödeme',
        'istatistikler': 'İstatistikler',
        'expense-listesi': 'Harcama Listesi',
        'accounts': 'Hesaplar',
        'monthly-summary': 'Aylık Özet',
        'data-yonetimi': 'Veri Yönetimi'
    };
    
    if (pageTitles[pageId]) {
        document.title = `${pageTitles[pageId]} - Payment Planner`;
    }
}

// Setup Wizard Component
function renderSetupWizard() {
    return `
        <div class="setup-wizard">
            <div class="wizard-container">
                <div class="wizard-header">
                    <h2>Hoş Geldiniz! 🎉</h2>
                    <p>Harcama takip sisteminizi kurmak için birkaç dakika ayırın.</p>
                </div>
                
                <div class="wizard-content">
                    <div class="wizard-step active" id="step1">
                        <h3>1. Kart Bilgilerinizi Ekleyin</h3>
                        <div class="form-group">
                            <label>Kredi Kartlarınızı ekleyin (virgülle ayırın):</label>
                            <input type="text" id="setupCards" placeholder="Örnek: Garanti, İş Bankası, Akbank" 
                                   class="form-control">
                        </div>
                    </div>
                    
                    <div class="wizard-step" id="step2">
                        <h3>2. Kişileri Tanımlayın</h3>
                        <div class="form-group">
                            <label>Harcama yapacak kişileri ekleyin (virgülle ayırın):</label>
                            <input type="text" id="setupUsers" placeholder="Örnek: Ali, Ayşe, Mehmet" 
                                   class="form-control">
                        </div>
                    </div>
                </div>
                
                <div class="wizard-footer">
                    <div class="wizard-actions">
                        <button id="prevStep" class="btn btn-outline" onclick="previousStep()" style="display: none;">Önceki</button>
                        <button id="nextStep" class="btn btn-primary" onclick="nextStep()">Sonraki</button>
                        <button id="finishSetup" class="btn btn-success" onclick="finishSetup()" style="display: none;">Tamamla</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Wizard navigation functions
function nextStep() {
    const currentStep = document.querySelector('.wizard-step.active');
    const nextStep = currentStep.nextElementSibling;
    
    if (nextStep && nextStep.classList.contains('wizard-step')) {
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
        
        // Update buttons
        document.getElementById('prevStep').style.display = 'inline-block';
        
        if (!nextStep.nextElementSibling || !nextStep.nextElementSibling.classList.contains('wizard-step')) {
            document.getElementById('nextStep').style.display = 'none';
            document.getElementById('finishSetup').style.display = 'inline-block';
        }
    }
}

function previousStep() {
    const currentStep = document.querySelector('.wizard-step.active');
    const prevStep = currentStep.previousElementSibling;
    
    if (prevStep && prevStep.classList.contains('wizard-step')) {
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
        
        // Update buttons
        if (!prevStep.previousElementSibling || !prevStep.previousElementSibling.classList.contains('wizard-step')) {
            document.getElementById('prevStep').style.display = 'none';
        }
        
        document.getElementById('nextStep').style.display = 'inline-block';
        document.getElementById('finishSetup').style.display = 'none';
    }
}

function finishSetup() {
    const cards = document.getElementById('setupCards').value.split(',').map(s => s.trim()).filter(s => s);
    const users = document.getElementById('setupUsers').value.split(',').map(s => s.trim()).filter(s => s);
    
    if (cards.length === 0) {
        alert('En az bir kart eklemelisiniz!');
        return;
    }
    
    if (users.length === 0) {
        alert('En az bir kişi eklemelisiniz!');
        return;
    }
    
    // Setup complete
    if (typeof authSystem !== 'undefined' && authSystem) {
        authSystem.completeSetup(cards, users);
    }
}
