// İstatistikler sayfasına özel JavaScript kodları

// Chart.js nesneleri
let monthlyTrendChart = null;
let cardDistributionChart = null;
let userDistributionChart = null;
let weeklyAverageChart = null;

// Sayfa yüklendiğinde ortak component'leri initialize et
document.addEventListener('DOMContentLoaded', function () {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('istatistikler');
    }

    // İstatistikleri yükle
    loadStatistics();
});

// Ana istatistik yükleme fonksiyonu
function loadStatistics() {
    try {
        // Veri kontrolü
        if (!harcamalar || harcamalar.length === 0) {
            showEmptyDataMessage();
            return;
        }

        // İstatistik kartlarını güncelle
        updateStatisticsCards();

        // Grafikleri oluştur
        createMonthlyTrendChart();
        createCardDistributionChart();
        createUserDistributionChart();
        createWeeklyAverageChart();

        // Detaylı istatistikleri güncelle
        updateDetailedStatistics();

    } catch (error) {
        console.error('❌ İstatistik yükleme hatası:', error);
        showToast('İstatistikler yüklenirken hata oluştu', 'error');
    }
}

// İstatistik kartlarını güncelle
function updateStatisticsCards() {
    const totalAmount = harcamalar.reduce((sum, h) => sum + h.tutar, 0);
    const totalCount = harcamalar.length;

    // Toplam harcama
    document.getElementById('totalExpenses').textContent = `${totalAmount.toLocaleString('tr-TR')} TL`;
    document.getElementById('totalExpensesCount').textContent = `${totalCount} harcama`;

    // En yoğun ay
    const monthlyData = getMonthlyData();
    const busiestMonth = Object.entries(monthlyData)
        .sort(([, a], [, b]) => b.total - a.total)[0];

    if (busiestMonth) {
        const [monthKey, data] = busiestMonth;
        const [year, month] = monthKey.split('-');
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

        document.getElementById('busiestMonth').textContent =
            `${monthNames[parseInt(month) - 1]} ${year}`;
        document.getElementById('busiestMonthAmount').textContent =
            `${data.total.toLocaleString('tr-TR')} TL`;
    }

    // En çok kullanılan kart
    const cardStats = getCardStatistics();
    const mostUsedCard = Object.entries(cardStats)
        .sort(([, a], [, b]) => b.count - a.count)[0];

    if (mostUsedCard) {
        const [cardName, stats] = mostUsedCard;
        document.getElementById('mostUsedCard').textContent = cardName;
        document.getElementById('mostUsedCardCount').textContent = `${stats.count} harcama`;
    }

    // En çok harcayan
    const userStats = getUserStatistics();
    const topSpender = Object.entries(userStats)
        .sort(([, a], [, b]) => b.total - a.total)[0];

    if (topSpender) {
        const [userName, stats] = topSpender;
        document.getElementById('topSpender').textContent = userName;
        document.getElementById('topSpenderAmount').textContent =
            `${stats.total.toLocaleString('tr-TR')} TL`;
    }
}

// Aylık veri analizi
function getMonthlyData() {
    const monthlyData = {};

    harcamalar.forEach(harcama => {
        const date = new Date(harcama.tarih);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                total: 0,
                count: 0,
                expenses: []
            };
        }

        monthlyData[monthKey].total += harcama.tutar;
        monthlyData[monthKey].count += 1;
        monthlyData[monthKey].expenses.push(harcama);
    });

    return monthlyData;
}

// Kart istatistikleri
function getCardStatistics() {
    const cardStats = {};

    harcamalar.forEach(harcama => {
        if (!cardStats[harcama.kart]) {
            cardStats[harcama.kart] = {
                total: 0,
                count: 0,
                expenses: []
            };
        }

        cardStats[harcama.kart].total += harcama.tutar;
        cardStats[harcama.kart].count += 1;
        cardStats[harcama.kart].expenses.push(harcama);
    });

    return cardStats;
}

// Kullanıcı istatistikleri
function getUserStatistics() {
    const userStats = {};

    harcamalar.forEach(harcama => {
        if (!userStats[harcama.kullanici]) {
            userStats[harcama.kullanici] = {
                total: 0,
                count: 0,
                expenses: []
            };
        }

        userStats[harcama.kullanici].total += harcama.tutar;
        userStats[harcama.kullanici].count += 1;
        userStats[harcama.kullanici].expenses.push(harcama);
    });

    return userStats;
}

