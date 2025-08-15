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
            version: 2,
            user: (authSystem && authSystem.currentUser) || null,
            exportDate: new Date().toISOString(),
            counts: {
                expenses: expenses.length,
                regularPayments: regularPayments.length,
                creditCards: creditCards.length,
                people: people.length
            },
            expenses: expenses,
            regularPayments: regularPayments,
            creditCards: creditCards,
            people: people
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kredi-cardi-dataleri-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        NotificationService.success('Veriler dışa aktarıldı');
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
                // Load raw data
                if (Array.isArray(data.expenses)) expenses = data.expenses;
                if (Array.isArray(data.regularPayments)) regularPayments = data.regularPayments;
                if (Array.isArray(data.creditCards)) creditCards = data.creditCards;
                if (Array.isArray(data.people)) people = data.people;
                // Save data
                DataManager.save();
                // Update UI components
                FormHandlers.updateCardOptions();
                FormHandlers.updateUserOptions();
                DataOperations.migrateRegularExpensesToDefinitions();
                DataManager.updateAllViews();
                const importCount = {
                    expenses: Array.isArray(data.expenses) ? data.expenses.length : 0,
                    regularPayments: Array.isArray(data.regularPayments) ? data.regularPayments.length : 0,
                    creditCards: Array.isArray(data.creditCards) ? data.creditCards.length : 0,
                    people: Array.isArray(data.people) ? data.people.length : 0
                };
                NotificationService.success(`Veriler içe aktarıldı: ${importCount.expenses} expense, ${importCount.regularPayments} düzenli ödeme, ${importCount.creditCards} card, ${importCount.people} kişi`);
                fileInput.value = '';
            } catch (error) {
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
