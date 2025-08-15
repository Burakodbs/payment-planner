// Statistics page specific JavaScript code
// Chart.js objects
let monthlyTrendChart = null;
let cardDistributionChart = null;
let userDistributionChart = null;
let weeklyAverageChart = null;
// Initialize common components when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Initialize common components
    if (typeof initializePage === 'function') {
        initializePage('statistics');
    }
    // Load statistics
    loadStatistics();
});
// Main statistics loading function
function loadStatistics() {
    try {
        // Data validation
        if (!expenses || expenses.length === 0) {
            showEmptyDataMessage();
            return;
        }
        // Update statistics cards
        updateStatisticsCards();
        // Create charts
        createMonthlyTrendChart();
        createCardDistributionChart();
        createUserDistributionChart();
        createWeeklyAverageChart();
        // Update detailed statistics
        updateDetailedStatistics();
    } catch (error) {
        console.error('âŒ Statistics loading error:', error);
        showToast('Error loading statistics', 'error');
    }
}
// Update statistics cards
function updateStatisticsCards() {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = expenses.length;
    // Total expenses
    document.getElementById('totalExpenses').textContent = `${totalAmount.toLocaleString('tr-TR')} TL`;
    document.getElementById('totalExpensesCount').textContent = `${totalCount} expense${totalCount !== 1 ? 's' : ''}`;
    // Busiest month
    const monthlyData = getMonthlyData();
    const busiestMonth = Object.entries(monthlyData)
        .sort(([, a], [, b]) => b.total - a.total)[0];
    if (busiestMonth) {
        const [monthKey, data] = busiestMonth;
        const [year, month] = monthKey.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('busiestMonth').textContent =
            `${monthNames[parseInt(month) - 1]} ${year}`;
        document.getElementById('busiestMonthAmount').textContent =
            `${data.total.toLocaleString('tr-TR')} TL`;
    }
    // Most used card
    const cardStats = getCardStatistics();
    const mostUsedCard = Object.entries(cardStats)
        .sort(([, a], [, b]) => b.count - a.count)[0];
    if (mostUsedCard) {
        const [cardName, stats] = mostUsedCard;
        document.getElementById('mostUsedCard').textContent = cardName;
        document.getElementById('mostUsedCardCount').textContent = `${stats.count} expense${stats.count !== 1 ? 's' : ''}`;
    }
    // Top spender
    const userStats = getUserStatistics();
    const topSpender = Object.entries(userStats)
        .sort(([, a], [, b]) => b.total - a.total)[0];
    if (topSpender) {
        const [userName, stats] = topSpender;
        document.getElementById('topSpender').textContent = userName || 'Bilinmeyen';
        document.getElementById('topSpenderAmount').textContent =
            `${stats.total.toLocaleString('tr-TR')} TL`;
    } else {
        document.getElementById('topSpender').textContent = '-';
        document.getElementById('topSpenderAmount').textContent = '0 TL';
    }
}
// Monthly data analysis
function getMonthlyData() {
    const monthlyData = {};
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                total: 0,
                count: 0,
                expenses: []
            };
        }
        monthlyData[monthKey].total += expense.amount;
        monthlyData[monthKey].count += 1;
        monthlyData[monthKey].expenses.push(expense);
    });
    return monthlyData;
}
// Card statistics
function getCardStatistics() {
    const cardStats = {};
    expenses.forEach(expense => {
        if (!cardStats[expense.card]) {
            cardStats[expense.card] = {
                total: 0,
                count: 0,
                expenses: []
            };
        }
        cardStats[expense.card].total += expense.amount;
        cardStats[expense.card].count += 1;
        cardStats[expense.card].expenses.push(expense);
    });
    return cardStats;
}
// User statistics
function getUserStatistics() {
    const userStats = {};
    expenses.forEach(expense => {
        const person = expense.person || expense.user || 'Bilinmeyen'; // Support both fields
        if (!userStats[person]) {
            userStats[person] = {
                total: 0,
                count: 0,
                expenses: []
            };
        }
        userStats[person].total += expense.amount;
        userStats[person].count += 1;
        userStats[person].expenses.push(expense);
    });
    return userStats;
}
// Monthly trend chart
function createMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    const monthlyData = getMonthlyData();
    // Get last 12 months
    const sortedMonths = Object.keys(monthlyData)
        .sort()
        .slice(-12);
    const labels = sortedMonths.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
                label: 'Monthly Expenses (TL)',
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
// Card distribution chart
function createCardDistributionChart() {
    const ctx = document.getElementById('cardDistributionChart').getContext('2d');
    const cardStats = getCardStatistics();
    const labels = Object.keys(cardStats);
    const data = Object.values(cardStats).map(stat => stat.total);
    // BoÅŸ data kontrolÃ¼
    if (labels.length === 0 || data.every(value => value === 0)) {
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        ctx.fillText('HenÃ¼z kart bazlÄ± veri yok', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
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
// KullanÄ±cÄ± daÄŸÄ±lÄ±m grafiÄŸi
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
                label: 'Total Expenses (TL)',
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
// HaftalÄ±k ortalama grafiÄŸi
function createWeeklyAverageChart() {
    const ctx = document.getElementById('weeklyAverageChart').getContext('2d');
    // HaftanÄ±n gÃ¼nleri bazÄ±nda analiz
    const weeklyData = {
        'Pazartesi': [],
        'SalÄ±': [],
        'Ã‡arÅŸamba': [],
        'PerÅŸembe': [],
        'Cuma': [],
        'Cumartesi': [],
        'Pazar': []
    };
    const dayNames = ['Pazar', 'Pazartesi', 'SalÄ±', 'Ã‡arÅŸamba', 'PerÅŸembe', 'Cuma', 'Cumartesi'];
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const dayName = dayNames[date.getDay()];
        weeklyData[dayName].push(expense.amount);
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
                label: 'Average Expenses (TL)',
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
// DetaylÄ± statisticsi gÃ¼ncelle
function updateDetailedStatistics() {
    // Expense analysis
    const expenseAnalysis = document.getElementById('expenseAnalysis');
    const avgExpense = expenses.reduce((sum, h) => sum + h.amount, 0) / expenses.length;
    const maxExpense = Math.max(...expenses.map(h => h.amount));
    const minExpense = Math.min(...expenses.map(h => h.amount));
    expenseAnalysis.innerHTML = `
        <div style="margin-bottom: 8px;">
            <strong>Ortalama:</strong> ${avgExpense.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL
        </div>
        <div style="margin-bottom: 8px;">
            <strong>En YÃ¼ksek:</strong> ${maxExpense.toLocaleString('tr-TR')} TL
        </div>
        <div style="margin-bottom: 8px;">
            <strong>En DÃ¼ÅŸÃ¼k:</strong> ${minExpense.toLocaleString('tr-TR')} TL
        </div>
        <div>
            <strong>Toplam Ä°ÅŸlem:</strong> ${expenses.length} adet
        </div>
    `;
    // Rekor statisticsi
    const recordStats = document.getElementById('recordStats');
    const monthlyData = getMonthlyData();
    const sortedMonths = Object.entries(monthlyData)
        .sort(([, a], [, b]) => b.total - a.total);
    const bestMonth = sortedMonths[0];
    const worstMonth = sortedMonths[sortedMonths.length - 1];
    recordStats.innerHTML = `
        <div style="margin-bottom: 8px;">
            <strong>En YÃ¼ksek Ay:</strong><br>
            ${formatMonth(bestMonth[0])} - ${bestMonth[1].total.toLocaleString('tr-TR')} TL
        </div>
        <div style="margin-bottom: 8px;">
            <strong>En DÃ¼ÅŸÃ¼k Ay:</strong><br>
            ${formatMonth(worstMonth[0])} - ${worstMonth[1].total.toLocaleString('tr-TR')} TL
        </div>
        <div>
            <strong>Aktif Ay SayÄ±sÄ±:</strong> ${Object.keys(monthlyData).length}
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
        if (change > 10) trend = `ğŸ“ˆ ArtÄ±ÅŸ (+${change.toFixed(1)}%)`;
        else if (change < -10) trend = `ğŸ“‰ AzalÄ±ÅŸ (${change.toFixed(1)}%)`;
        else trend = `ğŸ“Š Stabil (${change.toFixed(1)}%)`;
    }
    const installmentCount = expenses.filter(h => h.isTaksit).length;
    const installmentPercentage = ((installmentCount / expenses.length) * 100).toFixed(1);
    trendStats.innerHTML = `
        <div style="margin-bottom: 8px;">
            <strong>Son Trend:</strong><br>
            ${trend}
        </div>
        <div style="margin-bottom: 8px;">
            <strong>Taksitli Ä°ÅŸlemler:</strong><br>
            ${installmentCount} adet (%${installmentPercentage})
        </div>
        <div>
            <strong>Ortalama Ä°ÅŸlem/GÃ¼n:</strong><br>
            ${(expenses.length / getDaysSinceFirstExpense()).toFixed(1)} adet
        </div>
    `;
}
// YardÄ±mcÄ± fonksiyonlar
function formatMonth(monthKey) {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Ocak', 'Åubat', 'Mart', 'Nisan', 'MayÄ±s', 'Haziran',
        'Temmuz', 'AÄŸustos', 'EylÃ¼l', 'Ekim', 'KasÄ±m', 'AralÄ±k'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}
function getDaysSinceFirstExpense() {
    if (expenses.length === 0) return 1;
    const firstDate = new Date(Math.min(...expenses.map(h => new Date(h.date))));
    const today = new Date();
    const diffTime = Math.abs(today - firstDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
}
function showEmptyDataMessage() {
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
        pageContent.innerHTML = `
            <h2>ğŸ“Š Ä°statistikler</h2>
            <div class="summary-card" style="text-align: center; padding: 48px 24px;">
                <h3>ğŸ“ˆ No Expense Data Yet</h3>
                <p>Ä°statistikleri gÃ¶rÃ¼ntÃ¼leyebilmek iÃ§in Ã¶nce expense eklemeniz gerekiyor.</p>
                <a href="add-expense.html" class="btn btn-primary" style="margin-top: 16px;">
                    â• Add Expense
                </a>
            </div>
        `;
    }
}
// KiÅŸiye Ã–zel Ä°statistikler
let personalTrendChart = null;
let personalCardChart = null;
let personalComparisonChart = null;
// Sayfa yÃ¼klendiÄŸinde kiÅŸi listesini doldur
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadPersonalStatsInit();
    }, 500);
});
function loadPersonalStatsInit() {
    const personFilter = document.getElementById('personFilter');
    if (!personFilter) return;
    if (!people || people.length === 0) return;
    // KiÅŸiler listesini doldur
    personFilter.innerHTML = '<option value="">TÃ¼m KiÅŸiler</option>';
    people.forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        personFilter.appendChild(option);
    });
    // Ä°lk yÃ¼klemede tÃ¼m kiÅŸiler iÃ§in statistic gÃ¶ster
    updatePersonalStats();
}
function updatePersonalStats() {
    const selectedPerson = document.getElementById('personFilter').value;
    // SeÃ§ili kiÅŸiye gÃ¶re expensesÄ± filtrele
    let filteredExpenses = expenses;
    if (selectedPerson) {
        // Hem person hem user alanÄ±nÄ± kontrol et
        filteredExpenses = expenses.filter(h => 
            h.person === selectedPerson || h.user === selectedPerson
        );
    }
    if (filteredExpenses.length === 0) {
        showNoPersonalDataMessage();
        return;
    }
    // KiÅŸisel statistic cardsÄ±nÄ± gÃ¼ncelle
    updatePersonalStatsCards(filteredExpenses, selectedPerson);
    // KiÅŸisel chartleri oluÅŸtur
    createPersonalCharts(filteredExpenses, selectedPerson);
}
function updatePersonalStatsCards(filteredExpenses, person) {
    const totalAmount = filteredExpenses.reduce((sum, h) => sum + h.amount, 0);
    const totalCount = filteredExpenses.length;
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    // Find highest expense
    let maxExpense = { amount: 0, date: '-' };
    if (filteredExpenses.length > 0) {
        maxExpense = filteredExpenses.reduce((max, h) => h.amount > max.amount ? h : max);
    }
    // Calculate this month's expenses
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthExpenses = filteredExpenses.filter(h => h.date.startsWith(currentMonth));
    const thisMonthAmount = thisMonthExpenses.reduce((sum, h) => sum + h.amount, 0);
    // Update cards
    document.getElementById('personalTotalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('personalTotalCount').textContent = `${totalCount} expense`;
    document.getElementById('personalAvgAmount').textContent = formatCurrency(avgAmount);
    document.getElementById('personalMaxAmount').textContent = formatCurrency(maxExpense.amount);
    document.getElementById('personalMaxDate').textContent = formatDate(maxExpense.date);
    document.getElementById('personalThisMonth').textContent = formatCurrency(thisMonthAmount);
    document.getElementById('personalThisMonthCount').textContent = `${thisMonthExpenses.length} expense`;
}
function createPersonalCharts(filteredExpenses, person) {
    // Grafikleri temizle
    if (personalTrendChart) personalTrendChart.destroy();
    if (personalCardChart) personalCardChart.destroy();
    if (personalComparisonChart) personalComparisonChart.destroy();
    // Personal trend chart
    createPersonalTrendChart(filteredExpenses);
    // Card usage chart
    createPersonalCardChart(filteredExpenses);
    // Comparison chart
    createPersonalComparisonChart(filteredExpenses, person);
}
function createPersonalTrendChart(filteredExpenses) {
    const ctx = document.getElementById('personalTrendChart');
    if (!ctx) return;
    // AylÄ±k dataleri hazÄ±rla
    const monthlyData = {};
    filteredExpenses.forEach(h => {
        const month = h.date.slice(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + h.amount;
    });
    const sortedMonths = Object.keys(monthlyData).sort();
    const amounts = sortedMonths.map(m => monthlyData[m]);
    personalTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths.map(m => formatMonth(m)),
            datasets: [{
                label: 'Monthly Expenses',
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
function createPersonalCardChart(filteredExpenses) {
    const ctx = document.getElementById('personalCardChart');
    if (!ctx) return;
    // Prepare card data
    const cardData = {};
    filteredExpenses.forEach(h => {
        const card = h.card || 'Unknown';
        cardData[card] = (cardData[card] || 0) + h.amount;
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
function createPersonalComparisonChart(filteredExpenses, selectedPerson) {
    const ctx = document.getElementById('personalComparisonChart');
    if (!ctx) return;
    // Son 6 ayÄ±n datalerini hazÄ±rla
    const months = [];
    const personalAmounts = [];
    const totalAmounts = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        months.push(formatMonth(monthKey));
        // KiÅŸisel expense
        const personalAmount = filteredExpenses
            .filter(h => h.date.startsWith(monthKey))
            .reduce((sum, h) => sum + h.amount, 0);
        personalAmounts.push(personalAmount);
        // Toplam expense
        const totalAmount = expenses
            .filter(h => h.date.startsWith(monthKey))
            .reduce((sum, h) => sum + h.amount, 0);
        totalAmounts.push(totalAmount);
    }
    personalComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: selectedPerson || 'SeÃ§ili',
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
                <h3>ğŸ“Š Bu kiÅŸi iÃ§in data bulunamadÄ±</h3>
                <p>SeÃ§ili kiÅŸi iÃ§in henÃ¼z expense datasi bulunmuyor.</p>
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
    const monthNames = ['Oca', 'Åub', 'Mar', 'Nis', 'May', 'Haz',
        'Tem', 'AÄŸu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}
function formatDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
}
