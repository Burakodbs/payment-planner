// Chart Yönetimi
let chartInstances = {};

// Dashboard Charts
function updateDashboardCharts() {
    const chartInstances = window.chartInstances || {};

    // Canvas elementlerini kontrol et
    const trendCanvas = document.getElementById('dashboardTrendChart');
    const userCanvas = document.getElementById('dashboardUserChart');
    
    if (!trendCanvas || !userCanvas) {
        console.log('Dashboard chart canvas elements not found');
        return;
    }

    const currentDate = new Date();
    const months = [];
    const monthlyTotals = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const monthStr = `${year}-${month}`;
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
        
        const monthExpenses = harcamalar.filter(h => h.tarih && h.tarih.startsWith(monthStr));
        const monthTotal = monthExpenses.reduce((sum, h) => sum + (parseFloat(h.tutar) || 0), 0);
        
        months.push(monthName);
        monthlyTotals.push(monthTotal);
    }

    const trendCtx = trendCanvas.getContext('2d');
    if (chartInstances.dashboardTrend) {
        chartInstances.dashboardTrend.destroy();
    }
    chartInstances.dashboardTrend = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Aylık Harcama',
                data: monthlyTotals,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            }
        }
    });

    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthExpenses = harcamalar.filter(h => h.tarih && h.tarih.startsWith(currentMonth));
    
    const userTotals = {};
    thisMonthExpenses.forEach(h => {
        if (h.kullanici) {
            userTotals[h.kullanici] = (userTotals[h.kullanici] || 0) + (parseFloat(h.tutar) || 0);
        }
    });

    const userCtx = userCanvas.getContext('2d');
    if (chartInstances.dashboardUser) {
        chartInstances.dashboardUser.destroy();
    }
    chartInstances.dashboardUser = new Chart(userCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(userTotals),
            datasets: [{
                data: Object.values(userTotals),
                backgroundColor: [
                    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    window.chartInstances = chartInstances;
}

// Analytics Charts
function createMonthlyTrendChart(data) {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    
    if (chartInstances.monthlyTrend) {
        chartInstances.monthlyTrend.destroy();
    }

    const months = Object.keys(data.monthlyTrend).sort();
    const totals = months.map(month => data.monthlyTrend[month]);

    chartInstances.monthlyTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(month => {
                const [year, monthNum] = month.split('-');
                return new Date(year, monthNum - 1).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
                label: 'Aylık Harcama',
                data: totals,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            }
        }
    });
}

function createCardDistributionChart(data) {
    const ctx = document.getElementById('cardDistributionChart').getContext('2d');
    
    if (chartInstances.cardDistribution) {
        chartInstances.cardDistribution.destroy();
    }

    const cards = Object.keys(data.cardDistribution);
    const amounts = Object.values(data.cardDistribution);

    chartInstances.cardDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: cards,
            datasets: [{
                data: amounts,
                backgroundColor: [
                    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            }
        }
    });
}

function createUserDistributionChart(data) {
    const ctx = document.getElementById('userDistributionChart').getContext('2d');
    
    if (chartInstances.userDistribution) {
        chartInstances.userDistribution.destroy();
    }

    const users = Object.keys(data.userDistribution);
    const amounts = Object.values(data.userDistribution);

    chartInstances.userDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: users,
            datasets: [{
                label: 'Harcama Tutarı',
                data: amounts,
                backgroundColor: [
                    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
                ]
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
                            return value.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            }
        }
    });
}

function createWeeklyActivityChart(data) {
    const ctx = document.getElementById('weeklyActivityChart').getContext('2d');
    
    if (chartInstances.weeklyActivity) {
        chartInstances.weeklyActivity.destroy();
    }

    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const weeklyData = days.map(day => data.weeklyActivity[day] || 0);

    chartInstances.weeklyActivity = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: days,
            datasets: [{
                label: 'Haftalık Aktivite',
                data: weeklyData,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            }
        }
    });
}

function createComparisonChart(month1, month2, data1, data2) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    if (chartInstances.comparison) {
        chartInstances.comparison.destroy();
    }

    const allUsers = [...new Set([...Object.keys(data1), ...Object.keys(data2)])];
    
    chartInstances.comparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allUsers,
            datasets: [
                {
                    label: month1,
                    data: allUsers.map(user => data1[user] || 0),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)'
                },
                {
                    label: month2,
                    data: allUsers.map(user => data2[user] || 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString('tr-TR') + ' TL';
                        }
                    }
                }
            }
        }
    });
}