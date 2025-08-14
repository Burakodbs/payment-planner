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
                harcamalar: harcamalar.length,
                duzenliOdemeler: duzenliOdemeler.length,
                kredikartlari: kredikartlari.length,
                kisiler: kisiler.length
            },
            harcamalar: harcamalar,
            duzenliOdemeler: duzenliOdemeler,
            kredikartlari: kredikartlari,
            kisiler: kisiler
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `kredi-karti-verileri-${new Date().toISOString().slice(0, 10)}.json`;
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
                if (Array.isArray(data.harcamalar)) harcamalar = data.harcamalar;
                if (Array.isArray(data.duzenliOdemeler)) duzenliOdemeler = data.duzenliOdemeler;
                if (Array.isArray(data.kredikartlari)) kredikartlari = data.kredikartlari;
                if (Array.isArray(data.kisiler)) kisiler = data.kisiler;

                // Save data
                DataManager.save();

                // Update UI components
                FormHandlers.updateCardOptions();
                FormHandlers.updateUserOptions();
                DataOperations.migrateRegularExpensesToDefinitions();
                DataManager.updateAllViews();

                const importCount = {
                    harcamalar: Array.isArray(data.harcamalar) ? data.harcamalar.length : 0,
                    duzenliOdemeler: Array.isArray(data.duzenliOdemeler) ? data.duzenliOdemeler.length : 0,
                    kredikartlari: Array.isArray(data.kredikartlari) ? data.kredikartlari.length : 0,
                    kisiler: Array.isArray(data.kisiler) ? data.kisiler.length : 0
                };

                NotificationService.success(`Veriler içe aktarıldı: ${importCount.harcamalar} harcama, ${importCount.duzenliOdemeler} düzenli ödeme, ${importCount.kredikartlari} kart, ${importCount.kisiler} kişi`);

                fileInput.value = '';
            } catch (error) {
                NotificationService.error('Dosya okuma hatası: ' + error.message);
            }
        };

        reader.readAsText(file);
    }

    static clearAllData() {
        if (confirm('Tüm verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            if (confirm('Bu işlem GERİ ALINAMAZ! Emin misiniz?')) {
                if (authSystem && authSystem.currentUser) {
                    harcamalar = [];
                    duzenliOdemeler = [];
                    kredikartlari = [];
                    kisiler = [];
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
        if (confirm('Sadece harcama verilerini silmek istediğinizden emin misiniz?')) {
            harcamalar = [];
            DataManager.save();
            NotificationService.success('Harcama verileri silindi');
            DataManager.updateAllViews();
        }
    }

    static migrateRegularExpensesToDefinitions() {
        try {
            if (!Array.isArray(harcamalar) || !Array.isArray(duzenliOdemeler)) return;

            const userKey = (authSystem && authSystem.currentUser)
                ? `regular_defs_migrated_${authSystem.currentUser}`
                : 'regular_defs_migrated';

            const alreadyFlagged = localStorage.getItem(userKey) || 
                (authSystem && authSystem.currentUserData && authSystem.currentUserData._regularDefsMigrated);

            if (alreadyFlagged && duzenliOdemeler.length > 0) return;

            const isExpenseRegular = (h) => h && (
                h.isRegular || h.isDuzenli || h.isDuzenliOtomatik ||
                /(\(Düzenli\))/i.test(h.aciklama || '') ||
                (typeof h.id === 'string' && h.id.startsWith('duzenli_'))
            );

            const candidateRecords = harcamalar.filter(isExpenseRegular);
            if (candidateRecords.length === 0) {
                if (!alreadyFlagged) {
                    localStorage.setItem(userKey, '1');
                    if (authSystem && authSystem.currentUserData) {
                        authSystem.currentUserData._regularDefsMigrated = true;
                    }
                }
                return;
            }

            const existingDefinitionIds = new Set((duzenliOdemeler || []).map(d => d.id));
            const groups = new Map();

            candidateRecords.forEach(h => {
                if (h.duzenliOdemeId && existingDefinitionIds.has(h.duzenliOdemeId)) return;

                const baseName = (h.aciklama || 'Düzenli Ödeme')
                    .replace(/\(Düzenli.*?\)/i, '')
                    .replace(/\(Otomatik.*?\)/i, '')
                    .trim() || 'Düzenli Ödeme';
                    
                const key = [baseName, h.kart || '', h.kullanici || '', Number(h.tutar) || 0].join('||');
                const existing = groups.get(key);
                
                if (existing) {
                    if (h.tarih && h.tarih < existing.baslangicTarihi) {
                        existing.baslangicTarihi = h.tarih;
                    }
                    existing.items.push(h);
                } else {
                    groups.set(key, {
                        aciklama: baseName,
                        kart: h.kart,
                        kullanici: h.kullanici,
                        tutar: Number(h.tutar) || 0,
                        baslangicTarihi: h.tarih || new Date().toISOString().slice(0, 10),
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
                duzenliOdemeler.push({
                    id: newId,
                    aciklama: group.aciklama,
                    tutar: group.tutar,
                    kart: group.kart,
                    kullanici: group.kullanici,
                    baslangicTarihi: group.baslangicTarihi,
                    kategori: group.kategori,
                    aktif: true
                });
                
                group.items.forEach(h => { 
                    h.duzenliOdemeId = newId; 
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
