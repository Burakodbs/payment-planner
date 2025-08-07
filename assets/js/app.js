// Ana Uygulama Değişkenleri - Auth sistemi tarafından yönetilir
let harcamalar = [];
let duzenliOdemeler = [];
let kredikartlari = [];
let kisiler = [];

const currentMonth = new Date().toISOString().slice(0, 7);
const currentDate = new Date().toISOString().slice(0, 10);

// Figma-Inspired Theme System
function initializeTheme() {
    // Simple light theme only - no theme switching
    document.documentElement.setAttribute('data-theme', 'light');
}

// Theme toggle functions removed - using simple light theme only

// Tab Navigation
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'liste') {
        updateHarcamaTable();
    } else if (tabName === 'duzenli') {
        updateDuzenliOdemelerListesi();
    } else if (tabName === 'analitik') {
        initializeAnalytics();
    } else if (tabName === 'hesaplar') {
        updateHesaplar();
    } else if (tabName === 'aylik') {
        // Ay seçili değilse bugünkü ayı set et
        const ozetTarih = document.getElementById('ozet_tarih');
        if (ozetTarih && !ozetTarih.value) {
            ozetTarih.value = currentMonth;
        }
        updateAylikOzet();
    } else if (tabName === 'dashboard') {
        updateDashboard();
    }
}

// Uygulama Başlatma
document.addEventListener('DOMContentLoaded', function() {
    // Tema sistemini hemen başlat
    initializeTheme();
    
    // Auth sistemi başlatılana kadar bekle
    setTimeout(() => {
        if (authSystem && authSystem.currentUser) {
            // Kart ve kullanıcı seçeneklerini initialize et
            updateCardOptions();
            updateUserOptions();
            
            // Form başlangıç değerleri
            const ozetTarih = document.getElementById('ozet_tarih');
            const harcamaTarih = document.getElementById('harcamaTarih');
            const duzenliBaslangic = document.getElementById('duzenliBaslangic');
            const kart = document.getElementById('kart');
            
            if (ozetTarih) ozetTarih.value = currentMonth;
            if (harcamaTarih) harcamaTarih.value = currentDate;
            if (duzenliBaslangic) duzenliBaslangic.value = currentMonth;
            if (kart) kart.focus();
        }
    }, 100);
});