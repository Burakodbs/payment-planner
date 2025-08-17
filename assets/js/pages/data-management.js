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
 * Export all data to JSON file - Enhanced format compatibility
 */
function exportData() {
    try {
        console.log('🔄 Starting data export...');
        
        // Ensure up-to-date data extraction
        if (typeof authSystem !== 'undefined' && authSystem && authSystem.ensureCardUserExtraction) {
            try { 
                authSystem.ensureCardUserExtraction(); 
            } catch (e) {
                console.warn('Card/user extraction failed:', e);
            }
        }
        
        // Collect all data in Payment Planner backup format
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
        
        console.log('📊 Export data summary:', {
            expenses: exportData.expenses.length,
            regularPayments: exportData.regularPayments.length,
            creditCards: exportData.creditCards.length,
            people: exportData.people.length,
            filename
        });
        
        // Convert to JSON string with formatting
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
        
        // Show success message with detailed info
        const totalRecords = exportData.expenses.length + 
                            exportData.regularPayments.length + 
                            exportData.creditCards.length + 
                            exportData.people.length;
        
        const successMessage = `✅ Yedek başarıyla oluşturuldu!\n\n` +
                              `📂 Dosya: ${filename}\n` +
                              `📊 Toplam: ${totalRecords} kayıt\n` +
                              `💳 Harcamalar: ${exportData.expenses.length}\n` +
                              `🔄 Düzenli ödemeler: ${exportData.regularPayments.length}\n` +
                              `🏦 Kartlar: ${exportData.creditCards.length}\n` +
                              `👤 Kişiler: ${exportData.people.length}`;
        
        showToast(successMessage, 'success');
        
        console.log('✅ Export completed successfully:', {
            filename,
            totalRecords,
            breakdown: exportData
        });
        
    } catch (error) {
        console.error('❌ Export error:', error);
        showToast('❌ Yedek oluşturulurken hata oluştu:\n' + error.message, 'error');
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
 * Import data from JSON file - Enhanced for your backup format
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
                    
                    // Convert and normalize data format
                    const converted = convertAndNormalizeData(importedData);
                    
                    // Show detailed preview
                    const message = `📂 Dosya: ${file.name}\n` +
                                  `📅 Export Tarihi: ${importedData.exportDate ? new Date(importedData.exportDate).toLocaleDateString('tr-TR') : 'Bilinmiyor'}\n` +
                                  `📱 Uygulama: ${importedData.appName || 'Payment Planner'} v${importedData.version || '?'}\n\n` +
                                  `Bu işlem mevcut verileri değiştirecek!\n\n` +
                                  `🔄 İçe aktarılacak veriler:\n` +
                                  `• 💳 ${converted.expenses.length} harcama kaydı\n` +
                                  `• 🔄 ${converted.regularPayments.length} düzenli ödeme\n` +
                                  `• 🏦 ${converted.creditCards.length} kredi kartı\n` +
                                  `• 👤 ${converted.people.length} kişi\n\n` +
                                  `⚠️ Bu işlem geri alınamaz!\n` +
                                  `Devam edilsin mi?`;
                    
                    if (!confirm(message)) {
                        showToast('❌ İşlem iptal edildi.', 'warning');
                        return;
                    }
                    
                    // Import data with enhanced process
                    processDataImport(converted, file.name, importedData);
                    
                } catch (error) {
                    console.error('❌ Import parsing error:', error);
                    showToast('❌ Dosya okunamadı veya bozuk: ' + error.message, 'error');
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
 * Process the data import with enhanced error handling
 */
function processDataImport(convertedData, filename, originalData) {
    try {
        console.log('🔄 Processing data import...', {
            expenses: convertedData.expenses.length,
            regularPayments: convertedData.regularPayments.length,
            creditCards: convertedData.creditCards.length,
            people: convertedData.people.length
        });

        // Backup current data first
        const currentBackup = {
            expenses: window.expenses || [],
            regularPayments: window.regularPayments || [],
            creditCards: window.creditCards || [],
            people: window.people || []
        };

        try {
            // Update global arrays with imported data
            window.expenses = convertedData.expenses;
            window.regularPayments = convertedData.regularPayments;
            window.creditCards = convertedData.creditCards;
            window.people = convertedData.people;
            
            // CRITICAL: Also update global variable references
            if (typeof expenses !== 'undefined') {
                expenses.length = 0; // Clear existing
                expenses.push(...convertedData.expenses); // Add new data
            } else {
                window.expenses = convertedData.expenses;
            }
            
            if (typeof regularPayments !== 'undefined') {
                regularPayments.length = 0;
                regularPayments.push(...convertedData.regularPayments);
            }
            
            if (typeof creditCards !== 'undefined') {
                creditCards.length = 0;
                creditCards.push(...convertedData.creditCards);
            }
            
            if (typeof people !== 'undefined') {
                people.length = 0;
                people.push(...convertedData.people);
            }
            
            console.log('🔄 Global variables updated:', {
                expenses: expenses?.length || 0,
                regularPayments: regularPayments?.length || 0,
                creditCards: creditCards?.length || 0,
                people: people?.length || 0
            });
            
            // Save to auth system if available
            if (typeof authSystem !== 'undefined' && authSystem && authSystem.currentUser) {
                authSystem.currentUserData.expenses = convertedData.expenses;
                authSystem.currentUserData.regularPayments = convertedData.regularPayments;
                authSystem.currentUserData.creditCards = convertedData.creditCards;
                authSystem.currentUserData.people = convertedData.people;
                authSystem.saveUserData();
                
                console.log('✅ Data saved to auth system');
            }
            
            // Update all UI components
            if (typeof FormHandlers !== 'undefined') {
                if (FormHandlers.updateCardOptions) FormHandlers.updateCardOptions();
                if (FormHandlers.updateUserOptions) FormHandlers.updateUserOptions();
            }
            
            // Force reload user data to ensure sync
            if (typeof authSystem !== 'undefined' && authSystem && authSystem.loadUserData) {
                console.log('🔄 Forcing auth system data reload...');
                authSystem.loadUserData();
            }
            
            // Update views
            updateCardAndUserManagement();
            if (typeof DataManager !== 'undefined' && DataManager.updateAllViews) {
                DataManager.updateAllViews();
            }
            
            // Trigger page updates
            if (typeof authSystem !== 'undefined' && authSystem && authSystem.triggerPageUpdates) {
                console.log('🔄 Triggering page updates...');
                authSystem.triggerPageUpdates();
            }
            
            // Success message with detailed stats
            const totalRecords = convertedData.expenses.length + 
                               convertedData.regularPayments.length + 
                               convertedData.creditCards.length + 
                               convertedData.people.length;
            
            // Show detailed success info
            const successMessage = `✅ Veriler başarıyla içe aktarıldı!\n\n` +
                                  `📂 Dosya: ${filename}\n` +
                                  `📊 Toplam: ${totalRecords} kayıt\n` +
                                  `💳 Harcamalar: ${convertedData.expenses.length}\n` +
                                  `🔄 Düzenli ödemeler: ${convertedData.regularPayments.length}\n` +
                                  `🏦 Kartlar: ${convertedData.creditCards.length}\n` +
                                  `� Kişiler: ${convertedData.people.length}`;
            
            showToast(successMessage, 'success');
            
            console.log('✅ Import completed successfully:', {
                filename,
                totalRecords,
                breakdown: {
                    expenses: convertedData.expenses.length,
                    regularPayments: convertedData.regularPayments.length,
                    creditCards: convertedData.creditCards.length,
                    people: convertedData.people.length
                }
            });
            
            // Offer to reload page for complete refresh
            setTimeout(() => {
                if (confirm('🔄 Tüm görünümleri güncellemek için sayfayı yenilemek ister misiniz?\n\n(Önerilen: Evet)')) {
                    window.location.reload();
                }
            }, 2000);
            
        } catch (importError) {
            console.error('❌ Import processing failed, restoring backup:', importError);
            
            // Restore from backup
            window.expenses = currentBackup.expenses;
            window.regularPayments = currentBackup.regularPayments;
            window.creditCards = currentBackup.creditCards;
            window.people = currentBackup.people;
            
            if (typeof authSystem !== 'undefined' && authSystem && authSystem.currentUser) {
                authSystem.saveUserData();
            }
            
            showToast('❌ İçe aktarma sırasında hata oluştu, veriler geri yüklendi!\n\nHata: ' + importError.message, 'error');
        }
        
    } catch (error) {
        console.error('❌ Critical import error:', error);
        showToast('❌ Kritik hata: ' + error.message, 'error');
    }
}

/**
 * Convert and normalize data format - Enhanced for backup file compatibility
 */
function convertAndNormalizeData(importedData) {
    console.log('🔄 Converting data format...', importedData);
    
    const converted = {
        expenses: [],
        regularPayments: [],
        creditCards: [],
        people: []
    };
    
    try {
        // Handle expenses with multiple possible field names and formats
        let expenseSource = importedData.expenses || importedData.harcamalar || [];
        converted.expenses = expenseSource.map(expense => {
            // Normalize expense format
            const normalized = {
                id: expense.id || Date.now() + Math.random(),
                date: expense.date || expense.tarih || new Date().toISOString().slice(0, 10),
                card: expense.card || expense.kart || '',
                person: expense.person || expense.kisi || expense.user || '',
                description: expense.description || expense.aciklama || '',
                amount: parseFloat(expense.amount || expense.tutar || 0),
                category: expense.category || expense.kategori || 'Diğer'
            };
            
            // Handle installment data (both old and new formats)
            if (expense.isInstallment || expense.isTaksit || expense.installmentNumber || expense.taksitNo) {
                normalized.isInstallment = true;
                normalized.installmentNumber = expense.installmentNumber || expense.taksitNo || 1;
                normalized.totalInstallments = expense.totalInstallments || expense.toplamTaksit || 1;
            } else {
                normalized.isInstallment = false;
            }
            
            // Handle regular payment flags
            if (expense.isRegular || expense.regularPaymentId || expense.description?.includes('(Düzenli)')) {
                normalized.isRegular = true;
                if (expense.regularPaymentId) {
                    normalized.regularPaymentId = expense.regularPaymentId;
                }
            } else {
                normalized.isRegular = false;
            }
            
            return normalized;
        });
        
        // Handle regular payments
        let regularSource = importedData.regularPayments || importedData.duzenliOdemeler || [];
        converted.regularPayments = regularSource.map(payment => ({
            id: payment.id || Date.now() + Math.random(),
            description: payment.description || payment.aciklama || '',
            amount: parseFloat(payment.amount || payment.tutar || 0),
            card: payment.card || payment.kart || '',
            person: payment.person || payment.kisi || payment.user || '',
            startDate: payment.startDate || payment.baslangicTarihi || new Date().toISOString().slice(0, 10),
            category: payment.category || payment.kategori || 'Regular Payment',
            active: payment.active !== false // Default to true unless explicitly false
        }));
        
        // Handle credit cards - ensure uniqueness
        let cardSource = importedData.creditCards || importedData.kartlar || [];
        converted.creditCards = [...new Set(cardSource.filter(card => card && card.trim()))];
        
        // Handle people - ensure uniqueness  
        let peopleSource = importedData.people || importedData.kisiler || [];
        converted.people = [...new Set(peopleSource.filter(person => person && person.trim()))];
        
        // Extract additional cards and people from expenses if not already present
        converted.expenses.forEach(expense => {
            if (expense.card && !converted.creditCards.includes(expense.card)) {
                converted.creditCards.push(expense.card);
            }
            if (expense.person && !converted.people.includes(expense.person)) {
                converted.people.push(expense.person);
            }
        });
        
        // Extract additional cards and people from regular payments
        converted.regularPayments.forEach(payment => {
            if (payment.card && !converted.creditCards.includes(payment.card)) {
                converted.creditCards.push(payment.card);
            }
            if (payment.person && !converted.people.includes(payment.person)) {
                converted.people.push(payment.person);
            }
        });
        
        console.log('✅ Data conversion completed:', {
            expenses: converted.expenses.length,
            regularPayments: converted.regularPayments.length,
            creditCards: converted.creditCards.length,
            people: converted.people.length
        });
        
        return converted;
        
    } catch (error) {
        console.error('❌ Data conversion error:', error);
        throw new Error('Veri formatı dönüştürülemedi: ' + error.message);
    }
}

/**
 * Validate imported data - Enhanced validation
 */
function validateImportedData(data) {
    console.log('🔍 Validating imported data...', data);
    
    if (!data || typeof data !== 'object') {
        console.error('❌ Data is not a valid object');
        return false;
    }
    
    // Check if it has at least one of the expected properties
    const hasExpenses = Array.isArray(data.expenses) || Array.isArray(data.harcamalar);
    const hasPayments = Array.isArray(data.regularPayments) || Array.isArray(data.duzenliOdemeler);
    const hasCards = Array.isArray(data.creditCards) || Array.isArray(data.kartlar);
    const hasPeople = Array.isArray(data.people) || Array.isArray(data.kisiler);
    
    // Check for Payment Planner specific structure
    const isPaymentPlannerBackup = data.appName === 'Payment Planner' || data.version;
    
    const isValid = hasExpenses || hasPayments || hasCards || hasPeople || isPaymentPlannerBackup;
    
    console.log('✅ Validation result:', {
        isValid,
        hasExpenses,
        hasPayments, 
        hasCards,
        hasPeople,
        isPaymentPlannerBackup,
        appName: data.appName,
        version: data.version
    });
    
    return isValid;
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

/**
 * Show toast notification - Fallback if not available globally
 */
function showToast(message, type = 'info') {
    // Try to use global NotificationService first
    if (typeof NotificationService !== 'undefined') {
        switch(type) {
            case 'success': NotificationService.success(message); break;
            case 'error': NotificationService.error(message); break;
            case 'warning': NotificationService.warning(message); break;
            default: NotificationService.info(message); break;
        }
        return;
    }
    
    // Fallback to alert if NotificationService not available
    const emoji = {
        success: '✅',
        error: '❌', 
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    alert((emoji[type] || emoji.info) + ' ' + message);
}
