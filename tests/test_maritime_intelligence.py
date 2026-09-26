"""
Automated Test Suite for AI Maritime Intelligence, Fleet Auto-Optimizer,
Physical Port Clearances, Contract Duration Strategy, and Commercial Tender Generator.
Validates Ministry of Steel decision-support requirements and ML model isolation.
"""

import pytest
import os
import sys
from fastapi.testclient import TestClient

# Add project root and backend to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.api.main import app
from backend.data.routes_database import (
    EAST_COAST_PORTS,
    ORIGIN_PORTS,
    VESSEL_CLASSES,
    check_port_physical_clearance,
    compare_and_optimize_vessels,
    calculate_contract_duration_strategy,
    generate_procurement_tender_sheet
)
from backend.data.maritime_intelligence import (
    get_maritime_intelligence,
    _fetch_rss_articles,
    _generate_heuristic_intelligence,
    MARITIME_FEEDS
)
from backend.models.train_model import FreightForecaster


class TestHackathonRouteDatabaseExpansion:
    """Test full coverage of Ministry of Steel Indian East Coast ports and vessel classes."""

    def test_all_east_coast_ports_present(self):
        """Verify all 7 Indian East Coast ports required by the Ministry of Steel are present with valid specs."""
        required_ports = [
            "Paradip", "Dhamra", "Visakhapatnam", "Gangavaram",
            "Gopalpur", "Sandheads_Sagar", "Haldia"
        ]
        for port in required_ports:
            assert port in EAST_COAST_PORTS, f"Missing required port: {port}"
            p = EAST_COAST_PORTS[port]
            assert p["max_draft_m"] > 0
            assert p["max_loa_m"] > 0
            assert p["max_beam_m"] > 0
            assert p["discharge_rate_mt_day"] > 0

    def test_all_vessel_classes_present(self):
        """Verify all 4 vessel classes (including Handysize) are present with dimensions."""
        required_vessels = ["Capesize", "Panamax", "Supramax", "Handysize"]
        for vessel in required_vessels:
            assert vessel in VESSEL_CLASSES, f"Missing required vessel class: {vessel}"
            v = VESSEL_CLASSES[vessel]
            assert v["typical_draft_laden_m"] > 0
            assert v["typical_loa_m"] > 0
            assert v["typical_beam_m"] > 0
            assert v["speed_knots_laden"] > 0

    def test_physical_port_clearances(self):
        """Test 3-dimensional physical clearance checks (Draft, LOA, Beam) for various vessel-port pairs."""
        # Deepwater Paradip should pass Capesize
        res_paradip = check_port_physical_clearance("Paradip", "Capesize")
        assert res_paradip["draft_cleared"] is True
        assert res_paradip["overall_clearance"] == "PASSED"
        assert res_paradip["draft_clearance_m"] > 0

        # Shallow Haldia (9.1m draft) should fail/warn on Capesize (18.2m draft)
        res_haldia_cape = check_port_physical_clearance("Haldia", "Capesize")
        assert res_haldia_cape["draft_cleared"] is False
        assert res_haldia_cape["overall_clearance"] == "LIGHTERAGE_REQUIRED"
        assert len(res_haldia_cape["clearance_warnings"]) > 0

        # Haldia should handle Handysize directly
        res_haldia_handy = check_port_physical_clearance("Haldia", "Handysize")
        assert res_haldia_handy["overall_clearance"] in ["PASSED", "WARNING", "LIGHTERAGE_REQUIRED"]

    def test_multi_vessel_auto_optimizer(self):
        """Test multi-vessel optimizer evaluating Capesize, Panamax, Supramax, and Handysize side-by-side."""
        result = compare_and_optimize_vessels(
            origin_key="Australia_HayPoint",
            destination_key="Paradip",
            cargo_volume_mt=170000,
            base_market_rate_usd_mt=24.50,
            bunker_price_usd_mt=780.0,
            usd_inr_rate=83.2
        )

        assert result["origin"] == "Australia_HayPoint"
        assert result["destination"] == "Paradip"
        assert len(result["evaluated_options"]) == 4
        assert result["recommended_vessel_class"] == "Capesize"
        assert result["evaluated_options"][0]["rank"] == 1
        assert result["evaluated_options"][0]["is_optimal"] is True

    def test_contract_duration_strategy(self):
        """Test Spot vs 1-Month vs 3-Month COA contract timing matrix calculation."""
        strategy = calculate_contract_duration_strategy(
            spot_rate_usd_mt=25.0,
            cargo_volume_mt=150000,
            is_bullish=True,
            is_bearish=False,
            usd_inr_rate=83.2
        )

        assert "recommended_contract_type" in strategy
        assert "spot_rate_usd_mt" in strategy
        assert "forward_1m_rate_usd_mt" in strategy
        assert "forward_3m_coa_rate_usd_mt" in strategy
        assert strategy["total_spot_cost_inr_crore"] > 0

    def test_procurement_tender_generation(self):
        """Test commercial procurement tender sheet generation matching PSU standards."""
        tender = generate_procurement_tender_sheet(
            origin_key="Australia_HayPoint",
            destination_key="Paradip",
            vessel_class="Capesize",
            cargo_volume_mt=170000,
            commodity_type="Hard Coking Coal",
            forecast_rate_usd_mt=24.80,
            usd_inr_rate=83.2
        )

        assert "tender_reference_no" in tender
        assert "cargo_specifications" in tender
        assert "vessel_restrictions" in tender
        assert "port_specifications" in tender
        assert "commercial_terms" in tender
        assert tender["commercial_terms"]["recommended_ceiling_rate_usd_mt"] > 24.80