// Aylık trend grafiği
function createMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    const monthlyData = getMonthlyData();

    // Son 12 ayı al
    const sortedMonths = Object.keys(monthlyData)
        .sort()
        .slice(-12);

    const labels = sortedMonths.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
            'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        return `${monthNames[parseInt(month) - 1]} ${year.slice(-2)}`;
    });

    const data = sortedMonths.map(monthKey => monthlyData[monthKey].total);

    if (monthlyTrendChart) {
        monthlyTrendChart.destroy();
    }

    monthlyTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Aylık Harcama (TL)',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            }
        }
    });
}

// Kart dağılım grafiği
function createCardDistributionChart() {
    const ctx = document.getElementById('cardDistributionChart').getContext('2d');
    const cardStats = getCardStatistics();

    const labels = Object.keys(cardStats);
    const data = Object.values(cardStats).map(stat => stat.total);
    const colors = [
        '#6366f1', '#8b5cf6', '#06d6a0', '#f72585',
        '#ffbe0b', '#fb8500', '#219ebc', '#023047'
    ];

    if (cardDistributionChart) {
        cardDistributionChart.destroy();
    }

    cardDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.parsed;
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value.toLocaleString('tr-TR')} TL (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Kullanıcı dağılım grafiği
function createUserDistributionChart() {
    const ctx = document.getElementById('userDistributionChart').getContext('2d');
    const userStats = getUserStatistics();

    const labels = Object.keys(userStats);
    const data = Object.values(userStats).map(stat => stat.total);
    const colors = [
        '#06d6a0', '#f72585', '#6366f1', '#ffbe0b',
        '#fb8500', '#8b5cf6', '#219ebc', '#023047'
    ];

    if (userDistributionChart) {
        userDistributionChart.destroy();
    }

    userDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Toplam Harcama (TL)',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            }
        }
    });
}

// Haftalık ortalama grafiği
function createWeeklyAverageChart() {
    const ctx = document.getElementById('weeklyAverageChart').getContext('2d');

    // Haftanın günleri bazında analiz
    const weeklyData = {
        'Pazartesi': [],
        'Salı': [],
        'Çarşamba': [],
        'Perşembe': [],
        'Cuma': [],
        'Cumartesi': [],
        'Pazar': []
    };

    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    harcamalar.forEach(harcama => {
        const date = new Date(harcama.tarih);
        const dayName = dayNames[date.getDay()];
        weeklyData[dayName].push(harcama.tutar);
    });

    const labels = Object.keys(weeklyData);
    const averages = labels.map(day => {
        const expenses = weeklyData[day];
        return expenses.length > 0 ? expenses.reduce((a, b) => a + b, 0) / expenses.length : 0;
    });

    if (weeklyAverageChart) {
        weeklyAverageChart.destroy();
    }

    weeklyAverageChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ortalama Harcama (TL)',
                data: averages,
                borderColor: '#f72585',
                backgroundColor: 'rgba(247, 37, 133, 0.2)',
                pointBackgroundColor: '#f72585',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            }
        }
    });
}

