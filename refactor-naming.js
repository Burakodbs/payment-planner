// Naming Convention Refactoring Script
const fs = require('fs');
const path = require('path');

const replacements = {
    // Global Variables
    'harcamalar': 'expenses',
    'duzenliOdemeler': 'regularPayments', 
    'kredikartlari': 'creditCards',
    'kisiler': 'people',
    
    // Object Properties - will be handled with more precision
    // 'tarih': 'date',
    // 'tutar': 'amount', 
    // 'aciklama': 'description',
    // 'kart': 'card',
    // 'kisi': 'person',
    // 'kullanici': 'person',
    
    // Function Names
    'migrateDuzenliOdemeData': 'migrateRegularPaymentData',
    'duzenliOdemeEkle': 'addRegularPayment',
    'duzenliOdemeSil': 'deleteRegularPayment',
    'duzenliOdemeGuncelle': 'updateRegularPayment',
    
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
