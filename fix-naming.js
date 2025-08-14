const fs = require('fs');
const path = require('path');

// Define replacements for variable names, properties, and function parameters
const replacements = [
    // Variable names
    { from: 'expenses', to: 'expenses' },
    { from: 'expense', to: 'expense' },
    { from: 'cards', to: 'cards' },  
    { from: 'card', to: 'card' },
    { from: 'user', to: 'user' },
    { from: 'users', to: 'users' },
    { from: 'person', to: 'person' },
    { from: 'people', to: 'people' },
    
    // Object properties (exact match)
    { from: '.date', to: '.date' },
    { from: '.amount', to: '.amount' },
    { from: '.description', to: '.description' },
    { from: '.user', to: '.user' },
    { from: '.card', to: '.card' },
    { from: '"date"', to: '"date"' },
    { from: '"amount"', to: '"amount"' },
    { from: '"description"', to: '"description"' },
    { from: '"user"', to: '"user"' },
    { from: '"card"', to: '"card"' },
    { from: "'date'", to: "'date'" },
    { from: "'amount'", to: "'amount'" },
    { from: "'description'", to: "'description'" },
    { from: "'user'", to: "'user'" },
    { from: "'card'", to: "'card'" },
    
    // HTML IDs and names
    { from: 'regularCard', to: 'regularCard' },
    { from: 'regularUser', to: 'regularUser' },
    { from: 'regularPaymentsList', to: 'regularPaymentsList' },
    { from: 'shortcutInfo', to: 'shortcutInfo' },
    { from: 'expenseForm', to: 'expenseForm' },
    
    // Function names that might be missed
    { from: 'updateRegularPaymentsList', to: 'updateRegularPaymentsList' },
    { from: 'addRegularPayment', to: 'addRegularPayment' },
    { from: 'deleteRegularPayment', to: 'deleteRegularPayment' },
    { from: 'updateShortcutInfo', to: 'updateShortcutInfo' },
    
    // CSS classes that might contain Turkish
    { from: 'regular-item', to: 'regular-item' },
    { from: 'regular-info', to: 'regular-info' },
    
    // Comments and strings (be careful with these)
    { from: 'startDate', to: 'startDate' },
    { from: 'start', to: 'start' },
    { from: 'accounts', to: 'accounts' },
    { from: 'futurePayments', to: 'futurePayments' }
];

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        replacements.forEach(replacement => {
            const regex = new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const newContent = content.replace(regex, replacement.to);
            if (newContent !== content) {
                changed = true;
                content = newContent;
            }
        });
        
        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Updated: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

function processDirectory(dirPath) {
    try {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                processDirectory(fullPath);
            } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.html'))) {
                replaceInFile(fullPath);
            }
        });
    } catch (error) {
        console.error(`❌ Error processing directory ${dirPath}:`, error.message);
    }
}

// Start processing
console.log('🔄 Starting naming convention fixes...');
processDirectory('./assets');
processDirectory('./');

console.log('✨ Naming convention fixes completed!');
