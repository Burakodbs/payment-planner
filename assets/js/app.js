// Main Application Variables - Managed by auth system
// Initialize window properties first
window.expenses = window.expenses || [];
window.regularPayments = window.regularPayments || [];
window.creditCards = window.creditCards || [];
window.people = window.people || [];

// Global variables always reference window properties
let expenses = window.expenses;
let regularPayments = window.regularPayments;
let creditCards = window.creditCards;
let people = window.people;

console.log('🔄 Global variables initialized:', {
    expenses: expenses.length,
    regularPayments: regularPayments.length,
    creditCards: creditCards.length,
    people: people.length
});

const currentMonth = new Date().toISOString().slice(0, 7);
const currentDate = new Date().toISOString().slice(0, 10);

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Add active class to clicked button
    const activeButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Page-specific tab handling
function showPageTab(tabName) {
    // Hide all page tabs
    const tabs = document.querySelectorAll('.page-tab');
    tabs.forEach(tab => tab.style.display = 'none');
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.page-tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Add active class to clicked button
    const activeButton = document.querySelector(`[onclick="showPageTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Auth sistemi başlatılana kadar bekle
    function waitForAuthSystem() {
        if (typeof authSystem !== 'undefined' && authSystem && authSystem.currentUser) {
            // Kart ve kullanıcı seçeneklerini initialize et
            if (typeof FormHandlers !== 'undefined') {
                FormHandlers.updateCardOptions();
                FormHandlers.updateUserOptions();
            }
            
            // Form başlangıç değerleri
            const summaryTarih = document.getElementById('summaryDate');
            const expenseTarih = document.getElementById('expenseDate');
            const regularBaslangic = document.getElementById('regularStart');
            const card = document.getElementById('card');
            
            if (summaryTarih) summaryTarih.value = currentMonth;
            if (expenseTarih) expenseTarih.value = currentDate;
            if (regularBaslangic) regularBaslangic.value = currentMonth;
            if (card) card.focus();
        } else {
            // Auth sistemi henüz hazır değil, tekrar dene
            setTimeout(waitForAuthSystem, 100);
        }
    }
    
    // Auth sistemi kontrolünü başlat
    setTimeout(waitForAuthSystem, 100);
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});
