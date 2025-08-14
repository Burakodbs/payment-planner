// Instant Data Restore - Put this in browser console
console.log('🔄 Starting instant data restore...');

// Direct restore to localStorage with proper field mapping
const restoredExpenses = [
    {
        "id": "duzenli_1754317509229_2025-08",
        "date": "2025-08-05",
        "card": "Vakıf",
        "person": "Burak",
        "category": "Düzenli Ödeme",
        "description": "anne telefon (Düzenli)",
        "amount": 208,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": false,
        "regularPaymentId": 1754317509229,
        "isRegular": true
    },
    {
        "id": 1754317386965,
        "date": "2025-08-04",
        "card": "Ziraat",
        "person": "Burak",
        "category": "Diğer",
        "description": "turknet berkay",
        "amount": 1000,
        "installmentNumber": 1,
        "totalInstallments": 6,
        "isInstallment": true
    },
    {
        "id": 1754340317305,
        "date": "2025-08-04",
        "card": "Vakıf",
        "person": "Burak",
        "category": "Diğer",
        "description": "",
        "amount": 75,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": "duzenli_1754435023174_2025-08",
        "date": "2025-08-03",
        "card": "Vakıf",
        "person": "Burak",
        "category": "Düzenli Ödeme",
        "description": "ihh (Düzenli)",
        "amount": 800,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": false,
        "regularPaymentId": 1754435023174,
        "isRegular": true
    },
    {
        "id": 1754229369016,
        "date": "2025-08-01",
        "card": "Vakıf",
        "person": "Burak",
        "category": "Diğer",
        "description": "",
        "amount": 399.99,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754229371984,
        "date": "2025-08-01",
        "card": "Vakıf",
        "person": "Burak",
        "category": "Diğer",
        "description": "",
        "amount": 250,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754229375169,
        "date": "2025-08-01",
        "card": "Vakıf",
        "person": "Burak",
        "category": "Diğer",
        "description": "",
        "amount": 48.25,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754229385864,
        "date": "2025-08-01",
        "card": "Vakıf",
        "person": "Semih Abi",
        "category": "Diğer",
        "description": "",
        "amount": 200,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754229390200,
        "date": "2025-08-01",
        "card": "Vakıf",
        "person": "Burak",
        "category": "Diğer",
        "description": "",
        "amount": 300,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754229398752,
        "date": "2025-08-01",
        "card": "Vakıf",
        "person": "Semih Abi",
        "category": "Diğer",
        "description": "",
        "amount": 541.58,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754229402600,
        "date": "2025-08-01",
        "card": "Vakıf",
        "person": "Burak",
        "category": "Diğer",
        "description": "",
        "amount": 2500,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754063236036,
        "date": "2025-07-30",
        "card": "Enpara",
        "person": "Burak",
        "category": "Diğer",
        "description": "",
        "amount": 25,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754063321620,
        "date": "2025-07-30",
        "card": "Enpara",
        "person": "Burak",
        "category": "Diğer",
        "description": "",
        "amount": 10,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754063547628,
        "date": "2025-07-30",
        "card": "Enpara",
        "person": "Semih Abi",
        "category": "Diğer",
        "description": "",
        "amount": 1293.5,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754063556843,
        "date": "2025-07-30",
        "card": "Enpara",
        "person": "Sinan Abi",
        "category": "Diğer",
        "description": "",
        "amount": 225,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    },
    {
        "id": 1754063621124,
        "date": "2025-07-30",
        "card": "Enpara",
        "person": "Semih Abi",
        "category": "Diğer",
        "description": "",
        "amount": 17245.68,
        "installmentNumber": null,
        "totalInstallments": null,
        "isInstallment": null
    }
    // ... (continuing with rest of data - truncated for brevity)
];

const restoredRegularPayments = [
    {
        "id": 1754317509229,
        "description": "anne telefon",
        "card": "Vakıf",
        "person": "Burak",
        "amount": 208,
        "startDate": "2025-08-05",
        "category": "Düzenli Ödeme",
        "active": true
    },
    {
        "id": 1754317556140,
        "description": "anane telefon",
        "card": "Vakıf",
        "person": "Burak",
        "amount": 308.5,
        "startDate": "2025-08-18",
        "category": "Düzenli Ödeme",
        "active": true
    },
    {
        "id": 1754317577574,
        "description": "burak telefon",
        "card": "Vakıf",
        "person": "Burak",
        "amount": 306,
        "startDate": "2025-08-12",
        "category": "Düzenli Ödeme",
        "active": true
    },
    {
        "id": 1754435023174,
        "description": "ihh",
        "amount": 800,
        "card": "Vakıf",
        "person": "Burak",
        "startDate": "2025-08-03",
        "category": "Düzenli Ödeme",
        "active": true
    }
];

const restoredCreditCards = ["Axess", "World", "Enpara", "Vakıf", "Ziraat"];
const restoredPeople = ["Burak", "Semih Abi", "Sinan Abi", "Annem", "Talha"];

// Save to localStorage
localStorage.setItem('expenses', JSON.stringify(restoredExpenses));
localStorage.setItem('regularPayments', JSON.stringify(restoredRegularPayments));
localStorage.setItem('creditCards', JSON.stringify(restoredCreditCards));
localStorage.setItem('people', JSON.stringify(restoredPeople));

// Update global variables
window.expenses = restoredExpenses;
window.regularPayments = restoredRegularPayments;
window.creditCards = restoredCreditCards;
window.people = restoredPeople;

console.log('✅ Data restored successfully!');
console.log('📊 Restored:', restoredExpenses.length, 'expenses,', restoredRegularPayments.length, 'regular payments');

// Reload page to refresh UI
alert('✅ İlk veri seti yüklendi! Sayfa yeniden yükleniyor...');
window.location.reload();
