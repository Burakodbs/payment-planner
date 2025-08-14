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
// Yeni sistem: global regularPayments dizisini ve utils.js içindeki updateDuzenliOdemelerListesi fonksiyonunu kullan.
function loadDuzenliOdemeler() {
    if (typeof updateDuzenliOdemelerListesi === 'function') {
        updateDuzenliOdemelerListesi();
    } else {
        // Fallback – eski localStorage (geçici)
        const legacy = JSON.parse(localStorage.getItem('regularPayments') || '[]');
        const container = document.getElementById('duzenliOdemelerListesi');
        if (!container) return;
        if (legacy.length === 0) {
            container.innerHTML = '<p class="text-muted">Henüz düzenli ödeme tanımlanmamış.</p>';
            return;
        }
        container.innerHTML = legacy.map(o => `<div class="duzenli-item"><div class="duzenli-info"><h4>${o.description}</h4><p>${o.amount} TL - ${o.card} - ${o.person}</p><small>Başlangıç: ${(o.baslangicTarihi||o.baslangic||'').toString()}</small></div></div>`).join('');
    }
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
    if (typeof people !== 'undefined' && people) {
        people.forEach(kisi => {
            kullaniciSelect.innerHTML += `<option value="${kisi}">${kisi}</option>`;
        });
    }

    // Bugünün tarihi
    document.getElementById('regularStart').value = new Date().toISOString().split('T')[0];
}

// Düzenli ödeme ekle
function handleDuzenliOdemeSubmit(event) {
    event.preventDefault();
    // utils.js içindeki addDuzenliOdeme kullanılacak
    if (typeof addDuzenliOdeme === 'function') {
        addDuzenliOdeme();
    } else {
        showToast('Sistem yüklenmedi (addDuzenliOdeme yok)', 'error');
    }
}

// Düzenli ödeme sil
function removeDuzenliOdeme(index) {
    // Yeni sistemde index yerine id üzerinden silme tercih ediliyor.
    if (!Array.isArray(window.regularPayments)) return;
    const target = window.regularPayments[index];
    if (!target) return;
    if (typeof deleteDuzenliOdeme === 'function') {
        deleteDuzenliOdeme(target.id);
    }
}

// Kısayol bilgisini güncelle - hem kişiler hem kartlar için
function updateKisayolBilgi() {
    const kisayolElement = document.getElementById('kisayolBilgi');
    if (!kisayolElement) {
        return;
    }

    let kisayolText = 'Kısayollar: ';

    // Kullanıcı kısayolları
    if (people && people.length > 0) {
        const kullaniciKisayollari = people.slice(0, 5).map((kisi, index) => `Ctrl+${index + 1}=${kisi}`).join(', ');
        kisayolText += `Kullanıcılar: ${kullaniciKisayollari}`;
    }

    // Kart kısayolları (Shift + 1-9)
    if (creditCards && creditCards.length > 0) {
        const kartKisayollari = creditCards.slice(0, 9).map((kart, index) => `Shift+${index + 1}=${kart}`).join(', ');
        kisayolText += (people && people.length > 0) ? ` | Kartlar: ${kartKisayollari}` : `Kartlar: ${kartKisayollari}`;
    }

    kisayolElement.textContent = kisayolText;
}

// Sticky form values
let stickyCardValue = '';
let stickyDateValue = '';

// Keyboard shortcuts handler
function handleKeyboardShortcuts(event) {
    // Input alanlarında kısayolları devre dışı bırak
    const activeElement = document.activeElement;
    const isInputField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT'
    );

    // Kullanıcı kısayolları (Ctrl + 1-5)
    if (event.ctrlKey && event.key >= '1' && event.key <= '5' && !event.shiftKey && !event.altKey) {
        const userIndex = parseInt(event.key) - 1;
        if (people && people[userIndex]) {
            const kullaniciSelect = document.getElementById('kullanici');
            if (kullaniciSelect) {
                kullaniciSelect.value = people[userIndex];
                event.preventDefault();
            }
        }
    }

    // Kart kısayolları (Shift + 1-9) - sadece input alanında değilken
    if (event.shiftKey && event.code >= 'Digit1' && event.code <= 'Digit9' && !event.ctrlKey && !event.altKey && !isInputField) {
        const cardIndex = parseInt(event.code.replace('Digit', '')) - 1;
        if (creditCards && creditCards[cardIndex]) {
            const kartSelect = document.getElementById('kart');
            if (kartSelect) {
                kartSelect.value = creditCards[cardIndex];
                stickyCardValue = creditCards[cardIndex];
                event.preventDefault();
            }
        }
    }

    // Enter tuşu ile form gönderme (sadece form elementlerinde)
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName !== 'BUTTON' && activeElement.type !== 'submit') {
            const form = document.getElementById('harcamaForm');
            if (form && form.contains(activeElement)) {
                event.preventDefault();
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        }
    }
}

// Sticky values uygulama
function applyStickyValues() {
    // Kart değeri sticky ise uygula
    if (stickyCardValue) {
        const kartSelect = document.getElementById('kart');
        if (kartSelect && !kartSelect.value) {
            kartSelect.value = stickyCardValue;
        }
    }

    // Tarih değeri sticky ise uygula
    if (stickyDateValue) {
        const tarihInput = document.getElementById('expenseDate');
        if (tarihInput && !tarihInput.value) {
            tarihInput.value = stickyDateValue;
        }
    }
}

// Form reset sonrası sticky values korunması
function preserveStickyValues() {
    const kartSelect = document.getElementById('kart');
    const tarihInput = document.getElementById('expenseDate');

    // Mevcut değerleri sticky olarak kaydet
    if (kartSelect && kartSelect.value) {
        stickyCardValue = kartSelect.value;
    }
    if (tarihInput && tarihInput.value) {
        stickyDateValue = tarihInput.value;
    }
}

// Auth sistem yüklendikten sonra kısayol bilgisini güncelle
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('harcama-ekle');
    }

    // Keyboard shortcuts listener ekle
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Form change listeners ekle
    setTimeout(() => {
        const kartSelect = document.getElementById('kart');
        const tarihInput = document.getElementById('expenseDate');

        if (kartSelect) {
            kartSelect.addEventListener('change', function () {
                if (this.value) {
                    stickyCardValue = this.value;
                }
            });
        }

        if (tarihInput) {
            tarihInput.addEventListener('change', function () {
                if (this.value) {
                    stickyDateValue = this.value;
                }
            });
        }

        // İlk sticky values uygulaması
        applyStickyValues();
    }, 200);

    // Kısa bir gecikme ile kısayol bilgisini güncelle
    setTimeout(updateKisayolBilgi, 500);

    // Auth sistem data yükledikten sonra da güncelle
    if (typeof authSystem !== 'undefined') {
        const originalTrigger = authSystem.triggerPageUpdates;
        authSystem.triggerPageUpdates = function () {
            originalTrigger.call(this);
            setTimeout(updateKisayolBilgi, 100);
        };
    }
});