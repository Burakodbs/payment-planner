// JSON File Based Storage System
class FileStorage {
    constructor() {
        this.currentUser = null;
        this.userDataPath = null;
        this.autoSaveInterval = null;
        this.autoSaveDelay = 2000; // 2 saniye sonra otomatik kaydet
        this.pendingSave = false;
    }

    // Kullanıcı oturum açtığında çağrılır
    async initUser(username) {
        this.currentUser = username;
        this.userDataPath = `user_data_${username}.json`;
        
        // Kullanıcı JSON dosyasını yükle
        await this.loadUserData();
        
        // Otomatik kaydetmeyi başlat
        this.startAutoSave();
    }

    // Kullanıcı verilerini JSON dosyasından yükle
    async loadUserData() {
        try {
            // Dosyayı okumak için file input kullan
            const userData = await this.readJSONFile();
            if (userData) {
                this.applyUserData(userData);
                console.log(`✅ ${this.currentUser} kullanıcısının verileri yüklendi`);
                return userData;
            } else {
                // Eğer dosya yoksa boş veri yapısı oluştur
                await this.createEmptyUserData();
            }
        } catch (error) {
            console.error('Kullanıcı verileri yüklenirken hata:', error);
            await this.createEmptyUserData();
        }
    }

    // Dosyadan JSON veri oku
    async readJSONFile() {
        return new Promise((resolve) => {
            // IndexedDB kullanarak dosyaları saklayalım
            const dbRequest = indexedDB.open('PaymentPlannerFiles', 1);
            
            dbRequest.onerror = () => {
                console.log('IndexedDB açılamadı, boş veri döndürülüyor');
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

    // JSON dosyasına veri kaydet
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
            
            // Yedek dosyası da oluştur
            this.createBackupFile(userData);
            
            console.log(`✅ ${this.currentUser} kullanıcısının verileri kaydedildi`);
            this.pendingSave = false;
            
            // UI'da kaydetme durumunu göster
            this.showSaveStatus('Veriler kaydedildi', 'success');
            
        } catch (error) {
            console.error('Veri kaydetme hatası:', error);
            this.showSaveStatus('Kaydetme hatası!', 'error');
        }
    }

    // IndexedDB'ye dosya yaz
    async writeJSONFile(userData) {
        return new Promise((resolve, reject) => {
            const dbRequest = indexedDB.open('PaymentPlannerFiles', 1);
            
            dbRequest.onerror = () => reject(new Error('IndexedDB açılamadı'));
            
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
                putRequest.onerror = () => reject(new Error('IndexedDB yazma hatası'));
            };
        });
    }

    // Yedek dosya oluştur ve indir
    createBackupFile(userData) {
        const filename = `${this.currentUser}-backup-${new Date().toISOString().slice(0, 10)}.json`;
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Dosyayı downloads klasörüne kaydet (otomatik indirme)
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // Kullanıcı verilerini global değişkenlere uygula
    applyUserData(userData) {
        if (!userData) return;

        // Global değişkenleri güncelle
        if (userData.expenses) {
            expenses = userData.expenses;
        }
        if (userData.regularPayments) {
            regularPayments = userData.regularPayments;
        }
        if (userData.creditCards) {
            creditCards = userData.creditCards;
        }
        if (userData.people) {
            people = userData.people;
        }

        // Tema ayarını uygula
        if (userData.settings && userData.settings.theme) {
            document.body.className = userData.settings.theme === 'dark' ? 'dark-theme' : '';
        }

        // Tüm görünümleri güncelle
        this.updateAllViews();
    }

    // Boş kullanıcı verisi oluştur
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
        
        console.log(`📝 ${this.currentUser} için boş veri yapısı oluşturuldu`);
    }

    // Otomatik kaydetmeyi başlat
    startAutoSave() {
        // Veri değişikliklerini dinle
        this.watchDataChanges();
        
        // Periyodik kontrol (her 30 saniye)
        if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = setInterval(() => {
            if (this.pendingSave) {
                this.saveUserData();
            }
        }, 30000);
    }

    // Veri değişikliklerini izle
    watchDataChanges() {
        // Proxy kullanarak array değişikliklerini yakala
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
        
        // UI'da kaydetme durumunu göster
        this.showSaveStatus('Değişiklikler kaydediliyor...', 'pending');
        
        // Debounce - sürekli değişikliklerde kaydetmeyi geciktir
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveUserData();
        }, this.autoSaveDelay);
    }

    // Kaydetme durumu göster
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

        // Stil ve mesajı ayarla
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            pending: '#f39c12'
        };
        
        statusDiv.style.backgroundColor = colors[type] || colors.pending;
        statusDiv.textContent = message;
        statusDiv.style.opacity = '1';

        // Başarı ve hata mesajlarını otomatik gizle
        if (type !== 'pending') {
            setTimeout(() => {
                statusDiv.style.opacity = '0';
            }, 3000);
        }
    }

    // Tüm görünümleri güncelle
    updateAllViews() {
        // Sayfa yenilenmesini bekle
        setTimeout(() => {
            if (typeof DataManager !== 'undefined' && DataManager.updateAllViews) {
                DataManager.updateAllViews();
            }

            // Manuel olarak mevcut fonksiyonları çağır
            if (typeof updateExpenseTable === 'function') updateExpenseTable();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof updateAccounts === 'function') updateAccounts();
            if (typeof updateRegularPaymentsList === 'function') updateRegularPaymentsList();
            if (typeof updateDataStats === 'function') updateDataStats();
            if (typeof updateCardAndUserManagement === 'function') updateCardAndUserManagement();
        }, 100);
    }

    // Dosyadan veri içe aktar
    async importFromFile(file) {
        try {
            const text = await file.text();
            const userData = JSON.parse(text);
            
            // Veri formatını kontrol et ve dönüştür
            const convertedData = this.convertImportFormat(userData);
            
            // Verileri uygula
            this.applyUserData(convertedData);
            await this.saveUserData();
            
            console.log('✅ Dosyadan veri içe aktarma başarılı');
            this.showSaveStatus('Veriler içe aktarıldı', 'success');
            
            return true;
        } catch (error) {
            console.error('Dosya içe aktarma hatası:', error);
            this.showSaveStatus('İçe aktarma hatası!', 'error');
            return false;
        }
    }

    // Import formatını dönüştür
    convertImportFormat(data) {
        // Eski Türkçe formatından yeni formata dönüştür
        if (data.harcamalar) {
            data.expenses = data.harcamalar.map(item => ({
                id: item.id || Date.now() + Math.random(),
                description: item.aciklama || item.description || '',
                amount: item.tutar || item.amount || 0,
                date: item.tarih || item.date || new Date().toISOString().slice(0, 10),
                card: item.kart || item.card || 'Nakit',
                user: item.kisi || item.user || 'Admin',
                category: item.kategori || item.category || 'Diğer'
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

    // Kullanıcıyı çıkış yap
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
        
        console.log('👋 Kullanıcı oturumu kapatıldı ve veriler kaydedildi');
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

// Sayfa kapatılmadan önce kaydet
window.addEventListener('beforeunload', () => {
    if (fileStorage.pendingSave) {
        fileStorage.saveUserData();
    }
});

// Export for use in other modules
window.FileStorage = FileStorage;
window.fileStorage = fileStorage;
