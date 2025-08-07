// Ana Uygulama Değişkenleri - Auth sistemi tarafından yönetilir
let harcamalar = [];
let duzenliOdemeler = [];
let kredikartlari = [];
let kisiler = [];

const currentMonth = new Date().toISOString().slice(0, 7);
const currentDate = new Date().toISOString().slice(0, 10);

// Figma-Inspired Theme System
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeButtons = document.querySelectorAll('.theme-toggle');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    themeButtons.forEach(button => {
        if (currentTheme === 'dark') {
            button.innerHTML = '☀️';
            button.title = 'Açık temaya geç';
        } else {
            button.innerHTML = '🌙';
            button.title = 'Koyu temaya geç';
        }
    });
}

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