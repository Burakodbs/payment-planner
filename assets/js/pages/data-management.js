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
    
    // User management
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
}

// Card Management Functions
function addCard() {
    const input = document.getElementById('newCardName');
    const cardName = input.value.trim();
    
    if (!cardName) {
        showToast('⚠️ Kart adı boş olamaz!', 'warning');
        return;
    }
    
    if (creditCards.includes(cardName)) {
        showToast('⚠️ Bu kart zaten mevcut!', 'warning');
        return;
    }
    
    creditCards.push(cardName);
    input.value = '';
    
    // Update UI
    updateCardAndUserManagement();
    if (typeof updateCardOptions === 'function') {
        updateCardOptions();
    }
    if (typeof authSystem !== 'undefined' && authSystem) {
        authSystem.saveUserData();
    }
    
    showToast('✅ Kart başarıyla eklendi!', 'success');
}

function editCard(oldCard) {
    const newCard = prompt('Yeni kart adı:', oldCard);
    if (newCard && newCard.trim() && newCard.trim() !== oldCard) {
        const index = creditCards.indexOf(oldCard);
        if (index !== -1) {
            creditCards[index] = newCard.trim();
            
            // Update expenses that use this card
            if (typeof expenses !== 'undefined' && expenses) {
                expenses.forEach(expense => {
                    if (expense.card === oldCard) {
                        expense.card = newCard.trim();
                    }
                });
            }
            
            // Update UI
            updateCardAndUserManagement();
            if (typeof updateCardOptions === 'function') {
                updateCardOptions();
            }
            if (typeof authSystem !== 'undefined' && authSystem) {
                authSystem.saveUserData();
            }
            
            showToast('✅ Kart başarıyla güncellendi!', 'success');
        }
    }
}

function removeCard(card) {
    if (confirm(`"${card}" kartını silmek istediğinizden emin misiniz?\n\nBu karta ait harcamalar silinmeyecek, ancak kart bilgisi kaldırılacak.`)) {
        const index = creditCards.indexOf(card);
        if (index !== -1) {
            creditCards.splice(index, 1);
            
            // Update UI
            updateCardAndUserManagement();
            if (typeof updateCardOptions === 'function') {
                updateCardOptions();
            }
            if (typeof authSystem !== 'undefined' && authSystem) {
                authSystem.saveUserData();
            }
            
            showToast('✅ Kart başarıyla silindi!', 'success');
        }
    }
}

// User Management Functions
function addUser() {
    const input = document.getElementById('newUserName');
    const userName = input.value.trim();
    
    if (!userName) {
        showToast('⚠️ Kullanıcı adı boş olamaz!', 'warning');
        return;
    }
    
    if (people.includes(userName)) {
        showToast('⚠️ Bu kullanıcı zaten mevcut!', 'warning');
        return;
    }
    
    people.push(userName);
    input.value = '';
    
    // Update UI
    updateCardAndUserManagement();
    if (typeof updateUserOptions === 'function') {
        updateUserOptions();
    }
    if (typeof authSystem !== 'undefined' && authSystem) {
        authSystem.saveUserData();
    }
    
    showToast('✅ Kullanıcı başarıyla eklendi!', 'success');
}

function editUser(oldUser) {
    const newUser = prompt('Yeni kullanıcı adı:', oldUser);
    if (newUser && newUser.trim() && newUser.trim() !== oldUser) {
        const index = people.indexOf(oldUser);
        if (index !== -1) {
            people[index] = newUser.trim();
            
            // Update expenses that use this user
            if (typeof expenses !== 'undefined' && expenses) {
                expenses.forEach(expense => {
                    if (expense.user === oldUser) {
                        expense.user = newUser.trim();
                    }
                });
            }
            
            // Update UI
            updateCardAndUserManagement();
            if (typeof updateUserOptions === 'function') {
                updateUserOptions();
            }
            if (typeof authSystem !== 'undefined' && authSystem) {
                authSystem.saveUserData();
            }
            
            showToast('✅ Kullanıcı başarıyla güncellendi!', 'success');
        }
    }
}

