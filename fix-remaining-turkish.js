const fs = require('fs');
const path = require('path');

// Define additional replacements for remaining Turkish words
const additionalReplacements = [
    // Comments and labels
    { from: '// Card distribution chart', to: '// Card distribution chart' },
    { from: 'Total Expenses', to: 'Total Expenses' },
    { from: 'Average Expenses', to: 'Average Expenses' },
    { from: '// Expense analysis', to: '// Expense analysis' },
    { from: 'No Expense Data Yet', to: 'No Expense Data Yet' },
    { from: 'Add Expense', to: 'Add Expense' },
    { from: 'filteredExpenses', to: 'filteredExpenses' },
    
    // More chart and UI related Turkish text
    { from: 'Monthly Trend', to: 'Monthly Trend' },
    { from: 'Card Distribution', to: 'Card Distribution' },
    { from: 'User Distribution', to: 'User Distribution' },
    { from: 'Weekly Average', to: 'Weekly Average' },
    
    // Function and variable names that might remain
    { from: 'statistics', to: 'statistics' },
    { from: 'statistic', to: 'statistic' },
    { from: 'chart', to: 'chart' },
    { from: 'data', to: 'data' },
    { from: 'dataleri', to: 'data' },
    
    // HTML elements and IDs
    { from: 'monthlySummary', to: 'monthlySummary' },
    { from: 'currentDate', to: 'currentDate' }
];

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        additionalReplacements.forEach(replacement => {
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
console.log('🔄 Starting additional naming fixes...');
processDirectory('./assets');
processDirectory('./');

console.log('✨ Additional naming fixes completed!');
