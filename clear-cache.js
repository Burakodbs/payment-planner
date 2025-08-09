// Cache temizleme script'i
// Bu dosyayı browser console'da çalıştırarak cache'i manuel temizleyebilirsin

async function clearAllCaches() {
    console.log('🧹 Cache temizleniyor...');

    try {
        // Service Worker cache'lerini temizle
        const cacheNames = await caches.keys();
        console.log('Bulunan cache\'ler:', cacheNames);

        await Promise.all(
            cacheNames.map(cacheName => {
                console.log('Cache siliniyor:', cacheName);
                return caches.delete(cacheName);
            })
        );

        // Service Worker'ı yeniden kaydet
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(
                registrations.map(registration => {
                    console.log('Service Worker kaydı siliniyor');
                    return registration.unregister();
                })
            );
        }

        console.log('✅ Tüm cache\'ler temizlendi!');
        console.log('🔄 Sayfayı yenileyin (Ctrl+F5)');

    } catch (error) {
        console.error('❌ Cache temizleme hatası:', error);
    }
}

// Cache'i temizle ve sayfayı yenile
async function clearAndReload() {
    await clearAllCaches();
    setTimeout(() => {
        window.location.reload(true);
    }, 1000);
}

// Console'da kullanım:
console.log('Cache temizleme araçları yüklendi!');
console.log('Kullanım:');
console.log('clearAllCaches() - Sadece cache temizler');
console.log('clearAndReload() - Cache temizler ve sayfayı yeniler');

// Export functions to global scope
window.clearAllCaches = clearAllCaches;
window.clearAndReload = clearAndReload;