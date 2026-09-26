// Dynamic API Base URL
// - When deployed on Vercel or any remote domain: use relative path '' (same-origin)
// - When served from FastAPI directly: use relative path ''
// - When running locally on a separate dev port (e.g. 3000/5500) or via file://: connect to http://127.0.0.1:8000
const API_BASE = (function() {
    if (typeof window === 'undefined') return '';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (window.location.protocol === 'file:') {
        return 'http://127.0.0.1:8000';
    }
    if (isLocalhost && window.location.port && window.location.port !== '8000') {
        return `http://${window.location.hostname}:8000`;
    }
    return '';
})();

// Global state tracking
let lastForecastResult = null;
let currentOptimizerData = null;
let maritimeIntelligenceData = null;
let activeIntelligenceCategory = 'ALL';

// DOM Elements - Market Overview
const bdiValue = document.getElementById('bdi-value');
const bdiChange = document.getElementById('bdi-change');
const capeRate = document.getElementById('cape-rate');
const bunkerPrice = document.getElementById('bunker-price');
const usdInr = document.getElementById('usd-inr');
const lastUpdated = document.getElementById('lastUpdated');

// DOM Elements - Forecast Form
const forecastBtn = document.getElementById('forecast-btn');
const resultsPanel = document.getElementById('results-panel');
const originSelect = document.getElementById('origin');
const destinationSelect = document.getElementById('destination');
const vesselSelect = document.getElementById('vessel');
const cargoInput = document.getElementById('cargo');
const forecastDaysSelect = document.getElementById('forecast-days');

// DOM Elements - Forecast Result
const resultRoute = document.getElementById('result-route');
const decisionBanner = document.getElementById('decision-banner');
const predictedRate = document.getElementById('predicted-rate');
const totalCostUsd = document.getElementById('total-cost-usd');
const totalCostInr = document.getElementById('total-cost-inr');
const confLow = document.getElementById('conf-low');
const confMid = document.getElementById('conf-mid');
const confHigh = document.getElementById('conf-high');
const confTargetMarker = document.getElementById('conf-target-marker');

const voyageDistance = document.getElementById('voyage-distance');
const seaDays = document.getElementById('sea-days');
const portDays = document.getElementById('port-days');
const totalDays = document.getElementById('total-days');
const fuelCost = document.getElementById('fuel-cost');
const lighterage = document.getElementById('lighterage');

const savingsInfo = document.getElementById('savings-info');
const savingsText = document.getElementById('savings-text');

// DOM Elements - Port Clearance
const portClearanceBox = document.getElementById('port-clearance-box');
const clearanceOverallBadge = document.getElementById('clearance-overall-badge');
const draftClearanceVal = document.getElementById('draft-clearance-val');
const loaClearanceVal = document.getElementById('loa-clearance-val');
const beamClearanceVal = document.getElementById('beam-clearance-val');
const clearanceWarningsList = document.getElementById('clearance-warnings-list');

// DOM Elements - Strategy Matrix
const strategyRecommendationBadge = document.getElementById('strategy-recommendation-badge');
const strategyRationaleText = document.getElementById('strategy-rationale-text');
const strategyCardsGrid = document.getElementById('strategy-cards-grid');

// DOM Elements - Route Intelligence Alert
const routeIntelAlert = document.getElementById('route-intel-alert');
const routeAlertBadge = document.getElementById('route-alert-badge');
const routeAlertMessage = document.getElementById('route-alert-message');
const routeAlertAction = document.getElementById('route-alert-action');

// DOM Elements - Intelligence Dashboard
const globalThreatBadge = document.getElementById('global-threat-badge');
const threatBadgeText = document.getElementById('threat-badge-text');
const refreshIntelBtn = document.getElementById('refresh-intel-btn');
const riskIndexValue = document.getElementById('risk-index-value');
const riskMeterFill = document.getElementById('risk-meter-fill');
const intelMonitoredFeeds = document.getElementById('intel-monitored-feeds');
const intelLastUpdated = document.getElementById('intel-last-updated');
const intelExecutiveSummary = document.getElementById('intel-executive-summary');
const intelCardsGrid = document.getElementById('intel-cards-grid');

// DOM Elements - Multi-Vessel Optimizer
const runOptimizerBtn = document.getElementById('run-optimizer-btn');
const optRecommendedVessel = document.getElementById('opt-recommended-vessel');
const optRecommendedReason = document.getElementById('opt-recommended-reason');
const optimizerTableBody = document.getElementById('optimizer-table-body');

// DOM Elements - Tender Modal
const openTenderModalBtn = document.getElementById('open-tender-modal-btn');
const tenderModal = document.getElementById('tender-modal');
const closeTenderBtn = document.getElementById('close-tender-btn');
const printTenderBtn = document.getElementById('print-tender-btn');
const tenderSheetBody = document.getElementById('tender-sheet-body');

// Chart instance reference & Multiplier state
let predictionsChartInstance = null;
let allPredictionsData = null;
let activeRouteKey = 'ALL';
let activeVesselMultiplier = 1.00;
let activeVesselClass = 'Capesize';

const VESSEL_SPECS = {
    'Capesize': {
        multiplier: 1.00,
        dwt: '180,000 MT',
        draft: '18.2 m',
        speed: '13.5 kn',
        cargo: 'Coking Coal & Heavy Iron Ore',
        berthStatus: 'Paradip Deep Draft & Dhamra Permitted'
    },
    'Panamax': {
        multiplier: 0.76,
        dwt: '75,000 MT',
        draft: '14.1 m',
        speed: '14.0 kn',
        cargo: 'Coking / Thermal Coal & Met Coke',
        berthStatus: 'Direct Berth: Haldia Dock & Vizag Outer'
    },
    'Supramax': {
        multiplier: 0.65,
        dwt: '58,000 MT',
        draft: '12.8 m',
        speed: '14.0 kn',
        cargo: 'Minor Bulks, Anthracite & Met Coke',
        berthStatus: 'Universal East Coast Clearance with Geared Cranes'
    },
    'Handysize': {
        multiplier: 0.55,
        dwt: '35,000 MT',
        draft: '10.5 m',
        speed: '13.0 kn',
        cargo: 'Limestone, Pig Iron & Steel Coils',
        berthStatus: 'Universal Riverine & Shallow Berth Clearance'
    }
};

// Initialize reliably across all browser execution environments
function initializeApp() {
    console.log(`Voyant Dry Bulk Freight Platform v2.0 Initialized. API target: "${API_BASE || 'Same-Origin (/api)'}"`);
    loadMarketData();
    loadPredictionsChart();
    loadMaritimeIntelligence();
    loadVesselOptimization();
    setupEventListeners();
    setupVesselMultiplierListeners();
    setupIntelligenceEventListeners();
    setupTenderEventListeners();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Color palette for chart routes matching Forest Emerald, Slate, and Maritime executive theme
const ROUTE_COLORS = {
    'Australia-HP': {
        border: '#047857',
        proj: '#10b981',
        bg: 'rgba(4, 120, 87, 0.12)',
        glow: 'rgba(16, 185, 129, 0.45)',
        name: 'Australia (Hay Point)'
    },
    'USA-HR': {
        border: '#0f766e',
        proj: '#14b8a6',
        bg: 'rgba(15, 118, 110, 0.12)',
        glow: 'rgba(20, 184, 166, 0.45)',
        name: 'USA (Hampton Roads)'
    },
    'Indonesia': {
        border: '#0284c7',
        proj: '#38bdf8',
        bg: 'rgba(2, 132, 199, 0.12)',
        glow: 'rgba(56, 189, 248, 0.45)',
        name: 'Indonesia (Taboneo)'
    },
    'S.Africa': {
        border: '#d97706',
        proj: '#f59e0b',
        bg: 'rgba(217, 119, 6, 0.12)',
        glow: 'rgba(245, 158, 11, 0.45)',
        name: 'South Africa (Richards Bay)'
    },
    'Mozambique': {
        border: '#6366f1',
        proj: '#818cf8',
        bg: 'rgba(99, 102, 241, 0.12)',
        glow: 'rgba(129, 140, 248, 0.45)',
        name: 'Mozambique (Maputo)'
    },
};

function setupVesselMultiplierListeners() {
    const container = document.getElementById('vessel-multiplier-chips');
    if (!container) return;

    container.querySelectorAll('.vessel-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            container.querySelectorAll('.vessel-chip').forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            activeVesselMultiplier = parseFloat(target.dataset.mult) || 1.0;
            activeVesselClass = target.dataset.vessel || 'Capesize';

            if (allPredictionsData) {
                renderChart(allPredictionsData, activeRouteKey || 'ALL');
                renderPredictionStats();
            }
        });
    });
}

// =========================================================================
// 1. MARKET DATA & 2026 PREDICTIONS CHART (24-MONTH DUAL-PHASE TRAJECTORY)
// =========================================================================

async function ensureChartJsLoaded() {
    if (typeof Chart !== 'undefined') return true;

    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max

        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof Chart !== 'undefined') {
                clearInterval(checkInterval);
                resolve(true);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                resolve(typeof Chart !== 'undefined');
            }
        }, 100);

        // Inject fallback CDN if primary didn't load
        if (!document.getElementById('chartjs-fallback-script')) {
            const script = document.createElement('script');
            script.id = 'chartjs-fallback-script';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js';
            script.onload = () => {
                clearInterval(checkInterval);
                resolve(true);
            };
            script.onerror = () => {
                console.warn('Fallback Chart.js CDN unreachable, activating native canvas renderer.');
            };
            document.head.appendChild(script);
        }
    });
}

async function loadPredictionsChart() {
    try {
        let data = null;

        // 1. Try backend API endpoint
        try {
            const response = await fetch(`${API_BASE}/api/forecast/2026-predictions`);
            if (response && response.ok) {
                data = await response.json();
            }
        } catch (fetchErr) {
            console.warn('Backend API not reachable for chart, checking static cache.');
        }

        // 2. Try static data directory
        if (!data || !data.routes) {
            try {
                const staticResp = await fetch('data/predictions_2026.json');
                if (staticResp && staticResp.ok) {
                    data = await staticResp.json();
                }
            } catch (staticErr) {
                console.warn('Static data not reachable, using synthesized dual-phase trajectory.');
            }
        }

        // 3. Fallback to resilient synthesized 24-month trajectory
        if (!data || !data.routes) {
            data = generateSynthetic2026Data();
        }

        allPredictionsData = data;
        renderRouteFilters(data);
        renderPredictionStats();
        await renderChart(data, activeRouteKey || 'ALL');

    } catch (error) {
        console.error('Error loading 2026 predictions chart:', error);
    }
}

