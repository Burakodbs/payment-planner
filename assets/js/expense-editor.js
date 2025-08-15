// Expense Editing Functionality
class ExpenseEditor {
    static editingId = null;
    static edit(id) {
        const expense = expenses.find(h => h.id === id);
        if (!expense) {
            NotificationService.error('Expense not found');
            return;
        }
        this.editingId = id;
        // Fill modal fields
        document.getElementById('editDate').value = expense.date;
        document.getElementById('editDescription').value = expense.description || '';
        document.getElementById('editAmount').value = expense.amount;
        document.getElementById('editTaksitNo').value = expense.taksitNo || '';
        document.getElementById('editToplamTaksit').value = expense.toplamTaksit || '';
        // Populate select options
        this.populateModalSelects();
        // Set values
        document.getElementById('editCard').value = expense.card;
        document.getElementById('editUser').value = expense.person;
        // Show modal
        document.getElementById('editExpenseModal').style.display = 'block';
        NotificationService.info('DÃ¼zenleme modu aktif');
    }
    static populateModalSelects() {
        // Card options
        const cardSelect = document.getElementById('editCard');
        if (cardSelect) {
            const options = cardSelect.querySelectorAll('option:not([value=""])');
            options.forEach(option => option.remove());
            DataManager.getCards().forEach(card => {
                const option = document.createElement('option');
                option.value = card;
                option.textContent = card;
                cardSelect.appendChild(option);
            });
        }
        // User options
        const userSelect = document.getElementById('editUser');
        if (userSelect) {
            const options = userSelect.querySelectorAll('option:not([value=""])');
            options.forEach(option => option.remove());
            DataManager.getUsers().forEach(person => {
                const option = document.createElement('option');
                option.value = person;
                option.textContent = person;
                userSelect.appendChild(option);
            });
        }
    }
    static closeModal() {
        document.getElementById('editExpenseModal').style.display = 'none';
        this.editingId = null;
    }
    static handleSubmit(event) {
        event.preventDefault();
        if (!this.editingId) {
            NotificationService.error('DÃ¼zenlenecek expense bulunamadÄ±');
            return;
        }
        const expenseIndex = expenses.findIndex(h => h.id === this.editingId);
        if (expenseIndex === -1) {
            NotificationService.error('Expense not found');
            return;
        }
        // Get form data
        const date = document.getElementById('editDate').value;
        const card = document.getElementById('editCard').value;
        const user = document.getElementById('editUser').value;
        const description = document.getElementById('editDescription').value;
        const amount = document.getElementById('editAmount').value;
        const installmentNumber = document.getElementById('editInstallmentNumber').value;
        const totalInstallments = document.getElementById('editTotalInstallments').value;
        if (!date || !card || !user || !amount) {
            NotificationService.error('LÃ¼tfen tÃ¼m zorunlu alanlarÄ± doldurun');
            return;
        }
        // Update expense
        expenses[expenseIndex] = {
            ...expenses[expenseIndex],
            date,
            card,
            user,
            description,
            amount: parseFloat(amount),
            installmentNumber: installmentNumber ? parseInt(installmentNumber) : null,
            totalInstallments: totalInstallments ? parseInt(totalInstallments) : null,
            isInstallment: installmentNumber && totalInstallments
        };
        DataManager.save();
        DataManager.updateAllViews();
        this.closeModal();
        NotificationService.success('Expense updated');
    }
    static delete(id) {
        if (confirm('Bu expenseyÄ± silmek istediÄŸinizden emin misiniz?')) {
            const expenseIndex = expenses.findIndex(h => h.id === id);
            if (expenseIndex !== -1) {
                expenses.splice(expenseIndex, 1);
                DataManager.save();
                DataManager.updateAllViews();
                NotificationService.success('Expense deleted');
            } else {
                NotificationService.error('Expense not found');
            }
        }
    }
}
// Global backward compatibility
window.editExpense = (id) => ExpenseEditor.edit(id);
window.deleteExpense = (id) => ExpenseEditor.delete(id);
window.closeEditExpenseModal = () => ExpenseEditor.closeModal();
window.handleEditExpenseSubmit = (event) => ExpenseEditor.handleSubmit(event);
window.populateEditModalSelects = () => ExpenseEditor.populateModalSelects();
