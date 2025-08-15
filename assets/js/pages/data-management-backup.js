// Data Management page specific JavaScript code
// Sayfa yüklendiğinde ortak component'leri initialize et
document.addEventListener('DOMContentLoaded', function () {
    // Ortak compo        showToast(`✅ Yedek başarıyla oluşturuldu!\n📊 ${totalRecords} toplam kayıt\n📄 ${filename}`, 'success');
        console.log('Export completed:', {
            expenses: exportData.expenses.length,
            regularPayments: exportData.regularPayments.length,
            creditCards: exportData.creditCards.length,
            people: exportData.people.length,
            filename: filename
        });ri initialize et
    if (typeof initializePage === 'function') {
        initializePage('data-yonetimi');
    }
});
function updateDataStats() {
    // İstatistikler cardı kaldırıldı, fonksiyon geriye uyumluluk için boÅ        showToast(`✅ Veriler başarıyla geri yüklendi!\n📊 ${totalRecords} kayıt içe aktarıldı\n📄 ${filename}`, 'success');
        console.log('Data restoration completed:', {
            expenses: backupData.expenses.length,
            regularPayments: backupData.regularPayments.length,
            creditCards: backupData.creditCards.length,
            people: backupData.people.length
        });akıldı
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
// ==========================================
// BACKUP & RESTORE FUNCTIONS
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
                showToast('âœ… Yedek başarıyla oluşturuldu ve indirildi!', 'success');
            }).catch((error) => {
                console.error('FileStorage export error:', error);
                fallbackExport();
            });
            return;
        }
        // Fallback to original export method
        fallbackExport();
    } catch (error) {
        console.error('âŒ Export error:', error);
        showToast('âŒ Yedek oluşturulurken hata oluştu: ' + error.message, 'error');
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
        showToast(`âœ… Yedek başarıyla oluşturuldu!\nğŸ“Š ${totalRecords} toplam kayıt\nğŸ“ ${filename}`, 'success');
            expenses: exportData.expenses.length,
            regularPayments: exportData.regularPayments.length,
            creditCards: exportData.creditCards.length,
            people: exportData.people.length,
            filename: filename
        });
    } catch (error) {
        console.error('âŒ Export error:', error);
        showToast('âŒ Yedek oluşturulurken hata oluştu: ' + error.message, 'error');
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
        fileInput.addEventListener('change', async function(event) {
            const file = event.target.files[0];
            if (!file) {
                showToast('âš ï¸ Dosya seçilmedi', 'warning');
                return;
            }
            if (!file.name.toLowerCase().endsWith('.json')) {
                showToast('âŒ Lütfen geçerli bir JSON dosyası seçin', 'error');
                return;
            }
            try {
                // Use FileStorage if available
                if (window.fileStorage && window.fileStorage.currentUser) {
                    const success = await window.fileStorage.importFromFile(file);
                    if (success) {
                        showToast('âœ… Veriler başarıyla içe aktarıldı!', 'success');
                        // Update all views
                        setTimeout(() => {
                            updateCardAndUserManagement();
                            if (typeof DataManager !== 'undefined' && DataManager.updateAllViews) {
                                DataManager.updateAllViews();
                            }
                        }, 500);
                    }
                } else {
                    // Fallback to original import method
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const importedData = JSON.parse(e.target.result);
                            processImportedData(importedData, file.name);
                        } catch (parseError) {
                            console.error('âŒ JSON parse error:', parseError);
                            showToast('âŒ Geçersiz JSON dosyası: ' + parseError.message, 'error');
                        }
                    };
                    reader.onerror = function() {
                        showToast('âŒ Dosya okuma hatası', 'error');
                    };
                    reader.readAsText(file);
                }
            } catch (error) {
                console.error('âŒ Import error:', error);
                showToast('âŒ İçe aktarma hatası: ' + error.message, 'error');
            }
        });
        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    } catch (error) {
        console.error('âŒ Import initialization error:', error);
        showToast('âŒ İçe aktarma başlatılırken hata oluştu: ' + error.message, 'error');
    }
}
/**
 * Process and validate imported data
 */
