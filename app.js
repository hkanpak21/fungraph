/**
 * EduGraph - Çekirdek Uygulama Mantığı
 * Grafik Oluşturma, D3 Görselleştirme ve SIR Simülasyonu
 */

// --- Global Durum ---
let graphData = { nodes: [], links: [] };
let simulation; // D3 Kuvvet Simülasyonu
let svg, g; // D3 Elemanları
let isSimulating = false;
let simInterval;
let simStep = 0;
let beta = 0.3; // Enfeksiyon Olasılığı
let gamma = 0.1; // İyileşme Oranı
let sirHistory = { s: [], i: [], r: [] };
let activeModule = 'overview';

// --- Başlatma ---
document.addEventListener('DOMContentLoaded', () => {
    generateSyntheticData();
    initGraph("#graph-container"); // Varsayılan olarak sosyal haritada başlat
    initCharts();
    updateDashboardStats();
});

// --- Modül Değiştirme ---
window.switchModule = (moduleId) => {
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));

    document.getElementById(moduleId).classList.add('active');

    // Navigasyon aktifliğini güncelle
    const navItems = document.querySelectorAll('.nav-links li');
    if (moduleId === 'overview') navItems[0].classList.add('active');
    if (moduleId === 'social-map') navItems[1].classList.add('active');
    if (moduleId === 'simulation') navItems[2].classList.add('active');
    if (moduleId === 'analytics') navItems[3].classList.add('active');

    activeModule = moduleId;

    // Grafiği ilgili konteynere taşı
    if (moduleId === 'social-map') {
        moveGraph("#graph-container");
    } else if (moduleId === 'simulation') {
        moveGraph("#sim-graph-container");
    }
};

function moveGraph(containerId) {
    const container = document.querySelector(containerId);
    const svgElement = document.querySelector('svg');
    if (svgElement && container) {
        container.appendChild(svgElement);
        // Simülasyonu yeniden başlat (hareket durmuş olabilir)
        simulation.alpha(0.3).restart();
    }
}

// --- Veri Üretimi ---
function generateSyntheticData() {
    const nodeCount = 120;
    const nodes = [];
    const links = [];

    const clusters = ['9A', '9B', '10A', '10B', '11A'];
    for (let i = 0; i < nodeCount; i++) {
        const cluster = clusters[Math.floor(i / (nodeCount / clusters.length))];
        nodes.push({
            id: `Öğrenci-${i}`,
            group: cluster,
            state: 'S',
            degree: 0,
            betweenness: Math.random() * 0.5
        });
    }

    nodes.forEach((node, i) => {
        nodes.forEach((other, j) => {
            if (i === j) return;
            const sameGroup = node.group === other.group;
            const prob = sameGroup ? 0.12 : 0.003;

            if (Math.random() < prob) {
                links.push({ source: node.id, target: other.id });
                node.degree++;
                other.degree++;
            }
        });
    });

    graphData = { nodes, links };
}

// --- D3 Grafik Uygulaması ---
function initGraph(containerId) {
    const width = 800;
    const height = 600;

    // Temizle
    d3.select(containerId).selectAll("*").remove();

    svg = d3.select(containerId)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);

    g = svg.append("g");

    svg.call(d3.zoom().on("zoom", (event) => {
        g.attr("transform", event.transform);
    }));

    simulation = d3.forceSimulation(graphData.nodes)
        .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-120))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(18));

    const link = g.append("g")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-opacity", 0.4)
        .selectAll("line")
        .data(graphData.links)
        .join("line")
        .attr("stroke-width", 1);

    const node = g.append("g")
        .selectAll("circle")
        .data(graphData.nodes)
        .join("circle")
        .attr("r", d => 6 + (d.degree * 0.4))
        .attr("fill", d => getColorByGroup(d.group))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("class", "graph-node") // CSS seçici için
        .style("cursor", "pointer")
        .call(drag(simulation));

    node.on("mouseover", (event, d) => {
        const info = document.getElementById('node-info');
        info.style.display = 'block';
        document.getElementById('node-id').innerText = d.id;
        document.getElementById('node-metrics').innerText = `Sınıf: ${d.group}\nArkadaş: ${d.degree}\nNüfuz: ${(d.betweenness * 10).toFixed(1)}/10`;
    });

    node.on("click", (event, d) => {
        if (activeModule === 'simulation') {
            resetSimulation();
            d.state = 'I';
            updateSimUI();
        }
    });

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

function getColorByGroup(group) {
    const colors = {
        '9A': '#2a4494',
        '9B': '#3fa9f5',
        '10A': '#ed1c24',
        '10B': '#f59e0b',
        '11A': '#10b981'
    };
    return colors[group] || '#94a3b8';
}

function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// --- Filtreler ---
window.updateGraphView = () => {
    const filter = document.getElementById('filter-select').value;

    d3.selectAll(".graph-node")
        .transition()
        .duration(500)
        .attr("r", d => {
            if (filter === 'popularity') return 4 + (d.degree * 1.5);
            if (filter === 'bridges') return 4 + (d.betweenness * 30);
            return 6 + (d.degree * 0.4);
        })
        .attr("fill", d => {
            if (filter === 'cliques') return getColorByGroup(d.group);
            if (filter === 'none') return getColorByGroup(d.group);
            // Dereceye göre renk yoğunluğu
            if (filter === 'popularity') return d3.interpolateBlues(d.degree / 15);
            if (filter === 'bridges') return d3.interpolateReds(d.betweenness * 2);
            return getColorByGroup(d.group);
        });
};

