#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Template dosyalarını oku
const baseTemplate = fs.readFileSync('./templates/base.html', 'utf8');

// Sayfa definitionları
const pages = [
    {
        name: 'index',
        title: 'Ana Sayfa',
        content: `
            <div class="content">
                <!-- Dashboard Content -->
                <div class="page-content">
                    <h2>📊 Gösterge Paneli</h2>
                    <!-- Dashboard içeriği buraya -->
                </div>
            </div>
        `,
        scripts: './assets/js/pages/dashboard.js'
    },
    {
        name: 'add-expense',
        title: 'Harcama Ekle',
        content: `
            <div class="content">
                <!-- Add Expense Content -->
                <div class="page-content">
                    <h2>➕ Harcama Ekle</h2>
                    <!-- Form içeriği buraya -->
                </div>
            </div>
        `,
        scripts: './assets/js/pages/add-expense.js'
    }
    // Diğer sayfalar...
];

// Build fonksiyonu
function buildPages() {
    pages.forEach(page => {
        let html = baseTemplate
            .replace('{{PAGE_TITLE}}', page.title)
            .replace('{{CONTENT}}', page.content)
            .replace('{{PAGE_SCRIPTS}}', `<script src="${page.scripts}"></script>`);
        
        fs.writeFileSync(`./${page.name}.html`, html);
        console.log(`✅ ${page.name}.html built`);
    });
}

// Build yap
buildPages();
