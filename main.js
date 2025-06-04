const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTGL4I9qCp-lZM4XyLrt6NjOtWRye4j_bAORb_pod4Kyy-EC4yOdyKqinhzLzscSoLYnzAh4Uo-SQYD/pub?gid=946356819&single=true&output=csv';

let todasAsLinhas = [];
let sellersChart, productsChart, neighborhoodsChart, trendChart, categoryChart, performanceChart;

// Função para criar ou atualizar gráfico de barras
function updateBarChart(chartId, chartInstance, data, label) {
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

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetch(url)
        .then(res => res.text())
        .then(csv => {
            const linhas = csv.split('\n').filter(l => l.trim() !== '');
            const headers = linhas[0].split(',');
            todasAsLinhas = linhas.slice(1); // guarda para futuros filtros

            const dataIndex = headers.findIndex(h => h.trim().toUpperCase() === 'DATA DA VENDA');

            preencherAnosMesesDias(todasAsLinhas, dataIndex);
            filtrarPorDataAtual(headers, todasAsLinhas, dataIndex); // mostra o dia atual
        });

    document.getElementById('year').addEventListener('change', () => {
        const mesSelect = document.getElementById('month');
        const diaSelect = document.getElementById('day');
        const anoSelecionado = document.getElementById('year').value;

        if (anoSelecionado === 'todos') {
            mesSelect.disabled = true;
            diaSelect.disabled = true;
            mesSelect.innerHTML = '<option value="todos">Todos</option>';
            diaSelect.innerHTML = '<option value="todos">Todos</option>';
        } else {
            mesSelect.disabled = false;
            atualizarMeses();
            diaSelect.disabled = true;
            diaSelect.innerHTML = '<option value="todos">Todos</option>';
        }
    });

    document.getElementById('month').addEventListener('change', () => {
        const diaSelect = document.getElementById('day');
        const mesSelecionado = document.getElementById('month').value;

        if (mesSelecionado === 'todos') {
            diaSelect.disabled = true;
            diaSelect.innerHTML = '<option value="todos">Todos</option>';
        } else {
            diaSelect.disabled = false;
            atualizarDias();
        }
    });


    document.getElementById('filter-btn').addEventListener('click', () => {
        filtrarTabela();
    });
});

function preencherAnosMesesDias(linhas, dataIndex) {
    const anos = new Set();

    linhas.forEach(linha => {
        const colunas = linha.split(',');
        const data = colunas[dataIndex]?.trim();
        if (!data) return;
        const [d, m, a] = data.split('/');
        anos.add(a);
    });

    const yearSelect = document.getElementById('year');
    yearSelect.innerHTML = '<option value="todos">Todos</option>';
    [...anos].sort().forEach(ano => {
        const opt = document.createElement('option');
        opt.value = ano;
        opt.textContent = ano;
        yearSelect.appendChild(opt);
    });

    atualizarMeses();
    atualizarDias();
}

function atualizarMeses() {
    const mesSelect = document.getElementById('month');
    const anoSelecionado = document.getElementById('year').value;
    const meses = new Set();

    todasAsLinhas.forEach(linha => {
        const [d, m, a] = linha.split(',')[0].trim().split('/');
        if (anoSelecionado === 'todos' || a === anoSelecionado) {
            meses.add(m);
        }
    });

    mesSelect.innerHTML = '<option value="todos">Todos</option>';
    [...meses].sort((a, b) => a - b).forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2000, m - 1, 1));
        mesSelect.appendChild(opt);
    });
}

function atualizarDias() {
    const diaSelect = document.getElementById('day');
    const anoSelecionado = document.getElementById('year').value;
    const mesSelecionado = document.getElementById('month').value;
    const dias = new Set();

    todasAsLinhas.forEach(linha => {
        const [d, m, a] = linha.split(',')[0].trim().split('/');
        if ((anoSelecionado === 'todos' || a === anoSelecionado) &&
            (mesSelecionado === 'todos' || m === mesSelecionado.padStart(2, '0'))) {
            dias.add(d.padStart(2, '0'));
        }
    });

    diaSelect.innerHTML = '<option value="todos">Todos</option>';
    [...dias].sort().forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        diaSelect.appendChild(opt);
    });
}

