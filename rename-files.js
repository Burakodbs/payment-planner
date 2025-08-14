// File Renaming and Reference Update Script
const fs = require('fs');
const path = require('path');

const fileRenamings = {
    // HTML files
    'aylik-ozet.html': 'monthly-summary.html',
    'harcama-ekle.html': 'add-expense.html',
    'harcama-listesi.html': 'expense-list.html',
    'veri-yonetimi.html': 'data-management.html',
    
    // JS files
    'assets/js/pages/aylik-ozet.js': 'assets/js/pages/monthly-summary.js',
    'assets/js/pages/harcama-ekle.js': 'assets/js/pages/add-expense.js',
    'assets/js/pages/harcama-listesi.js': 'assets/js/pages/expense-list.js',
    'assets/js/pages/veri-yonetimi.js': 'assets/js/pages/data-management.js'
};

function updateReferences(filePath, oldName, newName) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Update script src references
        const scriptRegex = new RegExp(`src=["']([^"']*${oldName})["']`, 'g');
        if (scriptRegex.test(content)) {
            content = content.replace(scriptRegex, (match, src) => {
                const newSrc = src.replace(oldName, newName);
                return match.replace(src, newSrc);
            });
            modified = true;
            console.log(`  Updated script reference ${oldName} -> ${newName} in ${filePath}`);
        }
        
        // Update href references
        const hrefRegex = new RegExp(`href=["']([^"']*${oldName})["']`, 'g');
        if (hrefRegex.test(content)) {
            content = content.replace(hrefRegex, (match, href) => {
                const newHref = href.replace(oldName, newName);
                return match.replace(href, newHref);
            });
            modified = true;
            console.log(`  Updated href reference ${oldName} -> ${newName} in ${filePath}`);
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
        }
    } catch (error) {
        console.log(`  Could not update references in ${filePath}: ${error.message}`);
    }
}

function renameFiles() {
    console.log('🔄 Starting file renaming...');
    
    Object.entries(fileRenamings).forEach(([oldPath, newPath]) => {
        try {
            if (fs.existsSync(oldPath)) {
                // Rename the file
                fs.renameSync(oldPath, newPath);
                console.log(`📁 Renamed: ${oldPath} -> ${newPath}`);
                
                // Update references in all HTML and JS files
                const oldFileName = path.basename(oldPath);
                const newFileName = path.basename(newPath);
                
                // Check HTML files
                const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
                htmlFiles.forEach(htmlFile => {
                    updateReferences(htmlFile, oldFileName, newFileName);
                });
                
                // Check JS files recursively
                function updateJsReferences(dir) {
                    const files = fs.readdirSync(dir);
                    files.forEach(file => {
                        const fullPath = path.join(dir, file);
                        const stat = fs.statSync(fullPath);
                        
                        if (stat.isDirectory()) {
                            updateJsReferences(fullPath);
                        } else if (file.endsWith('.js')) {
                            updateReferences(fullPath, oldFileName, newFileName);
                        }
                    });
                }
                
                updateJsReferences('assets/js');
                
            } else {
                console.log(`⚠️  File not found: ${oldPath}`);
            }
        } catch (error) {
            console.log(`❌ Error renaming ${oldPath}: ${error.message}`);
        }
    });
    
    console.log('✅ File renaming completed!');
}

// Ask for confirmation before proceeding
console.log('This script will rename files and update all references.');
console.log('Make sure you have committed your changes first!');
console.log('');

renameFiles();