window.resetGraph = () => {
    document.getElementById('filter-select').value = 'none';
    updateGraphView();
    if (simulation) simulation.alpha(0.3).restart();
};

// --- SIR Simülasyon Mantığı ---
window.updateSimParams = () => {
    beta = parseFloat(document.getElementById('beta-slider').value);
    gamma = parseFloat(document.getElementById('gamma-slider').value);
    document.getElementById('beta-val').innerText = beta.toFixed(2);
    document.getElementById('gamma-val').innerText = gamma.toFixed(2);
};

window.toggleSimulation = () => {
    if (isSimulating) {
        clearInterval(simInterval);
        document.getElementById('play-btn').innerText = '▶ Simülasyonu Başlat';
    } else {
        if (graphData.nodes.every(n => n.state === 'S')) {
            const randomNode = graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)];
            randomNode.state = 'I';
        }
        simInterval = setInterval(runSimStep, 300);
        document.getElementById('play-btn').innerText = '⏸ Duraklat';
    }
    isSimulating = !isSimulating;
};

function runSimStep() {
    simStep++;
    const newStates = graphData.nodes.map(n => n.state);

    graphData.nodes.forEach((node, i) => {
        if (node.state === 'I') {
            graphData.links.forEach(link => {
                let targetNode = null;
                if (link.source.id === node.id) targetNode = link.target;
                else if (link.target.id === node.id) targetNode = link.source;

                if (targetNode && targetNode.state === 'S') {
                    if (Math.random() < beta) {
                        newStates[graphData.nodes.indexOf(targetNode)] = 'I';
                    }
                }
            });
            if (Math.random() < gamma) newStates[i] = 'R';
        }
    });

    graphData.nodes.forEach((node, i) => node.state = newStates[i]);
    updateSimUI();
    updateCharts();

    // Hepsi iyileştiyse veya bittiyse durdur
    if (graphData.nodes.every(n => n.state !== 'I')) {
        clearInterval(simInterval);
        isSimulating = false;
        document.getElementById('play-btn').innerText = '▶ Simülasyonu Başlat';
    }
}

function updateSimUI() {
    document.getElementById('sim-step').innerText = simStep;
    const infectedCount = graphData.nodes.filter(n => n.state === 'I').length;
    document.getElementById('count-infected').innerText = infectedCount;

    d3.selectAll(".graph-node")
        .transition()
        .duration(200)
        .attr("fill", d => {
            if (d.state === 'I') return '#ed1c24'; // Kırmızı (Enfekte)
            if (d.state === 'R') return '#10b981'; // Yeşil (İyileşmiş)
            return getColorByGroup(d.group);
        })
        .attr("stroke", d => (d.state === 'I' ? '#fff' : '#fff'))
        .attr("stroke-width", d => (d.state === 'I' ? 3 : 2));
}

window.resetSimulation = () => {
    clearInterval(simInterval);
    isSimulating = false;
    simStep = 0;
    graphData.nodes.forEach(n => n.state = 'S');
    sirHistory = { s: [], i: [], r: [] };

    // Grafik verilerini temizle
    window.sirChart.data.labels = [];
    window.sirChart.data.datasets.forEach(ds => ds.data = []);
    window.sirChart.update();

    updateSimUI();
    document.getElementById('play-btn').innerText = '▶ Simülasyonu Başlat';
};

// --- İstatistikler ve Grafikler ---
function initCharts() {
    const ctx = document.getElementById('sir-chart').getContext('2d');
    window.sirChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Sağlıklı', data: [], borderColor: '#3fa9f5', backgroundColor: 'rgba(63, 169, 245, 0.1)', fill: true, tension: 0.4 },
                { label: 'Enfekte', data: [], borderColor: '#ed1c24', backgroundColor: 'rgba(237, 28, 36, 0.1)', fill: true, tension: 0.4 },
                { label: 'İyileşmiş', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 }
            ]
        },
        options: {
            responsive: true,
            interaction: { intersect: false, mode: 'index' },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Öğrenci Sayısı' } },
                x: { title: { display: true, text: 'Zaman (Adım)' } }
            }
        }
    });
}

function updateCharts() {
    const s = graphData.nodes.filter(n => n.state === 'S').length;
    const i = graphData.nodes.filter(n => n.state === 'I').length;
    const r = graphData.nodes.filter(n => n.state === 'R').length;

    window.sirChart.data.labels.push(simStep);
    window.sirChart.data.datasets[0].data.push(s);
    window.sirChart.data.datasets[1].data.push(i);
    window.sirChart.data.datasets[2].data.push(r);
    window.sirChart.update('none'); // Performans için animasyonsuz güncelle
}

function updateDashboardStats() {
    document.getElementById('count-nodes').innerText = graphData.nodes.length;
    document.getElementById('count-edges').innerText = graphData.links.length;

    const topBridges = [...graphData.nodes]
        .sort((a, b) => b.degree - a.degree)
        .slice(0, 8);

    const tbody = document.querySelector('#bridges-table tbody');
    tbody.innerHTML = topBridges.map(node => `
        <tr>
            <td>${node.id}</td>
            <td>${node.degree}</td>
            <td>${(node.betweenness * 10).toFixed(1)}/10</td>
            <td>${node.degree > 8 ? '<span style="color:red; font-weight:bold">YÜKSEK</span>' : '<span style="color:orange">ORTA</span>'}</td>
        </tr>
    `).join('');
}
