// Harcama Ekleme sayfasına özel JavaScript kodları

// console.log('Harcama ekleme sayfası yüklendi');

// Sayfa tab'larını yönet
function showPageTab(tabName) {
    // Tüm tab'ları gizle
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Tüm tab butonlarının active class'ını kaldır
    document.querySelectorAll('.page-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Seçilen tab'ı göster
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Seçilen tab butonunu aktif yap
    event.target.classList.add('active');
    
    // Tab'a özel işlemler
    if (tabName === 'duzenli') {
        loadDuzenliOdemeler();
        populateDuzenliOdemeForm();
    }
}

// Düzenli ödemeleri yükle
function loadDuzenliOdemeler() {
    const duzenliOdemeler = JSON.parse(localStorage.getItem('duzenliOdemeler') || '[]');
    const container = document.getElementById('duzenliOdemelerListesi');
    
    if (duzenliOdemeler.length === 0) {
        container.innerHTML = '<p class="text-muted">Henüz düzenli ödeme tanımlanmamış.</p>';
        return;
    }
    
    let html = '<div class="duzenli-list">';
    duzenliOdemeler.forEach((odeme, index) => {
        html += `
            <div class="duzenli-item">
                <div class="duzenli-info">
                    <h4>${odeme.aciklama}</h4>
                    <p>${odeme.tutar} TL - ${odeme.kart} - ${odeme.kullanici}</p>
                    <small>Başlangıç: ${new Date(odeme.baslangic).toLocaleDateString('tr-TR')}</small>
                </div>
                <button class="remove-btn" onclick="removeDuzenliOdeme(${index})">Sil</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Düzenli ödeme formunu doldur
function populateDuzenliOdemeForm() {
    // Kartları doldur
    const kartSelect = document.getElementById('duzenliKart');
    kartSelect.innerHTML = '<option value="">Kart Seçin</option>';
    if (typeof kartlar !== 'undefined' && kartlar) {
        kartlar.forEach(kart => {
            kartSelect.innerHTML += `<option value="${kart}">${kart}</option>`;
        });
    }
    
    // Kullanıcıları doldur
    const kullaniciSelect = document.getElementById('duzenliKullanici');
    kullaniciSelect.innerHTML = '<option value="">Kullanıcı Seçin</option>';
    if (typeof kisiler !== 'undefined' && kisiler) {
        kisiler.forEach(kisi => {
            kullaniciSelect.innerHTML += `<option value="${kisi}">${kisi}</option>`;
        });
    }
    
    // Bugünün tarihi
    document.getElementById('duzenliBaslangic').value = new Date().toISOString().split('T')[0];
}

// Düzenli ödeme ekle
function handleDuzenliOdemeSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const odeme = {
        aciklama: document.getElementById('duzenliAciklama').value,
        tutar: parseFloat(document.getElementById('duzenliTutar').value),
        kart: document.getElementById('duzenliKart').value,
        kullanici: document.getElementById('duzenliKullanici').value,
        baslangic: document.getElementById('duzenliBaslangic').value,
        kategori: 'Düzenli Ödeme',
        id: Date.now()
    };
    
    const duzenliOdemeler = JSON.parse(localStorage.getItem('duzenliOdemeler') || '[]');
    duzenliOdemeler.push(odeme);
    localStorage.setItem('duzenliOdemeler', JSON.stringify(duzenliOdemeler));
    
    // Formu temizle
    event.target.reset();
    document.getElementById('duzenliBaslangic').value = new Date().toISOString().split('T')[0];
    
    // Listeyi güncelle
    loadDuzenliOdemeler();
    
    // Toast mesajı
    if (typeof showToast === 'function') {
        showToast('Düzenli ödeme başarıyla eklendi!', 'success');
    }
}

// Düzenli ödeme sil
function removeDuzenliOdeme(index) {
    if (confirm('Bu düzenli ödemeyi silmek istediğinizden emin misiniz?')) {
        const duzenliOdemeler = JSON.parse(localStorage.getItem('duzenliOdemeler') || '[]');
        duzenliOdemeler.splice(index, 1);
        localStorage.setItem('duzenliOdemeler', JSON.stringify(duzenliOdemeler));
        loadDuzenliOdemeler();
        
        if (typeof showToast === 'function') {
            showToast('Düzenli ödeme silindi', 'info');
        }
    }
}

// Kısayol bilgisini güncelle
function updateKisayolBilgi() {
    const kisayolElement = document.getElementById('kisayolBilgi');
    if (!kisayolElement || !kisiler || kisiler.length === 0) {
        return;
    }

    const kisayollar = kisiler.map((kisi, index) => `${index + 1}=${kisi}`).join(', ');
    kisayolElement.textContent = `Kısayollar: ${kisayollar}`;
}

// Auth sistem yüklendikten sonra kısayol bilgisini güncelle
document.addEventListener('DOMContentLoaded', function() {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('harcama-ekle');
    }
    
    // Kısa bir gecikme ile kısayol bilgisini güncelle
    setTimeout(updateKisayolBilgi, 500);
    
    // Auth sistem data yükledikten sonra da güncelle
    if (typeof authSystem !== 'undefined') {
        const originalTrigger = authSystem.triggerPageUpdates;
        authSystem.triggerPageUpdates = function() {
            originalTrigger.call(this);
            setTimeout(updateKisayolBilgi, 100);
        };
    }
});