function removeUser(user) {
    if (confirm(`"${user}" kullanıcısını silmek istediğinizden emin misiniz?\n\nBu kullanıcıya ait harcamalar silinmeyecek, ancak kullanıcı bilgisi kaldırılacak.`)) {
        const index = people.indexOf(user);
        if (index !== -1) {
            people.splice(index, 1);
            
            // Update UI
            updateCardAndUserManagement();
            if (typeof updateUserOptions === 'function') {
                updateUserOptions();
            }
            if (typeof authSystem !== 'undefined' && authSystem) {
                authSystem.saveUserData();
            }
            
            showToast('✅ Kullanıcı başarıyla silindi!', 'success');
        }
    }
}

// ==========================================
// DATA EXPORT/IMPORT FUNCTIONS
// ==========================================

/**
 * Export all data to JSON file - Integrated with FileStorage
 */
function exportData() {
    try {
        // Use FileStorage if available
        if (window.fileStorage && window.fileStorage.currentUser) {
            // FileStorage already handles backup file creation automatically
            // Force a manual save and backup
            window.fileStorage.saveUserData().then(() => {
                showToast('✅ Yedek başarıyla oluşturuldu ve indirildi!', 'success');
            }).catch((error) => {
                console.error('FileStorage export error:', error);
                fallbackExport();
            });
            return;
        }
        
        // Fallback to original export method
        fallbackExport();
    } catch (error) {
        console.error('❌ Export error:', error);
        showToast('❌ Yedek oluşturulurken hata oluştu: ' + error.message, 'error');
    }
}

/**
 * Fallback export method (original localStorage-based)
 */
function fallbackExport() {
    try {
        // Collect all data
        const exportData = {
            expenses: expenses || [],
            regularPayments: regularPayments || [],
            creditCards: creditCards || [],
            people: people || [],
            exportDate: new Date().toISOString(),
            version: '3.1.0',
            appName: 'Payment Planner'
        };
        
        // Create backup filename with current date
        const currentDate = new Date().toISOString().slice(0, 10);
        const filename = `payment-planner-backup-${currentDate}.json`;
        
        // Convert to JSON string
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Show success message
        const totalRecords = (exportData.expenses.length + 
                            exportData.regularPayments.length + 
                            exportData.creditCards.length + 
                            exportData.people.length);
        showToast(`✅ Yedek başarıyla oluşturuldu!\n📊 ${totalRecords} toplam kayıt\n📄 ${filename}`, 'success');
        
        console.log('Export completed:', {
            expenses: exportData.expenses.length,
            regularPayments: exportData.regularPayments.length,
            creditCards: exportData.creditCards.length,
            people: exportData.people.length,
            filename: filename
        });
    } catch (error) {
        console.error('❌ Export error:', error);
        showToast('❌ Yedek oluşturulurken hata oluştu: ' + error.message, 'error');
    }
}

/**
 * Import data from JSON file - Integrated with FileStorage
 */
