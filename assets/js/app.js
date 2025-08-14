// Main Application Variables - Managed by auth system
let expenses = [];
let regularPayments = [];
let creditCards = [];
let people = [];

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
        updateExpenseTable();
    } else if (tabName === 'duzenli') {
        updateRegularPaymentsList();
    } else if (tabName === 'analitik') {
        initializeAnalytics();
    } else if (tabName === 'accounts') {
        updateAccounts();
    } else if (tabName === 'aylik') {
        // Ay seçili değilse bugünkü ayı set et
        const summaryTarih = document.getElementById('summaryDate');
        if (summaryTarih && !summaryTarih.value) {
            summaryTarih.value = currentMonth;
        }
        updateMonthlySummary();
    } else if (tabName === 'dashboard') {
        updateDashboard();
    }
}

// Uygulama Başlatma
document.addEventListener('DOMContentLoaded', function () {
    // Tema sistemini hemen başlat
    initializeTheme();

    // Auth sistemi başlatılana kadar bekle
    setTimeout(() => {
        if (authSystem && authSystem.currentUser) {
            // Kart ve kullanıcı seçeneklerini initialize et
            FormHandlers.updateCardOptions();
            FormHandlers.updateUserOptions();

            // Form başlangıç değerleri
            const summaryTarih = document.getElementById('summaryDate');
            const expenseTarih = document.getElementById('expenseDate');
            const regularBaslangic = document.getElementById('regularStart');
            const card = document.getElementById('card');

            if (summaryTarih) summaryTarih.value = currentMonth;
            if (expenseTarih) expenseTarih.value = currentDate;
            if (regularBaslangic) regularBaslangic.value = currentMonth;
            if (card) card.focus();
        }
    }, 100);
});