const fs = require('fs');
const path = require('path');

// Final cleanup for remaining Turkish elements
const finalReplacements = [
    // Turkish messages that should be in English for code
    { from: "'Expense successfully added!'", to: "'Expense successfully added!'" },
    { from: "'Expense not found'", to: "'Expense not found'" },
    { from: '"Expense successfully added!"', to: '"Expense successfully added!"' },
    { from: '"Expense not found"', to: '"Expense not found"' },
    
    // HTML element IDs that are still Turkish
    { from: '#filterCard', to: '#filterCard' },
    { from: '#filterUser', to: '#filterUser' },
    { from: '#editCard', to: '#editCard' },
    { from: '#editUser', to: '#editUser' },
    { from: '#editDate', to: '#editDate' },
    { from: '#editAmount', to: '#editAmount' },
    { from: '#editDescription', to: '#editDescription' },
    { from: 'filterCard', to: 'filterCard' },
    { from: 'filterUser', to: 'filterUser' },
    { from: 'editCard', to: 'editCard' },
    { from: 'editUser', to: 'editUser' },
    { from: 'editDate', to: 'editDate' },
    { from: 'editAmount', to: 'editAmount' },
    { from: 'editDescription', to: 'editDescription' },
    
    // Function names
    { from: 'handleExpenseSubmit', to: 'handleExpenseSubmit' },
    
    // Any remaining Turkish words in camelCase
    { from: /([a-z])Harcama([A-Z])/g, to: '$1Expense$2' },
    { from: /([a-z])Kart([A-Z])/g, to: '$1Card$2' },
    { from: /([a-z])Kullanici([A-Z])/g, to: '$1User$2' },
    { from: /([a-z])Tarih([A-Z])/g, to: '$1Date$2' },
    { from: /([a-z])Tutar([A-Z])/g, to: '$1Amount$2' },
    { from: /([a-z])Aciklama([A-Z])/g, to: '$1Description$2' }
];

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        let changeCount = 0;
        
        finalReplacements.forEach(replacement => {
            let newContent;
            if (replacement.from instanceof RegExp) {
                const matches = content.match(replacement.from);
                if (matches) {
                    changeCount += matches.length;
                }
                newContent = content.replace(replacement.from, replacement.to);
            } else {
                const regex = new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                const matches = content.match(regex);
                if (matches) {
                    changeCount += matches.length;
                }
                newContent = content.replace(regex, replacement.to);
            }
            
            if (newContent !== content) {
                changed = true;
                content = newContent;
            }
        });
        
        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Final cleanup - Updated ${changeCount} items in: ${filePath}`);
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
console.log('🔄 Starting final cleanup...');
const totalChanges = processDirectory('./');
console.log(`✨ Final cleanup completed! Total changes: ${totalChanges}`);
