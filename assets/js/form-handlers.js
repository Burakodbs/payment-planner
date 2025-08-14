// Form Handlers and UI Operations
class FormHandlers {
    static handleExpenseSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const expense = {
            id: Date.now(),
            date: formData.get('date'),
            card: formData.get('card'),
            person: formData.get('user'),
            kategori: formData.get('kategori'),
            description: formData.get('description'),
            amount: parseFloat(formData.get('amount')),
            taksitNo: formData.get('taksitNo') ? parseInt(formData.get('taksitNo')) : null,
            toplamTaksit: formData.get('toplamTaksit') ? parseInt(formData.get('toplamTaksit')) : null,
            isTaksit: formData.get('taksitNo') && formData.get('toplamTaksit')
        };

        expenses.push(expense);
        DataManager.save();

        // Sticky values
        FormHandlers.preserveStickyValues();
        event.target.reset();
        FormHandlers.applyStickyValues();

        // Focus on amount input
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.focus();
            amountInput.select();
        }

        DataManager.updateAllViews();
        NotificationService.success('Expense successfully added!');
    }

    static preserveStickyValues() {
        const stickyFields = ['card', 'user'];
        const stickyValues = {};
        
        stickyFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value) {
                stickyValues[field] = element.value;
            }
        });
        
        sessionStorage.setItem('stickyValues', JSON.stringify(stickyValues));
    }

    static applyStickyValues() {
        try {
            const stickyValues = JSON.parse(sessionStorage.getItem('stickyValues') || '{}');
            
            Object.entries(stickyValues).forEach(([field, value]) => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = value;
                }
            });
        } catch (e) {
            // Ignore invalid JSON
        }
        
        // Always set current date
        const dateField = document.getElementById('expenseDate');
        if (dateField) {
            dateField.value = new Date().toISOString().slice(0, 10);
        }
    }

    static updateCardOptions() {
        const selects = document.querySelectorAll('#card, #filterCard, #editCard');
        
        selects.forEach(select => {
            const currentValue = select.value;
            const options = select.querySelectorAll('option:not([value=""])');
            options.forEach(option => option.remove());

            const cardList = DataManager.getCards();
            cardList.forEach(card => {
                const option = document.createElement('option');
                option.value = card;
                option.textContent = card;
                select.appendChild(option);
            });

            select.value = currentValue;
        });
    }

    static updateUserOptions() {
        const selects = document.querySelectorAll('#user, #filterUser, #editUser');
        
        selects.forEach(select => {
            const currentValue = select.value;
            select.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
            
            const userList = DataManager.getUsers();
            userList.forEach(person => {
                const option = document.createElement('option');
                option.value = person;
                option.textContent = person;
                select.appendChild(option);
            });

            select.value = currentValue;
        });
    }
}

// Global backward compatibility
window.handleExpenseSubmit = FormHandlers.handleExpenseSubmit;
window.updateCardOptions = FormHandlers.updateCardOptions;
window.updateUserOptions = FormHandlers.updateUserOptions;
