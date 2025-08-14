// Update remaining HTML references
const fs = require('fs');

const updates = {
    'accounts.html': 'accounts.html',
    'statistics.html': 'statistics.html'
};

function updateAllFiles() {
    console.log('🔄 Updating remaining HTML references...');
    
    // Get all HTML files
    const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
    
    htmlFiles.forEach(htmlFile => {
        let content = fs.readFileSync(htmlFile, 'utf8');
        let modified = false;
        
        Object.entries(updates).forEach(([oldName, newName]) => {
            // Update href references
            const hrefRegex = new RegExp(`href=["']${oldName}["']`, 'g');
            if (hrefRegex.test(content)) {
                content = content.replace(hrefRegex, `href="${newName}"`);
                modified = true;
                console.log(`  Updated ${oldName} -> ${newName} in ${htmlFile}`);
            }
        });
        
        if (modified) {
            fs.writeFileSync(htmlFile, content, 'utf8');
        }
    });
    
    console.log('✅ All references updated!');
}

updateAllFiles();
