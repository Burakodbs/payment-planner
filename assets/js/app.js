// Ana Uygulama Değişkenleri
let harcamalar = JSON.parse(localStorage.getItem('harcamalar') || '[]');
let duzenliOdemeler = JSON.parse(localStorage.getItem('duzenliOdemeler') || '[]');
let kredikartlari = JSON.parse(localStorage.getItem('kredikartlari') || '["Axess", "Vakıf", "Enpara", "World"]');
let kisiler = JSON.parse(localStorage.getItem('kisiler') || '["Sen", "SinanAbi", "SemihAbi", "Anne", "Talha"]');

const currentMonth = new Date().toISOString().slice(0, 7);
const currentDate = new Date().toISOString().slice(0, 10);

// Tema yönetimi
let currentTheme = localStorage.getItem('theme') || 'light';
let currentColorScheme = localStorage.getItem('colorScheme') || 'light';

function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentColorScheme);
    
    const themeIcon = document.getElementById('themeIcon');
    const isDark = currentTheme === 'dark';
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === currentColorScheme) {
            btn.classList.add('active');
        }
    });
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', currentColorScheme);
    }
    
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    
    themeIcon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeIcon.style.transform = 'rotate(0deg)';
    }, 300);
}

function changeColorScheme(scheme) {
    currentColorScheme = scheme;
    localStorage.setItem('colorScheme', currentColorScheme);
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', currentColorScheme);
    }
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === scheme) {
            btn.classList.add('active');
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
        updateAylikOzet();
    } else if (tabName === 'dashboard') {
        updateDashboard();
    }
}

// Uygulama Başlatma
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            changeColorScheme(btn.dataset.theme);
        });
    });
    
    // Kart ve kullanıcı seçeneklerini initialize et
    updateCardOptions();
    updateUserOptions();
    
    // Form başlangıç değerleri
    document.getElementById('ozet_tarih').value = currentMonth;
    document.getElementById('harcamaTarih').value = currentDate;
    document.getElementById('duzenliBaslangic').value = currentMonth;
    document.getElementById('kart').focus();
});