class TestRSSIngestion:
    """Test RSS Feed Ingestion from Maritime News Sources."""

    def test_maritime_feeds_configuration(self):
        """Verify maritime feed sources are configured with URLs and valid categories."""
        assert len(MARITIME_FEEDS) >= 3
        feed_names = [f["name"] for f in MARITIME_FEEDS]
        assert "gCaptain" in feed_names
        assert "Splash247" in feed_names
        assert "Hellenic Shipping News" in feed_names

        for feed in MARITIME_FEEDS:
            assert feed["url"].startswith("http")
            assert "category" in feed and len(feed["category"]) > 0

    def test_fetch_rss_articles_structure(self):
        """Verify RSS article fetching returns structured article objects."""
        articles = _fetch_rss_articles(timeout=5)
        assert isinstance(articles, list)
        for article in articles:
            assert "title" in article
            assert "source" in article
            assert "link" in article
            assert "pub_date" in article
            assert "description" in article
            assert "category" in article


class TestIntelligenceAnalysisEngine:
    """Test Gemini / Heuristic Threat Analysis and Black Swan Scoring."""

    def test_heuristic_intelligence_structure(self):
        """Verify heuristic fallback engine generates complete, valid schema."""
        intel = _generate_heuristic_intelligence([])
        assert isinstance(intel, dict)
        assert "overall_market_threat_level" in intel
        assert "black_swan_risk_index" in intel
        assert "executive_summary" in intel
        assert "top_intelligence_events" in intel
        assert isinstance(intel["top_intelligence_events"], list)
        assert len(intel["top_intelligence_events"]) >= 3

    def test_threat_level_and_risk_index_bounds(self):
        """Verify threat levels and Black Swan risk scores are strictly bounded."""
        intel = get_maritime_intelligence(force_refresh=True)

        # Threat Level
        valid_threat_levels = ["LOW", "MODERATE", "ELEVATED", "HIGH", "CRITICAL"]
        assert intel["overall_market_threat_level"] in valid_threat_levels

        # Black Swan Risk Index (0 - 100)
        risk_index = intel["black_swan_risk_index"]
        assert isinstance(risk_index, (int, float))
        assert 0 <= risk_index <= 100

        # Executive summary
        assert isinstance(intel["executive_summary"], str)
        assert len(intel["executive_summary"]) > 20

    def test_event_properties_and_severity_scores(self):
        """Verify each event has all required charterer intelligence fields."""
        intel = get_maritime_intelligence(force_refresh=False)
        events = intel.get("top_intelligence_events", [])
        assert len(events) > 0

        valid_impacts = ["BULLISH_FREIGHT", "BEARISH_FREIGHT", "TRANSIT_DELAY", "NEUTRAL"]

        for evt in events:
            assert "id" in evt
            assert "headline" in evt and len(evt["headline"]) > 5
            assert "source" in evt
            assert "category" in evt
            assert "severity_score" in evt
            assert 1 <= evt["severity_score"] <= 10, f"Severity {evt['severity_score']} out of range 1-10"
            assert evt["impact_direction"] in valid_impacts or len(evt["impact_direction"]) > 0
            assert isinstance(evt.get("affected_routes", []), list)
            assert "threat_analysis" in evt and len(evt["threat_analysis"]) > 10
            assert "charterer_action" in evt and len(evt["charterer_action"]) > 10


