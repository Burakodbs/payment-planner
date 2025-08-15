// GitHub Gist Cloud Sync Extension
class GistCloudSync {
    constructor() {
        this.gistId = null; // İlk kurulumda oluşturulacak
        this.githubToken = null; // GitHub Personal Access Token
        this.syncInterval = 5 * 60 * 1000; // 5 dakikada bir sync
        this.lastSyncTime = 0;
    }

    // GitHub token'ı ayarla (bir kez yapılır)
    setGitHubToken(token) {
        this.githubToken = token;
        localStorage.setItem('github_token', token);
        console.log('✅ GitHub token ayarlandı');
    }

    // Gist ID'yi ayarla (ilk upload'tan sonra)
    setGistId(gistId) {
        this.gistId = gistId;
        localStorage.setItem('gist_id', gistId);
        console.log('✅ Gist ID ayarlandı:', gistId);
    }

    // Ayarları yükle
    loadSettings() {
        this.githubToken = localStorage.getItem('github_token');
        this.gistId = localStorage.getItem('gist_id');
        this.lastSyncTime = parseInt(localStorage.getItem('last_sync_time') || '0');
    }

    // Verileri cloud'a gönder
    async uploadToGist(userData) {
        if (!this.githubToken) {
            console.warn('GitHub token ayarlanmamış');
            return false;
        }

        const gistData = {
            description: `Payment Planner Data - ${new Date().toISOString()}`,
            public: false, // Private gist
            files: {
                "payment-data.json": {
                    content: JSON.stringify(userData, null, 2)
                },
                "last-updated.txt": {
                    content: new Date().toISOString()
                }
            }
        };

        try {
            let url = 'https://api.github.com/gists';
            let method = 'POST';

            // Eğer gist ID varsa update et
            if (this.gistId) {
                url = `https://api.github.com/gists/${this.gistId}`;
                method = 'PATCH';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });

            if (response.ok) {
                const result = await response.json();
                
                // İlk upload ise gist ID'yi kaydet
                if (!this.gistId) {
                    this.setGistId(result.id);
                }

                this.lastSyncTime = Date.now();
                localStorage.setItem('last_sync_time', this.lastSyncTime.toString());
                
                console.log('☁️ Veriler cloud\'a yüklendi:', new Date().toLocaleTimeString());
                this.showSyncStatus('Cloud\'a yüklendi', 'success');
                return true;
            } else {
                throw new Error(`GitHub API Error: ${response.status}`);
            }

        } catch (error) {
            console.error('Cloud upload hatası:', error);
            this.showSyncStatus('Upload hatası', 'error');
            return false;
        }
    }

    // Cloud'dan verileri indir
    async downloadFromGist() {
        if (!this.gistId || !this.githubToken) {
            console.warn('Gist bilgileri eksik');
            return null;
        }

        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                headers: {
                    'Authorization': `token ${this.githubToken}`
                }
            });

            if (response.ok) {
                const gist = await response.json();
                const fileContent = gist.files['payment-data.json'].content;
                const userData = JSON.parse(fileContent);
                
                console.log('☁️ Veriler cloud\'dan indirildi:', new Date().toLocaleTimeString());
                this.showSyncStatus('Cloud\'dan indirildi', 'success');
                return userData;
            } else {
                throw new Error(`Gist download error: ${response.status}`);
            }

        } catch (error) {
            console.error('Cloud download hatası:', error);
            this.showSyncStatus('Download hatası', 'error');
            return null;
        }
    }

    // Otomatik senkronizasyon başlat
    startAutoSync() {
        // Sayfa yüklendiğinde cloud'dan kontrol et
        this.checkForCloudUpdates();

        // Periyodik olarak upload et
        setInterval(async () => {
            if (window.fileStorage && window.fileStorage.pendingSave) {
                await this.syncToCloud();
            }
        }, this.syncInterval);

        console.log('🔄 Otomatik cloud sync başlatıldı (5 dakika)');
    }

    // Cloud güncellemelerini kontrol et
    async checkForCloudUpdates() {
        const cloudData = await this.downloadFromGist();
        if (cloudData && window.fileStorage) {
            // Cloud'daki tarih ile local'i karşılaştır
            const cloudDate = new Date(cloudData.lastUpdated).getTime();
            const localDate = this.lastSyncTime;

            if (cloudDate > localDate) {
                const confirmSync = confirm('☁️ Cloud\'da daha güncel veriler bulundu. İndirmek istiyor musunuz?');
                if (confirmSync) {
                    window.fileStorage.applyUserData(cloudData);
                    await window.fileStorage.saveUserData();
                    this.showSyncStatus('Cloud\'dan senkronize edildi', 'success');
                }
            }
        }
    }

    // Manuel cloud sync
    async syncToCloud() {
        if (!window.fileStorage || !window.fileStorage.currentUser) {
            return false;
        }

        // Mevcut veriyi al
        const userData = {
            username: window.fileStorage.currentUser,
            lastUpdated: new Date().toISOString(),
            expenses: expenses || [],
            regularPayments: regularPayments || [],
            creditCards: creditCards || [],
            people: people || [],
            settings: {
                theme: 'light'
            }
        };

        return await this.uploadToGist(userData);
    }

    // Sync durumu göster
    showSyncStatus(message, type) {
        // Mevcut save status div'i kullan
        if (window.fileStorage) {
            window.fileStorage.showSaveStatus(`☁️ ${message}`, type);
        } else {
            console.log(`☁️ ${message}`);
        }
    }

    // Setup assistant - ilk kurulum için
    async setupWizard() {
        const setupMessage = `🔧 GITHUB GIST CLOUD SYNC KURULUMU

Bu özellik verilerinizi otomatik olarak GitHub Gist'e yedekler.
Böylece her cihazdan güncel verilerinize erişebilirsiniz.

Kurulum adımları:
1. GitHub.com'da Personal Access Token oluşturun
2. Token'ı aşağıdaki alana girin
3. İlk sync otomatik olarak yapılır

GitHub Token oluşturmak için:
github.com → Settings → Developer settings → Personal access tokens → Generate new token
✅ 'gist' permission'ını seçin

Token'ınızı girin:`;

        const token = prompt(setupMessage);
        if (token) {
            this.setGitHubToken(token);
            
            // İlk sync'i yap
            const success = await this.syncToCloud();
            if (success) {
                alert('✅ Cloud sync kurulumu tamamlandı!\nVerileriniz otomatik olarak senkronize edilecek.');
                this.startAutoSync();
            } else {
                alert('❌ Kurulum hatası. Token\'ı kontrol edin.');
            }
        }
    }
}

// Global instance
const gistSync = new GistCloudSync();

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function() {
    gistSync.loadSettings();
    
    // Eğer token varsa otomatik sync başlat
    if (gistSync.githubToken) {
        setTimeout(() => gistSync.startAutoSync(), 2000);
    }
});

// FileStorage ile entegre et
if (window.fileStorage) {
    const originalSave = window.fileStorage.saveUserData;
    window.fileStorage.saveUserData = async function() {
        // Normal kaydet
        const result = await originalSave.call(this);
        
        // Cloud'a da gönder (5 dakika sonra)
        setTimeout(() => {
            if (gistSync.githubToken) {
                gistSync.syncToCloud();
            }
        }, 5000);
        
        return result;
    };
}

// Global erişim
window.GistCloudSync = GistCloudSync;
window.gistSync = gistSync;
