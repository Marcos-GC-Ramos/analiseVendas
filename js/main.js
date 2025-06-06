import { updateBarChart, updateLineChart  } from './charts.js';

const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTGL4I9qCp-lZM4XyLrt6NjOtWRye4j_bAORb_pod4Kyy-EC4yOdyKqinhzLzscSoLYnzAh4Uo-SQYD/pub?gid=946356819&single=true&output=csv';

let todasAsLinhas = [];
let sellersChart, productsChart, neighborhoodsChart, trendChart, categoryChart, performanceChart;

// utilizando os dados que vem da url e povando o sistema
document.addEventListener('DOMContentLoaded', () => {
    const divCarregando = document.getElementById('div-carregando');
    divCarregando.classList.remove('hidden');

    fetch(url)
        .then(res => res.text())
        .then(csv => {
            const linhas = csv.split('\n').filter(l => l.trim() !== '');
            const headers = linhas[0].split(',');
            todasAsLinhas = linhas.slice(1);

            const dataIndex = headers.findIndex(h => h.trim().toUpperCase() === 'DATA DA VENDA');

            preencherAnosMesesDias(todasAsLinhas, dataIndex);

            // Define os filtros como "todos" e mostra toda a base
            document.getElementById('year').value = 'todos';
            document.getElementById('month').value = 'todos';
            document.getElementById('day').value = 'todos';
            filtrarTabela();
        })
        .finally(() => {
           divCarregando.classList.add('hidden');
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
        const valor = parseFloat(valorStr) * 0.3;
        return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

    document.getElementById('total-sales').textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Descrição do período
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

    function gerarRanking(filtradas, colunaIndex, tabelaId, chartId, chartVar, label) {
        const ranking = {};

        filtradas.forEach(linha => {
            const colunas = linha.split(',');
            const valorStr = colunas[3]?.replace('R$', '').replace(',', '.').trim();
            const valor = parseFloat(valorStr) * 0.3;
            const chave = colunas[colunaIndex]?.trim();

            if (!isNaN(valor) && chave) {
                if (!ranking[chave]) {
                    ranking[chave] = { total: 0, quantidade: 0 };
                }
                ranking[chave].total += valor;
                ranking[chave].quantidade += 1;
            }
        });

        // Renderiza a tabela
        const tbody = document.getElementById(tabelaId);
        tbody.innerHTML = '';
        Object.entries(ranking)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5)
            .forEach(([nome, { total, quantidade }]) => {
                const row = `
                    <tr>
                        <td class="py-2 text-sm text-gray-900">${nome}</td>
                        <td class="py-2 text-sm text-gray-900 text-center">${quantidade}</td>
                        <td class="py-2 text-sm text-gray-900 text-right font-medium">R$&nbsp;${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });

        // Dados para gráfico
        const top5 = Object.entries(ranking)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5)
            .reduce((acc, [key, val]) => {
                acc[key] = val.total;
                return acc;
            }, {});

        window[chartVar] = updateBarChart(chartId, window[chartVar], top5, label);
    }

    function atualizarGraficoDeTendencia(filtradas, ano, mes, dia) {
        if (ano !== 'todos' && mes !== 'todos' && dia !== 'todos') {
            // Oculta o gráfico
            document.getElementById('div-grafico-linha').style.display = 'none';
            document.getElementById('trend-chart').parentElement.style.display = 'none';
            return;
        }

        document.getElementById('trend-chart').parentElement.style.display = 'block';
        document.getElementById('div-grafico-linha').style.display = 'block';

        const agrupamento = {};
        const labelSet = new Set();

        filtradas.forEach(linha => {
            const colunas = linha.split(',');
            const data = colunas[0].trim(); // DATA DA VENDA
            const valorStr = colunas[3]?.replace('R$', '').replace(',', '.').trim();
            const valor = parseFloat(valorStr) * 0.3;
            if (isNaN(valor)) return;

            const [d, m, a] = data.split('/');

            let chaveX = '';
            let linhaID = '';

            if (ano === 'todos') {
                linhaID = a;
                chaveX = `${m.padStart(2, '0')}`; // mês
            } else if (ano !== 'todos' && mes === 'todos') {
                linhaID = 'Total';
                chaveX = `${m.padStart(2, '0')}`; // mês
            } else if (ano !== 'todos' && mes !== 'todos') {
                linhaID = 'Total';
                chaveX = d.padStart(2, '0'); // dia
            }

            if (!agrupamento[linhaID]) agrupamento[linhaID] = {};
            if (!agrupamento[linhaID][chaveX]) agrupamento[linhaID][chaveX] = 0;

            agrupamento[linhaID][chaveX] += valor;
            labelSet.add(chaveX);
        });

        const labels = [...labelSet].sort((a, b) => a - b);

        const datasets = Object.entries(agrupamento).map(([linhaID, valores]) => {
            return {
                label: linhaID,
                data: labels.map(l => valores[l] || 0),
                fill: false,
                tension: 0.2
            };
        });

        trendChart = updateLineChart('trend-chart', trendChart, labels, datasets, 'Tendência de Vendas');
    }

    renderizarTabela(headers, filtradas);
    gerarRanking(filtradas, 4, 'sellers-table', 'sellers-chart', 'sellersChart', 'Vendas por Vendedor');
    gerarRanking(filtradas, 2, 'products-table', 'products-chart', 'productsChart', 'Vendas por Produto');
    gerarRanking(filtradas, 1, 'bairros-table', 'bairros-chart', 'neighborhoodsChart', 'Vendas por Bairro');
    atualizarGraficoDeTendencia(filtradas, ano, mes, dia);
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