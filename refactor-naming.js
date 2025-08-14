// Naming Convention Refactoring Script
const fs = require('fs');
const path = require('path');

const replacements = {
    // Global Variables
    'expenses': 'expenses',
    'regularOdemeler': 'regularPayments', 
    'kredicardsi': 'creditCards',
    'people': 'people',
    
    // Object Properties - will be handled with more precision
    // 'date': 'date',
    // 'amount': 'amount', 
    // 'description': 'description',
    // 'card': 'card',
    // 'person': 'person',
    // 'user': 'person',
    
    // Function Names
    'migrateDuzenliOdemeData': 'migrateRegularPaymentData',
    'regularOdemeEkle': 'addRegularPayment',
    'regularOdemeSil': 'deleteRegularPayment',
    'regularOdemeGuncelle': 'updateRegularPayment',
    
    // Turkish comments and strings will remain for UI
};

function refactorFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(replacements).forEach(([oldName, newName]) => {
        // Word boundary regex to avoid partial matches
        const regex = new RegExp(`\\b${oldName}\\b`, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, newName);
            modified = true;
            console.log(`Replaced ${oldName} -> ${newName} in ${filePath}`);
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

// Process all JavaScript files
function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.js')) {
            refactorFile(fullPath);
        }
    });
}

console.log('🔄 Starting naming convention refactoring...');
processDirectory('./assets/js');
console.log('✅ Refactoring completed!');
