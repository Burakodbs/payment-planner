// Expense Domain Module - Clean, focused, testable
class ExpenseModule {
    constructor(dependencies) {
        this.store = dependencies.store;
        this.storage = dependencies.storage;
        this.eventBus = dependencies.eventBus;
        
        this.setupReducers();
        this.setupEventListeners();
    }

    // Setup store reducers
    setupReducers() {
        this.store.registerReducer('expenses', this.expenseReducer.bind(this));
    }

    // Expense reducer
    expenseReducer(state = [], action) {
        switch (action.type) {
            case 'EXPENSE_ADD':
                return [...state, this.validateExpense(action.payload)];
                
            case 'EXPENSE_UPDATE':
                return state.map(expense => 
                    expense.id === action.payload.id 
                        ? { ...expense, ...this.validateExpense(action.payload) }
                        : expense
                );
                
            case 'EXPENSE_DELETE':
                return state.filter(expense => expense.id !== action.payload.id);
                
            case 'EXPENSE_BULK_UPDATE':
                return action.payload.expenses || [];
                
            case 'EXPENSE_FILTER':
                // This would typically be UI state, but keeping for compatibility
                return state;
                
            default:
                return state;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        this.eventBus.on('auth:userChanged', () => {
            this.loadUserExpenses();
        });

        this.eventBus.on('storage:syncRequested', () => {
            this.syncToStorage();
        });
    }

    // Public API Methods
    
    async addExpense(expenseData) {
        try {
            const expense = this.createExpense(expenseData);
            
            this.store.dispatch({
                type: 'EXPENSE_ADD',
                payload: expense
            });

            await this.syncToStorage();
            
            this.eventBus.emit('expense:added', { expense });
            
            return { success: true, expense };
        } catch (error) {
            console.error('Add expense error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateExpense(id, updates) {
        try {
            const currentExpenses = this.store.getStateSlice('expenses');
            const existingExpense = currentExpenses.find(e => e.id === id);
            
            if (!existingExpense) {
                throw new Error('Expense not found');
            }

            const updatedExpense = { ...existingExpense, ...updates, id };
            
            this.store.dispatch({
                type: 'EXPENSE_UPDATE',
                payload: updatedExpense
            });

            await this.syncToStorage();
            
            this.eventBus.emit('expense:updated', { 
                expense: updatedExpense, 
                previousExpense: existingExpense 
            });
            
            return { success: true, expense: updatedExpense };
        } catch (error) {
            console.error('Update expense error:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteExpense(id) {
        try {
            const currentExpenses = this.store.getStateSlice('expenses');
            const expense = currentExpenses.find(e => e.id === id);
            
            if (!expense) {
                throw new Error('Expense not found');
            }

            this.store.dispatch({
                type: 'EXPENSE_DELETE',
                payload: { id }
            });

            await this.syncToStorage();
            
            this.eventBus.emit('expense:deleted', { expense });
            
            return { success: true };
        } catch (error) {
            console.error('Delete expense error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get expenses with optional filtering
    getExpenses(filters = {}) {
        let expenses = this.store.getStateSlice('expenses') || [];
        
        return this.applyFilters(expenses, filters);
    }

    // Get single expense
    getExpense(id) {
        const expenses = this.store.getStateSlice('expenses') || [];
        return expenses.find(e => e.id === id);
    }

    // Apply filters
    applyFilters(expenses, filters) {
        let filtered = [...expenses];

        if (filters.dateFrom) {
            filtered = filtered.filter(e => e.date >= filters.dateFrom);
        }

        if (filters.dateTo) {
            filtered = filtered.filter(e => e.date <= filters.dateTo);
        }

        if (filters.person) {
            filtered = filtered.filter(e => e.person === filters.person);
        }

        if (filters.card) {
            filtered = filtered.filter(e => e.card === filters.card);
        }

        if (filters.minAmount) {
            filtered = filtered.filter(e => e.amount >= filters.minAmount);
        }

        if (filters.maxAmount) {
            filtered = filtered.filter(e => e.amount <= filters.maxAmount);
        }

        if (filters.isInstallment !== undefined) {
            filtered = filtered.filter(e => Boolean(e.isInstallment) === filters.isInstallment);
        }

        // Sort
        if (filters.sortBy) {
            filtered = this.sortExpenses(filtered, filters.sortBy, filters.sortOrder);
        }

        return filtered;
    }

    // Sort expenses
    sortExpenses(expenses, sortBy, order = 'desc') {
        return expenses.sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];

            // Handle different data types
            if (sortBy === 'date') {
                valueA = new Date(valueA).getTime();
                valueB = new Date(valueB).getTime();
            } else if (sortBy === 'amount') {
                valueA = parseFloat(valueA) || 0;
                valueB = parseFloat(valueB) || 0;
            } else if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (order === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
    }

    // Create new expense with validation
    createExpense(data) {
        const expense = {
            id: this.generateId(),
            date: data.date || new Date().toISOString().slice(0, 10),
            description: data.description || '',
            amount: this.validateAmount(data.amount),
            person: data.person || '',
            card: data.card || '',
            category: data.category || '',
            isInstallment: Boolean(data.isInstallment),
            installmentNumber: data.installmentNumber || null,
            totalInstallments: data.totalInstallments || null,
            regularPaymentId: data.regularPaymentId || null,
            notes: data.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return this.validateExpense(expense);
    }

    // Validate expense data
    validateExpense(expense) {
        if (!expense.description?.trim()) {
            throw new Error('Description is required');
        }

        if (!expense.amount || expense.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        if (!expense.person?.trim()) {
            throw new Error('Person is required');
        }

        if (!expense.card?.trim()) {
            throw new Error('Card is required');
        }

        if (!this.isValidDate(expense.date)) {
            throw new Error('Valid date is required');
        }

        // Installment validation
        if (expense.isInstallment) {
            if (!expense.installmentNumber || expense.installmentNumber < 1) {
                throw new Error('Valid installment number is required');
            }
            if (!expense.totalInstallments || expense.totalInstallments < expense.installmentNumber) {
                throw new Error('Total installments must be greater than or equal to current installment');
            }
        }

        return expense;
    }

    // Validate amount
    validateAmount(amount) {
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed <= 0) {
            throw new Error('Invalid amount');
        }
        return parsed;
    }

    // Validate date
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    // Load user expenses from storage
    async loadUserExpenses() {
        try {
            const userData = await this.storage.get('currentUserData');
            const expenses = userData?.expenses || [];
            
            this.store.dispatch({
                type: 'EXPENSE_BULK_UPDATE',
                payload: { expenses }
            });
            
            this.eventBus.emit('expense:loaded', { count: expenses.length });
        } catch (error) {
            console.error('Load expenses error:', error);
        }
    }

    // Sync to storage
    async syncToStorage() {
        try {
            const currentUserData = await this.storage.get('currentUserData') || {};
            const expenses = this.store.getStateSlice('expenses');
            
            currentUserData.expenses = expenses;
            await this.storage.set('currentUserData', currentUserData);
            
            this.eventBus.emit('storage:synced', { type: 'expenses' });
        } catch (error) {
            console.error('Sync expenses error:', error);
        }
    }

    // Generate unique ID
    generateId() {
        return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Calculate statistics
    calculateStats(filters = {}) {
        const expenses = this.getExpenses(filters);
        
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const count = expenses.length;
        const average = count > 0 ? total / count : 0;
        
        const byPerson = expenses.reduce((acc, exp) => {
            acc[exp.person] = (acc[exp.person] || 0) + exp.amount;
            return acc;
        }, {});
        
        const byCard = expenses.reduce((acc, exp) => {
            acc[exp.card] = (acc[exp.card] || 0) + exp.amount;
            return acc;
        }, {});
        
        return {
            total,
            count,
            average,
            byPerson,
            byCard,
            maxAmount: Math.max(...expenses.map(e => e.amount), 0),
            minAmount: Math.min(...expenses.map(e => e.amount), 0)
        };
    }

    // Export for backup
    exportData() {
        return {
            expenses: this.store.getStateSlice('expenses') || [],
            version: '1.0',
            exportedAt: new Date().toISOString()
        };
    }

    // Import from backup
    async importData(data) {
        try {
            const expenses = data.expenses || [];
            
            // Validate each expense
            const validatedExpenses = expenses.map(exp => this.validateExpense(exp));
            
            this.store.dispatch({
                type: 'EXPENSE_BULK_UPDATE',
                payload: { expenses: validatedExpenses }
            });

            await this.syncToStorage();
            
            this.eventBus.emit('expense:imported', { count: validatedExpenses.length });
            
            return { success: true, count: validatedExpenses.length };
        } catch (error) {
            console.error('Import expenses error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Module factory function
const createExpenseModule = (dependencies) => {
    return new ExpenseModule(dependencies);
};

// Register module
if (window.moduleLoader) {
    window.moduleLoader.register('expense', createExpenseModule, ['store', 'storage', 'eventBus']);
}

export { ExpenseModule, createExpenseModule };
export default createExpenseModule;