function importData() {
    try {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        fileInput.onchange = function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate imported data
                    if (!validateImportedData(importedData)) {
                        showToast('❌ Geçersiz veri formatı!', 'error');
                        return;
                    }
                    
                    // Convert old format to new format if needed
                    const converted = convertLegacyData(importedData);
                    
                    // Ask user for confirmation
                    const message = `Bu işlem mevcut verileri değiştirecek!\n\n` +
                                  `İçe aktarılacak veriler:\n` +
                                  `• ${converted.expenses.length} harcama\n` +
                                  `• ${converted.regularPayments.length} düzenli ödeme\n` +
                                  `• ${converted.creditCards.length} kart\n` +
                                  `• ${converted.people.length} kişi\n\n` +
                                  `Devam edilsin mi?`;
                    
                    if (!confirm(message)) return;
                    
                    // Import data
                    if (window.fileStorage && window.fileStorage.currentUser) {
                        // Use FileStorage method
                        window.fileStorage.importBackupData(converted, file.name).then(() => {
                            showToast('✅ Veriler başarıyla içe aktarıldı!', 'success');
                            setTimeout(() => {
                                if (confirm('Sayfayı yenilemek tüm görünümleri güncelleyecek. Devam edilsin mi?')) {
                                    window.location.reload();
                                }
                            }, 1000);
                        }).catch(error => {
                            console.error('FileStorage import error:', error);
                            fallbackImport(converted, file.name);
                        });
                    } else {
                        fallbackImport(converted, file.name);
                    }
                    
                } catch (error) {
                    console.error('❌ Import parsing error:', error);
                    showToast('❌ Dosya okunamadı: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        // Trigger file dialog
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
        
    } catch (error) {
        console.error('❌ Import error:', error);
        showToast('❌ İçe aktarma başlatılamadı: ' + error.message, 'error');
    }
}

/**
 * Fallback import method
 */
function fallbackImport(backupData, filename) {
    try {
        // Update global arrays
        window.expenses = backupData.expenses || [];
        window.regularPayments = backupData.regularPayments || [];
        window.creditCards = backupData.creditCards || [];
        window.people = backupData.people || [];
        
        // Update auth system if available
        if (typeof authSystem !== 'undefined' && authSystem) {
            authSystem.saveUserData();
        }
        
        const totalRecords = backupData.expenses.length + 
                           backupData.regularPayments.length + 
                           backupData.creditCards.length + 
                           backupData.people.length;
        
        showToast(`✅ Veriler başarıyla geri yüklendi!\n📊 ${totalRecords} kayıt içe aktarıldı\n📄 ${filename}`, 'success');
        
        console.log('Data restoration completed:', {
            expenses: backupData.expenses.length,
            regularPayments: backupData.regularPayments.length,
            creditCards: backupData.creditCards.length,
            people: backupData.people.length
        });
        
        // Reload page after a short delay to refresh all views
        setTimeout(() => {
            if (confirm('Sayfayı yenilemek tüm görünümleri güncelleyecek. Devam edilsin mi?')) {
                window.location.reload();
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Data restoration error:', error);
        showToast('❌ Veri geri yükleme hatası: ' + error.message, 'error');
    }
}

/**
 * Convert old data format to new format
 */
function convertLegacyData(importedData) {
    const converted = {
        expenses: [],
        regularPayments: [],
        creditCards: [],
        people: []
    };
    
    // Handle expenses
    converted.expenses = importedData.expenses || importedData.harcamalar || [];
    
    // Handle regular payments
    converted.regularPayments = importedData.regularPayments || importedData.duzenliOdemeler || [];
    
    // Handle credit cards
    converted.creditCards = importedData.creditCards || importedData.kartlar || [];
    
    // Handle people (kisiler -> people)
    converted.people = importedData.people || importedData.kisiler || [];
    
    console.log('Data conversion completed:', {
        expenses: converted.expenses.length,
        regularPayments: converted.regularPayments.length,
        creditCards: converted.creditCards.length,
        people: converted.people.length
    });
    
    return converted;
}

/**
 * Validate imported data
 */
function validateImportedData(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Check if it has at least one of the expected properties
    const hasExpenses = Array.isArray(data.expenses) || Array.isArray(data.harcamalar);
    const hasPayments = Array.isArray(data.regularPayments) || Array.isArray(data.duzenliOdemeler);
    const hasCards = Array.isArray(data.creditCards) || Array.isArray(data.kartlar);
    const hasPeople = Array.isArray(data.people) || Array.isArray(data.kisiler);
    
    return hasExpenses || hasPayments || hasCards || hasPeople;
}

/**
 * Reset all data with confirmation
 */
function resetAllData() {
    const message = `⚠️ TÜM VERİLER SİLİNECEK!\n\n` +
                  `Bu işlem:\n` +
                  `• Tüm harcamaları\n` +
                  `• Tüm düzenli ödemeleri\n` +
                  `• Tüm kartları\n` +
                  `• Tüm kişileri\n` +
                  `kalıcı olarak silecek.\n\n` +
                  `Bu işlem GERİ ALINAMAZ!\n\n` +
                  `Devam etmek istediğinizden emin misiniz?`;
    
    if (!confirm(message)) return;
    
    // Second confirmation
    const finalConfirm = prompt('Onaylamak için "SIFIRLA" yazın:', '');
    if (finalConfirm !== 'SIFIRLA') {
        showToast('❌ İşlem iptal edildi.', 'error');
        return;
    }
    
    try {
        // Reset all data
        window.expenses = [];
        window.regularPayments = [];
        window.creditCards = [];
        window.people = [];
        
        // Save changes
        if (typeof authSystem !== 'undefined' && authSystem) {
            authSystem.saveUserData();
        }
        
        showToast('✅ Tüm veriler başarıyla sıfırlandı!', 'success');
        
        // Reload page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Reset error:', error);
        showToast('❌ Sıfırlama hatası: ' + error.message, 'error');
    }
}