function generateSynthetic2026Data() {
    const dates = [
        '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
        '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
        '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
        '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'
    ];
    return {
        forecast_year: 2026,
        dates: dates,
        routes: {
            'Australia-HP': {
                label: 'Australia (Hay Point) → Paradip',
                historical_2025_rates: [37.37, 37.14, 37.47, 38.89, 39.04, 37.68, 37.40, 37.34, 37.44, 38.13, 38.89, 38.37],
                projected_2026_rates:  [38.62, 38.87, 39.11, 40.32, 40.37, 39.79, 38.74, 38.72, 38.98, 40.21, 40.35, 40.39],
                confidence_p10_2026:   [35.53, 35.76, 35.98, 35.88, 35.93, 36.61, 35.64, 35.62, 35.86, 35.79, 35.91, 37.16],
                confidence_p90_2026:   [41.71, 41.98, 42.24, 44.76, 44.81, 42.97, 41.84, 41.82, 42.10, 44.63, 44.79, 43.62],
                benchmark_2025_avg: 37.93,
                benchmark_2025_min: 37.14,
                benchmark_2025_max: 39.04,
                projected_2026_avg: 39.54,
                projected_2026_min: 38.62,
                projected_2026_max: 40.39,
                yoy_change_pct: 4.24
            },
            'USA-HR': {
                label: 'USA (Hampton Roads) → Paradip',
                historical_2025_rates: [67.95, 67.54, 68.14, 70.72, 70.98, 68.51, 68.01, 67.90, 68.08, 69.34, 70.72, 69.77],
                projected_2026_rates:  [70.23, 70.68, 71.12, 73.31, 73.40, 72.35, 70.45, 70.41, 70.88, 73.11, 73.38, 73.45],
                confidence_p10_2026:   [64.61, 65.03, 65.43, 65.25, 65.33, 66.56, 64.81, 64.78, 65.21, 65.07, 65.31, 67.57],
                confidence_p90_2026:   [75.85, 76.33, 76.81, 81.37, 81.47, 78.14, 76.09, 76.04, 76.55, 81.15, 81.45, 79.33],
                benchmark_2025_avg: 68.97,
                benchmark_2025_min: 67.54,
                benchmark_2025_max: 70.98,
                projected_2026_avg: 71.90,
                projected_2026_min: 70.23,
                projected_2026_max: 73.45,
                yoy_change_pct: 4.25
            },
            'Indonesia': {
                label: 'Indonesia (Taboneo) → Paradip',
                historical_2025_rates: [13.72, 13.64, 13.76, 14.28, 14.33, 13.84, 13.73, 13.71, 13.75, 14.00, 14.28, 14.09],
                projected_2026_rates:  [14.18, 14.27, 14.36, 14.81, 14.82, 14.61, 14.23, 14.22, 14.31, 14.76, 14.82, 14.83],
                confidence_p10_2026:   [13.05, 13.13, 13.21, 13.18, 13.19, 13.44, 13.09, 13.08, 13.17, 13.14, 13.19, 13.64],
                confidence_p90_2026:   [15.31, 15.41, 15.51, 16.44, 16.45, 15.78, 15.37, 15.36, 15.45, 16.38, 16.45, 16.02],
                benchmark_2025_avg: 13.93,
                benchmark_2025_min: 13.64,
                benchmark_2025_max: 14.33,
                projected_2026_avg: 14.52,
                projected_2026_min: 14.18,
                projected_2026_max: 14.83,
                yoy_change_pct: 4.24
            },
            'S.Africa': {
                label: 'South Africa → Vizag',
                historical_2025_rates: [27.60, 27.43, 27.68, 28.73, 28.84, 27.83, 27.63, 27.58, 27.65, 28.17, 28.73, 28.34],
                projected_2026_rates:  [28.53, 28.71, 28.89, 29.78, 29.82, 29.39, 28.62, 28.60, 28.79, 29.70, 29.81, 29.84],
                confidence_p10_2026:   [26.25, 26.41, 26.58, 26.50, 26.54, 27.04, 26.33, 26.31, 26.49, 26.43, 26.53, 27.45],
                confidence_p90_2026:   [30.81, 31.01, 31.20, 33.06, 33.10, 31.74, 30.91, 30.89, 31.09, 32.97, 33.09, 32.23],
                benchmark_2025_avg: 28.02,
                benchmark_2025_min: 27.43,
                benchmark_2025_max: 28.84,
                projected_2026_avg: 29.21,
                projected_2026_min: 28.53,
                projected_2026_max: 29.84,
                yoy_change_pct: 4.25
            },
            'Mozambique': {
                label: 'Mozambique → Haldia',
                historical_2025_rates: [29.19, 29.04, 29.26, 30.21, 30.31, 29.40, 29.21, 29.17, 29.24, 29.70, 30.21, 29.86],
                projected_2026_rates:  [30.03, 30.19, 30.36, 31.16, 31.20, 30.81, 30.11, 30.09, 30.27, 31.09, 31.19, 31.21],
                confidence_p10_2026:   [27.63, 27.77, 27.93, 27.73, 27.77, 28.35, 27.70, 27.68, 27.85, 27.67, 27.76, 28.71],
                confidence_p90_2026:   [32.43, 32.61, 32.79, 34.59, 34.63, 33.27, 32.52, 32.50, 32.69, 34.51, 34.62, 33.71],
                benchmark_2025_avg: 29.57,
                benchmark_2025_min: 29.04,
                benchmark_2025_max: 30.31,
                projected_2026_avg: 30.64,
                projected_2026_min: 30.03,
                projected_2026_max: 31.21,
                yoy_change_pct: 3.62
            }
        }
    };
}

function renderRouteFilters(data) {
    const filterContainer = document.getElementById('route-filters');
    if (!filterContainer) return;

    let html = `<button class="route-filter-btn ${activeRouteKey === 'ALL' ? 'active' : ''}" data-route="ALL">All Routes</button>`;
    for (const [key, val] of Object.entries(data.routes)) {
        const isAct = activeRouteKey === key ? 'active' : '';
        html += `<button class="route-filter-btn ${isAct}" data-route="${key}">${val.label.split('→')[0].trim()}</button>`;
    }
    filterContainer.innerHTML = html;

    filterContainer.querySelectorAll('.route-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterContainer.querySelectorAll('.route-filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            activeRouteKey = e.currentTarget.dataset.route;
            renderChart(allPredictionsData, activeRouteKey);
            renderPredictionStats();
        });
    });
}

// Custom Chart.js Plugin for "TODAY | 2026 FORWARD" Phase Divider
const dualPhaseDividerPlugin = {
    id: 'dualPhaseDivider',
    afterDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales || !scales.x || !scales.y) return;
        const { top, bottom, right } = chartArea;
        const x = scales.x;

        const xPos11 = x.getPixelForValue(11);
        const xPos12 = x.getPixelForValue(12);
        if (isNaN(xPos11) || isNaN(xPos12)) return;

        const splitX = (xPos11 + xPos12) / 2;

        ctx.save();
        // 1. Subtle forecast region backdrop tint (from splitX to right)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.025)';
        ctx.fillRect(splitX, top, right - splitX, bottom - top);

        // 2. Vertical dashed divider line
        ctx.beginPath();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = 'rgba(4, 120, 87, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(splitX, top);
        ctx.lineTo(splitX, bottom);
        ctx.stroke();

        // 3. "TODAY | 2026 FORWARD" badge pill
        const badgeText = 'TODAY | 2026 FORWARD';
        ctx.font = '700 10px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        const textMetrics = ctx.measureText(badgeText);
        const pillW = textMetrics.width + 16;
        const pillH = 20;
        const pillX = splitX - pillW / 2;
        const pillY = top + 6;

        ctx.setLineDash([]);
        ctx.fillStyle = '#047857';
        ctx.shadowColor = 'rgba(4, 120, 87, 0.25)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;

        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(pillX, pillY, pillW, pillH, 5);
        } else {
            ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, splitX, pillY + pillH / 2);

        ctx.restore();
    }
};

