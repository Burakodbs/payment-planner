// Statistics page specific JavaScript code
// Chart.js objects
let monthlyTrendChart = null;
let cardDistributionChart = null;
let userDistributionChart = null;
let personalTrendChart = null;
let personalCardChart = null;

// Chart period state
let currentPeriod = '12months';

// Initialize common components when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Initialize common components
    if (typeof initializePage === 'function') {
        initializePage('statistics');
    }
    // Load statistics
    loadStatistics();
    // Initialize personal stats
    initializePersonalStats();
});

// Main statistics loading function
function loadStatistics() {
    try {
        // Data validation
        if (!expenses || expenses.length === 0) {
            showEmptyDataMessage();
            return;
        }
        
        // Update overview cards
        updateOverviewCards();
        
        // Create main charts
        createMonthlyTrendChart();
        createCardDistributionChart();
        createUserDistributionChart();
        
        // Update detailed statistics
        updateDetailedStatistics();
        
    } catch (error) {
        console.error('❌ Statistics loading error:', error);
        showToast('İstatistikler yüklenirken hata oluştu', 'error');
    }
}

// Update overview cards
function updateOverviewCards() {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = expenses.length;
    
    // Total expenses
    document.getElementById('totalExpenses').textContent = `${formatCurrency(totalAmount)}`;
    document.getElementById('totalExpensesCount').textContent = `${totalCount} harcama`;
    
    // Monthly average (last 6 months)
    const monthlyAvg = calculateMonthlyAverage();
    document.getElementById('monthlyAverage').textContent = `${formatCurrency(monthlyAvg)}`;
    
    // Most used card
    const cardStats = getCardStatistics();
    const mostUsedCard = Object.entries(cardStats)
        .sort(([, a], [, b]) => b.count - a.count)[0];
    if (mostUsedCard) {
        const [cardName, stats] = mostUsedCard;
        document.getElementById('mostUsedCard').textContent = cardName;
        document.getElementById('mostUsedCardCount').textContent = `${stats.count} kullanım`;
    } else {
        document.getElementById('mostUsedCard').textContent = '-';
        document.getElementById('mostUsedCardCount').textContent = '0 kullanım';
    }
    
    // Top spender
    const userStats = getUserStatistics();
    const topSpender = Object.entries(userStats)
        .sort(([, a], [, b]) => b.total - a.total)[0];
    if (topSpender) {
        const [userName, stats] = topSpender;
        document.getElementById('topSpender').textContent = userName || 'Bilinmeyen';
        document.getElementById('topSpenderAmount').textContent = `${formatCurrency(stats.total)}`;
    } else {
        document.getElementById('topSpender').textContent = '-';
        document.getElementById('topSpenderAmount').textContent = '0 TL';
    }
}

// Calculate monthly average for last 6 months
function calculateMonthlyAverage() {
    const now = new Date();
    const last6Months = [];
    
    for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        last6Months.push(monthKey);
    }
    
    const monthlyData = getMonthlyData();
    const monthlyTotals = last6Months.map(month => monthlyData[month]?.total || 0);
    const total = monthlyTotals.reduce((sum, amount) => sum + amount, 0);
    
    return total / 6;
}

// Change chart period
function changeChartPeriod(period) {
    currentPeriod = period;
    
    // Update button states
    document.querySelectorAll('.chart-controls .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
    });
    event.target.classList.remove('btn-outline');
    event.target.classList.add('btn-primary');
    
    // Recreate monthly trend chart with new period
    createMonthlyTrendChart();
}

// Initialize personal stats
function initializePersonalStats() {
    // Populate person filter
    const personFilter = document.getElementById('personFilter');
    const users = [...new Set(expenses.map(e => e.person).filter(p => p))];
    
    personFilter.innerHTML = '<option value="">Tüm Kullanıcılar</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        personFilter.appendChild(option);
    });
    
    // Update personal stats for all users initially
    updatePersonalStats();
}

// Update personal statistics
function updatePersonalStats() {
    const selectedPerson = document.getElementById('personFilter').value;
    let filteredExpenses = expenses;
    
    if (selectedPerson) {
        filteredExpenses = expenses.filter(e => e.person === selectedPerson);
    }
    
    if (filteredExpenses.length === 0) {
        showEmptyPersonalStats();
        return;
    }
    
    // Update personal summary cards
    updatePersonalSummaryCards(filteredExpenses);
    
    // Update personal charts
    createPersonalTrendChart(filteredExpenses);
    createPersonalCardChart(filteredExpenses);
}