function filtrarTabela() {
    const ano = document.getElementById('year').value;
    const mes = document.getElementById('month').value;
    const dia = document.getElementById('day').value;
    const dataIndex = 0;

    const headers = ['DATA DA VENDA', 'BAIRRO', 'PRODUTO', 'VALOR TOTAL', 'VENDEDOR'];
    const filtradas = todasAsLinhas.filter(linha => {
        const colunas = linha.split(',');
        const data = colunas[dataIndex]?.trim();
        const [d, m, a] = data.split('/');

        const condAno = (ano === 'todos' || a === ano);
        const condMes = (mes === 'todos' || m === mes.padStart(2, '0'));
        const condDia = (dia === 'todos' || d === dia.padStart(2, '0'));

        return condAno && condMes && condDia;
    });

    // 💰 Calcular o total de vendas
    const total = filtradas.reduce((acc, linha) => {
        const colunas = linha.split(',');
        const valorStr = colunas[3]?.replace('R$', '').replace(',', '.').trim();
        const valor = parseFloat(valorStr);
        return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

    document.getElementById('total-sales').textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // 🗓️ Descrição do período
    let label = '';
    if (ano !== 'todos') {
        const mInt = parseInt(mes);
        if (mes !== 'todos' && dia !== 'todos') {
            const data = new Date(parseInt(ano), mInt - 1, parseInt(dia));
            label = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        } else if (mes !== 'todos') {
            const data = new Date(parseInt(ano), mInt - 1, 1);
            label = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        } else {
            label = `Ano: ${ano}`;
        }
    } else {
        label = 'Todos os anos';
    }

    document.getElementById('period-label').textContent = label.charAt(0).toUpperCase() + label.slice(1);

    function gerarRankings(filtradas) {
        const vendedores = {};

        filtradas.forEach(linha => {
            const colunas = linha.split(',');
            const valorStr = colunas[3]?.replace('R$', '').replace(',', '.').trim();
            const valor = parseFloat(valorStr);
            const vendedor = colunas[4]?.trim();

            if (!isNaN(valor)) {
                vendedores[vendedor] = (vendedores[vendedor] || 0) + valor;
            }
        });

        function renderTabela(dados, elementoId) {
            const tbody = document.getElementById(elementoId);
            tbody.innerHTML = ''; // Limpa antes de adicionar
            Object.entries(dados)
                .sort((a, b) => b[1] - a[1]) // Ordena do maior para o menor
                .slice(0, 5) // Top 5
                .forEach(([chave, valor]) => {
                    const row = `
                    <tr>
                        <td class="py-2 text-sm text-gray-900">${chave}</td>
                        <td class="py-2 text-sm text-gray-900 text-right font-medium">R$&nbsp;${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    `;
                    tbody.insertAdjacentHTML('beforeend', row);
                });
        }

        renderTabela(vendedores, 'sellers-table');

        const top5 = Object.entries(vendedores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .reduce((acc, [key, val]) => {
            acc[key] = val;
            return acc;
        }, {});

        sellersChart = updateBarChart('sellers-chart', sellersChart, top5, 'Vendas por Vendedor');
    }

    renderizarTabela(headers, filtradas);
    gerarRankings(filtradas);
}

function filtrarPorDataAtual(headers, linhas, dataIndex) {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = String(hoje.getFullYear());

    const filtradas = linhas.filter(linha => {
        const colunas = linha.split(',');
        const data = colunas[dataIndex]?.trim();
        const [d, m, a] = data.split('/');
        return d === dia && m === mes && a === ano;
    });

    renderizarTabela(headers, filtradas);
}

function renderizarTabela(headers, linhas) {
    const cabecalho = document.getElementById('cabecalho');
    const corpo = document.getElementById('corpo');
    cabecalho.innerHTML = '';
    corpo.innerHTML = '';

    const trHead = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
    });
    cabecalho.appendChild(trHead);

    linhas.forEach(linha => {
        const tr = document.createElement('tr');
        linha.split(',').forEach(dado => {
            const td = document.createElement('td');
            td.textContent = dado.trim();
            tr.appendChild(td);
        });
        corpo.appendChild(tr);
    });
}