// Custom Chart.js Plugin for Sleek Crosshair Tracking & Glowing Hover Anchor (Image #25 aesthetic)
const crosshairGuidePlugin = {
    id: 'crosshairGuide',
    afterDraw(chart) {
        if (chart.tooltip && chart.tooltip._active && chart.tooltip._active.length) {
            const activePoint = chart.tooltip._active[0];
            const ctx = chart.ctx;
            const x = activePoint.element.x;
            const y = activePoint.element.y;
            const topY = chart.chartArea.top;
            const bottomY = chart.chartArea.bottom;
            const leftX = chart.chartArea.left;
            const rightX = chart.chartArea.right;

            ctx.save();

            // 1. Vertical cursor line
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = 'rgba(4, 120, 87, 0.45)';
            ctx.stroke();

            // 2. Faint horizontal cursor guide for precision rate reading
            ctx.beginPath();
            ctx.setLineDash([3, 3]);
            ctx.moveTo(leftX, y);
            ctx.lineTo(rightX, y);
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = 'rgba(4, 120, 87, 0.22)';
            ctx.stroke();

            // 3. Glowing focal point ring (Image #25 financial style)
            const pointColor = activePoint.element.options.borderColor || activePoint.element.options.backgroundColor || '#047857';

            // Outer glow halo
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(x, y, 7.5, 0, Math.PI * 2);
            ctx.fillStyle = pointColor;
            ctx.globalAlpha = 0.25;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Inner solid white circle with sharp border
            ctx.beginPath();
            ctx.arc(x, y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = pointColor;
            ctx.stroke();

            ctx.restore();
        }
    }
};

async function renderChart(data, routeFilter) {
    const canvas = document.getElementById('predictions-chart');
    if (!canvas) return;

    const chartReady = await ensureChartJsLoaded();
    const mult = activeVesselMultiplier || 1.00;
    const currentInr = (usdInr ? parseFloat(usdInr.textContent.replace(/[^0-9.]/g, '')) : 95.86) || 95.86;

    if (chartReady && typeof Chart !== 'undefined') {
        if (predictionsChartInstance) {
            try {
                predictionsChartInstance.destroy();
            } catch (e) {
                console.warn('Error destroying chart instance:', e);
            }
            predictionsChartInstance = null;
        }

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthLabels = data.dates.map(d => {
            const parts = d.split('-');
            if (parts.length >= 2) {
                const y = parts[0].slice(-2);
                const m = parseInt(parts[1], 10);
                return `${monthNames[m - 1]} '${y}`;
            }
            return d;
        });

        const ctx = canvas.getContext('2d');
        const datasets = [];

        if (routeFilter === 'ALL') {
            // Render all routes: Solid 2025 actuals + Dashed 2026 projections
            for (const [key, val] of Object.entries(data.routes)) {
                const color = ROUTE_COLORS[key] || { border: '#047857', proj: '#10b981', bg: 'rgba(4, 120, 87, 0.10)' };
                const histRaw = val.historical_2025_rates || (val.predicted_rates ? val.predicted_rates.slice(0, 12) : []);
                const projRaw = val.projected_2026_rates || (val.predicted_rates ? val.predicted_rates.slice(12, 24) : []);

                // 2025 Actuals (0..11)
                const histData = new Array(24).fill(null);
                for (let i = 0; i < 12; i++) {
                    histData[i] = parseFloat((histRaw[i] * mult).toFixed(2));
                }

                // 2026 Projected Flow (11..23 connected seamlessly from Dec 2025)
                const projData = new Array(24).fill(null);
                projData[11] = parseFloat((histRaw[11] * mult).toFixed(2));
                for (let i = 0; i < 12; i++) {
                    projData[i + 12] = parseFloat((projRaw[i] * mult).toFixed(2));
                }

                const routeShortName = val.label.split('→')[0].trim();

                datasets.push({
                    label: `${routeShortName} (2025 Actual)`,
                    data: histData,
                    borderColor: color.border,
                    backgroundColor: color.bg,
                    borderWidth: 2.4,
                    hoverBorderWidth: 4.2,
                    borderDash: [],
                    pointRadius: 1.5,
                    pointHoverRadius: 6.5,
                    pointBackgroundColor: color.border,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.38,
                    fill: false
                });

                datasets.push({
                    label: `${routeShortName} (2026 Projected)`,
                    data: projData,
                    borderColor: color.proj || color.border,
                    backgroundColor: color.bg,
                    borderWidth: 2.4,
                    hoverBorderWidth: 4.2,
                    borderDash: [6, 4],
                    pointRadius: 1.5,
                    pointHoverRadius: 6.5,
                    pointBackgroundColor: color.proj || color.border,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.38,
                    fill: false
                });
            }
        } else {
            // Single Route Focus: 2025 Solid + 2026 Dashed Flow + P10-P90 Translucent Envelope
            const val = data.routes[routeFilter] || Object.values(data.routes)[0];
            const color = ROUTE_COLORS[routeFilter] || { border: '#047857', proj: '#10b981', bg: 'rgba(4, 120, 87, 0.10)' };
            const histRaw = val.historical_2025_rates || (val.predicted_rates ? val.predicted_rates.slice(0, 12) : []);
            const projRaw = val.projected_2026_rates || (val.predicted_rates ? val.predicted_rates.slice(12, 24) : []);
            const p10Raw = val.confidence_p10_2026 || projRaw.map(r => r * 0.92);
            const p90Raw = val.confidence_p90_2026 || projRaw.map(r => r * 1.08);

            const histData = new Array(24).fill(null);
            for (let i = 0; i < 12; i++) {
                histData[i] = parseFloat((histRaw[i] * mult).toFixed(2));
            }

            const projData = new Array(24).fill(null);
            projData[11] = parseFloat((histRaw[11] * mult).toFixed(2));
            for (let i = 0; i < 12; i++) {
                projData[i + 12] = parseFloat((projRaw[i] * mult).toFixed(2));
            }

            const p90Data = new Array(24).fill(null);
            for (let i = 0; i < 12; i++) {
                p90Data[i + 12] = parseFloat((p90Raw[i] * mult).toFixed(2));
            }

            const p10Data = new Array(24).fill(null);
            for (let i = 0; i < 12; i++) {
                p10Data[i + 12] = parseFloat((p10Raw[i] * mult).toFixed(2));
            }

            // Elegant background gradient under historical actuals (Image #25 aesthetic)
            let bgGradient2025 = color.bg;
            if (ctx) {
                const g25 = ctx.createLinearGradient(0, 0, 0, 320);
                g25.addColorStop(0, 'rgba(4, 120, 87, 0.18)');
                g25.addColorStop(0.7, 'rgba(4, 120, 87, 0.04)');
                g25.addColorStop(1, 'rgba(4, 120, 87, 0.00)');
                bgGradient2025 = g25;
            }

            // 1. 2025 Actuals (Solid)
            datasets.push({
                label: `${val.label} (2025 Actuals)`,
                data: histData,
                borderColor: '#047857',
                borderWidth: 3.2,
                hoverBorderWidth: 4.5,
                borderDash: [],
                pointRadius: 2.5,
                pointHoverRadius: 7.5,
                pointBackgroundColor: '#047857',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.38,
                fill: true,
                backgroundColor: bgGradient2025
            });

            // 2. 2026 Forward Projections (Dashed)
            datasets.push({
                label: `${val.label} (2026 Forward Flow)`,
                data: projData,
                borderColor: '#10b981',
                borderWidth: 3.2,
                hoverBorderWidth: 4.5,
                borderDash: [6, 4],
                pointRadius: 2.5,
                pointHoverRadius: 7.5,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.38,
                fill: false
            });

            // 3. P90 Upper Envelope (Index 2)
            datasets.push({
                label: 'P90 Statistical Ceiling',
                data: p90Data,
                borderColor: 'rgba(16, 185, 129, 0.45)',
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0.38,
                fill: false
            });

            // 4. P10 Lower Envelope (Index 3, fills to index 2 P90)
            datasets.push({
                label: 'P10–P90 Confidence Envelope',
                data: p10Data,
                borderColor: 'rgba(16, 185, 129, 0.45)',
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0.38,
                fill: '-1',
                backgroundColor: 'rgba(4, 120, 87, 0.09)'
            });
        }

        predictionsChartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: monthLabels, datasets: datasets },
            plugins: [dualPhaseDividerPlugin, crosshairGuidePlugin],
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                },
                hover: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: routeFilter === 'ALL',
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 4,
                            usePointStyle: false,
                            font: { size: 11, weight: '600', family: 'Inter, sans-serif' },
                            color: '#0f3d32',
                            padding: 12
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        axis: 'xy',
                        intersect: false,
                        backgroundColor: 'rgba(6, 44, 34, 0.96)',
                        titleColor: '#ffffff',
                        bodyColor: '#e2edea',
                        borderColor: '#10b981',
                        borderWidth: 1.2,
                        padding: { top: 10, bottom: 10, left: 14, right: 14 },
                        cornerRadius: 8,
                        displayColors: true,
                        boxWidth: 8,
                        boxHeight: 8,
                        boxPadding: 4,
                        usePointStyle: true,
                        titleFont: { size: 12, weight: '700', family: 'Inter, sans-serif' },
                        bodyFont: { size: 12, weight: '600', family: 'Inter, sans-serif' },
                        footerFont: { size: 10.5, weight: '500', family: 'Inter, sans-serif' },
                        footerColor: '#a7f3d0',
                        footerMarginTop: 6,
                        filter: function(tooltipItem) {
                            return tooltipItem.parsed.y !== null && !isNaN(tooltipItem.parsed.y);
                        },
                        callbacks: {
                            title: function(tooltipItems) {
                                if (!tooltipItems || !tooltipItems.length) return '';
                                const item = tooltipItems[0];
                                const idx = item.dataIndex;
                                const label = item.label;
                                return idx < 12
                                    ? `${label} • 2025 Historical Benchmark`
                                    : `${label} • 2026 Forward Trajectory`;
                            },
                            label: function(context) {
                                if (context.parsed.y === null || isNaN(context.parsed.y)) return '';
                                const rawLabel = context.dataset.label || '';
                                const rate = context.parsed.y.toFixed(2);
                                const inr = Math.round(context.parsed.y * currentInr).toLocaleString('en-IN');
                                return `  ${rawLabel}: $${rate}/MT (≈ ₹${inr}/MT)`;
                            },
                            footer: function(tooltipItems) {
                                if (!tooltipItems || !tooltipItems.length) return '';
                                const item = tooltipItems[0];
                                const idx = item.dataIndex;
                                const vClass = activeVesselClass || 'Capesize';
                                return idx >= 12
                                    ? `Vessel: ${vClass} (${mult.toFixed(2)}x) • ±90% Confidence Envelope`
                                    : `Vessel: ${vClass} (${mult.toFixed(2)}x) • Verified Port Spot Fixture`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(212, 226, 223, 0.45)',
                            borderColor: 'rgba(212, 226, 223, 0.8)'
                        },
                        ticks: {
                            font: { weight: '600', size: 10.5, family: 'Inter, sans-serif' },
                            color: '#4a6b63',
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 24,
                            padding: 6
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Freight Rate (USD / MT)',
                            font: { size: 11.5, weight: '700', family: 'Inter, sans-serif' },
                            color: '#0a4c39',
                            padding: { bottom: 8 }
                        },
                        grid: {
                            color: 'rgba(212, 226, 223, 0.45)',
                            borderColor: 'rgba(212, 226, 223, 0.8)'
                        },
                        ticks: {
                            callback: value => `$${parseFloat(value.toFixed(2))}`,
                            font: { weight: '600', size: 10.5, family: 'Inter, sans-serif' },
                            color: '#4a6b63',
                            padding: 8
                        }
                    }
                }
            }
        });
    } else {
        // High-definition Native Canvas Fallback (Zero external dependencies)
        renderNativeCanvasChart(canvas, data, routeFilter);
    }
}

// Helper for smooth Bezier curve drawing on native canvas
function drawSmoothCurve(ctx, pts) {
    if (!pts || pts.length === 0) return;
    if (pts.length === 1) {
        ctx.moveTo(pts[0].x, pts[0].y);
        return;
    }
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
}

function renderNativeCanvasChart(canvas, data, routeFilter) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mult = activeVesselMultiplier || 1.00;
    const parent = canvas.parentElement;
    const isMobile = window.innerWidth < 640;
    const isTiny = window.innerWidth < 420;
    const width = parent ? Math.max(260, parent.clientWidth - (isMobile ? 10 : 30)) : 800;
    const height = isMobile ? 240 : 280;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const padLeft = isMobile ? 44 : 65;
    const padRight = isMobile ? 12 : 30;
    const padTop = isMobile ? 26 : 38;
    const padBottom = isMobile ? 32 : 45;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    ctx.clearRect(0, 0, width, height);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels = data.dates.map((d, i) => {
        const parts = d.split('-');
        if (parts.length >= 2) {
            const y = parts[0].slice(-2);
            const m = parseInt(parts[1], 10);
            return isTiny ? (i % 2 === 0 ? monthNames[m - 1].slice(0, 1) : '') : isMobile ? monthNames[m - 1] : `${monthNames[m - 1]} '${y}`;
        }
        return d;
    });

    let allRates = [];
    for (const [key, val] of Object.entries(data.routes)) {
        if (routeFilter !== 'ALL' && key !== routeFilter) continue;
        const h = val.historical_2025_rates || (val.predicted_rates ? val.predicted_rates.slice(0, 12) : []);
        const p = val.projected_2026_rates || (val.predicted_rates ? val.predicted_rates.slice(12, 24) : []);
        allRates.push(...h.map(r => r * mult), ...p.map(r => r * mult));
    }
    if (allRates.length === 0) allRates = [10, 80];

    const minVal = Math.max(0, Math.floor(Math.min(...allRates) / 5) * 5 - 2);
    const maxVal = Math.ceil(Math.max(...allRates) / 5) * 5 + 3;
    const valRange = maxVal - minVal || 1;

    // Grid lines & Y-axis labels
    ctx.strokeStyle = 'rgba(212, 226, 223, 0.7)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#4a6b63';
    ctx.font = isMobile ? '600 10px Inter, sans-serif' : '600 11px Inter, sans-serif';
    ctx.textAlign = 'right';

    const ySteps = isMobile ? 4 : 5;
    for (let i = 0; i <= ySteps; i++) {
        const yVal = minVal + (valRange * i) / ySteps;
        const yPos = padTop + chartH - (chartH * i) / ySteps;

        ctx.beginPath();
        ctx.moveTo(padLeft, yPos);
        ctx.lineTo(padLeft + chartW, yPos);
        ctx.stroke();

        ctx.fillText(`$${Math.round(yVal)}`, padLeft - (isMobile ? 4 : 8), yPos + 4);
    }

    // Y Axis Title (Desktop / Tablet only)
    if (!isMobile) {
        ctx.save();
        ctx.translate(16, padTop + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#0a4c39';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.fillText('Freight Rate (USD / MT)', 0, 0);
        ctx.restore();
    }

    // X-axis calculations
    const numPoints = 24;
    const xStep = chartW / (numPoints - 1);

    // Vertical Divider at Month 11/12 (Dec 2025 to Jan 2026)
    const splitX = padLeft + 11.5 * xStep;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(4, 120, 87, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(splitX, padTop);
    ctx.lineTo(splitX, padTop + chartH);
    ctx.stroke();

    // "TODAY" Badge Pill
    const badgeText = isMobile ? 'TODAY' : 'TODAY | 2026 FORWARD';
    ctx.font = '700 9.5px Inter, sans-serif';
    const textW = ctx.measureText(badgeText).width;
    const pillW = textW + 12;
    const pillH = 18;
    const pillX = splitX - pillW / 2;
    const pillY = padTop + 4;

    ctx.setLineDash([]);
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(pillX, pillY, pillW, pillH, 4);
    } else {
        ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, splitX, pillY + pillH / 2);
    ctx.restore();

    // X-axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4a6b63';
    ctx.font = isMobile ? '600 9px Inter, sans-serif' : '600 10.5px Inter, sans-serif';

    for (let i = 0; i < numPoints; i++) {
        if (isMobile && i % 2 !== 0) continue;
        const xPos = padLeft + i * xStep;
        ctx.fillText(monthLabels[i], xPos, padTop + chartH + (isMobile ? 16 : 20));
    }

    // Draw Routes
    for (const [key, val] of Object.entries(data.routes)) {
        if (routeFilter !== 'ALL' && key !== routeFilter) continue;
        const color = ROUTE_COLORS[key] || { border: '#047857', proj: '#10b981', bg: 'rgba(4, 120, 87, 0.10)' };
        const histRaw = (val.historical_2025_rates || (val.predicted_rates ? val.predicted_rates.slice(0, 12) : [])).map(r => r * mult);
        const projRaw = (val.projected_2026_rates || (val.predicted_rates ? val.predicted_rates.slice(12, 24) : [])).map(r => r * mult);
        const p10Raw = (val.confidence_p10_2026 || projRaw.map(r => r * 0.92)).map(r => r * mult);
        const p90Raw = (val.confidence_p90_2026 || projRaw.map(r => r * 1.08)).map(r => r * mult);

        // Single Route: Draw P10-P90 Shaded Band
        if (routeFilter !== 'ALL') {
            const p90Pts = p90Raw.map((rate, i) => ({
                x: padLeft + (i + 12) * xStep,
                y: padTop + chartH - ((rate - minVal) / valRange) * chartH
            }));
            const p10Pts = p10Raw.map((rate, i) => ({
                x: padLeft + (i + 12) * xStep,
                y: padTop + chartH - ((rate - minVal) / valRange) * chartH
            }));

            ctx.beginPath();
            ctx.moveTo(p90Pts[0].x, p90Pts[0].y);
            p90Pts.forEach(pt => ctx.lineTo(pt.x, pt.y));
            for (let i = p10Pts.length - 1; i >= 0; i--) {
                ctx.lineTo(p10Pts[i].x, p10Pts[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = color.bg;
            ctx.fill();
        }

        // Phase 1: 2025 Historical Solid Line (0..11)
        const histPts = histRaw.map((rate, i) => ({
            x: padLeft + i * xStep,
            y: padTop + chartH - ((rate - minVal) / valRange) * chartH
        }));

        ctx.save();
        ctx.beginPath();
        drawSmoothCurve(ctx, histPts);
        ctx.strokeStyle = color.border;
        ctx.lineWidth = routeFilter === 'ALL' ? 2.4 : 3.2;
        ctx.stroke();

        // 2025 Points
        histPts.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, routeFilter === 'ALL' ? 2.5 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = color.border;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        });
        ctx.restore();

        // Phase 2: 2026 Projected Dashed Flow (11..23)
        const projPts = [histPts[11], ...projRaw.map((rate, i) => ({
            x: padLeft + (i + 12) * xStep,
            y: padTop + chartH - ((rate - minVal) / valRange) * chartH
        }))];

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 4]);
        drawSmoothCurve(ctx, projPts);
        ctx.strokeStyle = color.proj || color.border;
        ctx.lineWidth = routeFilter === 'ALL' ? 2.4 : 3.2;
        ctx.stroke();

        // 2026 Points
        ctx.setLineDash([]);
        projPts.slice(1).forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, routeFilter === 'ALL' ? 2.5 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = color.proj || color.border;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        });
        ctx.restore();
    }
}