// Update personal summary cards
function updatePersonalSummaryCards(filteredExpenses) {
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = filteredExpenses.length;
    const avgAmount = totalAmount / totalCount;
    const maxExpense = Math.max(...filteredExpenses.map(e => e.amount));
    const maxExpenseItem = filteredExpenses.find(e => e.amount === maxExpense);
    
    // This month's expenses
    const now = new Date();
    const thisMonthExpenses = filteredExpenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
    });
    const thisMonthAmount = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Update DOM
    document.getElementById('personalTotalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('personalTotalCount').textContent = `${totalCount} harcama`;
    document.getElementById('personalAvgAmount').textContent = formatCurrency(avgAmount);
    document.getElementById('personalMaxAmount').textContent = formatCurrency(maxExpense);
    document.getElementById('personalMaxDate').textContent = maxExpenseItem ? 
        formatDate(new Date(maxExpenseItem.date)) : '-';
    document.getElementById('personalThisMonth').textContent = formatCurrency(thisMonthAmount);
    document.getElementById('personalThisMonthCount').textContent = `${thisMonthExpenses.length} harcama`;
}

// Show empty personal stats
function showEmptyPersonalStats() {
    document.getElementById('personalTotalAmount').textContent = '0 TL';
    document.getElementById('personalTotalCount').textContent = '0 harcama';
    document.getElementById('personalAvgAmount').textContent = '0 TL';
    document.getElementById('personalMaxAmount').textContent = '0 TL';
    document.getElementById('personalMaxDate').textContent = '-';
    document.getElementById('personalThisMonth').textContent = '0 TL';
    document.getElementById('personalThisMonthCount').textContent = '0 harcama';
    
    // Clear personal charts
    if (personalTrendChart) {
        personalTrendChart.destroy();
        personalTrendChart = null;
    }
    if (personalCardChart) {
        personalCardChart.destroy();
        personalCardChart = null;
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

// Card statistics analysis
function getCardStatistics() {
    const cardStats = {};
    expenses.forEach(expense => {
        const cardName = expense.card || 'Bilinmeyen Kart';
        if (!cardStats[cardName]) {
            cardStats[cardName] = {
                total: 0,
                count: 0
            };
        }
        cardStats[cardName].total += expense.amount;
        cardStats[cardName].count += 1;
    });
    return cardStats;
}

// User statistics analysis
function getUserStatistics() {
    const userStats = {};
    expenses.forEach(expense => {
        const userName = expense.person || 'Bilinmeyen';
        if (!userStats[userName]) {
            userStats[userName] = {
                total: 0,
                count: 0
            };
        }
        userStats[userName].total += expense.amount;
        userStats[userName].count += 1;
    });
    return userStats;
}

// Create monthly trend chart
function createMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (monthlyTrendChart) {
        monthlyTrendChart.destroy();
    }
    
    const monthlyData = getMonthlyData();
    const months = currentPeriod === '6months' ? 6 : 12;
    const now = new Date();
    const labels = [];
    const data = [];
    
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
        
        labels.push(monthName);
        data.push(monthlyData[monthKey]?.total || 0);
    }
    
    monthlyTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Aylık Harcama',
                data: data,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Harcama: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: '#f3f4f6'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create card distribution chart
function createCardDistributionChart() {
    const ctx = document.getElementById('cardDistributionChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (cardDistributionChart) {
        cardDistributionChart.destroy();
    }
    
    const cardStats = getCardStatistics();
    const labels = Object.keys(cardStats);
    const data = Object.values(cardStats).map(stat => stat.total);
    const colors = generateChartColors(labels.length);
    
    cardDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((sum, val) => sum + val, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create user distribution chart
function createUserDistributionChart() {
    const ctx = document.getElementById('userDistributionChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (userDistributionChart) {
        userDistributionChart.destroy();
    }
    
    const userStats = getUserStatistics();
    const labels = Object.keys(userStats);
    const data = Object.values(userStats).map(stat => stat.total);
    const colors = generateChartColors(labels.length);
    
    userDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((sum, val) => sum + val, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create personal trend chart
function createPersonalTrendChart(filteredExpenses) {
    const ctx = document.getElementById('personalTrendChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (personalTrendChart) {
        personalTrendChart.destroy();
    }
    
    // Group by month
    const monthlyData = {};
    filteredExpenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += expense.amount;
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
    });
    const data = sortedMonths.map(month => monthlyData[month]);
    
    personalTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Aylık Harcama',
                data: data,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: '#4f46e5',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Harcama: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: '#f3f4f6'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create personal card chart
function createPersonalCardChart(filteredExpenses) {
    const ctx = document.getElementById('personalCardChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (personalCardChart) {
        personalCardChart.destroy();
    }
    
    // Group by card
    const cardData = {};
    filteredExpenses.forEach(expense => {
        const cardName = expense.card || 'Bilinmeyen Kart';
        if (!cardData[cardName]) {
            cardData[cardName] = 0;
        }
        cardData[cardName] += expense.amount;
    });
    
    const labels = Object.keys(cardData);
    const data = Object.values(cardData);
    const colors = generateChartColors(labels.length);
    
    personalCardChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((sum, val) => sum + val, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Generate chart colors
function generateChartColors(count) {
    const colors = [
        '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// Update detailed statistics
function updateDetailedStatistics() {
    updateExpenseAnalysis();
    updateRecordStats();
    updateTrendStats();
}

// Update expense analysis
function updateExpenseAnalysis() {
    const container = document.getElementById('expenseAnalysis');
    if (!container) return;
    
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgExpense = totalAmount / expenses.length;
    const dailyAvg = totalAmount / ((Date.now() - new Date(Math.min(...expenses.map(e => new Date(e.date))))) / (1000 * 60 * 60 * 24));
    
    container.innerHTML = `
        <div style="margin-bottom: 12px;">
            <strong>📊 Ortalama Harcama:</strong> ${formatCurrency(avgExpense)}
        </div>
        <div style="margin-bottom: 12px;">
            <strong>📅 Günlük Ortalama:</strong> ${formatCurrency(dailyAvg)}
        </div>
        <div style="margin-bottom: 12px;">
            <strong>📈 Toplam Harcama:</strong> ${formatCurrency(totalAmount)}
        </div>
        <div>
            <strong>🎯 Toplam İşlem:</strong> ${expenses.length} harcama
        </div>
    `;
}

// Update record stats
function updateRecordStats() {
    const container = document.getElementById('recordStats');
    if (!container) return;
    
    const amounts = expenses.map(e => e.amount);
    const maxAmount = Math.max(...amounts);
    const minAmount = Math.min(...amounts);
    const maxExpense = expenses.find(e => e.amount === maxAmount);
    const minExpense = expenses.find(e => e.amount === minAmount);
    
    const monthlyData = getMonthlyData();
    const monthlyTotals = Object.values(monthlyData).map(m => m.total);
    const maxMonthTotal = Math.max(...monthlyTotals);
    const maxMonth = Object.entries(monthlyData).find(([, data]) => data.total === maxMonthTotal);
    
    container.innerHTML = `
        <div style="margin-bottom: 12px;">
            <strong>🥇 En Yüksek Harcama:</strong> ${formatCurrency(maxAmount)}
            <br><small style="color: var(--text-secondary);">${maxExpense ? formatDate(new Date(maxExpense.date)) : ''}</small>
        </div>
        <div style="margin-bottom: 12px;">
            <strong>🥉 En Düşük Harcama:</strong> ${formatCurrency(minAmount)}
            <br><small style="color: var(--text-secondary);">${minExpense ? formatDate(new Date(minExpense.date)) : ''}</small>
        </div>
        <div>
            <strong>📅 En Yoğun Ay:</strong> ${formatCurrency(maxMonthTotal)}
            <br><small style="color: var(--text-secondary);">${maxMonth ? formatMonthYear(maxMonth[0]) : ''}</small>
        </div>
    `;
}

// Update trend stats
function updateTrendStats() {
    const container = document.getElementById('trendStats');
    if (!container) return;
    
    const monthlyData = getMonthlyData();
    const months = Object.keys(monthlyData).sort();
    
    if (months.length < 2) {
        container.innerHTML = '<div style="color: var(--text-secondary);">Trend analizi için en az 2 aylık veri gerekli</div>';
        return;
    }
    
    const lastMonth = monthlyData[months[months.length - 1]];
    const prevMonth = monthlyData[months[months.length - 2]];
    const change = lastMonth.total - prevMonth.total;
    const changePercent = ((change / prevMonth.total) * 100).toFixed(1);
    
    const trend = change > 0 ? '📈 Artış' : change < 0 ? '📉 Azalış' : '➡️ Sabit';
    const trendColor = change > 0 ? '#ef4444' : change < 0 ? '#10b981' : '#6b7280';
    
    container.innerHTML = `
        <div style="margin-bottom: 12px;">
            <strong>📊 Son Ay Trendi:</strong> <span style="color: ${trendColor};">${trend}</span>
        </div>
        <div style="margin-bottom: 12px;">
            <strong>💰 Değişim:</strong> ${formatCurrency(Math.abs(change))}
        </div>
        <div>
            <strong>📈 Değişim Oranı:</strong> <span style="color: ${trendColor};">%${Math.abs(changePercent)}</span>
        </div>
    `;
}

// Helper functions
function formatCurrency(amount) {
    return `${amount.toLocaleString('tr-TR')} TL`;
}

function formatDate(date) {
    return date.toLocaleDateString('tr-TR');
}

function formatMonthYear(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
}

// Show empty data message
function showEmptyDataMessage() {
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
        pageContent.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">📊</div>
                <h3 style="margin-bottom: 12px; color: var(--text-color);">Henüz İstatistik Yok</h3>
                <p>İstatistikleri görüntülemek için önce bazı harcamalar eklemelisiniz.</p>
                <a href="add-expense.html" class="btn btn-primary" style="margin-top: 20px;">
                    ➕ İlk Harcamanızı Ekleyin
                </a>
            </div>
        `;
    }
}
