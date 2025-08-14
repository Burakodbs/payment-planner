// Function Name Refactoring Script
const fs = require('fs');
const path = require('path');

const functionReplacements = {
    // Turkish function names to English
    'updateAylikOzet': 'updateMonthlySummary',
    'loadAylikOzet': 'loadMonthlySummary',
    'hesapla': 'calculate',
    'guncelle': 'update',
    'yukle': 'load',
    'kaydet': 'save',
    'temizle': 'clear',
    'sil': 'delete',
    'ekle': 'add',
    
    // More specific function names we might have
    'harcamaEkle': 'addExpense',
    'harcamaSil': 'deleteExpense',
    'harcamaGuncelle': 'updateExpense',
    'kartEkle': 'addCard',
    'kartSil': 'deleteCard',
    'kisiEkle': 'addPerson',
    'kisiSil': 'deletePerson'
};

function refactorFunctions(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(functionReplacements).forEach(([oldName, newName]) => {
        // Function definitions: function oldName(
        const funcDefRegex = new RegExp(`function\\s+${oldName}\\s*\\(`, 'g');
        if (funcDefRegex.test(content)) {
            content = content.replace(funcDefRegex, `function ${newName}(`);
            modified = true;
            console.log(`Replaced function ${oldName}() -> ${newName}() in ${filePath}`);
        }
        
        // Function calls: oldName(
        const funcCallRegex = new RegExp(`\\b${oldName}\\s*\\(`, 'g');
        if (funcCallRegex.test(content)) {
            content = content.replace(funcCallRegex, `${newName}(`);
            modified = true;
            console.log(`Replaced call ${oldName}() -> ${newName}() in ${filePath}`);
        }
        
        // typeof checks: typeof oldName === 'function'
        const typeofRegex = new RegExp(`typeof\\s+${oldName}\\s+===`, 'g');
        if (typeofRegex.test(content)) {
            content = content.replace(typeofRegex, `typeof ${newName} ===`);
            modified = true;
            console.log(`Replaced typeof ${oldName} -> typeof ${newName} in ${filePath}`);
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.js')) {
            refactorFunctions(fullPath);
        }
    });
}

console.log('🔄 Starting function name refactoring...');
processDirectory('./assets/js');
console.log('✅ Function name refactoring completed!');