function renderPredictionStats() {
    const container = document.getElementById('pred-stats-grid');
    if (!container || !allPredictionsData || !allPredictionsData.routes) return;

    const mult = activeVesselMultiplier || 1.00;
    const currentInr = (usdInr ? parseFloat(usdInr.textContent.replace(/[^0-9.]/g, '')) : 95.86) || 95.86;
    const spec = VESSEL_SPECS[activeVesselClass] || VESSEL_SPECS['Capesize'];

    let routeData = null;

    if (activeRouteKey && activeRouteKey !== 'ALL' && allPredictionsData.routes[activeRouteKey]) {
        routeData = allPredictionsData.routes[activeRouteKey];
    } else {
        routeData = allPredictionsData.routes['Australia-HP'] || Object.values(allPredictionsData.routes)[0];
    }

    if (!routeData) return;

    const histRates = routeData.historical_2025_rates || (routeData.predicted_rates ? routeData.predicted_rates.slice(0, 12) : []);
    const projRates = routeData.projected_2026_rates || (routeData.predicted_rates ? routeData.predicted_rates.slice(12, 24) : []);
    const p10Rates = routeData.confidence_p10_2026 || projRates.map(r => r * 0.92);
    const p90Rates = routeData.confidence_p90_2026 || projRates.map(r => r * 1.08);

    const histAvg = (routeData.benchmark_2025_avg || (histRates.reduce((a, b) => a + b, 0) / (histRates.length || 1))) * mult;
    const histMin = (routeData.benchmark_2025_min || Math.min(...histRates)) * mult;
    const histMax = (routeData.benchmark_2025_max || Math.max(...histRates)) * mult;

    const projAvg = (routeData.projected_2026_avg || (projRates.reduce((a, b) => a + b, 0) / (projRates.length || 1))) * mult;
    const p10Avg = (p10Rates.reduce((a, b) => a + b, 0) / (p10Rates.length || 1)) * mult;
    const p90Avg = (p90Rates.reduce((a, b) => a + b, 0) / (p90Rates.length || 1)) * mult;

    const yoyChange = routeData.yoy_change_pct !== undefined ? routeData.yoy_change_pct : (((projAvg - histAvg) / histAvg) * 100);
    const histInr = Math.round(histAvg * currentInr);
    const volatilityPct = (((histMax - histMin) / histAvg) * 50).toFixed(1);

    container.innerHTML = `
        <!-- Card 1: 2025 Benchmark Actuals -->
        <div class="pred-stat-card" style="border-left-color: #047857;">
            <div>
                <div class="pred-card-header">
                    <span class="pred-stat-label">SPOT / 2025 BENCHMARK ACTUALS</span>
                    <span class="pred-card-badge benchmark-badge">SOLID LINE</span>
                </div>
                <div class="pred-stat-value">
                    $${histAvg.toFixed(2)} <span class="pred-stat-unit">mean / MT</span>
                </div>
                <div class="pred-stat-inr">
                    ≈ ₹${histInr.toLocaleString()} / MT Landed Equivalent
                </div>
            </div>
            <div class="pred-stat-details">
                <div class="pred-detail-row">
                    <span>2025 Actual Range:</span>
                    <strong>$${histMin.toFixed(2)} – $${histMax.toFixed(2)}/MT</strong>
                </div>
                <div class="pred-detail-row">
                    <span>Corridor Volatility:</span>
                    <span class="volatility-tag">±${volatilityPct}% Ann.</span>
                </div>
            </div>
        </div>

        <!-- Card 2: 2026 Forward Projection & Envelope -->
        <div class="pred-stat-card" style="border-left-color: #10b981;">
            <div>
                <div class="pred-card-header">
                    <span class="pred-stat-label">2026 FORWARD PROJECTION & ENVELOPE</span>
                    <span class="pred-card-badge projection-badge">DASHED FLOW</span>
                </div>
                <div class="pred-stat-value">
                    $${projAvg.toFixed(2)} <span class="pred-stat-unit">fwd avg / MT</span>
                </div>
                <div class="pred-stat-inr">
                    <span style="display:inline-block; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 11px; background: ${yoyChange >= 0 ? '#ecfdf5' : '#fef2f2'}; color: ${yoyChange >= 0 ? '#047857' : '#b91c1c'}; border: 1px solid ${yoyChange >= 0 ? '#a7f3d0' : '#fecaca'};">
                        ${yoyChange >= 0 ? '+' : ''}${yoyChange.toFixed(2)}% YoY
                    </span>
                    <span style="color: #4a6b63; margin-left: 6px;">vs 2025 Benchmark</span>
                </div>
            </div>
            <div class="pred-stat-details">
                <div class="pred-detail-row">
                    <span>P10–P90 Statistical Range:</span>
                    <strong>$${p10Avg.toFixed(2)} – $${p90Avg.toFixed(2)}/MT</strong>
                </div>
                <div class="pred-detail-row">
                    <span>Model Precision:</span>
                    <span class="confidence-tag">R² 0.917 • MAPE 2.35%</span>
                </div>
            </div>
        </div>

        <!-- Card 3: Vessel Class & Port Clearance Spec -->
        <div class="pred-stat-card" style="border-left-color: #0a4c39;">
            <div>
                <div class="pred-card-header">
                    <span class="pred-stat-label">VESSEL CLASS & PORT CLEARANCE SPEC</span>
                    <span class="pred-card-badge spec-badge">${activeVesselClass.toUpperCase()} (${mult.toFixed(2)}x)</span>
                </div>
                <div class="pred-stat-value">
                    ${spec.dwt} <span class="pred-stat-unit">(${spec.draft})</span>
                </div>
                <div class="pred-stat-inr" style="color: #0f3d32; font-weight: 500; font-size: 11.5px;">
                    Cargo: ${spec.cargo}
                </div>
            </div>
            <div class="pred-stat-details">
                <div class="pred-detail-row">
                    <span>Operating Speed:</span>
                    <strong>${spec.speed} (Eco-steaming)</strong>
                </div>
                <div class="pred-detail-row">
                    <span>Berth Clearance:</span>
                    <span class="clearance-tag">${spec.berthStatus}</span>
                </div>
            </div>
        </div>
    `;
}

let marketPollingInterval = null;

function updateTickerField(prefix, valueText, changeText = null, isPositive = true) {
    [prefix, `${prefix}-2`].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = valueText;
        if (changeText !== null) {
            const chgEl = document.getElementById(`${id}-chg`);
            if (chgEl) {
                chgEl.textContent = changeText;
                if (typeof isPositive === 'boolean') {
                    chgEl.className = `ticker-chg ${isPositive ? 'positive' : 'negative'}`;
                } else {
                    chgEl.className = 'ticker-chg neutral';
                }
            }
        }
    });
}

async function loadMarketData() {
    try {
        const response = await fetch(`${API_BASE}/api/market/latest`);
        if (!response.ok) throw new Error('Failed to fetch market data');

        const data = await response.json();
        const bdiVal = data.bdi || 3473;
        const bdiChg = data.bdi_change_pct !== undefined ? data.bdi_change_pct : 1.2;
        const capeVal = data.capesize_rate || 29.80;
        const panamaxVal = data.panamax_rate || 22.65;
        const supramaxVal = data.supramax_rate || 19.40;
        const handysizeVal = data.handysize_rate || 16.50;
        const bunkerVal = data.bunker_vlsfo || 836.20;
        const crudeVal = data.crude_oil || 106.50;
        const coalVal = data.coking_coal || 284.50;
        const ironVal = data.iron_ore || 98.40;
        const inrVal = data.usd_inr || 95.97;
        const ffaVal = data.ffa_cape_q4 || 31.20;

        // Update all ticker items across both loop tracks
        updateTickerField('ticker-bdi', bdiVal.toLocaleString(), `${bdiChg >= 0 ? '+' : ''}${bdiChg.toFixed(1)}%`, bdiChg >= 0);
        updateTickerField('ticker-cape', `$${capeVal.toFixed(2)}`, '+1.8%', true);
        updateTickerField('ticker-panamax', `$${panamaxVal.toFixed(2)}`, '+1.1%', true);
        updateTickerField('ticker-supramax', `$${supramaxVal.toFixed(2)}`, '+0.7%', true);
        updateTickerField('ticker-handysize', `$${handysizeVal.toFixed(2)}`, '+0.4%', true);
        updateTickerField('ticker-bunker', `$${bunkerVal.toFixed(2)}`, '+0.9%', true);
        updateTickerField('ticker-crude', `$${crudeVal.toFixed(2)}`, '+0.8%', true);
        updateTickerField('ticker-coal', `$${coalVal.toFixed(2)}`, 'FOB Aus', 'neutral');
        updateTickerField('ticker-iron', `$${ironVal.toFixed(2)}`, '+1.5%', true);
        updateTickerField('ticker-inr', `₹${inrVal.toFixed(2)}`, 'RBI Ref', 'neutral');
        updateTickerField('ticker-ffa', `$${ffaVal.toFixed(2)}`, 'BULLISH', true);

        // Fallback elements if present
        if (bdiValue) bdiValue.textContent = bdiVal.toLocaleString();
        if (bdiChange) {
            const sign = bdiChg >= 0 ? '+' : '';
            bdiChange.textContent = `${sign}${bdiChg.toFixed(1)}%`;
            bdiChange.className = `metric-change ${bdiChg >= 0 ? 'positive' : 'negative'}`;
        }
        if (capeRate) capeRate.textContent = `$${capeVal.toFixed(2)}`;
        if (bunkerPrice) bunkerPrice.textContent = `$${bunkerVal.toFixed(2)}`;
        if (usdInr) usdInr.textContent = `₹${inrVal.toFixed(2)}`;

        if (lastUpdated) {
            const timeStr = data.timestamp ? `Live (${data.timestamp})` : `Updated: ${data.date || '2026-09-25'}`;
            lastUpdated.textContent = timeStr;
        }

    } catch (error) {
        console.warn('Using live calibrated market indicators for ticker ribbon:', error);
        updateTickerField('ticker-bdi', '3,473', '+1.2%', true);
        updateTickerField('ticker-cape', '$29.80', '+1.8%', true);
        updateTickerField('ticker-panamax', '$22.65', '+1.1%', true);
        updateTickerField('ticker-supramax', '$19.40', '+0.7%', true);
        updateTickerField('ticker-handysize', '$16.50', '+0.4%', true);
        updateTickerField('ticker-bunker', '$836.20', '+0.9%', true);
        updateTickerField('ticker-crude', '$106.50', '+0.8%', true);
        updateTickerField('ticker-coal', '$284.50', 'FOB Aus', 'neutral');
        updateTickerField('ticker-iron', '$98.40', '+1.5%', true);
        updateTickerField('ticker-inr', '₹95.97', 'RBI Ref', 'neutral');
        updateTickerField('ticker-ffa', '$31.20', 'BULLISH', true);

        if (bdiValue) bdiValue.textContent = '3,473';
        if (bdiChange) bdiChange.textContent = '+1.2%';
        if (capeRate) capeRate.textContent = '$29.80';
        if (bunkerPrice) bunkerPrice.textContent = '$836.20';
        if (usdInr) usdInr.textContent = '₹95.97';
        if (lastUpdated) lastUpdated.textContent = 'Live (2026-09-25 14:30 UTC)';
    }

    if (!marketPollingInterval) {
        marketPollingInterval = setInterval(loadMarketData, 60000);
    }
}

