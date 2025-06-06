export function updateBarChart(chartId, chartInstance, data, label) {
    const ctx = document.getElementById(chartId).getContext('2d');
    const labels = Object.keys(data);
    const values = Object.values(data);

    const chartData = {
        labels: labels,
        datasets: [{
            label: label,
            data: values,
            backgroundColor: [
                'rgba(99, 102, 241, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(79, 70, 229, 0.7)',
                'rgba(67, 56, 202, 0.7)',
                'rgba(55, 48, 163, 0.7)'
            ],
            borderColor: [
                'rgba(99, 102, 241, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(79, 70, 229, 1)',
                'rgba(67, 56, 202, 1)',
                'rgba(55, 48, 163, 1)'
            ],
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return formatCurrency(context.raw);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return formatCurrency(value).replace('R$', '');
                    }
                }
            }
        }
    };

    if (chartInstance) {
        chartInstance.data = chartData;
        chartInstance.options = options;
        chartInstance.update();
        return chartInstance;
    } else {
        return new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: options
        });
    }
}

export function updateLineChart(canvasId, chartInstance, labels, datasets, title) {
    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById(canvasId).getContext('2d');

    // Cores padrão (mesmo estilo do updateBarChart)
    const backgroundColors = [
        'rgba(99, 102, 241, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(79, 70, 229, 0.7)',
        'rgba(67, 56, 202, 0.7)',
        'rgba(55, 48, 163, 0.7)'
    ];

    const borderColors = [
        'rgba(99, 102, 241, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(79, 70, 229, 1)',
        'rgba(67, 56, 202, 1)',
        'rgba(55, 48, 163, 1)'
    ];

    // Aplicar cores nos datasets
    const coloredDatasets = datasets.map((dataset, index) => {
        return {
            ...dataset,
            backgroundColor: backgroundColors[index % backgroundColors.length],
            borderColor: borderColors[index % borderColors.length],
            tension: 0.3,
            fill: false 
        };
    });

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: coloredDatasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom'
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'R$ Total de Vendas' }
                },
                x: {
                    title: { display: true, text: 'Período' }
                }
            }
        }
    });
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}