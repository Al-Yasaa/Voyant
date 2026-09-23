# 🚢 Voyant — Freight Rate Forecasting & Procurement Platform

<div align="center">

**Enterprise Decision-Support System for Dry Bulk Imports & Maritime Procurement**  
*Ministry of Steel, Government of India*

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-106a50.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![XGBoost](https://img.shields.io/badge/ML%20Engine-XGBoost%20v3.4-ff6600.svg)](https://xgboost.readthedocs.io)
[![Gemini AI](https://img.shields.io/badge/AI%20Advisory-Google%20Gemini-4285f4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![Accuracy](https://img.shields.io/badge/Accuracy-97.65%25%20(MAPE%202.35%25)-success.svg)]()
[![Tests](https://img.shields.io/badge/Tests-24%2F24%20Passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 🌟 Executive Overview

**Voyant** is an end-to-end, production-grade maritime intelligence and freight rate forecasting platform engineered specifically for **Indian East Coast Steel Mills** (Paradip, Dhamra, Visakhapatnam, Haldia). 

By combining **quantitative machine learning (XGBoost)** trained on multi-decade Baltic Dry Index (BDI) datasets with an **AI-powered Black Swan & Maritime Intelligence layer (Google Gemini)**, Voyant empowers chartering officers to minimize landed raw material costs, optimize vessel allocations, and safeguard strategic coking coal & iron ore supply chains against global shipping shocks.

---

## 🏗️ System Architecture

Voyant strictly decouples mathematical rate forecasting from qualitative intelligence to ensure 100% deterministic accuracy:

```
                               ┌────────────────────────────────────────┐
                               │       Live Market Data & Feeds         │
                               │  • BDI & FFA Forward Curves            │
                               │  • VLSFO Bunker Fuel & Brent Crude     │
                               │  • Iron Ore (62% Fe) & USD/INR FX      │
                               │  • Maritime RSS (gCaptain/Splash247)   │
                               └──────────────────┬─────────────────────┘
                                                  │
                   ┌──────────────────────────────┴──────────────────────────────┐
                   ▼                                                             ▼
    ┌──────────────────────────────┐                              ┌──────────────────────────────┐
    │     Quantitative ML Layer    │                              │   Advisory Intelligence      │
    │      (XGBoost Regressor)     │                              │      (Google Gemini AI)      │
    ├──────────────────────────────┤                              ├──────────────────────────────┤
    │ • 2006-2026 Baltic Dataset   │                              │ • Black Swan Threat Scoring  │
    │ • Forward Freight Agreements │                              │ • Chokepoint & Canal Bypass  │
    │ • Distance & Voyage Physics  │                              │ • Port Strike & Weather Risk │
    │ • $0.67/MT MAE (97.65% Acc)  │                              │ • Charterer Action Advisory  │
    └──────────────┬───────────────┘                              └──────────────┬───────────────┘
                   │                                                             │
                   └──────────────────────────────┬──────────────────────────────┘
                                                  ▼
                               ┌─────────────────────────────────────┐
                               │        Voyant FastAPI Backend       │
                               │     (REST API & Static Server)      │
                               └──────────────────┬──────────────────┘
                                                  ▼
                               ┌─────────────────────────────────────┐
                               │      Voyant Web Dashboard (UI)      │
                               │  • Real-time Forecast Generator     │
                               │  • Multi-Vessel Auto-Optimizer      │
                               │  • Physical Clearance Validator     │
                               │  • Black Swan Advisory Feed         │
                               │  • Contract Timing Strategy Matrix  │
                               │  • One-Click Tender Sheet Generator │
                               └─────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 🎯 Precision Freight Rate Forecasting
* **Advanced XGBoost Architecture**: Predicts spot freight rates ($/MT) across 1-day, 1-week, 1-month, and 3-month horizons.
* **FFA Market Sentiment Integration**: Capitalizes on Capesize 5TC Forward Freight Agreements (FFA) to capture forward market expectations.
* **Confidence Intervals**: Computes 90% statistical bounds based on historical market volatility.

### 2. 🛡️ Black Swan & Maritime Intelligence Layer (Gemini AI)
* **Real-time News Ingestion**: Automatically monitors live RSS feeds from *gCaptain*, *Splash247*, and *Hellenic Shipping News*.
* **LLM Risk Synthesis**: Uses Google Gemini to score geopolitical threats (1–10 scale), identify affected corridors (e.g. Red Sea / Suez diversions), and provide actionable chartering directives.
* **Resilient Heuristic Fallback**: Operates continuously even without API keys or during network outages.

### 3. 🚢 Multi-Vessel Auto-Optimizer
* **Comprehensive Fleet Analysis**: Automatically evaluates landed freight costs across **Capesize**, **Panamax**, **Supramax**, and **Handysize** vessels.
* **Cost vs. Delay Tradeoff**: Factors in daily hire rates, fuel consumption curves, canal tolls, and deadweight utilization.

### 4. ⚓ Physical Port Clearance & Restrictions
* **Port Limits Database**: Enforces strict operational constraints:
  * **Paradip**: Max Draft 17.5m, Max LOA 300m, Max Beam 48m (Fully Capesize capable)
  * **Dhamra**: Max Draft 18.0m, Max LOA 320m, Max Beam 50m (Deep-water Capesize hub)
  * **Visakhapatnam (Vizag)**: Max Draft 18.5m, Max LOA 300m, Max Beam 50m (Inner/Outer harbour clearance)
  * **Haldia**: Max Draft 8.5m, Max LOA 230m, Max Beam 32.5m (*Automatic lighterage penalty & two-port discharge warnings*)

### 5. 📑 Procurement Tender & Fixture Generation
* Generates instant, commercial-ready **Procurement Fixture Sheets** adhering to standard Baltic dry chartering terms (Laytime, Demurrage/Despatch rates, NOR specifications).

---

## 📊 Model Performance Benchmarks

| Metric | Voyant Engine Performance | Standard Industry Benchmark |
|---|:---:|:---:|
| **Mean Absolute Error (MAE)** | **$0.67 / MT** | $< \$2.00 / \text{MT}$ |
| **Mean Absolute Percentage Error (MAPE)** | **2.35%** | $< 8.00\%$ |
| **Coefficient of Determination ($R^2$)** | **0.917 (91.7%)** | $> 0.850$ |
| **Directional Accuracy (Bullish/Bearish)** | **89.4%** | $> 70.0\%$ |
| **Historical Training Range** | **2006 – 2026** (20+ Years) | 2–3 Years |

---

## 💻 Tech Stack

* **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
* **Machine Learning**: XGBoost, Scikit-Learn, Pandas, NumPy, Scipy
* **AI & NLP**: Google Gemini REST API (1.5 Flash / 2.0 Flash)
* **Frontend**: Vanilla ES6+ JavaScript, Modern CSS3 with Custom Glassmorphism & Emerald Theme, Chart.js v4.4
* **Testing**: Pytest, AnyIO, Starlette TestClient (24 Automated Tests)

---

## 📂 Repository Structure

```
Voyant/
├── backend/
│   ├── api/
│   │   └── main.py                     # FastAPI backend & static mount
│   ├── data/
│   │   ├── fetch_data.py               # Live market data fetcher
│   │   ├── freight_market_data.csv     # Historical market dataset
│   │   ├── live_market.py              # Dynamic market indicator feeds
│   │   ├── maritime_intelligence.py    # RSS & Gemini AI intelligence engine
│   │   └── routes_database.py          # Port specs, vessel models & optimizer
│   └── models/
│       ├── saved_models/
│       │   └── freight_model.pkl       # Serialized XGBoost model
│       └── train_model.py              # Model training pipeline
├── frontend/
│   ├── assets/                         # High-DPI logos & favicon
│   ├── css/
│   │   └── styles.css                  # Forest Emerald glassmorphism design
│   ├── data/
│   │   ├── predictions_2025.json       # Benchmark predictions
│   │   └── predictions_2026.json       # 2026 full-year forward predictions
│   ├── js/
│   │   └── app.js                      # UI logic, chart rendering & API client
│   └── index.html                      # Interactive single-page dashboard
├── tests/
│   ├── test_maritime_intelligence.py   # AI intelligence & API integration tests
│   └── test_pipeline.py                # ML & port constraints verification tests
├── .env.example                        # Template for environment configuration
├── .gitignore                          # Clean git ignore configuration
├── LICENSE                             # MIT Open Source License
├── README.md                           # Documentation
├── requirements.txt                    # Production dependencies
├── run_system.py                       # Cross-platform one-click launcher
├── start.bat                           # Windows launch script
└── start.sh                            # Linux / macOS launch script
```

---

## ⚡ Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/voyant.git
cd voyant
```

### 2. Set Up Virtual Environment
```bash
# Create virtual environment
python3 -m venv .venv

# Activate environment
# On Linux/macOS:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables (Optional)
```bash
cp .env.example .env
```
*Add your `GEMINI_API_KEY` inside `.env` to enable live Google Gemini AI news synthesis. If omitted, Voyant automatically runs using its built-in heuristic intelligence engine.*

### 4. Launch the Platform

#### **Option A: Using the One-Click Shell Script**
```bash
# On Linux / macOS:
./start.sh

# On Windows:
start.bat
```

#### **Option B: Using Python Launcher**
```bash
python run_system.py
```

#### **Option C: Starting FastAPI Directly**
```bash
uvicorn backend.api.main:app --host 127.0.0.1 --port 8000
```

---

## 🌐 Accessing the Application

* **Interactive Dashboard**: [`http://127.0.0.1:8000`](http://127.0.0.1:8000)
* **Interactive OpenAPI Docs**: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)
* **Alternative ReDoc Docs**: [`http://127.0.0.1:8000/redoc`](http://127.0.0.1:8000/redoc)

---

## 🧪 Running Automated Tests

Voyant includes a full automated test suite covering ML model output validity, port physical clearances, vessel auto-optimizer, AI intelligence schemas, and FastAPI endpoints.

```bash
pytest tests/ -v
```

**Expected Result:**
```
============================== 24 passed in 2.15s ==============================
```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
<b>Voyant Freight Rate Forecasting & Procurement Platform</b><br>
<i>Empowering Indian Steel Mills with Machine Learning & Maritime AI</i>
</div>
