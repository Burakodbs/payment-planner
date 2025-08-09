// Authentication UI Handler Functions

// Login/Register form handling
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        authSystem.login(username, password);
        authSystem.showMainApp();
        showToast('Başarıyla giriş yapıldı!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Şifreler eşleşmiyor!', 'error');
        return;
    }

    try {
        authSystem.register(username, password, email);
        authSystem.login(username, password);
        authSystem.showMainApp();
        showToast('Hesap başarıyla oluşturuldu!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
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