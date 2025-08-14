// Form Handlers and UI Operations
class FormHandlers {
    static handleExpenseSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const expense = {
            id: Date.now(),
            date: formData.get('tarih'),
            card: formData.get('kart'),
            person: formData.get('kullanici'),
            kategori: formData.get('kategori'),
            description: formData.get('aciklama'),
            amount: parseFloat(formData.get('tutar')),
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
        const tutarInput = document.getElementById('tutar');
        if (tutarInput) {
            tutarInput.focus();
            tutarInput.select();
        }

        DataManager.updateAllViews();
        NotificationService.success('Harcama başarıyla eklendi!');
    }

    static preserveStickyValues() {
        const stickyFields = ['kart', 'kullanici'];
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
        const selects = document.querySelectorAll('#kart, #filtreKart, #editKart');
        
        selects.forEach(select => {
            const currentValue = select.value;
            const options = select.querySelectorAll('option:not([value=""])');
            options.forEach(option => option.remove());

            const cardList = DataManager.getCards();
            cardList.forEach(kart => {
                const option = document.createElement('option');
                option.value = kart;
                option.textContent = kart;
                select.appendChild(option);
            });

            select.value = currentValue;
        });
    }

    static updateUserOptions() {
        const selects = document.querySelectorAll('#kullanici, #filtreKullanici, #editKullanici');
        
        selects.forEach(select => {
            const currentValue = select.value;
            select.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
            
            const userList = DataManager.getUsers();
            userList.forEach(kisi => {
                const option = document.createElement('option');
                option.value = kisi;
                option.textContent = kisi;
                select.appendChild(option);
            });

            select.value = currentValue;
        });
    }
}

// Global backward compatibility
window.handleHarcamaSubmit = FormHandlers.handleExpenseSubmit;
window.updateCardOptions = FormHandlers.updateCardOptions;
window.updateUserOptions = FormHandlers.updateUserOptions;
