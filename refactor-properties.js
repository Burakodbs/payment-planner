// Object Property Naming Convention Refactoring
const fs = require('fs');
const path = require('path');

const propertyReplacements = {
    'tarih': 'date',
    'tutar': 'amount',
    'aciklama': 'description', 
    'kart': 'card',
    'kisi': 'person',
    'kullanici': 'person', // Both kisi and kullanici become person
    'durum': 'status'
};

function refactorObjectProperties(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(propertyReplacements).forEach(([oldProp, newProp]) => {
        // Dot notation: obj.property
        const dotRegex = new RegExp(`\\.${oldProp}\\b`, 'g');
        if (dotRegex.test(content)) {
            content = content.replace(dotRegex, `.${newProp}`);
            modified = true;
            console.log(`Replaced .${oldProp} -> .${newProp} in ${filePath}`);
        }
        
        // Bracket notation: obj['property'] or obj["property"]
        const bracketRegex1 = new RegExp(`\\['${oldProp}'\\]`, 'g');
        const bracketRegex2 = new RegExp(`\\["${oldProp}"\\]`, 'g');
        
        if (bracketRegex1.test(content)) {
            content = content.replace(bracketRegex1, `['${newProp}']`);
            modified = true;
            console.log(`Replaced ['${oldProp}'] -> ['${newProp}'] in ${filePath}`);
        }
        
        if (bracketRegex2.test(content)) {
            content = content.replace(bracketRegex2, `["${newProp}"]`);
            modified = true;
            console.log(`Replaced ["${oldProp}"] -> ["${newProp}"] in ${filePath}`);
        }
        
        // Object literal properties: {property: value}
        const objectLiteralRegex = new RegExp(`\\b${oldProp}:`, 'g');
        if (objectLiteralRegex.test(content)) {
            content = content.replace(objectLiteralRegex, `${newProp}:`);
            modified = true;
            console.log(`Replaced ${oldProp}: -> ${newProp}: in ${filePath}`);
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
            refactorObjectProperties(fullPath);
        }
    });
}

console.log('🔄 Starting object property refactoring...');
processDirectory('./assets/js');
console.log('✅ Object property refactoring completed!');
