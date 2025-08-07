// İstatistikler sayfasına özel JavaScript kodları

// Sayfa yüklendiğinde ortak component'leri initialize et
document.addEventListener('DOMContentLoaded', function() {
    // Ortak component'leri initialize et
    if (typeof initializePage === 'function') {
        initializePage('istatistikler');
    }
});

// Chart.js instances
let cardChart, userChart, monthlyChart, weeklyChart, installmentChart;

// İstatistikleri güncelle
function updateStatistics() {
    if (!harcamalar || harcamalar.length === 0) {
        // // console.log('Harcama verisi bulunamadı');
        return;
    }

    updateOverviewStats();
    updateCharts();
    updateDetailedTables();
}

// Özet istatistikleri güncelle
function updateOverviewStats() {
    const totalExpenses = harcamalar.length;
    const totalAmount = harcamalar.reduce((sum, h) => sum + (parseFloat(h.tutar) || 0), 0);
    const avgExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
    
    // Bu ayın harcamaları
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const thisMonthExpenses = harcamalar.filter(h => h.tarih.startsWith(currentMonth));
    const thisMonthAmount = thisMonthExpenses.reduce((sum, h) => sum + (parseFloat(h.tutar) || 0), 0);

    document.getElementById('totalExpenses').textContent = totalExpenses.toLocaleString();
    document.getElementById('totalAmount').textContent = totalAmount.toLocaleString() + ' ₺';
    document.getElementById('avgExpense').textContent = avgExpense.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' ₺';
    document.getElementById('thisMonthAmount').textContent = thisMonthAmount.toLocaleString() + ' ₺';
}

// Grafikleri güncelle
function updateCharts() {
    updateCardDistributionChart();
    updateUserDistributionChart();
    updateMonthlyTrendChart();
    updateWeeklyDistributionChart();
    updateInstallmentChart();
}

// Kart dağılım grafiği
function updateCardDistributionChart() {
    const ctx = document.getElementById('cardDistributionChart').getContext('2d');
    
    // Kart bazında toplam tutarlar
    const cardTotals = {};
    harcamalar.forEach(h => {
        if (!cardTotals[h.kart]) cardTotals[h.kart] = 0;
        cardTotals[h.kart] += parseFloat(h.tutar) || 0;
    });

    const labels = Object.keys(cardTotals);
    const data = Object.values(cardTotals);
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];

    if (cardChart) cardChart.destroy();
    
    cardChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
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
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw.toLocaleString()} ₺ (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Kullanıcı dağılım grafiği
function updateUserDistributionChart() {
    const ctx = document.getElementById('userDistributionChart').getContext('2d');
    
    // Kullanıcı bazında toplam tutarlar
    const userTotals = {};
    harcamalar.forEach(h => {
        if (!userTotals[h.kullanici]) userTotals[h.kullanici] = 0;
        userTotals[h.kullanici] += parseFloat(h.tutar) || 0;
    });

    const labels = Object.keys(userTotals);
    const data = Object.values(userTotals);
    const colors = [
        '#4BC0C0', '#36A2EB', '#FF6384', '#FFCE56', 
        '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0'
    ];

    if (userChart) userChart.destroy();
    
    userChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
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
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw.toLocaleString()} ₺ (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Aylık trend grafiği
function updateMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    
    // Son 12 ay için veri hazırla
    const monthlyData = {};
    const now = new Date();
    
    // Son 12 ayı oluştur
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        const monthLabel = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
        monthlyData[monthKey] = { label: monthLabel, total: 0, count: 0 };
    }

    // Harcamaları aylara dağıt
    harcamalar.forEach(h => {
        const monthKey = h.tarih.substring(0, 7); // YYYY-MM
        if (monthlyData[monthKey]) {
            monthlyData[monthKey].total += parseFloat(h.tutar) || 0;
            monthlyData[monthKey].count += 1;
        }
    });

    const labels = Object.values(monthlyData).map(m => m.label);
    const amounts = Object.values(monthlyData).map(m => m.total);
    const counts = Object.values(monthlyData).map(m => m.count);

    if (monthlyChart) monthlyChart.destroy();
    
    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Toplam Tutar (₺)',
                data: amounts,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Harcama Sayısı',
                data: counts,
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Ay'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Tutar (₺)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Adet'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Haftalık dağılım grafiği
function updateWeeklyDistributionChart() {
    const ctx = document.getElementById('weeklyDistributionChart').getContext('2d');
    
    const weeklyData = {
        'Pazartesi': 0, 'Salı': 0, 'Çarşamba': 0, 'Perşembe': 0,
        'Cuma': 0, 'Cumartesi': 0, 'Pazar': 0
    };

    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    harcamalar.forEach(h => {
        const date = new Date(h.tarih);
        const dayName = dayNames[date.getDay()];
        weeklyData[dayName] += parseFloat(h.tutar) || 0;
    });

    const labels = Object.keys(weeklyData);
    const data = Object.values(weeklyData);

    if (weeklyChart) weeklyChart.destroy();
    
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Toplam Harcama (₺)',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
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
                    title: {
                        display: true,
                        text: 'Tutar (₺)'
                    }
                }
            }
        }
    });
}

