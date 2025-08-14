// Expense Editing Functionality
class ExpenseEditor {
    static editingId = null;

    static edit(id) {
        const expense = harcamalar.find(h => h.id === id);
        if (!expense) {
            NotificationService.error('Harcama bulunamadı');
            return;
        }

        this.editingId = id;

        // Fill modal fields
        document.getElementById('editTarih').value = expense.tarih;
        document.getElementById('editAciklama').value = expense.aciklama || '';
        document.getElementById('editTutar').value = expense.tutar;
        document.getElementById('editTaksitNo').value = expense.taksitNo || '';
        document.getElementById('editToplamTaksit').value = expense.toplamTaksit || '';

        // Populate select options
        this.populateModalSelects();

        // Set values
        document.getElementById('editKart').value = expense.kart;
        document.getElementById('editKullanici').value = expense.kullanici;

        // Show modal
        document.getElementById('editHarcamaModal').style.display = 'block';
        NotificationService.info('Düzenleme modu aktif');
    }

    static populateModalSelects() {
        // Card options
        const kartSelect = document.getElementById('editKart');
        if (kartSelect) {
            const options = kartSelect.querySelectorAll('option:not([value=""])');
            options.forEach(option => option.remove());

            DataManager.getCards().forEach(kart => {
                const option = document.createElement('option');
                option.value = kart;
                option.textContent = kart;
                kartSelect.appendChild(option);
            });
        }

        // User options
        const kullaniciSelect = document.getElementById('editKullanici');
        if (kullaniciSelect) {
            const options = kullaniciSelect.querySelectorAll('option:not([value=""])');
            options.forEach(option => option.remove());

            DataManager.getUsers().forEach(kisi => {
                const option = document.createElement('option');
                option.value = kisi;
                option.textContent = kisi;
                kullaniciSelect.appendChild(option);
            });
        }
    }

    static closeModal() {
        document.getElementById('editHarcamaModal').style.display = 'none';
        this.editingId = null;
    }

    static handleSubmit(event) {
        event.preventDefault();

        if (!this.editingId) {
            NotificationService.error('Düzenlenecek harcama bulunamadı');
            return;
        }

        const expenseIndex = harcamalar.findIndex(h => h.id === this.editingId);
        if (expenseIndex === -1) {
            NotificationService.error('Harcama bulunamadı');
            return;
        }

        // Get form data
        const tarih = document.getElementById('editTarih').value;
        const kart = document.getElementById('editKart').value;
        const kullanici = document.getElementById('editKullanici').value;
        const aciklama = document.getElementById('editAciklama').value;
        const tutar = document.getElementById('editTutar').value;
        const taksitNo = document.getElementById('editTaksitNo').value;
        const toplamTaksit = document.getElementById('editToplamTaksit').value;

        if (!tarih || !kart || !kullanici || !tutar) {
            NotificationService.error('Lütfen tüm zorunlu alanları doldurun');
            return;
        }

        // Update expense
        harcamalar[expenseIndex] = {
            ...harcamalar[expenseIndex],
            tarih,
            kart,
            kullanici,
            aciklama,
            tutar: parseFloat(tutar),
            taksitNo: taksitNo ? parseInt(taksitNo) : null,
            toplamTaksit: toplamTaksit ? parseInt(toplamTaksit) : null,
            isTaksit: taksitNo && toplamTaksit
        };

        DataManager.save();
        DataManager.updateAllViews();
        this.closeModal();
        NotificationService.success('Harcama güncellendi');
    }

    static delete(id) {
        if (confirm('Bu harcamayı silmek istediğinizden emin misiniz?')) {
            const expenseIndex = harcamalar.findIndex(h => h.id === id);
            if (expenseIndex !== -1) {
                harcamalar.splice(expenseIndex, 1);
                DataManager.save();
                DataManager.updateAllViews();
                NotificationService.success('Harcama silindi');
            } else {
                NotificationService.error('Harcama bulunamadı');
            }
        }
    }
}

// Global backward compatibility
window.editHarcama = (id) => ExpenseEditor.edit(id);
window.deleteHarcama = (id) => ExpenseEditor.delete(id);
window.closeEditHarcamaModal = () => ExpenseEditor.closeModal();
window.handleEditHarcamaSubmit = (event) => ExpenseEditor.handleSubmit(event);
window.populateEditModalSelects = () => ExpenseEditor.populateModalSelects();
