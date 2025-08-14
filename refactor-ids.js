// HTML ID and JavaScript Reference Refactoring
const fs = require('fs');
const path = require('path');

const htmlIdReplacements = {
    'expenseTarih': 'expenseDate',
    'expenseTutar': 'expenseAmount', 
    'expenseAciklama': 'expenseDescription',
    'expenseKart': 'expenseCard',
    'expenseKullanici': 'expensePerson',
    'ozet_tarih': 'summaryDate',
    'regularBaslangic': 'regularStart',
    'regularTutar': 'regularAmount',
    'regularAciklama': 'regularDescription'
};

function refactorHtmlIds(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(htmlIdReplacements).forEach(([oldId, newId]) => {
        // HTML id attributes: id="oldId"
        const idAttrRegex = new RegExp(`id="${oldId}"`, 'g');
        if (idAttrRegex.test(content)) {
            content = content.replace(idAttrRegex, `id="${newId}"`);
            modified = true;
            console.log(`Replaced id="${oldId}" -> id="${newId}" in ${filePath}`);
        }
        
        // HTML for attributes: for="oldId"
        const forAttrRegex = new RegExp(`for="${oldId}"`, 'g');
        if (forAttrRegex.test(content)) {
            content = content.replace(forAttrRegex, `for="${newId}"`);
            modified = true;
            console.log(`Replaced for="${oldId}" -> for="${newId}" in ${filePath}`);
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function refactorJsReferences(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(htmlIdReplacements).forEach(([oldId, newId]) => {
        // getElementById references
        const getByIdRegex = new RegExp(`getElementById\\('${oldId}'\\)`, 'g');
        if (getByIdRegex.test(content)) {
            content = content.replace(getByIdRegex, `getElementById('${newId}')`);
            modified = true;
            console.log(`Replaced getElementById('${oldId}') -> getElementById('${newId}') in ${filePath}`);
        }
        
        // querySelector references  
        const querySelectorRegex = new RegExp(`querySelector\\('#${oldId}'\\)`, 'g');
        if (querySelectorRegex.test(content)) {
            content = content.replace(querySelectorRegex, `querySelector('#${newId}')`);
            modified = true;
            console.log(`Replaced querySelector('#${oldId}') -> querySelector('#${newId}') in ${filePath}`);
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function processFiles() {
    // Process HTML files
    const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
    htmlFiles.forEach(file => {
        refactorHtmlIds(file);
    });
    
    // Process JS files
    function processJsDirectory(dirPath) {
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                processJsDirectory(fullPath);
            } else if (file.endsWith('.js')) {
                refactorJsReferences(fullPath);
            }
        });
    }
    
    processJsDirectory('./assets/js');
}

console.log('🔄 Starting HTML ID and JS reference refactoring...');
processFiles();
console.log('✅ HTML ID refactoring completed!');
