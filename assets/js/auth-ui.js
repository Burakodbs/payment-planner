// Authentication UI Handler Functions

// Login form handling
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        authSystem.login(username, password);
        
        if (authSystem.users[username].role === 'admin') {
            authSystem.showAdminPanel();
            showToast('Admin olarak giriş yapıldı!', 'success');
        } else {
            authSystem.showAuthenticatedContent();
            showToast('Başarıyla giriş yapıldı!', 'success');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Admin - Yeni kullanıcı oluştur
function handleCreateUser(event) {
    event.preventDefault();

    const username = document.getElementById('newUsername').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const confirmPassword = document.getElementById('confirmNewUserPassword').value;

    if (password !== confirmPassword) {
        showToast('Şifreler eşleşmiyor!', 'error');
        return;
    }

    try {
        authSystem.createUser(username, password, email, 'user');
        showToast('Kullanıcı başarıyla oluşturuldu!', 'success');
        
        // Formu temizle
        event.target.reset();
        
        // Kullanıcı listesini güncelle
        authSystem.updateUsersList();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Admin paneli toggle
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

// Admin işlemleri
function clearAllSessions() {
    if (confirm('Tüm kullanıcı oturumları sonlandırılacak. Emin misiniz?')) {
        try {
            authSystem.clearAllSessions();
            showToast('Tüm oturumlar temizlendi', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

function showSystemInfo() {
    const systemInfo = document.getElementById('systemInfo');
    const button = document.querySelector('[onclick="showSystemInfo()"]');
    
    if (systemInfo.style.display === 'none' || !systemInfo.style.display) {
        // Bilgileri güncelle
        const totalUsers = Object.keys(authSystem.users).length - 1; // admin hariç
        const activeSessions = Object.keys(authSystem.sessions).length;
        
        // Son giriş zamanını bul
        let lastLoginTime = 'Hiç';
        let latestTimestamp = 0;
        
        for (const sessionId in authSystem.sessions) {
            const session = authSystem.sessions[sessionId];
            if (session.timestamp > latestTimestamp) {
                latestTimestamp = session.timestamp;
            }
        }
        
        if (latestTimestamp > 0) {
            lastLoginTime = new Date(latestTimestamp).toLocaleString('tr-TR');
        }
        
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeSessions').textContent = activeSessions;
        document.getElementById('lastLogin').textContent = lastLoginTime;
        
        systemInfo.style.display = 'block';
        button.textContent = '📊 Bilgileri Gizle';
    } else {
        systemInfo.style.display = 'none';
        button.textContent = '📊 Sistem Bilgileri';
    }
}

// Şifre sıfırlama
function resetUserPassword(username) {
    const newPassword = prompt(`${username} için yeni şifre girin (en az 8 karakter, büyük/küçük harf ve rakam içermeli):`);
    
    if (!newPassword) return;
    
    try {
        authSystem.resetUserPassword(username, newPassword);
        showToast(`${username} kullanıcısının şifresi sıfırlandı`, 'success');
        authSystem.updateUsersList();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Migration yardım fonksiyonları
function showMigrationHelp() {
    const migrationHelp = document.getElementById('migrationHelp');
    const button = document.querySelector('[onclick="showMigrationHelp()"]');
    
    if (migrationHelp.style.display === 'none' || !migrationHelp.style.display) {
        migrationHelp.style.display = 'block';
        button.textContent = '🔧 Yardımı Gizle';
    } else {
        migrationHelp.style.display = 'none';
        button.textContent = '🔧 Veri Geçiş Yardımı';
    }
}

function checkOldData() {
    const oldCurrentUser = localStorage.getItem('current_user');
    const globalHarcamalar = JSON.parse(localStorage.getItem('harcamalar') || '[]');
    const globalDuzenliOdemeler = JSON.parse(localStorage.getItem('duzenliOdemeler') || '[]');
    const globalKredikartlari = JSON.parse(localStorage.getItem('kredikartlari') || '[]');
    const globalKisiler = JSON.parse(localStorage.getItem('kisiler') || '[]');
    
    let message = '🔍 Eski Veri Kontrol Sonuçları:\n\n';
    
    if (oldCurrentUser) {
        message += `📱 Eski Kullanıcı: ${oldCurrentUser}\n`;
    }
    
    message += `📊 Harcamalar: ${globalHarcamalar.length} kayıt\n`;
    message += `🔄 Düzenli Ödemeler: ${globalDuzenliOdemeler.length} kayıt\n`;
    message += `💳 Kredi Kartları: ${globalKredikartlari.length} kayıt\n`;
    message += `👥 Kişiler: ${globalKisiler.length} kayıt\n\n`;
    
    if (oldCurrentUser || globalHarcamalar.length > 0 || globalDuzenliOdemeler.length > 0 || 
        globalKredikartlari.length > 0 || globalKisiler.length > 0) {
        message += '✅ Eski veriler tespit edildi. "Zorunlu Veri Geçişi" yapabilirsiniz.';
    } else {
        message += '❌ Eski veri bulunamadı.';
    }
    
    alert(message);
}

function forceDataMigration() {
    if (confirm('⚠️ Zorunlu veri geçişi yapılacak. Bu işlem mevcut verileri etkileyebilir. Devam etmek istediğinizden emin misiniz?')) {
        try {
            // Migration'ı yeniden çalıştır
            authSystem.migrateOldUserData();
            showToast('Veri geçişi tamamlandı', 'success');
            authSystem.updateUsersList();
        } catch (error) {
            showToast('Veri geçişinde hata: ' + error.message, 'error');
        }
    }
}

// Setup Wizard Functions
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
    const cardName = document.getElementById('newCardName').value.trim();

    if (!cardName) {
        showToast('Kart adı boş olamaz!', 'error');
        return;
    }

    if (tempCards.includes(cardName)) {
        showToast('Bu kart zaten eklenmiş!', 'error');
        return;
    }

    tempCards.push(cardName);
    updateCardsList();
    document.getElementById('newCardName').value = '';
    showToast(`${cardName} kartı eklendi!`, 'success');
}

function addUser() {
    const userName = document.getElementById('newUserName').value.trim();

    if (!userName) {
        showToast('Kişi adı boş olamaz!', 'error');
        return;
    }

    if (tempUsers.includes(userName)) {
        showToast('Bu kişi zaten eklenmiş!', 'error');
        return;
    }

    tempUsers.push(userName);
    updateUsersList();
    document.getElementById('newUserName').value = '';
    showToast(`${userName} kişisi eklendi!`, 'success');
}

function removeCard(cardName) {
    tempCards = tempCards.filter(card => card !== cardName);
    updateCardsList();
    showToast(`${cardName} kartı kaldırıldı!`, 'info');
}

function removeUser(userName) {
    tempUsers = tempUsers.filter(user => user !== userName);
    updateUsersList();
    showToast(`${userName} kişisi kaldırıldı!`, 'info');
}

function updateCardsList() {
    const cardsList = document.getElementById('cardsList');

    if (tempCards.length === 0) {
        cardsList.innerHTML = '<p class="setup-help">Henüz kart eklenmedi. En az bir kart eklemeniz önerilir.</p>';
    } else {
        cardsList.innerHTML = tempCards.map(card => `
            <div class="setup-item">
                <span class="setup-item-name">💳 ${card}</span>
                <button class="btn btn-sm btn-danger" onclick="removeCard('${card}')">🗑️</button>
            </div>
        `).join('');
    }
}

function updateUsersList() {
    const usersList = document.getElementById('usersList');

    if (tempUsers.length === 0) {
        usersList.innerHTML = '<p class="setup-help">Henüz kişi eklenmedi. En az bir kişi eklemeniz önerilir.</p>';
    } else {
        usersList.innerHTML = tempUsers.map(user => `
            <div class="setup-item">
                <span class="setup-item-name">👤 ${user}</span>
                <button class="btn btn-sm btn-danger" onclick="removeUser('${user}')">🗑️</button>
            </div>
        `).join('');
    }
}

function finishSetup() {
    if (tempCards.length === 0) {
        if (!confirm('Henüz kart eklemediniz. Kart eklemeden devam etmek istediğinizden emin misiniz?')) {
            return;
        }
    }

    if (tempUsers.length === 0) {
        if (!confirm('Henüz kişi eklemediniz. Kişi eklemeden devam etmek istediğinizden emin misiniz?')) {
            return;
        }
    }

    authSystem.completeSetup(tempCards, tempUsers);
    showToast('Kurulum tamamlandı! Artık harcama eklemeye başlayabilirsiniz.', 'success');

    // Temp arrays'i temizle
    tempCards = [];
    tempUsers = [];
    currentStep = 1;
}

// Enter tuşu ile form gönderimi
document.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;

        // Setup wizard'da enter tuşu kontrolü
        if (document.getElementById('setupWizard').style.display !== 'none') {
            if (activeElement.id === 'newCardName') {
                event.preventDefault();
                addCard();
            } else if (activeElement.id === 'newUserName') {
                event.preventDefault();
                addUser();
            }
        }
    }
});