// Taksit durumu grafiği
function updateInstallmentChart() {
    const ctx = document.getElementById('installmentChart').getContext('2d');
    
    let tekCekim = 0;
    let taksitli = 0;
    
    harcamalar.forEach(h => {
        const amount = parseFloat(h.tutar) || 0;
        if (h.isTaksit || h.toplamTaksit > 1) {
            taksitli += amount;
        } else {
            tekCekim += amount;
        }
    });

    const data = [tekCekim, taksitli];
    const labels = ['Tek Çekim', 'Taksitli'];

    if (installmentChart) installmentChart.destroy();
    
    installmentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#4BC0C0', '#FF6384'],
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
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${context.raw.toLocaleString()} ₺ (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Detaylı tabloları güncelle
function updateDetailedTables() {
    updateTopExpensesTable();
    updateMonthlySummaryTable();
}

// En yüksek harcamalar tablosu
function updateTopExpensesTable() {
    const tbody = document.querySelector('#topExpensesTable tbody');
    
    // Harcamaları tutara göre sırala (en yüksek ilk)
    const sortedExpenses = [...harcamalar]
        .sort((a, b) => (parseFloat(b.tutar) || 0) - (parseFloat(a.tutar) || 0))
        .slice(0, 10); // İlk 10 tanesi

    tbody.innerHTML = '';
    
    sortedExpenses.forEach(expense => {
        const row = tbody.insertRow();
        const date = new Date(expense.tarih);
        
        row.insertCell(0).textContent = date.toLocaleDateString('tr-TR');
        row.insertCell(1).textContent = expense.aciklama || '-';
        row.insertCell(2).textContent = (parseFloat(expense.tutar) || 0).toLocaleString() + ' ₺';
        row.insertCell(3).textContent = expense.kart;
        row.insertCell(4).textContent = expense.kullanici;
    });
}

// Aylık özet tablosu
function updateMonthlySummaryTable() {
    const tbody = document.querySelector('#monthlySummaryTable tbody');
    
    // Aylık verileri grupla
    const monthlyData = {};
    harcamalar.forEach(h => {
        const monthKey = h.tarih.substring(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, count: 0 };
        }
        monthlyData[monthKey].total += parseFloat(h.tutar) || 0;
        monthlyData[monthKey].count += 1;
    });

    tbody.innerHTML = '';
    
    // Ayları sırala (en son ay ilk)
    Object.keys(monthlyData)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 12) // Son 12 ay
        .forEach(monthKey => {
            const data = monthlyData[monthKey];
            const row = tbody.insertRow();
            
            // YYYY-MM formatını güzel tarihe çevir
            const [year, month] = monthKey.split('-');
            const date = new Date(year, month - 1);
            const monthName = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
            
            row.insertCell(0).textContent = monthName;
            row.insertCell(1).textContent = data.count.toLocaleString();
            row.insertCell(2).textContent = data.total.toLocaleString() + ' ₺';
            row.insertCell(3).textContent = (data.total / data.count).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' ₺';
        });
}