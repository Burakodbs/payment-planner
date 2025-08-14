// Data Management page specific JavaScript code


// Sayfa yüklendiğinde ortak component'leri initialize et
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('data-yonetimi');
    }
});

function updateDataStats() {
    // İstatistikler cardı kaldırıldı, fonksiyon geriye uyumluluk için boş bırakıldı
}

function updateCardAndUserManagement() {
    // Card management
    const cardList = document.getElementById('cardManagementList');
    if (cardList) {
        cardList.innerHTML = creditCards.map(card => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                <span>${card}</span>
                <div style="display: flex; gap: 4px;">
                    <button class="btn btn-sm btn-outline" onclick="editCard('${card}')">Düzenle</button>
                    <button class="btn btn-sm btn-danger" onclick="removeCard('${card}')">Sil</button>
                </div>
            </div>
        `).join('');
    }

    // Kullanıcı yönetimi
    const userList = document.getElementById('userManagementList');
    if (userList) {
        userList.innerHTML = people.map(person => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                <span>${person}</span>
                <div style="display: flex; gap: 4px;">
                    <button class="btn btn-sm btn-outline" onclick="editUser('${person}')">Düzenle</button>
                    <button class="btn btn-sm btn-danger" onclick="removeUser('${person}')">Sil</button>
                </div>
            </div>
        `).join('');
    }

    // Düzenli ödeme form seçeneklerini güncelle
    const regularCardSelect = document.getElementById('regularCard');
    const regularUserSelect = document.getElementById('regularUser');

    if (regularCardSelect) {
        // Mevcut seçenekleri clear(ilk option hariç)
        const options = regularCardSelect.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());

        // Yeni seçenekleri ekle
        creditCards.forEach(card => {
            const option = document.createElement('option');
            option.value = card;
            option.textContent = card;
            regularCardSelect.appendChild(option);
        });
    }

    if (regularUserSelect) {
        // Mevcut seçenekleri clear(ilk option hariç)
        const options = regularUserSelect.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());

        // Yeni seçenekleri ekle
        people.forEach(person => {
            const option = document.createElement('option');
            option.value = person;
            option.textContent = person;
            regularUserSelect.appendChild(option);
        });
    }
}

function addNewCard() {
    const input = document.getElementById('newCardInput');
    const cardName = input.value.trim();
    if (cardName && !creditCards.includes(cardName)) {
        creditCards.push(cardName);
        authSystem.saveUserData();
        updateCardOptions();
        updateCardAndUserManagement();
        input.value = '';
        showToast('Card successfully added', 'success');
    }
}

function addNewUser() {
    const input = document.getElementById('newUserInput');
    const userName = input.value.trim();
    if (userName && !people.includes(userName)) {
        people.push(userName);
        authSystem.saveUserData();
        updateUserOptions();
        updateCardAndUserManagement();
        input.value = '';
        showToast('Kullanıcı başarıyla eklendi', 'success');
    }
}

function removeCard(cardName) {
    if (confirm(`"${cardName}" cardını silmek istediğinizden emin misiniz?`)) {
        creditCards = creditCards.filter(k => k !== cardName);
        authSystem.saveUserData();
        updateCardOptions();
        updateCardAndUserManagement();
        showToast('Card deleted', 'success');
    }
}

function removeUser(userName) {
    if (confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
        people = people.filter(k => k !== userName);
        authSystem.saveUserData();
        updateUserOptions();
        updateCardAndUserManagement();
        showToast('Kullanıcı silindi', 'success');
    }
}

// Manual migration function for data management page
function runManualMigration() {
    if (typeof migrateRegularPaymentData === 'function') {
        migrateRegularPaymentData();
    } else {
        showToast('Migration fonksiyonu bulunamadı', 'error');
    }
}