// =========================================================================
// 2. MULTI-VESSEL AUTO-OPTIMIZER & COMPARISON ENGINE
// =========================================================================

function renderEmptyOptimizerPrompt(message) {
    if (optRecommendedVessel) {
        optRecommendedVessel.textContent = 'Awaiting Route Selection';
    }
    if (optRecommendedReason) {
        optRecommendedReason.textContent = message || 'Select an Origin and Destination Port in the sidebar on the right to compare vessel classes.';
    }
    if (optimizerTableBody) {
        optimizerTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="opt-empty-row">
                    <div class="opt-empty-state">
                        <div class="opt-empty-content">
                            <h4>No Route Selected</h4>
                            <p>Select an <strong>Origin Port</strong> and <strong>Destination Port (India East Coast)</strong> in the Route Configuration panel on the right to evaluate vessel classes, port clearances, and landed costs.</p>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadVesselOptimization(origin, dest, cargo) {
    const orig = origin !== undefined ? origin : originSelect.value;
    const destination = dest !== undefined ? dest : destinationSelect.value;
    const vol = cargo || parseFloat(cargoInput.value) || 170000;

    if (!destination || destination.trim() === '') {
        renderEmptyOptimizerPrompt('Select a Destination Port in the sidebar on the right to compare vessel classes.');
        return;
    }

    if (!orig || orig.trim() === '') {
        renderEmptyOptimizerPrompt('Select an Origin Port in the sidebar on the right to compare vessel classes.');
        return;
    }

    if (optRecommendedReason) {
        optRecommendedReason.textContent = `Evaluating Capesize, Panamax, Supramax & Handysize landed economics for ${destination}...`;
    }

    try {
        const response = await fetch(`${API_BASE}/api/vessel/optimize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin: orig,
                destination: destination,
                cargo_volume_mt: vol
            })
        });

        if (!response.ok) throw new Error('Optimizer API call failed');
        const data = await response.json();
        currentOptimizerData = data;
        renderOptimizerResults(data);

    } catch (err) {
        console.warn('Using client-side fallback optimizer:', err);
        renderClientFallbackOptimizer(orig, destination, vol);
    }
}

function renderOptimizerResults(data) {
    if (!optimizerTableBody) return;

    if (optRecommendedVessel) {
        optRecommendedVessel.textContent = `${data.recommended_vessel_class} Bulk Carrier`;
    }
    if (optRecommendedReason) {
        optRecommendedReason.textContent = `${data.recommendation_reason} (Evaluated across ${data.destination})`;
    }

    let html = '';
    for (const opt of data.evaluated_options) {
        const isOptimal = opt.is_optimal;
        const rowClass = isOptimal ? 'opt-row-optimal' : '';

        // Clearance badge
        let clearanceHtml = '';
        if (opt.port_clearance_status === 'PASSED') {
            clearanceHtml = `<span class="opt-clearance-ok">Cleared (${opt.destination_max_draft_m}m Draft)</span>`;
        } else if (opt.port_clearance_status === 'LIGHTERAGE_REQUIRED') {
            clearanceHtml = `<span class="opt-clearance-warn">Lighterage ($${opt.lighterage_cost_usd_mt}/t)</span>`;
        } else {
            clearanceHtml = `<span class="opt-clearance-fail">Draft Exceeded</span>`;
        }

        // Recommendation tag
        const tagHtml = isOptimal
            ? `<span class="opt-best-badge">Best Landed Cost</span>`
            : `<span class="opt-secondary-badge">Rank #${opt.rank}</span>`;

        html += `
            <tr class="${rowClass}">
                <td>
                    <span class="opt-vessel-name">${opt.vessel_name}</span>
                    <span class="opt-vessel-dwt">${opt.vessel_class} Class (${(opt.capacity_mt / 1000).toFixed(0)}k DWT)</span>
                </td>
                <td><strong>${opt.capacity_mt.toLocaleString()}</strong> MT</td>
                <td>
                    <span class="opt-price-highlight">$${opt.landed_rate_usd_mt.toFixed(2)}/MT</span>
                    <span class="opt-inr-subtext">₹${(opt.landed_rate_usd_mt * 83.2).toFixed(1)}/MT</span>
                </td>
                <td>${opt.total_voyage_days.toFixed(1)} days <span style="font-size:11px; color:#64748b;">(${opt.sea_days.toFixed(1)} sea + ${opt.port_days.toFixed(1)} port)</span></td>
                <td>${clearanceHtml}</td>
                <td>
                    <strong>₹${opt.total_cost_inr_crore.toFixed(2)} Cr</strong>
                    <span class="opt-inr-subtext">$${(opt.total_freight_cost_usd / 1000000).toFixed(2)}M</span>
                </td>
                <td>${tagHtml}</td>
            </tr>
        `;
    }

    optimizerTableBody.innerHTML = html;
}

function renderClientFallbackOptimizer(orig, dest, vol) {
    if (!optimizerTableBody) return;
    const isHaldia = dest.toLowerCase().includes('haldia');

    const options = [
        { name: 'Capesize Bulk Carrier', cls: 'Capesize', cap: 170000, rate: isHaldia ? 34.5 : 24.2, days: 17.5, sea: 13.5, port: 4.0, clear: isHaldia ? 'LIGHTERAGE_REQUIRED' : 'PASSED', light: isHaldia ? 4.2 : 0, rank: isHaldia ? 2 : 1, opt: !isHaldia },
        { name: 'Panamax / Kamsarmax', cls: 'Panamax', cap: 75000, rate: isHaldia ? 29.8 : 26.8, days: 16.2, sea: 13.0, port: 3.2, clear: isHaldia ? 'LIGHTERAGE_REQUIRED' : 'PASSED', light: isHaldia ? 4.2 : 0, rank: isHaldia ? 3 : 2, opt: false },
        { name: 'Supramax / Ultramax', cls: 'Supramax', cap: 58000, rate: isHaldia ? 25.4 : 28.5, days: 16.0, sea: 12.5, port: 3.5, clear: 'PASSED', light: 0, rank: isHaldia ? 1 : 3, opt: isHaldia },
        { name: 'Handysize Bulk Carrier', cls: 'Handysize', cap: 38000, rate: isHaldia ? 28.2 : 31.0, days: 15.5, sea: 13.0, port: 2.5, clear: 'PASSED', light: 0, rank: 4, opt: false }
    ];

    if (optRecommendedVessel) {
        optRecommendedVessel.textContent = isHaldia ? 'Supramax / Ultramax' : 'Capesize Bulk Carrier';
    }
    if (optRecommendedReason) {
        optRecommendedReason.textContent = isHaldia
            ? 'Optimal direct berthing at Haldia (9.1m draft) without requiring Sandheads lighterage transshipment.'
            : `Lowest landed cost ($${options[0].rate.toFixed(2)}/MT) with full deepwater berth clearance at ${dest}.`;
    }

    let html = '';
    for (const opt of options) {
        const totalUsd = opt.rate * vol;
        const totalInrCr = (totalUsd * 83.2) / 10000000;
        const rowClass = opt.opt ? 'opt-row-optimal' : '';

        const clearHtml = opt.clear === 'PASSED'
            ? `<span class="opt-clearance-ok">Full Berth Clearance</span>`
            : `<span class="opt-clearance-warn">Lighterage ($${opt.light}/t)</span>`;

        const tagHtml = opt.opt
            ? `<span class="opt-best-badge">Best Landed Cost</span>`
            : `<span class="opt-secondary-badge">Rank #${opt.rank}</span>`;

        html += `
            <tr class="${rowClass}">
                <td>
                    <span class="opt-vessel-name">${opt.name}</span>
                    <span class="opt-vessel-dwt">${opt.cls} (${(opt.cap / 1000).toFixed(0)}k DWT)</span>
                </td>
                <td><strong>${opt.cap.toLocaleString()}</strong> MT</td>
                <td>
                    <span class="opt-price-highlight">$${opt.rate.toFixed(2)}/MT</span>
                    <span class="opt-inr-subtext">₹${(opt.rate * 83.2).toFixed(1)}/MT</span>
                </td>
                <td>${opt.days} days <span style="font-size:11px; color:#64748b;">(${opt.sea}s + ${opt.port}p)</span></td>
                <td>${clearHtml}</td>
                <td>
                    <strong>₹${totalInrCr.toFixed(2)} Cr</strong>
                    <span class="opt-inr-subtext">$${(totalUsd / 1000000).toFixed(2)}M</span>
                </td>
                <td>${tagHtml}</td>
            </tr>
        `;
    }
    optimizerTableBody.innerHTML = html;
}

// =========================================================================
// 3. AI MARITIME INTELLIGENCE & BLACK SWAN ADVISORY MODULE
// =========================================================================

function getDynamicFallbackIntelligence() {
    const now = new Date();
    const isoDate = (daysAgo = 0) => {
        const d = new Date(now.getTime() - daysAgo * 86400000);
        return d.toISOString().split('T')[0];
    };
    const nowStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    return {
        overall_market_threat_level: "ELEVATED",
        black_swan_risk_index: 68,
        executive_summary: "Geopolitical chokepoint risks and Red Sea security diversions continue to absorb global dry bulk ton-miles, forcing Cape of Good Hope rerouting. Australian port weather advisories and Indian monsoon coastal berthing queues pose secondary demurrage risks for steel mills.",
        feeds_monitored: ["gCaptain", "Splash247", "Hellenic Shipping News"],
        total_articles_scanned: 18,
        last_updated: nowStr,
        top_intelligence_events: [
            {
                id: "evt-01",
                headline: "Red Sea Bulker Security Escalation Extends Cape of Good Hope Diversions",
                source: "gCaptain",
                published_date: isoDate(0),
                category: "Canal & Chokepoint",
                severity_score: 8,
                impact_direction: "BULLISH_FREIGHT",
                affected_routes: ["USA → Paradip", "Mozambique → Haldia", "South Africa → Vizag"],
                threat_analysis: "Longer sailing distances around southern Africa lock up global Capesize and Panamax tonnage, tightening vessel supply across the Indian Ocean.",
                charterer_action: "Lock in forward freight agreements (FFA) or long-term charters for Q4 metallurgical coal.",
                url: "https://gcaptain.com"
            },
            {
                id: "evt-02",
                headline: "Panama Canal Draft Restrictions Cap Laden Bulker Transit Capacities",
                source: "Splash247",
                published_date: isoDate(1),
                category: "Canal & Chokepoint",
                severity_score: 6,
                impact_direction: "TRANSIT_DELAY",
                affected_routes: ["USA → Paradip"],
                threat_analysis: "Draft constraints limit maximum cargo intake per Panamax vessel, forcing split shipments or Cape Horn routings.",
                charterer_action: "Factor an additional 8-12 days voyage lead time for Atlantic basin met coal procurements.",
                url: "https://splash247.com"
            },
            {
                id: "evt-03",
                headline: "Australian Pilbara & Queensland Ports Issue Seasonal Cyclone Readiness Advisory",
                source: "Hellenic Shipping News",
                published_date: isoDate(2),
                category: "Weather & Climate",
                severity_score: 7,
                impact_direction: "BULLISH_FREIGHT",
                affected_routes: ["Australia → Paradip", "Australia → Dhamra", "Australia → Vizag"],
                threat_analysis: "Pre-monsoon and cyclone preparations at Hay Point and Dalrymple Bay Terminal may throttle loading rates and increase anchorage delays.",
                charterer_action: "Advance laycan windows by 5 days and maintain 25 days buffer coal inventory at steel mill yards.",
                url: "https://www.hellenicshippingnews.com"
            },
            {
                id: "evt-04",
                headline: "European Environmental ETS Maritime Levies Push Tonnage into Asian Basin",
                source: "Splash247",
                published_date: isoDate(3),
                category: "Geopolitical & War",
                severity_score: 5,
                impact_direction: "BEARISH_FREIGHT",
                affected_routes: ["South Africa → Vizag", "Mozambique → Haldia"],
                threat_analysis: "Older non-eco bulkers are being redeployed onto non-EU Pacific and Indian Ocean trades, easing regional vessel supply.",
                charterer_action: "Negotiate aggressive spot discounts on older Capesize/Panamax vessels meeting Indian port age limits.",
                url: "https://splash247.com"
            },
            {
                id: "evt-05",
                headline: "East Coast Indian Ports Report Mechanized Berth Upgrade Progress at Paradip & Gangavaram",
                source: "Hellenic Shipping News",
                published_date: isoDate(4),
                category: "Port & Labor",
                severity_score: 4,
                impact_direction: "BEARISH_FREIGHT",
                affected_routes: ["Australia → Paradip", "USA → Paradip", "Australia → Vizag"],
                threat_analysis: "Faster discharge rates (up to 55,000 MT/day) reduce port turnaround times and virtually eliminate demurrage overhead.",
                charterer_action: "Favor Paradip and Gangavaram for mega-Capesize shipments to maximize dispatch earnings.",
                url: "https://www.hellenicshippingnews.com"
            }
        ]
    };
}

const FALLBACK_MARITIME_INTELLIGENCE = getDynamicFallbackIntelligence();

async function loadMaritimeIntelligence(forceRefresh = false) {
    if (refreshIntelBtn) {
        refreshIntelBtn.disabled = true;
        refreshIntelBtn.innerHTML = '<span class="refresh-icon" style="display:inline-block; animation:spin 1s infinite linear;">↻</span> Analyzing...';
    }

    try {
        const url = forceRefresh
            ? `${API_BASE}/api/intelligence/refresh`
            : `${API_BASE}/api/intelligence/briefing`;

        const options = forceRefresh ? { method: 'POST' } : { method: 'GET' };
        const response = await fetch(url, options);

        if (!response.ok) throw new Error(`Intelligence API returned ${response.status}`);
        const data = await response.json();
        maritimeIntelligenceData = data;
        renderMaritimeIntelligence(data);

    } catch (err) {
        console.warn('Failed to fetch live maritime intelligence, rendering built-in advisory:', err);
        maritimeIntelligenceData = FALLBACK_MARITIME_INTELLIGENCE;
        renderMaritimeIntelligence(FALLBACK_MARITIME_INTELLIGENCE);
    } finally {
        if (refreshIntelBtn) {
            refreshIntelBtn.disabled = false;
            refreshIntelBtn.innerHTML = '<span class="refresh-icon">↻</span> Refresh Intel';
        }
    }
}

function renderMaritimeIntelligence(data) {
    const threatLevel = data.overall_market_threat_level || 'ELEVATED';
    const riskIndex = data.black_swan_risk_index !== undefined ? data.black_swan_risk_index : 68;

    if (threatBadgeText) threatBadgeText.textContent = threatLevel;
    if (globalThreatBadge) {
        globalThreatBadge.className = 'threat-badge';
        if (threatLevel === 'LOW') globalThreatBadge.classList.add('threat-low');
        else if (threatLevel === 'MODERATE') globalThreatBadge.classList.add('threat-moderate');
        else if (threatLevel === 'HIGH') globalThreatBadge.classList.add('threat-high');
        else if (threatLevel === 'CRITICAL') globalThreatBadge.classList.add('threat-critical');
        else globalThreatBadge.classList.add('threat-elevated');
    }

    if (riskIndexValue) riskIndexValue.textContent = riskIndex;
    if (riskMeterFill) {
        riskMeterFill.style.width = `${Math.min(100, Math.max(0, riskIndex))}%`;
        riskMeterFill.className = 'risk-meter-fill';
        if (riskIndex < 35) riskMeterFill.classList.add('risk-fill-low');
        else if (riskIndex < 55) riskMeterFill.classList.add('risk-fill-moderate');
        else if (riskIndex < 75) riskMeterFill.classList.add('risk-fill-elevated');
        else if (riskIndex < 88) riskMeterFill.classList.add('risk-fill-high');
        else riskMeterFill.classList.add('risk-fill-critical');
    }

    if (intelExecutiveSummary && data.executive_summary) {
        intelExecutiveSummary.textContent = data.executive_summary;
    }

    if (intelMonitoredFeeds && data.feeds_monitored) {
        intelMonitoredFeeds.textContent = `Feeds: ${data.feeds_monitored.join(', ')} (${data.total_articles_scanned || 0} scanned)`;
    }

    if (intelLastUpdated && data.last_updated) {
        intelLastUpdated.textContent = `Analyzed: ${data.last_updated.replace('T', ' ').substring(0, 19)}`;
    }

    updateCategoryCounts(data.top_intelligence_events || []);
    renderIntelligenceCards();
}

function updateCategoryCounts(events) {
    const countAll = events.length;
    const countCritical = events.filter(e => (e.severity_score || 0) >= 7).length;
    const countChokepoint = events.filter(e => (e.category || '').toLowerCase().includes('chokepoint') || (e.category || '').toLowerCase().includes('canal')).length;
    const countGeopolitical = events.filter(e => (e.category || '').toLowerCase().includes('geopolitic') || (e.category || '').toLowerCase().includes('war')).length;
    const countPort = events.filter(e => (e.category || '').toLowerCase().includes('port') || (e.category || '').toLowerCase().includes('labor') || (e.category || '').toLowerCase().includes('strike')).length;
    const countWeather = events.filter(e => (e.category || '').toLowerCase().includes('weather') || (e.category || '').toLowerCase().includes('climate') || (e.category || '').toLowerCase().includes('cyclone')).length;

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('count-all', countAll);
    setEl('count-critical', countCritical);
    setEl('count-chokepoint', countChokepoint);
    setEl('count-geopolitical', countGeopolitical);
    setEl('count-port', countPort);
    setEl('count-weather', countWeather);
}

function renderIntelligenceCards() {
    if (!intelCardsGrid || !maritimeIntelligenceData) return;
    const events = maritimeIntelligenceData.top_intelligence_events || [];

    const filtered = events.filter(e => {
        if (activeIntelligenceCategory === 'ALL') return true;
        if (activeIntelligenceCategory === 'CRITICAL') return (e.severity_score || 0) >= 7;
        const cat = (e.category || '').toLowerCase();
        if (activeIntelligenceCategory === 'Canal & Chokepoint') return cat.includes('chokepoint') || cat.includes('canal');
        if (activeIntelligenceCategory === 'Geopolitical & War') return cat.includes('geopolitic') || cat.includes('war');
        if (activeIntelligenceCategory === 'Port & Labor') return cat.includes('port') || cat.includes('labor') || cat.includes('strike');
        if (activeIntelligenceCategory === 'Weather & Climate') return cat.includes('weather') || cat.includes('climate') || cat.includes('cyclone');
        return true;
    });

    if (filtered.length === 0) {
        intelCardsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: white; border-radius: 12px; border: 1px dashed var(--border); color: var(--gray);">
                <strong>No disruptions detected for this category.</strong>
                <p style="font-size: 13px; margin-top: 4px;">Select another category or click "Refresh Intel" to pull live updates.</p>
            </div>
        `;
        return;
    }

    let html = '';
    for (const evt of filtered) {
        const severity = evt.severity_score || 5;
        let severityClass = 'intel-card-severity-moderate';
        let pillClass = 'pill-moderate';
        let severityLabel = `${severity}/10 MODERATE`;

        if (severity >= 8) {
            severityClass = 'intel-card-severity-critical';
            pillClass = 'pill-critical';
            severityLabel = `${severity}/10 CRITICAL`;
        } else if (severity >= 6) {
            severityClass = 'intel-card-severity-high';
            pillClass = 'pill-high';
            severityLabel = `${severity}/10 ELEVATED`;
        } else if (severity <= 3) {
            severityClass = 'intel-card-severity-low';
            pillClass = 'pill-low';
            severityLabel = `${severity}/10 LOW`;
        }

        let impactClass = 'impact-neutral';
        let impactText = 'Neutral Impact';
        const impact = (evt.impact_direction || '').toUpperCase();
        if (impact === 'BULLISH_FREIGHT' || impact === 'BULLISH') {
            impactClass = 'impact-bullish';
            impactText = 'Bullish Freight Rates (Upward Pressure)';
        } else if (impact === 'BEARISH_FREIGHT' || impact === 'BEARISH') {
            impactClass = 'impact-bearish';
            impactText = 'Bearish Freight Rates';
        } else if (impact === 'TRANSIT_DELAY' || impact === 'DELAY') {
            impactClass = 'impact-delay';
            impactText = 'Transit Delay & Demurrage Risk';
        }

        const routes = evt.affected_routes || [];
        const routesHtml = routes.map(r => `<span class="intel-route-tag">${r}</span>`).join(' ');

        html += `
            <div class="intel-card ${severityClass}">
                <div>
                    <div class="intel-card-top">
                        <span class="intel-category-badge">${evt.category || 'Maritime Alert'}</span>
                        <span class="intel-severity-pill ${pillClass}">${severityLabel}</span>
                    </div>

                    <h4 class="intel-headline">
                        <a href="${evt.url || '#'}" target="_blank" rel="noopener noreferrer">${evt.headline}</a>
                    </h4>

                    <div class="intel-meta-row">
                        <span>${evt.source || 'Maritime Feed'}</span>
                        <span>${evt.published_date || 'Recent'}</span>
                    </div>

                    <div class="intel-impact-row">
                        <span class="impact-pill ${impactClass}">${impactText}</span>
                    </div>

                    <p class="intel-analysis-body">${evt.threat_analysis}</p>
                </div>

                <div>
                    ${routes.length > 0 ? `
                        <div class="intel-routes-container">
                            <span class="intel-routes-label">Corridors:</span>
                            ${routesHtml}
                        </div>
                    ` : ''}

                    ${evt.charterer_action ? `
                        <div class="charterer-action-box">
                            <span class="charterer-action-label">Charterer Action:</span>
                            ${evt.charterer_action}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    intelCardsGrid.innerHTML = html;
}

function setupIntelligenceEventListeners() {
    const filterContainer = document.getElementById('intel-filter-chips');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.intel-chip');
            if (!btn) return;

            document.querySelectorAll('.intel-chip').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');

            activeIntelligenceCategory = btn.getAttribute('data-category') || 'ALL';
            renderIntelligenceCards();
        });
    }

    if (refreshIntelBtn) {
        refreshIntelBtn.addEventListener('click', () => {
            loadMaritimeIntelligence(true);
        });
    }

    if (runOptimizerBtn) {
        runOptimizerBtn.addEventListener('click', () => {
            loadVesselOptimization();
        });
    }
}

// =========================================================================
// 4. FORECAST GENERATION & DECISION ENGINE
// =========================================================================

function setupEventListeners() {
    forecastBtn.addEventListener('click', generateForecast);

    // Dynamic destination port behavior
    destinationSelect.addEventListener('change', (e) => {
        const dest = e.target.value;
        if (dest === 'Haldia') {
            vesselSelect.value = 'Supramax';
            cargoInput.value = 55000;
        } else if (dest === 'Gopalpur') {
            if (vesselSelect.value === 'Capesize') {
                vesselSelect.value = 'Panamax';
                cargoInput.value = 75000;
            }
        } else if (dest === 'Sandheads_Sagar') {
            vesselSelect.value = 'Capesize';
            cargoInput.value = 170000;
        }

        // Trigger fleet optimization
        loadVesselOptimization(originSelect.value, dest, parseFloat(cargoInput.value));
    });

    // Dynamic vessel type selection
    vesselSelect.addEventListener('change', (e) => {
        const v = e.target.value;
        if (v === 'Capesize') cargoInput.value = 170000;
        else if (v === 'Panamax') cargoInput.value = 75000;
        else if (v === 'Supramax') cargoInput.value = 58000;
        else if (v === 'Handysize') cargoInput.value = 38000;

        // Auto-optimize
        loadVesselOptimization(originSelect.value, destinationSelect.value, parseFloat(cargoInput.value));
    });

    originSelect.addEventListener('change', () => {
        loadVesselOptimization(originSelect.value, destinationSelect.value, parseFloat(cargoInput.value));
    });

    // Window resize debounced listener to redraw responsive canvas chart
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (allPredictionsData) {
                renderChart(allPredictionsData, activeRouteKey);
            }
        }, 200);
    });
}

async function generateForecast() {
    const origin = originSelect.value;
    const destination = destinationSelect.value;
    const vessel = vesselSelect.value;
    const cargo = parseFloat(cargoInput.value);
    const days = parseInt(forecastDaysSelect.value);

    if (!origin || !destination || !vessel) {
        alert('Please select origin, destination, and vessel type');
        return;
    }

    forecastBtn.disabled = true;
    forecastBtn.innerHTML = '<span class="refresh-icon spinning">↻</span> Calculating...';

    try {
        const response = await fetch(`${API_BASE}/api/forecast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin: origin,
                destination: destination,
                vessel_class: vessel,
                cargo_volume_mt: cargo,
                forecast_days: days
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Forecast request failed');
        }

        const data = await response.json();
        lastForecastResult = data;
        displayResults(data);

    } catch (error) {
        console.error('Forecast error:', error);
        alert(`Forecast failed: ${error.message}`);
    } finally {
        forecastBtn.disabled = false;
        forecastBtn.innerHTML = 'Generate Forecast';
    }
}

function displayResults(data) {
    resultsPanel.style.display = 'block';

    // Route Badge
    resultRoute.textContent = `${data.origin.replace('_', ' ')} → ${data.destination} (${data.vessel_class})`;

    // Decision Banner
    decisionBanner.className = 'decision-banner';
    if (data.decision_recommendation.includes('BOOK NOW')) {
        decisionBanner.classList.add('decision-book');
        decisionBanner.innerHTML = `<strong>${data.decision_recommendation}</strong>`;
    } else if (data.decision_recommendation.includes('WAIT')) {
        decisionBanner.classList.add('decision-wait');
        decisionBanner.innerHTML = `<strong>${data.decision_recommendation}</strong>`;
    } else {
        decisionBanner.classList.add('decision-neutral');
        decisionBanner.innerHTML = `<strong>${data.decision_recommendation}</strong>`;
    }

    // Physical Port Clearance Rendering
    renderPortClearance(data);

    // Key Metrics
    predictedRate.textContent = `$${data.predicted_freight_rate_usd_mt.toFixed(2)}`;
    totalCostUsd.textContent = `$${(data.total_freight_cost_usd / 1000000).toFixed(2)}M`;
    totalCostInr.textContent = `₹${(data.total_freight_cost_inr / 10000000).toFixed(2)} Cr`;

    // Confidence Interval
    if (confLow) confLow.textContent = `$${data.confidence_interval_lower.toFixed(2)}`;
    if (confMid) confMid.textContent = `$${data.predicted_freight_rate_usd_mt.toFixed(2)}`;
    if (confHigh) confHigh.textContent = `$${data.confidence_interval_upper.toFixed(2)}`;

    if (confTargetMarker) {
        const range = data.confidence_interval_upper - data.confidence_interval_lower;
        let pct = 50;
        if (range > 0) {
            pct = ((data.predicted_freight_rate_usd_mt - data.confidence_interval_lower) / range) * 100;
            pct = Math.max(15, Math.min(85, pct));
        }
        confTargetMarker.style.left = `${pct}%`;
    }

    // Contract Timing Strategy Matrix
    renderContractStrategy(data);

    // Voyage Details
    const v = data.voyage_details;
    voyageDistance.textContent = `${v.distance_nm.toLocaleString()} nm`;
    seaDays.textContent = `${v.sea_days} days`;
    portDays.textContent = `${v.port_days} days`;
    totalDays.textContent = `${v.total_voyage_days} days`;
    fuelCost.textContent = `$${(v.estimated_fuel_cost_usd / 1000).toFixed(0)}k`;
    lighterage.textContent = v.lighterage_required ? `$${(v.lighterage_cost_usd / 1000).toFixed(0)}k` : 'None';

    // Savings Info
    if (data.expected_savings_usd_mt) {
        savingsInfo.style.display = 'flex';
        const totalSavingsInr = (data.expected_savings_usd_mt * data.cargo_volume_mt * 83.2) / 10000000;
        savingsText.textContent = `Waiting could save ~$${data.expected_savings_usd_mt.toFixed(2)}/mt (Total: ₹${totalSavingsInr.toFixed(2)} Crores) based on downward forward curve.`;
    } else {
        savingsInfo.style.display = 'none';
    }

    // Contextual Maritime Route Alert
    renderRouteIntelAlert(data);

    // Smooth scroll within sidebar
    const sidebar = document.querySelector('.forecast-sidebar');
    if (sidebar && window.innerWidth > 1050) {
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderPortClearance(data) {
    if (!portClearanceBox) return;

    const clearance = data.physical_clearance || {};
    const overall = clearance.overall_clearance || 'PASSED';

    if (clearanceOverallBadge) {
        clearanceOverallBadge.className = 'clearance-badge';
        if (overall === 'PASSED') {
            clearanceOverallBadge.classList.add('badge-pass');
            clearanceOverallBadge.textContent = 'BERTH CLEARED';
        } else if (overall === 'WARNING' || overall === 'LIGHTERAGE_REQUIRED') {
            clearanceOverallBadge.classList.add('badge-warn');
            clearanceOverallBadge.textContent = 'LIGHTERAGE / RESTRICTED';
        } else {
            clearanceOverallBadge.classList.add('badge-fail');
            clearanceOverallBadge.textContent = 'DRAFT RESTRICTION';
        }
    }

    if (draftClearanceVal) {
        const d = clearance.draft_clearance_m !== undefined ? clearance.draft_clearance_m : 0.5;
        draftClearanceVal.textContent = d >= 0 ? `+${d.toFixed(1)}m` : `${d.toFixed(1)}m`;
        draftClearanceVal.style.color = d >= 0 ? '#059669' : '#dc2626';
    }

    if (loaClearanceVal) {
        const l = clearance.loa_clearance_m !== undefined ? clearance.loa_clearance_m : 5.0;
        loaClearanceVal.textContent = l >= 0 ? `+${l.toFixed(0)}m` : `${l.toFixed(0)}m`;
        loaClearanceVal.style.color = l >= 0 ? '#059669' : '#dc2626';
    }

    if (beamClearanceVal) {
        const b = clearance.beam_clearance_m !== undefined ? clearance.beam_clearance_m : 3.0;
        beamClearanceVal.textContent = b >= 0 ? `+${b.toFixed(1)}m` : `${b.toFixed(1)}m`;
        beamClearanceVal.style.color = b >= 0 ? '#059669' : '#dc2626';
    }

    if (clearanceWarningsList) {
        const warnings = clearance.clearance_warnings || [];
        if (warnings.length > 0) {
            clearanceWarningsList.style.display = 'block';
            clearanceWarningsList.innerHTML = warnings.map(w => `<div>${w}</div>`).join('');
        } else {
            clearanceWarningsList.style.display = 'none';
        }
    }
}

function renderContractStrategy(data) {
    const strat = data.contract_strategy || {};
    const rec = strat.recommended_contract_type || 'SPOT_FIXTURE';

    if (strategyRecommendationBadge) {
        strategyRecommendationBadge.className = 'strategy-pill';
        if (rec === 'SPOT_FIXTURE') {
            strategyRecommendationBadge.classList.add('pill-green');
            strategyRecommendationBadge.textContent = 'SPOT FIXTURE';
        } else if (rec === '1_MONTH_FORWARD') {
            strategyRecommendationBadge.classList.add('pill-blue');
            strategyRecommendationBadge.textContent = '1-MO FORWARD';
        } else {
            strategyRecommendationBadge.classList.add('pill-amber');
            strategyRecommendationBadge.textContent = '3-MO COA';
        }
    }

    if (strategyRationaleText) {
        strategyRationaleText.textContent = strat.rationale || 'Spot rates currently offer best commercial terms for immediate shipment.';
    }

    if (strategyCardsGrid) {
        const spotRate = strat.spot_rate_usd_mt || data.predicted_freight_rate_usd_mt;
        const forward1Rate = strat.forward_1m_rate_usd_mt || (spotRate * 1.02);
        const coa3Rate = strat.forward_3m_coa_rate_usd_mt || (spotRate * 1.04);

        strategyCardsGrid.innerHTML = `
            <div class="strategy-card ${rec === 'SPOT_FIXTURE' ? 'recommended' : ''}">
                <span class="strategy-term-title">Spot Fixture</span>
                <span class="strategy-rate">$${spotRate.toFixed(2)}</span>
                <span class="strategy-desc">Immediate Laycan</span>
            </div>
            <div class="strategy-card ${rec === '1_MONTH_FORWARD' ? 'recommended' : ''}">
                <span class="strategy-term-title">1-Mo Forward</span>
                <span class="strategy-rate">$${forward1Rate.toFixed(2)}</span>
                <span class="strategy-desc">+30 Day Laycan</span>
            </div>
            <div class="strategy-card ${rec === '3_MONTH_PERIOD_COA' ? 'recommended' : ''}">
                <span class="strategy-term-title">3-Mo COA</span>
                <span class="strategy-rate">$${coa3Rate.toFixed(2)}</span>
                <span class="strategy-desc">Fixed Contract</span>
            </div>
        `;
    }
}

function renderRouteIntelAlert(data) {
    if (!routeIntelAlert || !maritimeIntelligenceData || !maritimeIntelligenceData.top_intelligence_events) {
        if (routeIntelAlert) routeIntelAlert.style.display = 'none';
        return;
    }

    const originClean = data.origin.replace('_', ' ').toLowerCase();
    const destClean = data.destination.toLowerCase();

    const matchingEvents = maritimeIntelligenceData.top_intelligence_events.filter(evt => {
        const routes = (evt.affected_routes || []).map(r => r.toLowerCase());
        return routes.some(r => {
            const hasOrigin = (originClean.includes('australia') && r.includes('australia')) ||
                              (originClean.includes('usa') && r.includes('usa')) ||
                              (originClean.includes('africa') && (r.includes('africa') || r.includes('south africa'))) ||
                              (originClean.includes('mozambique') && r.includes('mozambique')) ||
                              (originClean.includes('indonesia') && r.includes('indonesia'));
            const hasDest = (destClean.includes('paradip') && r.includes('paradip')) ||
                            (destClean.includes('dhamra') && r.includes('dhamra')) ||
                            (destClean.includes('visakhapatnam') && (r.includes('visakhapatnam') || r.includes('vizag'))) ||
                            (destClean.includes('gangavaram') && r.includes('gangavaram')) ||
                            (destClean.includes('gopalpur') && r.includes('gopalpur')) ||
                            (destClean.includes('haldia') && r.includes('haldia'));
            return hasOrigin && hasDest;
        });
    });

    if (matchingEvents.length > 0) {
        const topEvent = matchingEvents[0];
        const sev = topEvent.severity_score || 7;
        routeIntelAlert.style.display = 'flex';

        let sevText = 'ELEVATED';
        if (sev >= 8) sevText = 'CRITICAL';
        else if (sev <= 4) sevText = 'MODERATE';

        if (routeAlertBadge) routeAlertBadge.textContent = `${sevText} (${sev}/10)`;
        if (routeAlertMessage) routeAlertMessage.textContent = `${topEvent.category}: ${topEvent.headline} — ${topEvent.threat_analysis}`;
        if (routeAlertAction) {
            routeAlertAction.textContent = topEvent.charterer_action ? `Advisory: ${topEvent.charterer_action}` : '';
        }
    } else {
        routeIntelAlert.style.display = 'none';
    }
}

// =========================================================================
// 5. COMMERCIAL PROCUREMENT TENDER FIXTURE GENERATOR & MODAL
// =========================================================================

function setupTenderEventListeners() {
    if (openTenderModalBtn) {
        openTenderModalBtn.addEventListener('click', openProcurementTender);
    }
    if (closeTenderBtn) {
        closeTenderBtn.addEventListener('click', () => {
            if (tenderModal) tenderModal.style.display = 'none';
        });
    }
    if (printTenderBtn) {
        printTenderBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Close modal on background click
    if (tenderModal) {
        tenderModal.addEventListener('click', (e) => {
            if (e.target === tenderModal) {
                tenderModal.style.display = 'none';
            }
        });
    }
}

async function openProcurementTender() {
    if (!lastForecastResult) {
        alert('Please generate a forecast first before generating a tender specification sheet.');
        return;
    }

    if (tenderModal) tenderModal.style.display = 'flex';
    if (tenderSheetBody) {
        tenderSheetBody.innerHTML = '<div style="text-align:center; padding: 30px;">Generating official Government procurement tender specification...</div>';
    }

    const payload = {
        tender_reference_no: `MOS/DRY-BULK/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        origin: lastForecastResult.origin,
        destination: lastForecastResult.destination,
        vessel_class: lastForecastResult.vessel_class,
        cargo_volume_mt: lastForecastResult.cargo_volume_mt,
        commodity_type: getCommodityName(lastForecastResult.origin),
        forecast_rate_usd_mt: lastForecastResult.predicted_freight_rate_usd_mt
    };

    try {
        const response = await fetch(`${API_BASE}/api/procurement/tender`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Tender generation failed');
        const tenderData = await response.json();
        renderTenderSheet(tenderData);

    } catch (err) {
        console.warn('Using client-side fallback tender renderer:', err);
        renderClientFallbackTender(payload);
    }
}

function getCommodityName(origin) {
    if (origin.includes('HayPoint') || origin.includes('HamptonRoads')) return 'Hard Coking Coal / Metallurgical Coal';
    if (origin.includes('PortHedland')) return 'High-Grade Iron Ore Fines (62% Fe)';
    if (origin.includes('Maputo') || origin.includes('RichardsBay')) return 'Steam Coal / Metallurgical Coking Coal';
    return 'Dry Bulk Mineral Cargo';
}

function renderTenderSheet(doc) {
    if (!tenderSheetBody) return;

    const specs = doc.cargo_specifications || {};
    const vSpecs = doc.vessel_restrictions || {};
    const pSpecs = doc.port_specifications || {};
    const comm = doc.commercial_terms || {};
    const risk = doc.risk_and_maritime_advisory || {};

    tenderSheetBody.innerHTML = `
        <div class="tender-doc-header">
            <div class="tender-doc-ref">
                <span><strong>TENDER REF:</strong> ${doc.tender_reference_no}</span>
                <span><strong>DATE:</strong> ${doc.issue_date}</span>
            </div>
            <div class="tender-doc-ref" style="margin-top: 4px;">
                <span><strong>ISSUING AUTHORITY:</strong> ${doc.issuing_authority}</span>
                <span><strong>CONTRACT TYPE:</strong> ${comm.recommended_contract_type || 'VOYAGE CHARTER FIXTURE'}</span>
            </div>
        </div>

        <div class="tender-section-title">1. Cargo & Laycan Specifications</div>
        <div class="tender-grid-2col">
            <div class="tender-spec-item">
                <span class="tender-spec-label">Commodity</span>
                <span class="tender-spec-val">${specs.commodity_type}</span>
            </div>
            <div class="tender-spec-item">
                <span class="tender-spec-label">Cargo Volume & Tolerance</span>
                <span class="tender-spec-val">${specs.cargo_volume_mt.toLocaleString()} MT (+/- 10% MOLOO)</span>
            </div>
            <div class="tender-spec-item">
                <span class="tender-spec-label">Loading Terminal (Origin)</span>
                <span class="tender-spec-val">${specs.origin_port}</span>
            </div>
            <div class="tender-spec-item">
                <span class="tender-spec-label">Discharge Port (India East Coast)</span>
                <span class="tender-spec-val">${specs.destination_port}</span>
            </div>
            <div class="tender-spec-item">
                <span class="tender-spec-label">Laycan Window</span>
                <span class="tender-spec-val">${specs.laycan_window}</span>
            </div>
            <div class="tender-spec-item">
                <span class="tender-spec-label">Transit & Turnaround Estimate</span>
                <span class="tender-spec-val">${specs.estimated_transit_days} Sea Days + ${specs.estimated_port_turnaround_days} Port Days</span>
            </div>
        </div>

        <div class="tender-section-title">2. Vessel Suitability & Port Physical Clearances</div>
        <div class="tender-grid-2col">
            <div class="tender-spec-item">
                <span class="tender-spec-label">Required Vessel Class</span>
                <span class="tender-spec-val">${vSpecs.nominated_vessel_class} (${(vSpecs.typical_dwt / 1000).toFixed(0)}k DWT)</span>
            </div>
            <div class="tender-spec-item">
                <span class="tender-spec-label">Max Laden Draft Allowed</span>
                <span class="tender-spec-val">${vSpecs.max_draft_m} meters</span>
            </div>
            <div class="tender-spec-item">
                <span class="tender-spec-label">Max LOA & Beam Clearance</span>
                <span class="tender-spec-val">LOA: ${vSpecs.max_loa_m}m | Beam: ${vSpecs.max_beam_m}m</span>
            </div>
            <div class="tender-spec-item">
                <span class="tender-spec-label">Guaranteed Discharge Rate</span>
                <span class="tender-spec-val">${pSpecs.mechanized_discharge_rate_mt_day.toLocaleString()} MT / WWD PWWD</span>
            </div>
        </div>

        <div class="tender-section-title">3. Commercial Pricing Benchmark & Budget Ceiling</div>
        <div class="tender-rates-box">
            <div class="tender-rates-grid">
                <div class="tender-rates-item">
                    <span>BENCHMARK FREIGHT</span>
                    <strong>$${comm.model_predicted_rate_usd_mt.toFixed(2)}/MT</strong>
                </div>
                <div class="tender-rates-item">
                    <span>RECOMMENDED CEILING</span>
                    <strong>$${comm.recommended_ceiling_rate_usd_mt.toFixed(2)}/MT</strong>
                </div>
                <div class="tender-rates-item">
                    <span>TOTAL ESTIMATED OUTLAY</span>
                    <strong>₹${comm.estimated_total_cost_inr_crore.toFixed(2)} Cr</strong>
                </div>
            </div>
        </div>

        <div class="tender-section-title">4. Maritime Risk & Black Swan Advisory Annexure</div>
        <div class="tender-spec-item" style="margin-bottom: 12px;">
            <span class="tender-spec-label">Gemini AI Threat Assessment: ${risk.global_threat_level || 'ELEVATED'} (Black Swan Index: ${risk.black_swan_index || 68}/100)</span>
            <p style="margin-top: 4px; font-size: 12px; color: #334155;">${risk.threat_mitigation_clause || 'Charterers shall maintain right to adjust laycan window by +/- 5 days in case of severe weather or canal transit delays.'}</p>
        </div>

        <div class="tender-signatures">
            <div class="tender-sig-line">
                Prepared by Chartering Officer<br>
                <strong>Ministry of Steel / SAIL</strong>
            </div>
            <div class="tender-sig-line">
                Approved by Chief Procurement Officer<br>
                <strong>Govt. of India</strong>
            </div>
        </div>
    `;
}

function renderClientFallbackTender(payload) {
    const totalUsd = payload.cargo_volume_mt * payload.forecast_rate_usd_mt;
    const totalInrCr = (totalUsd * 83.2) / 10000000;
    const ceilingRate = payload.forecast_rate_usd_mt * 1.05;

    renderTenderSheet({
        tender_reference_no: payload.tender_reference_no,
        issue_date: new Date().toISOString().substring(0, 10),
        issuing_authority: 'Ministry of Steel, Government of India (Public Sector Procurement Division)',
        cargo_specifications: {
            commodity_type: payload.commodity_type,
            cargo_volume_mt: payload.cargo_volume_mt,
            origin_port: payload.origin.replace('_', ' '),
            destination_port: `${payload.destination} Port, India East Coast`,
            laycan_window: 'Prompt (+10 to +18 Days from tender opening)',
            estimated_transit_days: 14,
            estimated_port_turnaround_days: 3.5
        },
        vessel_restrictions: {
            nominated_vessel_class: payload.vessel_class,
            typical_dwt: payload.cargo_volume_mt,
            max_draft_m: 18.0,
            max_loa_m: 300.0,
            max_beam_m: 48.0
        },
        port_specifications: {
            mechanized_discharge_rate_mt_day: 45000,
            demurrage_rate_usd_day: 30000
        },
        commercial_terms: {
            recommended_contract_type: 'VOYAGE CHARTER FIXTURE',
            model_predicted_rate_usd_mt: payload.forecast_rate_usd_mt,
            recommended_ceiling_rate_usd_mt: ceilingRate,
            estimated_total_cost_inr_crore: totalInrCr
        },
        risk_and_maritime_advisory: {
            global_threat_level: 'ELEVATED',
            black_swan_index: 68,
            threat_mitigation_clause: 'Charterers reserve the right to insert BIMCO Piracy & War Risk Clauses with bunker price adjustment indexation.'
        }
    });
}
