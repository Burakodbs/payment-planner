// Veri Yönetimi sayfasına özel JavaScript kodları


// Sayfa yüklendiğinde ortak component'leri initialize et
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('veri-yonetimi');
    }
});

function updateDataStats() {
    // İstatistikler kartı kaldırıldı, fonksiyon geriye uyumluluk için boş bırakıldı
}

function updateCardAndUserManagement() {
    // Kart yönetimi
    const cardList = document.getElementById('cardManagementList');
    if (cardList) {
        cardList.innerHTML = kredikartlari.map(kart => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                <span>${kart}</span>
                <div style="display: flex; gap: 4px;">
                    <button class="btn btn-sm btn-outline" onclick="editCard('${kart}')">Düzenle</button>
                    <button class="btn btn-sm btn-danger" onclick="removeCard('${kart}')">Sil</button>
                </div>
            </div>
        `).join('');
    }

    // Kullanıcı yönetimi
    const userList = document.getElementById('userManagementList');
    if (userList) {
        userList.innerHTML = kisiler.map(kisi => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                <span>${kisi}</span>
                <div style="display: flex; gap: 4px;">
                    <button class="btn btn-sm btn-outline" onclick="editUser('${kisi}')">Düzenle</button>
                    <button class="btn btn-sm btn-danger" onclick="removeUser('${kisi}')">Sil</button>
                </div>
            </div>
        `).join('');
    }

    // Düzenli ödeme form seçeneklerini güncelle
    const duzenliKartSelect = document.getElementById('duzenliKart');
    const duzenliKullaniciSelect = document.getElementById('duzenliKullanici');

    if (duzenliKartSelect) {
        // Mevcut seçenekleri temizle (ilk option hariç)
        const options = duzenliKartSelect.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());

        // Yeni seçenekleri ekle
        kredikartlari.forEach(kart => {
            const option = document.createElement('option');
            option.value = kart;
            option.textContent = kart;
            duzenliKartSelect.appendChild(option);
        });
    }

    if (duzenliKullaniciSelect) {
        // Mevcut seçenekleri temizle (ilk option hariç)
        const options = duzenliKullaniciSelect.querySelectorAll('option:not([value=""])');
        options.forEach(option => option.remove());

        // Yeni seçenekleri ekle
        kisiler.forEach(kisi => {
            const option = document.createElement('option');
            option.value = kisi;
            option.textContent = kisi;
            duzenliKullaniciSelect.appendChild(option);
        });
    }
}

function addNewCard() {
    const input = document.getElementById('newCardInput');
    const cardName = input.value.trim();
    if (cardName && !kredikartlari.includes(cardName)) {
        kredikartlari.push(cardName);
        authSystem.saveUserData();
        updateCardOptions();
        updateCardAndUserManagement();
        input.value = '';
        showToast('Kart başarıyla eklendi', 'success');
    }
}

function addNewUser() {
    const input = document.getElementById('newUserInput');
    const userName = input.value.trim();
    if (userName && !kisiler.includes(userName)) {
        kisiler.push(userName);
        authSystem.saveUserData();
        updateUserOptions();
        updateCardAndUserManagement();
        input.value = '';
        showToast('Kullanıcı başarıyla eklendi', 'success');
    }
}

function removeCard(cardName) {
    if (confirm(`"${cardName}" kartını silmek istediğinizden emin misiniz?`)) {
        kredikartlari = kredikartlari.filter(k => k !== cardName);
        authSystem.saveUserData();
        updateCardOptions();
        updateCardAndUserManagement();
        showToast('Kart silindi', 'success');
    }
}

function removeUser(userName) {
    if (confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
        kisiler = kisiler.filter(k => k !== userName);
        authSystem.saveUserData();
        updateUserOptions();
        updateCardAndUserManagement();
        showToast('Kullanıcı silindi', 'success');
    }
}

// Manual migration function for data management page
function runManualMigration() {
    if (typeof migrateDuzenliOdemeData === 'function') {
        migrateDuzenliOdemeData();
    } else {
        showToast('Migration fonksiyonu bulunamadı', 'error');
    }
}