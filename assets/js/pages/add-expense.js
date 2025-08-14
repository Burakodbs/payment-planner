// Add Expense page specific JavaScript code

// console.log('Add expense page loaded');

// Sayfa tab'larını yönet
function showPageTab(tabName) {
    // Tüm tab'ları gizle
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Tüm tab butonlarının active class'ını kaldır
    document.querySelectorAll('.page-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // Seçilen tab'ı göster
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Seçilen tab butonunu aktif yap
    event.target.classList.add('active');

    // Tab specific operations
    if (tabName === 'regular') {
        loadRegularPayments();
        populateRegularPaymentForm();
    }
}

// Load regular payments
// New system: use global regularPayments array and updateRegularPaymentsList function from utils.js.
function loadRegularPayments() {
    if (typeof updateRegularPaymentsList === 'function') {
        updateRegularPaymentsList();
    } else {
        // Fallback – old localStorage (temporary)
        const legacy = JSON.parse(localStorage.getItem('regularPayments') || '[]');
        const container = document.getElementById('regularPaymentsList');
        if (!container) return;
        if (legacy.length === 0) {
            container.innerHTML = '<p class="text-muted">No regular payments defined yet.</p>';
            return;
        }
        container.innerHTML = legacy.map(o => `<div class="regular-item"><div class="regular-info"><h4>${o.description}</h4><p>${o.amount} TL - ${o.card} - ${o.person}</p><small>Start Date: ${(o.startDate||o.start||'').toString()}</small></div></div>`).join('');
    }
}

// Populate regular payment form
function populateRegularPaymentForm() {
    // Populate cards
    const cardSelect = document.getElementById('regularCard');
    cardSelect.innerHTML = '<option value="">Select Card</option>';
    if (typeof cards !== 'undefined' && cards) {
        cards.forEach(card => {
            cardSelect.innerHTML += `<option value="${card}">${card}</option>`;
        });
    }

    // Populate users
    const userSelect = document.getElementById('regularUser');
    userSelect.innerHTML = '<option value="">Select User</option>';
    if (typeof people !== 'undefined' && people) {
        people.forEach(person => {
            userSelect.innerHTML += `<option value="${person}">${person}</option>`;
        });
    }

    // Today's date
    document.getElementById('regularStart').value = new Date().toISOString().split('T')[0];
}

// Add regular payment
function handleRegularPaymentSubmit(event) {
    event.preventDefault();
    // addRegularPayment function from utils.js will be used
    if (typeof addRegularPayment === 'function') {
        addRegularPayment();
    } else {
        showToast('System not loaded (addRegularPayment not found)', 'error');
    }
}

// Remove regular payment
function removeRegularPayment(index) {
    // In the new system, deletion by id is preferred instead of index.
    if (!Array.isArray(window.regularPayments)) return;
    const target = window.regularPayments[index];
    if (!target) return;
    if (typeof deleteRegularPayment === 'function') {
        deleteRegularPayment(target.id);
    }
}

// Update shortcut info - for both people and cards
function updateShortcutInfo() {
    const shortcutElement = document.getElementById('shortcutInfo');
    if (!shortcutElement) {
        return;
    }

    let shortcutText = 'Shortcuts: ';

    // User shortcuts
    if (people && people.length > 0) {
        const userShortcuts = people.slice(0, 5).map((person, index) => `Ctrl+${index + 1}=${person}`).join(', ');
        shortcutText += `Users: ${userShortcuts}`;
    }

    // Card shortcuts (Shift + 1-9)
    if (creditCards && creditCards.length > 0) {
        const cardShortcuts = creditCards.slice(0, 9).map((card, index) => `Shift+${index + 1}=${card}`).join(', ');
        shortcutText += (people && people.length > 0) ? ` | Cards: ${cardShortcuts}` : `Cards: ${cardShortcuts}`;
    }

    shortcutElement.textContent = shortcutText;
}

// Sticky form values
let stickyCardValue = '';
let stickyDateValue = '';

// Keyboard shortcuts handler
function handleKeyboardShortcuts(event) {
    // Input alanlarında kısayolları devre dışı bırak
    const activeElement = document.activeElement;
    const isInputField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT'
    );

    // User shortcuts (Ctrl + 1-5)
    if (event.ctrlKey && event.key >= '1' && event.key <= '5' && !event.shiftKey && !event.altKey) {
        const userIndex = parseInt(event.key) - 1;
        if (people && people[userIndex]) {
            const userSelect = document.getElementById('user');
            if (userSelect) {
                userSelect.value = people[userIndex];
                event.preventDefault();
            }
        }
    }

    // Card shortcuts (Shift + 1-9) - only when not in input fields
    if (event.shiftKey && event.code >= 'Digit1' && event.code <= 'Digit9' && !event.ctrlKey && !event.altKey && !isInputField) {
        const cardIndex = parseInt(event.code.replace('Digit', '')) - 1;
        if (creditCards && creditCards[cardIndex]) {
            const cardSelect = document.getElementById('card');
            if (cardSelect) {
                cardSelect.value = creditCards[cardIndex];
                stickyCardValue = creditCards[cardIndex];
                event.preventDefault();
            }
        }
    }

    // Submit form with Enter key (only in form elements)
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName !== 'BUTTON' && activeElement.type !== 'submit') {
            const form = document.getElementById('expenseForm');
            if (form && form.contains(activeElement)) {
                event.preventDefault();
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        }
    }
}

// Apply sticky values
function applyStickyValues() {
    // Apply card value if sticky
    if (stickyCardValue) {
        const cardSelect = document.getElementById('card');
        if (cardSelect && !cardSelect.value) {
            cardSelect.value = stickyCardValue;
        }
    }

    // Apply date value if sticky
    if (stickyDateValue) {
        const dateInput = document.getElementById('expenseDate');
        if (dateInput && !dateInput.value) {
            dateInput.value = stickyDateValue;
        }
    }
}

// Preserve sticky values after form reset
function preserveStickyValues() {
    const cardSelect = document.getElementById('card');
    const dateInput = document.getElementById('expenseDate');

    // Save current values as sticky
    if (cardSelect && cardSelect.value) {
        stickyCardValue = cardSelect.value;
    }
    if (dateInput && dateInput.value) {
        stickyDateValue = dateInput.value;
    }
}

// Initialize after auth system loads and update shortcut info
document.addEventListener('DOMContentLoaded', function () {
    // Initialize common components
    if (typeof initializePage === 'function') {
        initializePage('add-expense');
    }

    // Add keyboard shortcuts listener
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Add form change listeners
    setTimeout(() => {
        const cardSelect = document.getElementById('card');
        const dateInput = document.getElementById('expenseDate');

        if (cardSelect) {
            cardSelect.addEventListener('change', function () {
                if (this.value) {
                    stickyCardValue = this.value;
                }
            });
        }

        if (dateInput) {
            dateInput.addEventListener('change', function () {
                if (this.value) {
                    stickyDateValue = this.value;
                }
            });
        }

        // Initial sticky values application
        applyStickyValues();
    }, 200);

    // Update shortcut info with short delay
    setTimeout(updateShortcutInfo, 500);

    // Update after auth system loads data
    if (typeof authSystem !== 'undefined') {
        const originalTrigger = authSystem.triggerPageUpdates;
        authSystem.triggerPageUpdates = function () {
            originalTrigger.call(this);
            setTimeout(updateShortcutInfo, 100);
        };
    }
});