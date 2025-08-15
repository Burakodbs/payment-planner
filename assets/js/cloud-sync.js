// GitHub Gist Cloud Sync Extension
class GistCloudSync {
    constructor() {
        this.gistId = null; // Ä°lk kurulumda oluÅŸturulacak
        this.githubToken = null; // GitHub Personal Access Token
        this.syncInterval = 5 * 60 * 1000; // 5 dakikada bir sync
        this.lastSyncTime = 0;
    }
    // GitHub token'Ä± ayarla (bir kez yapÄ±lÄ±r)
    setGitHubToken(token) {
        this.githubToken = token;
        localStorage.setItem('github_token', token);
    }
    // Gist ID'yi ayarla (ilk upload'tan sonra)
    setGistId(gistId) {
        this.gistId = gistId;
        localStorage.setItem('gist_id', gistId);
    }
    // AyarlarÄ± yÃ¼kle
    loadSettings() {
        this.githubToken = localStorage.getItem('github_token');
        this.gistId = localStorage.getItem('gist_id');
        this.lastSyncTime = parseInt(localStorage.getItem('last_sync_time') || '0');
    }
    // Verileri cloud'a gÃ¶nder
    async uploadToGist(userData) {
        if (!this.githubToken) {
            console.warn('GitHub token ayarlanmamÄ±ÅŸ');
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
            // EÄŸer gist ID varsa update et
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
                // Ä°lk upload ise gist ID'yi kaydet
                if (!this.gistId) {
                    this.setGistId(result.id);
                }
                this.lastSyncTime = Date.now();
                localStorage.setItem('last_sync_time', this.lastSyncTime.toString());
                this.showSyncStatus('Cloud\'a yÃ¼klendi', 'success');
                return true;
            } else {
                throw new Error(`GitHub API Error: ${response.status}`);
            }
        } catch (error) {
            console.error('Cloud upload hatasÄ±:', error);
            console.error('Token var mÄ±:', !!this.githubToken);
            console.error('Request detaylarÄ±:', {
                url: this.gistId ? `https://api.github.com/gists/${this.gistId}` : 'https://api.github.com/gists',
                method: this.gistId ? 'PATCH' : 'POST',
                hasToken: !!this.githubToken
            });
            this.showSyncStatus('Upload hatasÄ±: ' + error.message, 'error');
            return false;
        }
    }
    // Cloud'dan verileri indir
    async downloadFromGist() {
        if (!this.githubToken) {
            console.warn('GitHub token eksik');
            return null;
        }
        if (!this.gistId) {
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
                this.showSyncStatus('Cloud\'dan indirildi', 'success');
                return userData;
            } else {
                throw new Error(`Gist download error: ${response.status}`);
            }
        } catch (error) {
            console.error('Cloud download hatasÄ±:', error);
            this.showSyncStatus('Download hatasÄ±', 'error');
            return null;
        }
    }
    // Otomatik senkronizasyon baÅŸlat
    startAutoSync() {
        // Sayfa yÃ¼klendiÄŸinde cloud'dan kontrol et (sadece gist ID varsa)
        if (this.gistId) {
            this.checkForCloudUpdates();
        } else {
        }
        // Periyodik olarak upload et
        setInterval(async () => {
            if (window.fileStorage && window.fileStorage.pendingSave) {
                await this.syncToCloud();
            }
        }, this.syncInterval);
    }
    // Cloud gÃ¼ncellemelerini kontrol et
    async checkForCloudUpdates() {
        const cloudData = await this.downloadFromGist();
        if (cloudData && window.fileStorage) {
            // Cloud'daki tarih ile local'i karÅŸÄ±laÅŸtÄ±r
            const cloudDate = new Date(cloudData.lastUpdated).getTime();
            const localDate = this.lastSyncTime;
            if (cloudDate > localDate) {
                const confirmSync = confirm('â˜ï¸ Cloud\'da daha gÃ¼ncel veriler bulundu. Ä°ndirmek istiyor musunuz?');
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
        // FileStorage'Ä±n hazÄ±r olmasÄ±nÄ± bekle
        let retries = 0;
        while ((!window.fileStorage || !window.fileStorage.currentUser) && retries < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
        }
        if (!window.fileStorage || !window.fileStorage.currentUser) {
            console.warn('âŒ FileStorage veya currentUser hala eksik');
            return false;
        }
            currentUser: window.fileStorage.currentUser,
            hasUserData: !!window.fileStorage.userData
        });
        // Mevcut veriyi al
        const userData = {
            username: window.fileStorage.currentUser,
            lastUpdated: new Date().toISOString(),
            expenses: window.fileStorage.userData.expenses || [],
            regularPayments: window.fileStorage.userData.regularPayments || [],
            creditCards: window.fileStorage.userData.creditCards || [],
            people: window.fileStorage.userData.people || [],
            settings: {
                theme: localStorage.getItem('theme') || 'light'
            }
        };
            expenses: userData.expenses.length,
            regularPayments: userData.regularPayments.length,
            creditCards: userData.creditCards.length,
            people: userData.people.length
        });
        return await this.uploadToGist(userData);
    }
    // Sync durumu gÃ¶ster
    showSyncStatus(message, type) {
        // Mevcut save status div'i kullan
        if (window.fileStorage) {
            window.fileStorage.showSaveStatus(`â˜ï¸ ${message}`, type);
        } else {
        }
    }
    // Setup assistant - ilk kurulum iÃ§in
    async setupWizard() {
        const setupMessage = `ğŸ”§ GITHUB GIST CLOUD SYNC KURULUMU
Bu Ã¶zellik verilerinizi otomatik olarak GitHub Gist'e yedekler.
BÃ¶ylece her cihazdan gÃ¼ncel verilerinize eriÅŸebilirsiniz.
Kurulum adÄ±mlarÄ±:
1. GitHub.com'da Personal Access Token oluÅŸturun
2. Token'Ä± aÅŸaÄŸÄ±daki alana girin
3. Ä°lk sync otomatik olarak yapÄ±lÄ±r
GitHub Token oluÅŸturmak iÃ§in:
github.com â†’ Settings â†’ Developer settings â†’ Personal access tokens â†’ Generate new token
âœ… 'gist' permission'Ä±nÄ± seÃ§in
Token'Ä±nÄ±zÄ± girin:`;
        const token = prompt(setupMessage);
        if (token) {
            this.setGitHubToken(token);
            // Ä°lk sync'i yap
            const success = await this.syncToCloud();
            if (success) {
                alert('âœ… Cloud sync kurulumu tamamlandÄ±!\nVerileriniz otomatik olarak senkronize edilecek.');
                this.startAutoSync();
                return true;
            } else {
                alert('âŒ Kurulum hatasÄ±. Token\'Ä± kontrol edin.');
                return false;
            }
        }
        return false;
    }
}
// Global instance
const gistSync = new GistCloudSync();
// Sayfa yÃ¼klendiÄŸinde sadece settings yÃ¼kle
document.addEventListener('DOMContentLoaded', function() {
    gistSync.loadSettings();
    // Otomatik sync login sonrasÄ± auth.js'de baÅŸlatÄ±lacak
    if (gistSync.githubToken) {
    } else {
    }
});
// FileStorage ile entegre et (manuel Ã§aÄŸÄ±rÄ±m)
function initFileStorageIntegration() {
    if (window.fileStorage && !window.fileStorage._cloudSyncInitialized) {
        const originalSave = window.fileStorage.saveUserData;
        window.fileStorage.saveUserData = async function() {
            // Normal kaydet
            const result = await originalSave.call(this);
            // Cloud'a da gÃ¶nder (5 saniye sonra)
            setTimeout(() => {
                if (gistSync.githubToken) {
                    gistSync.syncToCloud();
                }
            }, 5000);
            return result;
        };
        window.fileStorage._cloudSyncInitialized = true;
        return true;
    }
    return false;
}
// Global eriÅŸim iÃ§in
window.initFileStorageIntegration = initFileStorageIntegration;
// Global eriÅŸim
window.GistCloudSync = GistCloudSync;
window.gistSync = gistSync;
