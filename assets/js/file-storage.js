// JSON File Based Storage System
class FileStorage {
    constructor() {
        this.currentUser = null;
        this.userDataPath = null;
        this.autoSaveInterval = null;
        this.autoSaveDelay = 2000; // 2 saniye sonra otomatik kaydet
        this.pendingSave = false;
    }
    // KullanÄ±cÄ± oturum aÃ§tÄ±ÄŸÄ±nda Ã§aÄŸrÄ±lÄ±r
    async initUser(username) {
        this.currentUser = username;
        this.userDataPath = `user_data_${username}.json`;
        // KullanÄ±cÄ± JSON dosyasÄ±nÄ± yÃ¼kle
        await this.loadUserData();
        // Otomatik kaydetmeyi baÅŸlat
        this.startAutoSave();
    }
    // KullanÄ±cÄ± verilerini JSON dosyasÄ±ndan yÃ¼kle
    async loadUserData() {
        try {
            // DosyayÄ± okumak iÃ§in file input kullan
            const userData = await this.readJSONFile();
            if (userData) {
                this.applyUserData(userData);
                return userData;
            } else {
                // EÄŸer dosya yoksa boÅŸ veri yapÄ±sÄ± oluÅŸtur
                await this.createEmptyUserData();
            }
        } catch (error) {
            console.error('KullanÄ±cÄ± verileri yÃ¼klenirken hata:', error);
            await this.createEmptyUserData();
        }
    }
    // Dosyadan JSON veri oku
    async readJSONFile() {
        return new Promise((resolve) => {
            // IndexedDB kullanarak dosyalarÄ± saklayalÄ±m
            const dbRequest = indexedDB.open('PaymentPlannerFiles', 1);
            dbRequest.onerror = () => {
                resolve(null);
            };
            dbRequest.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('userFiles')) {
                    db.createObjectStore('userFiles', { keyPath: 'username' });
                }
            };
            dbRequest.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['userFiles'], 'readonly');
                const store = transaction.objectStore('userFiles');
                const getRequest = store.get(this.currentUser);
                getRequest.onsuccess = () => {
                    const result = getRequest.result;
                    resolve(result ? result.data : null);
                };
                getRequest.onerror = () => {
                    resolve(null);
                };
            };
        });
    }
    // JSON dosyasÄ±na veri kaydet
    async saveUserData() {
        if (!this.currentUser) return;
        const userData = {
            username: this.currentUser,
            lastUpdated: new Date().toISOString(),
            expenses: expenses || [],
            regularPayments: regularPayments || [],
            creditCards: creditCards || [],
            people: people || [],
            settings: {
                theme: document.body.className.includes('dark-theme') ? 'dark' : 'light'
            }
        };
        try {
            // IndexedDB'ye kaydet
            await this.writeJSONFile(userData);
            // Yedek dosyasÄ± da oluÅŸtur
            this.createBackupFile(userData);
            this.pendingSave = false;
            // UI'da kaydetme durumunu gÃ¶ster
            this.showSaveStatus('Veriler kaydedildi', 'success');
        } catch (error) {
            console.error('Veri kaydetme hatasÄ±:', error);
            this.showSaveStatus('Kaydetme hatasÄ±!', 'error');
        }
    }
    // IndexedDB'ye dosya yaz
    async writeJSONFile(userData) {
        return new Promise((resolve, reject) => {
            const dbRequest = indexedDB.open('PaymentPlannerFiles', 1);
            dbRequest.onerror = () => reject(new Error('IndexedDB aÃ§Ä±lamadÄ±'));
            dbRequest.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('userFiles')) {
                    db.createObjectStore('userFiles', { keyPath: 'username' });
                }
            };
            dbRequest.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['userFiles'], 'readwrite');
                const store = transaction.objectStore('userFiles');
                const putRequest = store.put({
                    username: this.currentUser,
                    data: userData,
                    savedAt: new Date().toISOString()
                });
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(new Error('IndexedDB yazma hatasÄ±'));
            };
        });
    }
    // Yedek dosya oluÅŸtur ve ana klasÃ¶rÃ¼n iÃ§indeki backups klasÃ¶rÃ¼ne kaydet
    createBackupFile(userData) {
        const filename = `${this.currentUser}-backup-${new Date().toISOString().slice(0, 10)}.json`;
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        // Ana klasÃ¶r iÃ§indeki backups klasÃ¶rÃ¼ne kaydet
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.style.display = 'none';
        // TarayÄ±cÄ±dan dosya sistemi eriÅŸimi iÃ§in manuel indirme
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        // KullanÄ±cÄ±ya backup klasÃ¶rÃ¼ oluÅŸturmasÄ± iÃ§in bilgi ver
        // Backup klasÃ¶rÃ¼ kontrolÃ¼ ve oluÅŸturma Ã¶nerisi
        this.suggestBackupFolder(filename);
    }
    // Backup klasÃ¶rÃ¼ Ã¶nerisi
    suggestBackupFolder(filename) {
        // LocalStorage'da backup folder Ã¶nerisi gÃ¶sterildi mi kontrol et
        const backupSuggestionShown = localStorage.getItem('backup_folder_suggestion_shown');
        if (!backupSuggestionShown) {
            setTimeout(() => {
                const message = `ğŸ“ YEDEK KLASÃ–RÃœ Ã–NERÄ°SÄ°\n\n` +
                               `Yedek dosyalarÄ±nÄ±zÄ± daha dÃ¼zenli tutmak iÃ§in:\n\n` +
                               `1. Ana klasÃ¶rÃ¼nÃ¼zde 'backups' klasÃ¶rÃ¼ oluÅŸturun\n` +
                               `2. Ä°ndirilen yedek dosyalarÄ±nÄ± oraya taÅŸÄ±yÄ±n\n` +
                               `3. Bu klasÃ¶rÃ¼ .gitignore'a ekleyebilirsiniz\n\n` +
                               `Dosya: ${filename}\n\n` +
                               `Bu Ã¶nerinin bir daha gÃ¶sterilmesini istiyor musunuz?`;
                const showAgain = confirm(message);
                if (!showAgain) {
                    localStorage.setItem('backup_folder_suggestion_shown', 'true');
                }
            }, 2000);
        }
    }
    // Backup klasÃ¶rÃ¼ varlÄ±ÄŸÄ±nÄ± kontrol et
    checkBackupFolder() {
        // Bu fonksiyon tarayÄ±cÄ± kÄ±sÄ±tlamalarÄ± nedeniyle dosya sistemi eriÅŸimi yapamaz
        // Sadece kullanÄ±cÄ±ya rehberlik saÄŸlar
    }
    // KullanÄ±cÄ± verilerini global deÄŸiÅŸkenlere uygula
    applyUserData(userData) {
        if (!userData) return;
        // Global deÄŸiÅŸkenleri gÃ¼ncelle
        if (userData.expenses) {
            expenses = userData.expenses;
            window.expenses = expenses;
        }
        if (userData.regularPayments) {
            regularPayments = userData.regularPayments;
            window.regularPayments = regularPayments;
        }
        if (userData.creditCards) {
            creditCards = userData.creditCards;
            window.creditCards = creditCards;
        }
        if (userData.people) {
            people = userData.people;
            window.people = people;
        }
        // Tema ayarÄ±nÄ± uygula
        if (userData.settings && userData.settings.theme) {
            document.body.className = userData.settings.theme === 'dark' ? 'dark-theme' : '';
        }
        // TÃ¼m gÃ¶rÃ¼nÃ¼mleri gÃ¼ncelle
        this.updateAllViews();
    }
    // BoÅŸ kullanÄ±cÄ± verisi oluÅŸtur
    async createEmptyUserData() {
        const emptyData = {
            username: this.currentUser,
            lastUpdated: new Date().toISOString(),
            expenses: [],
            regularPayments: [],
            creditCards: [
                { name: 'Nakit', limit: 0, color: '#2ecc71' }
            ],
            people: [
                { name: this.currentUser, color: '#3498db' }
            ],
            settings: {
                theme: 'light'
            }
        };
        this.applyUserData(emptyData);
        await this.saveUserData();
    }
    // Otomatik kaydetmeyi baÅŸlat
    startAutoSave() {
        // Veri deÄŸiÅŸikliklerini dinle
        this.watchDataChanges();
        // Periyodik kontrol (her 30 saniye)
        if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = setInterval(() => {
            if (this.pendingSave) {
                this.saveUserData();
            }
        }, 30000);
    }
    // Veri deÄŸiÅŸikliklerini izle
    watchDataChanges() {
        // Proxy kullanarak array deÄŸiÅŸikliklerini yakala
        const createWatchedArray = (arr, name) => {
            return new Proxy(arr, {
                set: (target, property, value) => {
                    target[property] = value;
                    this.scheduleAutoSave(name);
                    return true;
                }
            });
        };
        // Global array'leri watch et
        if (typeof expenses !== 'undefined') {
            expenses = createWatchedArray(expenses, 'expenses');
        }
        if (typeof regularPayments !== 'undefined') {
            regularPayments = createWatchedArray(regularPayments, 'regularPayments');
        }
        if (typeof creditCards !== 'undefined') {
            creditCards = createWatchedArray(creditCards, 'creditCards');
        }
        if (typeof people !== 'undefined') {
            people = createWatchedArray(people, 'people');
        }
    }
    // Otomatik kaydetmeyi zamanla
    scheduleAutoSave(dataType) {
        this.pendingSave = true;
        // UI'da kaydetme durumunu gÃ¶ster
        this.showSaveStatus('DeÄŸiÅŸiklikler kaydediliyor...', 'pending');
        // Debounce - sÃ¼rekli deÄŸiÅŸikliklerde kaydetmeyi geciktir
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveUserData();
        }, this.autoSaveDelay);
    }
    // Kaydetme durumu gÃ¶ster
    showSaveStatus(message, type) {
        // Mevcut status div'i kontrol et
        let statusDiv = document.getElementById('save-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'save-status';
            statusDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 9999;
                transition: all 0.3s ease;
                opacity: 0;
            `;
            document.body.appendChild(statusDiv);
        }
        // Stil ve mesajÄ± ayarla
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            pending: '#f39c12'
        };
        statusDiv.style.backgroundColor = colors[type] || colors.pending;
        statusDiv.textContent = message;
        statusDiv.style.opacity = '1';
        // BaÅŸarÄ± ve hata mesajlarÄ±nÄ± otomatik gizle
        if (type !== 'pending') {
            setTimeout(() => {
                statusDiv.style.opacity = '0';
            }, 3000);
        }
    }
    // TÃ¼m gÃ¶rÃ¼nÃ¼mleri gÃ¼ncelle
    updateAllViews() {
        // Sayfa yenilenmesini bekle
        setTimeout(() => {
            if (typeof DataManager !== 'undefined' && DataManager.updateAllViews) {
                DataManager.updateAllViews();
            }
            // Manuel olarak mevcut fonksiyonlarÄ± Ã§aÄŸÄ±r
            if (typeof updateExpenseTable === 'function') updateExpenseTable();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof updateAccounts === 'function') updateAccounts();
            if (typeof updateRegularPaymentsList === 'function') updateRegularPaymentsList();
            if (typeof updateDataStats === 'function') updateDataStats();
            if (typeof updateCardAndUserManagement === 'function') updateCardAndUserManagement();
        }, 100);
    }
    // Dosyadan veri iÃ§e aktar
    async importFromFile(file) {
        try {
            const text = await file.text();
            const userData = JSON.parse(text);
            // Veri formatÄ±nÄ± kontrol et ve dÃ¶nÃ¼ÅŸtÃ¼r
            const convertedData = this.convertImportFormat(userData);
            // Verileri uygula
            this.applyUserData(convertedData);
            await this.saveUserData();
            this.showSaveStatus('Veriler iÃ§e aktarÄ±ldÄ±', 'success');
            return true;
        } catch (error) {
            console.error('Dosya iÃ§e aktarma hatasÄ±:', error);
            this.showSaveStatus('Ä°Ã§e aktarma hatasÄ±!', 'error');
            return false;
        }
    }
    // Import formatÄ±nÄ± dÃ¶nÃ¼ÅŸtÃ¼r
    convertImportFormat(data) {
        // Eski TÃ¼rkÃ§e formatÄ±ndan yeni formata dÃ¶nÃ¼ÅŸtÃ¼r
        if (data.harcamalar) {
            data.expenses = data.harcamalar.map(item => ({
                id: item.id || Date.now() + Math.random(),
                description: item.aciklama || item.description || '',
                amount: item.tutar || item.amount || 0,
                date: item.tarih || item.date || new Date().toISOString().slice(0, 10),
                card: item.kart || item.card || 'Nakit',
                user: item.kisi || item.user || 'Admin',
                category: item.kategori || item.category || 'DiÄŸer'
            }));
            delete data.harcamalar;
        }
        if (data.duzenliOdemeler) {
            data.regularPayments = data.duzenliOdemeler;
            delete data.duzenliOdemeler;
        }
        if (data.kartlar) {
            data.creditCards = data.kartlar;
            delete data.kartlar;
        }
        if (data.kisiler) {
            data.people = data.kisiler;
            delete data.kisiler;
        }
        return data;
    }
    // KullanÄ±cÄ±yÄ± Ã§Ä±kÄ±ÅŸ yap
    logout() {
        // Otomatik kaydetmeyi durdur
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        // Son kez kaydet
        if (this.pendingSave) {
            this.saveUserData();
        }
        this.currentUser = null;
        this.userDataPath = null;
        this.pendingSave = false;
    }
    // Sistem durumunu kontrol et
    getStatus() {
        return {
            currentUser: this.currentUser,
            userDataPath: this.userDataPath,
            pendingSave: this.pendingSave,
            autoSaveActive: !!this.autoSaveInterval
        };
    }
}
// Global FileStorage instance
const fileStorage = new FileStorage();
// Sayfa kapatÄ±lmadan Ã¶nce kaydet
window.addEventListener('beforeunload', () => {
    if (fileStorage.pendingSave) {
        fileStorage.saveUserData();
    }
});
// Export for use in other modules
window.FileStorage = FileStorage;
window.fileStorage = fileStorage;