function processImportedData(importedData, filename) {
    try {
        // Validate data structure
        if (!importedData || typeof importedData !== 'object') {
            throw new Error('Geçersiz veri formatı');
        }
        // Convert old Turkish field names to new English format if needed
        const convertedData = convertImportedDataFormat(importedData);
        // Validate converted data
        const validationResult = validateImportedData(convertedData);
        if (!validationResult.isValid) {
            throw new Error('Veri doğrulama hatası: ' + validationResult.error);
        }
        // Show confirmation dialog
        const totalRecords = (convertedData.expenses?.length || 0) + 
                           (convertedData.regularPayments?.length || 0) + 
                           (convertedData.creditCards?.length || 0) + 
                           (convertedData.people?.length || 0);
        const confirmMessage = `ğŸ“ Dosya: ${filename}\n\nğŸ“Š İçe Aktarılacak Veriler:\n` +
                              `â€¢ ${convertedData.expenses?.length || 0} harcama\n` +
                              `â€¢ ${convertedData.regularPayments?.length || 0} düzenli ödeme\n` +
                              `â€¢ ${convertedData.creditCards?.length || 0} kredi kartı\n` +
                              `â€¢ ${convertedData.people?.length || 0} kişi\n\n` +
                              `âš ï¸ UYARI: Bu işlem mevcut tüm verilerinizin yerine geçer!\n\n` +
                              `Devam etmek istediğinizden emin misiniz?`;
        if (confirm(confirmMessage)) {
            restoreDataFromBackup(convertedData, filename);
        } else {
            showToast('ğŸ“‹ İçe aktarma iptal edildi', 'info');
        }
    } catch (error) {
        console.error('âŒ Data processing error:', error);
        showToast('âŒ Veri işleme hatası: ' + error.message, 'error');
    }
}
/**
 * Convert imported data format (handle both old Turkish and new English formats)
 */
