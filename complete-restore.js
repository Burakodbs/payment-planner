// Complete Data Restore Script
// Paste this entire code in browser console

(function() {
    console.log('🔄 Starting complete data restoration...');
    
    const backupExpenses = [
        {"id":"duzenli_1754317509229_2025-08","date":"2025-08-05","card":"Vakıf","person":"Burak","category":"Düzenli Ödeme","description":"anne telefon (Düzenli)","amount":208,"installmentNumber":null,"totalInstallments":null,"isInstallment":false,"regularPaymentId":1754317509229,"isRegular":true},
        {"id":1754317386965,"date":"2025-08-04","card":"Ziraat","person":"Burak","category":"Diğer","description":"turknet berkay","amount":1000,"installmentNumber":1,"totalInstallments":6,"isInstallment":true},
        {"id":1754340317305,"date":"2025-08-04","card":"Vakıf","person":"Burak","category":"Diğer","description":"","amount":75,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":"duzenli_1754435023174_2025-08","date":"2025-08-03","card":"Vakıf","person":"Burak","category":"Düzenli Ödeme","description":"ihh (Düzenli)","amount":800,"installmentNumber":null,"totalInstallments":null,"isInstallment":false,"regularPaymentId":1754435023174,"isRegular":true},
        {"id":1754229369016,"date":"2025-08-01","card":"Vakıf","person":"Burak","category":"Diğer","description":"","amount":399.99,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754229371984,"date":"2025-08-01","card":"Vakıf","person":"Burak","category":"Diğer","description":"","amount":250,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754229375169,"date":"2025-08-01","card":"Vakıf","person":"Burak","category":"Diğer","description":"","amount":48.25,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754229385864,"date":"2025-08-01","card":"Vakıf","person":"Semih Abi","category":"Diğer","description":"","amount":200,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754229390200,"date":"2025-08-01","card":"Vakıf","person":"Burak","category":"Diğer","description":"","amount":300,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754229398752,"date":"2025-08-01","card":"Vakıf","person":"Semih Abi","category":"Diğer","description":"","amount":541.58,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754229402600,"date":"2025-08-01","card":"Vakıf","person":"Burak","category":"Diğer","description":"","amount":2500,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063236036,"date":"2025-07-30","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":25,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063321620,"date":"2025-07-30","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":10,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063547628,"date":"2025-07-30","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":1293.5,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063556843,"date":"2025-07-30","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":225,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063621124,"date":"2025-07-30","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":17245.68,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063218252,"date":"2025-07-29","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":81,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063228756,"date":"2025-07-29","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":115,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063312923,"date":"2025-07-29","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":385,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063219909,"date":"2025-07-28","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":75,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063547724,"date":"2025-07-28","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":0,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063668211,"date":"2025-07-28","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":3320,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063573075,"date":"2025-07-27","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":164.9,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063154884,"date":"2025-07-26","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":199.96,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063292901,"date":"2025-07-26","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":35,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063660980,"date":"2025-07-26","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":3600,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063225660,"date":"2025-07-24","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":822.48,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063273540,"date":"2025-07-24","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":1625.25,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063172180,"date":"2025-07-22","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":100,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063175515,"date":"2025-07-22","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":60,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063284092,"date":"2025-07-22","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":435,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063157900,"date":"2025-07-21","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":159,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063287181,"date":"2025-07-19","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":64,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063166188,"date":"2025-07-17","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":500,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754229600094,"date":"2025-07-17","card":"Vakıf","person":"Burak","category":"Diğer","description":"","amount":2142.4,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063233068,"date":"2025-07-16","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":55.35,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063160564,"date":"2025-07-14","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":59.5,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063560267,"date":"2025-07-14","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":219.5,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063300428,"date":"2025-07-13","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":1713.85,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063213148,"date":"2025-07-12","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":273.9,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063543316,"date":"2025-07-12","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":2404,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063316164,"date":"2025-07-11","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":210,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063677476,"date":"2025-07-11","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":436,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063565172,"date":"2025-07-10","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":189,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063276100,"date":"2025-07-09","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":1317,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063550924,"date":"2025-07-08","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":449.5,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063656868,"date":"2025-07-08","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":52.99,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063242980,"date":"2025-07-06","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":3250,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063683740,"date":"2025-07-05","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":443.99,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754065810207,"date":"2025-07-04","card":"Axess","person":"Sinan Abi","category":"Diğer","description":"","amount":1300,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063204492,"date":"2025-07-02","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":330,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063305764,"date":"2025-07-02","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":1600,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063651028,"date":"2025-07-02","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":64,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754061939229,"date":"2025-07-01","card":"Axess","person":"Semih Abi","category":"Diğer","description":"","amount":880,"installmentNumber":2,"totalInstallments":3,"isInstallment":true},
        {"id":1754062896740,"date":"2025-07-01","card":"Axess","person":"Semih Abi","category":"Diğer","description":"","amount":11666.66,"installmentNumber":11,"totalInstallments":12,"isInstallment":true},
        {"id":1754063119988,"date":"2025-07-01","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":1158.37,"installmentNumber":4,"totalInstallments":6,"isInstallment":true},
        {"id":1754063138429,"date":"2025-07-01","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":564,"installmentNumber":3,"totalInstallments":6,"isInstallment":true},
        {"id":1754063146547,"date":"2025-07-01","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":355.66,"installmentNumber":3,"totalInstallments":6,"isInstallment":true},
        {"id":1754063216060,"date":"2025-07-01","card":"Enpara","person":"Burak","category":"Diğer","description":"","amount":150,"installmentNumber":null,"totalInstallments":null,"isInstallment":null},
        {"id":1754063629908,"date":"2025-07-01","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":1216.85,"installmentNumber":1,"totalInstallments":6,"isInstallment":true},
        {"id":1754063645628,"date":"2025-07-01","card":"Enpara","person":"Semih Abi","category":"Diğer","description":"","amount":600,"installmentNumber":1,"totalInstallments":6,"isInstallment":true},
        {"id":1754063671684,"date":"2025-07-01","card":"Enpara","person":"Sinan Abi","category":"Diğer","description":"","amount":1302,"installmentNumber":null,"totalInstallments":null,"isInstallment":null}
    ];

    const backupRegularPayments = [
        {"id":1754317509229,"description":"anne telefon","card":"Vakıf","person":"Burak","amount":208,"startDate":"2025-08-05","category":"Regular Payment","active":true},
        {"id":1754317556140,"description":"anane telefon","card":"Vakıf","person":"Burak","amount":308.5,"startDate":"2025-08-18","category":"Regular Payment","active":true},
        {"id":1754317577574,"description":"burak telefon","card":"Vakıf","person":"Burak","amount":306,"startDate":"2025-08-12","category":"Regular Payment","active":true},
        {"id":1754435023174,"description":"ihh","amount":800,"card":"Vakıf","person":"Burak","startDate":"2025-08-03","category":"Regular Payment","active":true}
    ];

    const backupCreditCards = ["Axess", "World", "Enpara", "Vakıf", "Ziraat"];
    const backupPeople = ["Burak", "Semih Abi", "Sinan Abi", "Annem", "Talha"];

    try {
        // Clear existing data
        localStorage.clear();
        
        // Restore to localStorage
        localStorage.setItem('expenses', JSON.stringify(backupExpenses));
        localStorage.setItem('regularPayments', JSON.stringify(backupRegularPayments));
        localStorage.setItem('creditCards', JSON.stringify(backupCreditCards));
        localStorage.setItem('people', JSON.stringify(backupPeople));

        // Update global variables if they exist
        if (typeof window.expenses !== 'undefined') window.expenses = backupExpenses;
        if (typeof window.regularPayments !== 'undefined') window.regularPayments = backupRegularPayments;
        if (typeof window.creditCards !== 'undefined') window.creditCards = backupCreditCards;
        if (typeof window.people !== 'undefined') window.people = backupPeople;

        console.log('✅ Veri geri yükleme tamamlandı!');
        console.log(`📊 Özet: ${backupExpenses.length} harcama, ${backupRegularPayments.length} düzenli ödeme, ${backupCreditCards.length} kart, ${backupPeople.length} kişi`);
        
        alert(`✅ TÜM VERİLERİNİZ GERİ YÜKLENDİ!\n\n📊 Özet:\n• ${backupExpenses.length} harcama\n• ${backupRegularPayments.length} düzenli ödeme\n• ${backupCreditCards.length} kredi kartı\n• ${backupPeople.length} kişi\n\nSayfa yeniden yükleniyor...`);
        
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error) {
        console.error('❌ Veri geri yükleme hatası:', error);
        alert('❌ Veri geri yükleme sırasında hata oluştu. Konsolu kontrol edin.');
    }
})();