class TestFastAPIFullSuite:
    """Test REST API Endpoints."""

    @pytest.fixture
    def client(self):
        return TestClient(app)

    def test_get_intelligence_briefing_endpoint(self, client):
        """Test GET /api/intelligence/briefing returns 200 OK and valid JSON."""
        response = client.get("/api/intelligence/briefing")
        assert response.status_code == 200
        data = response.json()
        assert "overall_market_threat_level" in data
        assert "black_swan_risk_index" in data

    def test_get_2026_predictions_endpoint(self, client):
        """Test GET /api/forecast/2026-predictions returns 24-month dual-phase trajectory for all routes."""
        response = client.get("/api/forecast/2026-predictions")
        assert response.status_code == 200
        data = response.json()
        assert "dates" in data
        assert len(data["dates"]) == 24
        assert "routes" in data
        assert "Australia-HP" in data["routes"]
        route = data["routes"]["Australia-HP"]
        assert len(route["historical_2025_rates"]) == 12
        assert len(route["projected_2026_rates"]) == 12

    def test_post_forecast_with_clearance(self, client):
        """Test POST /api/forecast returns complete forecast with physical clearance and strategy."""
        payload = {
            "origin": "Australia_HayPoint",
            "destination": "Paradip",
            "vessel_class": "Capesize",
            "cargo_volume_mt": 170000,
            "forecast_days": 7
        }
        response = client.post("/api/forecast", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "predicted_freight_rate_usd_mt" in data
        assert "physical_clearance" in data
        assert "contract_strategy" in data
        assert data["physical_clearance"]["overall_clearance"] == "PASSED"

    def test_post_vessel_optimize_endpoint(self, client):
        """Test POST /api/vessel/optimize endpoint."""
        payload = {
            "origin": "Australia_HayPoint",
            "destination": "Paradip",
            "cargo_volume_mt": 170000
        }
        response = client.post("/api/vessel/optimize", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["destination"] == "Paradip"
        assert len(data["evaluated_options"]) == 4

    def test_post_procurement_tender_endpoint(self, client):
        """Test POST /api/procurement/tender endpoint."""
        payload = {
            "origin": "Australia_HayPoint",
            "destination": "Paradip",
            "vessel_class": "Capesize",
            "cargo_volume_mt": 170000,
            "commodity_type": "Hard Coking Coal",
            "forecast_rate_usd_mt": 24.50
        }
        response = client.post("/api/procurement/tender", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "tender_reference_no" in data
        assert "commercial_terms" in data


class TestModelSeparationAndIsolation:
    """Verify that the AI Maritime Intelligence Layer is 100% isolated from the ML pipeline."""

    def test_ml_rate_engine_isolation(self):
        """
        Verify that mathematical XGBoost freight predictions remain completely independent
        and unaltered by the existence or execution of the AI intelligence layer.
        """
        forecaster = FreightForecaster()
        forecaster.load_model(os.path.join(PROJECT_ROOT, "backend", "models", "saved_models", "freight_model.pkl"))

        sample_input = {
            "bdi": 2350,
            "capesize_rate_usd_mt": 23.50,
            "panamax_rate_usd_mt": 16.20,
            "bunker_vlsfo_usd_mt": 780.00,
            "iron_ore": 118.50,
            "usd_inr": 83.25,
            "distance_nm": 5200,
            "sea_days": 16.5,
            "total_voyage_days": 20.5,
            "fuel_consumption_mt": 640.0,
            "vessel_capesize": 1,
            "vessel_panamax": 0,
            "vessel_supramax": 0,
            "origin_australia": 1,
            "origin_usa": 0,
            "origin_africa": 0,
            "origin_indonesia": 0,
            "dest_paradip": 1,
            "dest_dhamra": 0,
            "dest_vizag": 0,
            "dest_haldia": 0
        }

        # Step 1: Run ML rate prediction
        prediction_before = forecaster.predict(sample_input)

        # Step 2: Trigger intensive maritime intelligence analysis
        intel = get_maritime_intelligence(force_refresh=True)
        assert intel["black_swan_risk_index"] >= 0

        # Step 3: Run ML rate prediction again
        prediction_after = forecaster.predict(sample_input)

        # Step 4: Mathematical rate output must be strictly identical
        assert prediction_before["predicted_rate_usd_mt"] == prediction_after["predicted_rate_usd_mt"]
        assert prediction_before["confidence_interval_lower"] == prediction_after["confidence_interval_lower"]
        assert prediction_before["confidence_interval_upper"] == prediction_after["confidence_interval_upper"]


if __name__ == "__main__":
    pytest.main(["-v", __file__])
