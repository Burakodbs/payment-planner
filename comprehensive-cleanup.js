const fs = require('fs');
const path = require('path');

// Comprehensive replacements for all remaining Turkish naming
const replacements = [
    // Page identifiers
    { from: "'monthly-summary'", to: "'monthly-summary'" },
    { from: '"monthly-summary"', to: '"monthly-summary"' },
    { from: "'accounts'", to: "'accounts'" },
    { from: '"accounts"', to: '"accounts"' },
    { from: "'add-expense'", to: "'add-expense'" },
    { from: '"add-expense"', to: '"add-expense"' },
    { from: "'expense-list'", to: "'expense-list'" },
    { from: '"expense-list"', to: '"expense-list"' },
    { from: "'data-management'", to: "'data-management'" },
    { from: '"data-management"', to: '"data-management"' },
    { from: "'statistics'", to: "'statistics'" },
    { from: '"statistics"', to: '"statistics"' },
    
    // HTML element IDs and names that are still in Turkish
    { from: 'minAmount', to: 'minAmount' },
    { from: 'maxAmount', to: 'maxAmount' },
    { from: 'sortCriteria', to: 'sortCriteria' },
    { from: 'editExpenseForm', to: 'editExpenseForm' },
    { from: 'filterDate', to: 'filterDate' }, // This one is already correct
    { from: 'filterUser', to: 'filterUser' }, // This one is already correct
    { from: 'filterCard', to: 'filterCard' }, // This one is already correct
    
    // Function names
    { from: 'updateExpenseTable', to: 'updateExpenseTable' },
    { from: 'handleEditExpenseSubmit', to: 'handleEditExpenseSubmit' },
    { from: 'updateAccounts', to: 'updateAccounts' },
    { from: 'initRegularPaymentCheck', to: 'initRegularPaymentCheck' },
    
    // Variable names
    { from: 'amountInput', to: 'amountInput' },
    { from: 'editForm', to: 'editForm' }, // This is fine
    
    // Comments and strings
    { from: '// Accounts page specific JavaScript code', to: '// Accounts page specific JavaScript code' },
    { from: "// console.log('Accounts page loaded');", to: "// console.log('Accounts page loaded');" },
    { from: '// Hesaplar sayfasına özel fonksiyonlar ve event listener\'lar', to: '// Accounts page specific functions and event listeners' },
    { from: '// Update accounts table', to: '// Update accounts table' },
    { from: '// Data Management page specific JavaScript code', to: '// Data Management page specific JavaScript code' },
    { from: '// Card management', to: '// Card management' },
    { from: "'Card successfully added'", to: "'Card successfully added'" },
    { from: "'Card deleted'", to: "'Card deleted'" },
    
    // Sort criteria values
    { from: "'date-desc'", to: "'date-desc'" },
    { from: "'date-asc'", to: "'date-asc'" },
    { from: "'amount-desc'", to: "'amount-desc'" },
    { from: "'amount-asc'", to: "'amount-asc'" },
    { from: '"date-desc"', to: '"date-desc"' },
    { from: '"date-asc"', to: '"date-asc"' },
    { from: '"amount-desc"', to: '"amount-desc"' },
    { from: '"amount-asc"', to: '"amount-asc"' },
    
    // Additional variable patterns
    { from: /\bharcama([A-Z])/g, to: 'expense$1' },
    { from: /\bkart([A-Z])/g, to: 'card$1' },
    { from: /\bkullanici([A-Z])/g, to: 'user$1' },
    { from: /\btarih([A-Z])/g, to: 'date$1' },
    { from: /\btutar([A-Z])/g, to: 'amount$1' },
    { from: /\baciklama([A-Z])/g, to: 'description$1' },
    { from: /\bhesap([A-Z])/g, to: 'account$1' },
    { from: /\bozet([A-Z])/g, to: 'summary$1' },
    { from: /\bistatistik([A-Z])/g, to: 'statistic$1' },
    { from: /\bveri([A-Z])/g, to: 'data$1' },
    { from: /\bduzenli([A-Z])/g, to: 'regular$1' }
];

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        let changeCount = 0;
        
        replacements.forEach(replacement => {
            let newContent;
            if (replacement.from instanceof RegExp) {
                newContent = content.replace(replacement.from, replacement.to);
            } else {
                const regex = new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                newContent = content.replace(regex, replacement.to);
            }
            
            if (newContent !== content) {
                const matches = content.match(replacement.from instanceof RegExp ? replacement.from : new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
                if (matches) {
                    changeCount += matches.length;
                }
                changed = true;
                content = newContent;
            }
        });
        
        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Updated ${changeCount} items in: ${filePath}`);
            return changeCount;
        }
        return 0;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return 0;
    }
}

function processDirectory(dirPath) {
    let totalChanges = 0;
    try {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                totalChanges += processDirectory(fullPath);
            } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.html'))) {
                totalChanges += replaceInFile(fullPath);
            }
        });
    } catch (error) {
        console.error(`❌ Error processing directory ${dirPath}:`, error.message);
    }
    return totalChanges;
}

// Start processing
console.log('🔄 Starting comprehensive Turkish naming cleanup...');
console.log('📂 Processing assets directory...');
const assetsChanges = processDirectory('./assets');
console.log('📂 Processing root directory...');
const rootChanges = processDirectory('./');

const totalChanges = assetsChanges + rootChanges;
console.log(`✨ Comprehensive cleanup completed! Total changes: ${totalChanges}`);