// Detaylı istatistikleri güncelle
function updateDetailedStatistics() {
    // Harcama analizi
    const expenseAnalysis = document.getElementById('expenseAnalysis');
    const avgExpense = harcamalar.reduce((sum, h) => sum + h.tutar, 0) / harcamalar.length;
    const maxExpense = Math.max(...harcamalar.map(h => h.tutar));
    const minExpense = Math.min(...harcamalar.map(h => h.tutar));

    expenseAnalysis.innerHTML = `
        <div style="margin-bottom: 8px;">
            <strong>Ortalama:</strong> ${avgExpense.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL
        </div>
        <div style="margin-bottom: 8px;">
            <strong>En Yüksek:</strong> ${maxExpense.toLocaleString('tr-TR')} TL
        </div>
        <div style="margin-bottom: 8px;">
            <strong>En Düşük:</strong> ${minExpense.toLocaleString('tr-TR')} TL
        </div>
        <div>
            <strong>Toplam İşlem:</strong> ${harcamalar.length} adet
        </div>
    `;

    // Rekor istatistikleri
    const recordStats = document.getElementById('recordStats');
    const monthlyData = getMonthlyData();
    const sortedMonths = Object.entries(monthlyData)
        .sort(([, a], [, b]) => b.total - a.total);

    const bestMonth = sortedMonths[0];
    const worstMonth = sortedMonths[sortedMonths.length - 1];

    recordStats.innerHTML = `
        <div style="margin-bottom: 8px;">
            <strong>En Yüksek Ay:</strong><br>
            ${formatMonth(bestMonth[0])} - ${bestMonth[1].total.toLocaleString('tr-TR')} TL
        </div>
        <div style="margin-bottom: 8px;">
            <strong>En Düşük Ay:</strong><br>
            ${formatMonth(worstMonth[0])} - ${worstMonth[1].total.toLocaleString('tr-TR')} TL
        </div>
        <div>
            <strong>Aktif Ay Sayısı:</strong> ${Object.keys(monthlyData).length}
        </div>
    `;

    // Trend analizi
    const trendStats = document.getElementById('trendStats');
    const recentMonths = Object.entries(monthlyData)
        .sort()
        .slice(-3);

    let trend = 'Stabil';
    if (recentMonths.length >= 2) {
        const current = recentMonths[recentMonths.length - 1][1].total;
        const previous = recentMonths[recentMonths.length - 2][1].total;
        const change = ((current - previous) / previous * 100);

        if (change > 10) trend = `📈 Artış (+${change.toFixed(1)}%)`;
        else if (change < -10) trend = `📉 Azalış (${change.toFixed(1)}%)`;
        else trend = `📊 Stabil (${change.toFixed(1)}%)`;
    }

    const installmentCount = harcamalar.filter(h => h.isTaksit).length;
    const installmentPercentage = ((installmentCount / harcamalar.length) * 100).toFixed(1);

    trendStats.innerHTML = `
        <div style="margin-bottom: 8px;">
            <strong>Son Trend:</strong><br>
            ${trend}
        </div>
        <div style="margin-bottom: 8px;">
            <strong>Taksitli İşlemler:</strong><br>
            ${installmentCount} adet (%${installmentPercentage})
        </div>
        <div>
            <strong>Ortalama İşlem/Gün:</strong><br>
            ${(harcamalar.length / getDaysSinceFirstExpense()).toFixed(1)} adet
        </div>
    `;
}

// Yardımcı fonksiyonlar
function formatMonth(monthKey) {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}

function getDaysSinceFirstExpense() {
    if (harcamalar.length === 0) return 1;

    const firstDate = new Date(Math.min(...harcamalar.map(h => new Date(h.tarih))));
    const today = new Date();
    const diffTime = Math.abs(today - firstDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 1;
}

function showEmptyDataMessage() {
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
        pageContent.innerHTML = `
            <h2>📊 İstatistikler</h2>
            <div class="summary-card" style="text-align: center; padding: 48px 24px;">
                <h3>📈 Henüz Harcama Verisi Yok</h3>
                <p>İstatistikleri görüntüleyebilmek için önce harcama eklemeniz gerekiyor.</p>
                <a href="harcama-ekle.html" class="btn btn-primary" style="margin-top: 16px;">
                    ➕ Harcama Ekle
                </a>
            </div>
        `;
    }
}

// Kişiye Özel İstatistikler
let personalTrendChart = null;
let personalCardChart = null;
let personalComparisonChart = null;

// Sayfa yüklendiğinde kişi listesini doldur
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadPersonalStatsInit();
    }, 500);
});

function loadPersonalStatsInit() {
    const personFilter = document.getElementById('personFilter');
    
    if (!personFilter) return;
    if (!kisiler || kisiler.length === 0) return;
    
    // Kişiler listesini doldur
    personFilter.innerHTML = '<option value="">Tüm Kişiler</option>';
    kisiler.forEach(kisi => {
        const option = document.createElement('option');
        option.value = kisi;
        option.textContent = kisi;
        personFilter.appendChild(option);
    });
    
    // İlk yüklemede tüm kişiler için istatistik göster
    updatePersonalStats();
}

function updatePersonalStats() {
    const selectedPerson = document.getElementById('personFilter').value;
    
    // Seçili kişiye göre harcamaları filtrele
    let filteredHarcamalar = harcamalar;
    if (selectedPerson) {
        // Hem kisi hem kullanici alanını kontrol et
        filteredHarcamalar = harcamalar.filter(h => 
            h.kisi === selectedPerson || h.kullanici === selectedPerson
        );
    }
    
    if (filteredHarcamalar.length === 0) {
        showNoPersonalDataMessage();
        return;
    }
    
    // Kişisel istatistik kartlarını güncelle
    updatePersonalStatsCards(filteredHarcamalar, selectedPerson);
    
    // Kişisel grafikleri oluştur
    createPersonalCharts(filteredHarcamalar, selectedPerson);
}

