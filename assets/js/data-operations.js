// Data Import/Export Operations
class DataOperations {
    static exportData() {
        // Ensure up-to-date data extraction
        if (authSystem && authSystem.ensureCardUserExtraction) {
            try { 
                authSystem.ensureCardUserExtraction(); 
            } catch (_) {}
        }
        
        const data = {
            expenses: expenses || [],
            regularPayments: regularPayments || [],
            creditCards: creditCards || [],
            people: people || [],
            exportDate: new Date().toISOString(),
            version: '3.1.0',
            appName: 'Payment Planner'
        };
        
        const currentDate = new Date().toISOString().slice(0, 10);
        const filename = `payment-planner-backup-${currentDate}.json`;
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const totalRecords = data.expenses.length + data.regularPayments.length + data.creditCards.length + data.people.length;
        NotificationService.success(`✅ Yedek oluşturuldu!\n📂 ${filename}\n📊 ${totalRecords} toplam kayıt`);
        
        console.log('✅ Export completed:', {
            filename,
            counts: {
                expenses: data.expenses.length,
                regularPayments: data.regularPayments.length,
                creditCards: data.creditCards.length,
                people: data.people.length
            }
        });
    }
    static importData() {
        const fileInput = document.getElementById('fileInput');
        if (!fileInput || !fileInput.files || !fileInput.files.length) {
            NotificationService.error('Lütfen bir dosya seçin');
            return;
        }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Enhanced validation for your backup format
                if (!data || typeof data !== 'object') {
                    NotificationService.error('Geçersiz dosya formatı');
                    return;
                }
                
                console.log('📂 Importing data from:', file.name, data);
                
                // Load raw data with multiple format support
                if (Array.isArray(data.expenses) || Array.isArray(data.harcamalar)) {
                    expenses = data.expenses || data.harcamalar || [];
                }
                if (Array.isArray(data.regularPayments) || Array.isArray(data.duzenliOdemeler)) {
                    regularPayments = data.regularPayments || data.duzenliOdemeler || [];
                }
                if (Array.isArray(data.creditCards) || Array.isArray(data.kartlar)) {
                    creditCards = data.creditCards || data.kartlar || [];
                }
                if (Array.isArray(data.people) || Array.isArray(data.kisiler)) {
                    people = data.people || data.kisiler || [];
                }
                
                // Save data
                DataManager.save();
                
                // Update UI components
                FormHandlers.updateCardOptions();
                FormHandlers.updateUserOptions();
                DataOperations.migrateRegularExpensesToDefinitions();
                DataManager.updateAllViews();
                
                const importCount = {
                    expenses: expenses.length,
                    regularPayments: regularPayments.length,
                    creditCards: creditCards.length,
                    people: people.length
                };
                
                NotificationService.success(`✅ Veriler içe aktarıldı!\n💳 ${importCount.expenses} harcama\n🔄 ${importCount.regularPayments} düzenli ödeme\n🏦 ${importCount.creditCards} kart\n👤 ${importCount.people} kişi`);
                fileInput.value = '';
                
                console.log('✅ Import completed:', importCount);
                
            } catch (error) {
                console.error('❌ Import error:', error);
                NotificationService.error('Dosya okuma hatası: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    static clearAllData() {
        if (confirm('Tüm dataleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            if (confirm('Bu işlem GERİ ALINAMAZ! Emin misiniz?')) {
                if (authSystem && authSystem.currentUser) {
                    expenses = [];
                    regularPayments = [];
                    creditCards = [];
                    people = [];
                    authSystem.saveUserData();
                    location.reload();
                } else {
                    localStorage.clear();
                    location.reload();
                }
            }
        }
    }
    static clearExpenseData() {
        if (confirm('Sadece expense datalerini silmek istediğinizden emin misiniz?')) {
            expenses = [];
            DataManager.save();
            NotificationService.success('Expense data deleted');
            DataManager.updateAllViews();
        }
    }
    static migrateRegularExpensesToDefinitions() {
        try {
            if (!Array.isArray(expenses) || !Array.isArray(regularPayments)) return;
            const userKey = (authSystem && authSystem.currentUser)
                ? `regular_defs_migrated_${authSystem.currentUser}`
                : 'regular_defs_migrated';
            const alreadyFlagged = localStorage.getItem(userKey) || 
                (authSystem && authSystem.currentUserData && authSystem.currentUserData._regularDefsMigrated);
            if (alreadyFlagged && regularPayments.length > 0) return;
            const isExpenseRegular = (h) => h && (
                h.isRegular || h.isRegular || h.isRegularAutomatic ||
                /(\(Düzenli\))/i.test(h.description || '') ||
                (typeof h.id === 'string' && h.id.startsWith('regular_'))
            );
            const candidateRecords = expenses.filter(isExpenseRegular);
            if (candidateRecords.length === 0) {
                if (!alreadyFlagged) {
                    localStorage.setItem(userKey, '1');
                    if (authSystem && authSystem.currentUserData) {
                        authSystem.currentUserData._regularDefsMigrated = true;
                    }
                }
                return;
            }
            const existingDefinitionIds = new Set((regularPayments || []).map(d => d.id));
            const groups = new Map();
            candidateRecords.forEach(h => {
                if (h.regularOdemeId && existingDefinitionIds.has(h.regularOdemeId)) return;
                const baseName = (h.description || 'Düzenli Ödeme')
                    .replace(/\(Düzenli.*?\)/i, '')
                    .replace(/\(Otomatik.*?\)/i, '')
                    .trim() || 'Düzenli Ödeme';
                const key = [baseName, h.card || '', h.person || '', Number(h.amount) || 0].join('||');
                const existing = groups.get(key);
                if (existing) {
                    if (h.date && h.date < existing.startDate) {
                        existing.startDate = h.date;
                    }
                    existing.items.push(h);
                } else {
                    groups.set(key, {
                        description: baseName,
                        card: h.card,
                        person: h.person,
                        amount: Number(h.amount) || 0,
                        startDate: h.date || new Date().toISOString().slice(0, 10),
                        kategori: 'Düzenli Ödeme',
                        items: [h]
                    });
                }
            });
            if (groups.size === 0) {
                if (!alreadyFlagged) {
                    localStorage.setItem(userKey, '1');
                    if (authSystem && authSystem.currentUserData) {
                        authSystem.currentUserData._regularDefsMigrated = true;
                    }
                }
                return;
            }
            groups.forEach(group => {
                const newId = Date.now() + Math.floor(Math.random() * 1000000);
                regularPayments.push({
                    id: newId,
                    description: group.description,
                    amount: group.amount,
                    card: group.card,
                    person: group.person,
                    startDate: group.startDate,
                    kategori: group.kategori,
                    aktif: true
                });
                group.items.forEach(h => { 
                    h.regularOdemeId = newId; 
                });
            });
            DataManager.save();
            localStorage.setItem(userKey, '1');
            NotificationService.info(`${groups.size} düzenli ödeme tanımı otomatik oluşturuldu`);
        } catch (e) {
            console.warn('Regular payment migration error:', e);
        }
    }
}
// Global backward compatibility
window.exportData = DataOperations.exportData;
window.importData = DataOperations.importData;
window.clearAllData = DataOperations.clearAllData;
window.clearExpenseData = DataOperations.clearExpenseData;
