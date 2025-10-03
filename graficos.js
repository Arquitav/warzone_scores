
import { fetchScores } from './api.js';


const PLAYER_COLORS = {
    'IngratoConcubino': 'rgba(179, 0, 0, 1)',
    'Takabrawn': 'rgba(0, 68, 255, 1)',
    'Ovejacaracol': 'rgba(197, 0, 164, 1)',
    'Arquimax': 'rgba(0, 139, 19, 1)'
};

const ctx = document.getElementById('statsChart').getContext('2d');
const statFilterButtons = document.querySelectorAll('#filters-container-stats button'); // Renombrado para claridad

let chart; 
let processedData;

// --- LÓGICA DE LA GRÁFICA ---

// =================================================================
// CAMBIO 1: La función fetchData ahora acepta un rango de tiempo
// =================================================================
async function fetchData(rango) {
    let fechaInicio;
    const ahora = new Date();

    if (rango === '5h') {
        fechaInicio = new Date(ahora - 5 * 60 * 60 * 1000);
    } else if (rango === '7d') {
        fechaInicio = new Date(ahora - 7 * 24 * 60 * 60 * 1000);
    } else if (rango === '30d') {
        fechaInicio = new Date(ahora - 30 * 24 * 60 * 60 * 1000);
    } else {
        // Por si acaso, un default que traiga todo
        fechaInicio = new Date(0); 
    }

    try {
        const data = await fetchScores(rango);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// =================================================================
// CAMBIO 2: Nueva función principal que controla la carga de datos
// =================================================================
async function cargarGraficos(rango = '5h') {
    const rawData = await fetchData(rango); // Llama a fetchData con el rango
    
    // Si no hay datos, limpiamos la gráfica y salimos
    if (!rawData || rawData.length === 0) {
        if(chart) {
            chart.data.labels = [];
            chart.data.datasets = [];
            chart.update();
        }
        console.warn(`No se encontraron datos para el rango: ${rango}`);
        return;
    }
    
    processedData = processDataForChart(rawData);
    
    // Si la gráfica no existe, la creamos
    if (!chart) {
        createChart();
    }
    
    // Actualizamos la gráfica con la estadística de puntuación por defecto
    updateChart('puntuacion'); 
}


// (Esta función no necesita cambios)
function processDataForChart(data) {
    const dataByPlayer = data.reduce((acc, record) => {
        const { nombre, ...stats } = record;
        if (!acc[nombre]) { acc[nombre] = []; }
        acc[nombre].push(stats);
        return acc;
    }, {});
    const labels = [...new Set(data.map(d => d.partida_id))].sort((a, b) => a - b);
    return { dataByPlayer, labels };
}

// (Esta función no necesita cambios)
function createChart() {
    const color_grid = 'rgba(116, 116, 116, 1)';
    chart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Número de Partida', color: color_grid },
                    grid: { color: color_grid },
                    ticks: { color: color_grid }
                },
                y: {
                    title: { display: true, text: 'Valor', color: color_grid },
                    grid: { color: color_grid },
                    ticks: { color: color_grid, stepSize: 1 },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { labels: { color: color_grid } },
            }
        }
    });
}

// (Esta función no necesita cambios)
function updateChart(statKey) {
    if (!processedData || !chart) return;
    const { dataByPlayer, labels } = processedData;
    chart.data.labels = labels.map(l => `Partida ${l}`);
    chart.data.datasets = Object.keys(dataByPlayer).map(playerName => {
        const statData = dataByPlayer[playerName].map(record => record[statKey] || 0);
        let cumulativeTotal = 0;
        const cumulativeStatData = statData.map(value => {
            cumulativeTotal += value;
            return cumulativeTotal;
        });
        return {
            label: playerName,
            data: cumulativeStatData,
            borderColor: PLAYER_COLORS[playerName] || 'grey',
            backgroundColor: (PLAYER_COLORS[playerName] || 'grey').replace('1)', '0.2)'),
            fill: false,
            tension: 0.1
        };
    });
    const statTitle = statKey.charAt(0).toUpperCase() + statKey.slice(1);
    chart.options.scales.y.title.text = `${statTitle} (Acumulado)`;
    chart.update();
}

// --- EVENT LISTENERS ---

// Estos listeners para cambiar de estadística siguen funcionando igual
statFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const stat = button.getAttribute('data-stat');
        if (!stat) return; // seguridad: si no hay data-stat no hacer nada
        updateChart(stat);
    });
});

// =================================================================
// CAMBIO 3: Añadir listeners para los NUEVOS botones de tiempo
// =================================================================
document.getElementById('btn-5h').addEventListener('click', () => cargarGraficos('5h'));
document.getElementById('btn-7d').addEventListener('click', () => cargarGraficos('7d'));
document.getElementById('btn-30d').addEventListener('click', () => cargarGraficos('30d'));

// =================================================================
// CAMBIO 4: Iniciar todo con la nueva función y un rango por defecto
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarGraficos('5h'); // Carga los datos de las últimas 5h al abrir la página

});