function updatePersonalStatsCards(filteredHarcamalar, person) {
    const totalAmount = filteredHarcamalar.reduce((sum, h) => sum + h.tutar, 0);
    const totalCount = filteredHarcamalar.length;
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    
    // En yüksek harcamayı bul
    let maxExpense = { tutar: 0, tarih: '-' };
    if (filteredHarcamalar.length > 0) {
        maxExpense = filteredHarcamalar.reduce((max, h) => h.tutar > max.tutar ? h : max);
    }
    
    // Bu ay harcamalarını hesapla
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthExpenses = filteredHarcamalar.filter(h => h.tarih.startsWith(currentMonth));
    const thisMonthAmount = thisMonthExpenses.reduce((sum, h) => sum + h.tutar, 0);
    
    // Kartları güncelle
    document.getElementById('personalTotalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('personalTotalCount').textContent = `${totalCount} harcama`;
    document.getElementById('personalAvgAmount').textContent = formatCurrency(avgAmount);
    document.getElementById('personalMaxAmount').textContent = formatCurrency(maxExpense.tutar);
    document.getElementById('personalMaxDate').textContent = formatDate(maxExpense.tarih);
    document.getElementById('personalThisMonth').textContent = formatCurrency(thisMonthAmount);
    document.getElementById('personalThisMonthCount').textContent = `${thisMonthExpenses.length} harcama`;
}

function createPersonalCharts(filteredHarcamalar, person) {
    // Grafikleri temizle
    if (personalTrendChart) personalTrendChart.destroy();
    if (personalCardChart) personalCardChart.destroy();
    if (personalComparisonChart) personalComparisonChart.destroy();
    
    // Kişisel trend grafiği
    createPersonalTrendChart(filteredHarcamalar);
    
    // Kart kullanım grafiği
    createPersonalCardChart(filteredHarcamalar);
    
    // Karşılaştırma grafiği
    createPersonalComparisonChart(filteredHarcamalar, person);
}

function createPersonalTrendChart(filteredHarcamalar) {
    const ctx = document.getElementById('personalTrendChart');
    if (!ctx) return;
    
    // Aylık verileri hazırla
    const monthlyData = {};
    filteredHarcamalar.forEach(h => {
        const month = h.tarih.slice(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + h.tutar;
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const amounts = sortedMonths.map(m => monthlyData[m]);
    
    personalTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths.map(m => formatMonth(m)),
            datasets: [{
                label: 'Aylık Harcama',
                data: amounts,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function createPersonalCardChart(filteredHarcamalar) {
    const ctx = document.getElementById('personalCardChart');
    if (!ctx) return;
    
    // Kart verilerini hazırla
    const cardData = {};
    filteredHarcamalar.forEach(h => {
        const card = h.kart || 'Bilinmeyen';
        cardData[card] = (cardData[card] || 0) + h.tutar;
    });
    
    const cards = Object.keys(cardData);
    const amounts = Object.values(cardData);
    const colors = generateColors(cards.length);
    
    personalCardChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: cards,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createPersonalComparisonChart(filteredHarcamalar, selectedPerson) {
    const ctx = document.getElementById('personalComparisonChart');
    if (!ctx) return;
    
    // Son 6 ayın verilerini hazırla
    const months = [];
    const personalAmounts = [];
    const totalAmounts = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        months.push(formatMonth(monthKey));
        
        // Kişisel harcama
        const personalAmount = filteredHarcamalar
            .filter(h => h.tarih.startsWith(monthKey))
            .reduce((sum, h) => sum + h.tutar, 0);
        personalAmounts.push(personalAmount);
        
        // Toplam harcama
        const totalAmount = harcamalar
            .filter(h => h.tarih.startsWith(monthKey))
            .reduce((sum, h) => sum + h.tutar, 0);
        totalAmounts.push(totalAmount);
    }
    
    personalComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: selectedPerson || 'Seçili',
                    data: personalAmounts,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: '#6366f1',
                    borderWidth: 1
                },
                {
                    label: 'Toplam',
                    data: totalAmounts,
                    backgroundColor: 'rgba(156, 163, 175, 0.7)',
                    borderColor: '#9ca3af',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function showNoPersonalDataMessage() {
    const container = document.getElementById('personalChartsContainer');
    if (container) {
        container.innerHTML = `
            <div class="summary-card" style="text-align: center; padding: 48px 24px;">
                <h3>📊 Bu kişi için veri bulunamadı</h3>
                <p>Seçili kişi için henüz harcama verisi bulunmuyor.</p>
            </div>
        `;
    }
}

function generateColors(count) {
    const colors = [
        '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444',
        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#64748b'
    ];
    
    while (colors.length < count) {
        colors.push(`hsl(${Math.random() * 360}, 70%, 60%)`);
    }
    
    return colors.slice(0, count);
}

function formatMonth(monthKey) {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
        'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}

function formatDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
}