function convertImportedDataFormat(importedData) {
    const converted = {
        expenses: [],
        regularPayments: [],
        creditCards: [],
        people: []
    };
    // Handle expenses (harcamalar -> expenses)
    const expensesData = importedData.expenses || importedData.harcamalar || [];
    converted.expenses = expensesData.map(item => {
        // Handle null amounts
        const amount = (item.amount !== null && item.amount !== undefined) ? 
                      parseFloat(item.amount) : 
                      (item.tutar !== null && item.tutar !== undefined) ? 
                      parseFloat(item.tutar) : 0;
        return {
            id: item.id,
            date: item.date || item.tarih,
            card: item.card || item.kart,
            person: item.person || item.kullanici,
            category: item.category || item.kategori || 'Diğer',
            description: item.description || item.aciklama || '',
            amount: amount,
            installmentNumber: item.installmentNumber || item.taksitNo,
            totalInstallments: item.totalInstallments || item.toplamTaksit,
            isInstallment: item.isInstallment || item.isTaksit || false,
            regularPaymentId: item.regularPaymentId || item.duzenliOdemeId,
            isRegular: item.isRegular || false
        };
    });
    // Handle regular payments (duzenliOdemeler -> regularPayments)
    const regularPaymentsData = importedData.regularPayments || importedData.duzenliOdemeler || [];
    converted.regularPayments = regularPaymentsData.map(item => ({
        id: item.id,
        description: item.description || item.aciklama || item.ad,
        amount: parseFloat(item.amount || item.tutar) || 0,
        card: item.card || item.kart,
        person: item.person || item.kullanici,
        startDate: item.startDate || item.baslangicTarihi,
        category: item.category || item.kategori || 'Regular Payment',
        active: item.active !== false && item.aktif !== false // Default to true
    }));
    // Handle credit cards (kredikartlari -> creditCards)
    converted.creditCards = importedData.creditCards || importedData.kredikartlari || [];
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
    try {
        // Check if data has required structure
        if (!data.expenses || !Array.isArray(data.expenses)) {
            return { isValid: false, error: 'Expenses data is missing or invalid' };
        }
        if (!data.regularPayments || !Array.isArray(data.regularPayments)) {
            return { isValid: false, error: 'Regular payments data is missing or invalid' };
        }
        if (!data.creditCards || !Array.isArray(data.creditCards)) {
            return { isValid: false, error: 'Credit cards data is missing or invalid' };
        }
        if (!data.people || !Array.isArray(data.people)) {
            return { isValid: false, error: 'People data is missing or invalid' };
        }
        // Validate expenses data structure
        for (let i = 0; i < Math.min(data.expenses.length, 3); i++) {
            const expense = data.expenses[i];
            if (!expense.id || !expense.date || !expense.card || !expense.person) {
                return { isValid: false, error: `Invalid expense structure at index ${i}` };
            }
        }
        return { isValid: true };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
}
/**
 * Restore data from backup
 */
function restoreDataFromBackup(backupData, filename) {
    try {
        // Create backup of current data before restoring
        const currentDataBackup = {
            expenses: [...(expenses || [])],
            regularPayments: [...(regularPayments || [])],
            creditCards: [...(creditCards || [])],
            people: [...(people || [])]
        };
        // Update global variables
        window.expenses = backupData.expenses;
        window.regularPayments = backupData.regularPayments;
        window.creditCards = backupData.creditCards;
        window.people = backupData.people;
        // Save to localStorage
        localStorage.setItem('expenses', JSON.stringify(backupData.expenses));
        localStorage.setItem('regularPayments', JSON.stringify(backupData.regularPayments));
        localStorage.setItem('creditCards', JSON.stringify(backupData.creditCards));
        localStorage.setItem('people', JSON.stringify(backupData.people));
        // Save to auth system if available
        if (typeof authSystem !== 'undefined' && authSystem.currentUser) {
            authSystem.currentUserData = {
                ...authSystem.currentUserData,
                expenses: backupData.expenses,
                regularPayments: backupData.regularPayments,
                creditCards: backupData.creditCards,
                people: backupData.people
            };
            authSystem.saveUserData();
        }
        // Update all UI components
        if (typeof DataManager !== 'undefined' && DataManager.updateAllViews) {
            DataManager.updateAllViews();
        }
        updateCardAndUserManagement();
        const totalRecords = backupData.expenses.length + 
                           backupData.regularPayments.length + 
                           backupData.creditCards.length + 
                           backupData.people.length;
        showToast(`âœ… Veriler başarıyla geri yüklendi!\nğŸ“Š ${totalRecords} kayıt içe aktarıldı\nğŸ“ ${filename}`, 'success');
            expenses: backupData.expenses.length,
            regularPayments: backupData.regularPayments.length,
            creditCards: backupData.creditCards.length,
            people: backupData.people.length
        });
        // Reload page after a short delay to refresh all views
        setTimeout(() => {
            if (confirm('Sayfayı yeniden yüklemek tüm görünümleri güncelleyecek. Devam edilsin mi?')) {
                window.location.reload();
            }
        }, 2000);
    } catch (error) {
        console.error('âŒ Data restoration error:', error);
        showToast('âŒ Veri geri yükleme hatası: ' + error.message, 'error');
        // Try to restore from backup if available
        if (currentDataBackup) {
            window.expenses = currentDataBackup.expenses;
            window.regularPayments = currentDataBackup.regularPayments;
            window.creditCards = currentDataBackup.creditCards;
            window.people = currentDataBackup.people;
        }
    }
}
/**
 * Emergency restore function - restore from hardcoded backup data - Integrated with FileStorage
 */
function emergencyRestore() {
    try {
        // Hardcoded backup data from the latest known backup
        const emergencyBackupData = {
            "expenses": [
                {"id":"duzenli_1754317509229_2025-08","date":"2025-08-05","card":"Vakıf","person":"Burak","category":"Düzenli Ã–deme","description":"anne telefon (Düzenli)","amount":208,"installmentNumber":null,"totalInstallments":null,"isInstallment":false,"regularPaymentId":1754317509229,"isRegular":true},
                {"id":1754317386965,"date":"2025-08-04","card":"Ziraat","person":"Burak","category":"Diğer","description":"turknet berkay","amount":1000,"installmentNumber":1,"totalInstallments":6,"isInstallment":true},
                {"id":1754340317305,"date":"2025-08-04","card":"Vakıf","person":"Burak","category":"Diğer","description":"","amount":75,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
                {"id":"duzenli_1754435023174_2025-08","date":"2025-08-03","card":"Vakıf","person":"Burak","category":"Düzenli Ã–deme","description":"ihh (Düzenli)","amount":800,"installmentNumber":null,"totalInstallments":null,"isInstallment":false,"regularPaymentId":1754435023174,"isRegular":true}
            ],
            "regularPayments": [
                {"id":1754317509229,"description":"anne telefon","card":"Vakıf","person":"Burak","amount":208,"startDate":"2025-08-05","category":"Regular Payment","active":true},
                {"id":1754317556140,"description":"anane telefon","card":"Vakıf","person":"Burak","amount":308.5,"startDate":"2025-08-18","category":"Regular Payment","active":true},
                {"id":1754317577574,"description":"burak telefon","card":"Vakıf","person":"Burak","amount":306,"startDate":"2025-08-12","category":"Regular Payment","active":true},
                {"id":1754435023174,"description":"ihh","amount":800,"card":"Vakıf","person":"Burak","startDate":"2025-08-03","category":"Regular Payment","active":true}
            ],
            "creditCards": ["Axess", "World", "Enpara", "Vakıf", "Ziraat"],
            "people": ["Burak", "Semih Abi", "Sinan Abi", "Annem", "Talha"]
        };
        const confirmMessage = `ğŸš¨ ACİL VERİ KURTARMA\n\n` +
                              `Bu işlem son bilinen yedek verileri geri yükler:\n` +
                              `â€¢ ${emergencyBackupData.expenses.length} harcama\n` +
                              `â€¢ ${emergencyBackupData.regularPayments.length} düzenli ödeme\n` +
                              `â€¢ ${emergencyBackupData.creditCards.length} kredi kartı\n` +
                              `â€¢ ${emergencyBackupData.people.length} kişi\n\n` +
                              `âš ï¸ UYARI: Mevcut tüm veriler silinecek!\n\n` +
                              `Acil kurtarma işlemini başlatmak istiyor musunuz?`;
        if (confirm(confirmMessage)) {
            // Use FileStorage if available
            if (window.fileStorage && window.fileStorage.currentUser) {
                // Convert to proper format for FileStorage
                const userData = {
                    username: window.fileStorage.currentUser,
                    lastUpdated: new Date().toISOString(),
                    expenses: emergencyBackupData.expenses,
                    regularPayments: emergencyBackupData.regularPayments,
                    creditCards: emergencyBackupData.creditCards,
                    people: emergencyBackupData.people,
                    settings: {
                        theme: 'light'
                    }
                };
                window.fileStorage.applyUserData(userData);
                window.fileStorage.saveUserData().then(() => {
                    showToast('ğŸš‘ Acil veri kurtarma başarıyla tamamlandı!', 'success');
                    setTimeout(() => updateCardAndUserManagement(), 500);
                }).catch((error) => {
                    console.error('FileStorage emergency restore error:', error);
                    // Fallback to original method
                    restoreDataFromBackup(emergencyBackupData, 'Emergency Backup');
                });
            } else {
                // Fallback to original method
                restoreDataFromBackup(emergencyBackupData, 'Emergency Backup');
            }
            showToast('ğŸš‘ Acil veri kurtarma işlemi başlatıldı!', 'success');
        } else {
            showToast('ğŸš¨ Acil kurtarma iptal edildi', 'info');
        }
    } catch (error) {
        console.error('âŒ Emergency restore error:', error);
        showToast('âŒ Acil kurtarma hatası: ' + error.message, 'error');
    }
}
