"""
Automated Test Suite for Freight Forecasting Pipeline
Tests Data Fetching, Model Training, Predictions, and API Endpoints
"""

import pytest
import pandas as pd
import numpy as np
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.data.routes_database import (
    EAST_COAST_PORTS, ORIGIN_PORTS, VESSEL_CLASSES,
    get_route_details, list_all_available_routes
)
from backend.models.train_model import FreightForecaster


class TestRoutesDatabase:
    """Test routes and maritime database functionality."""

    def test_ports_exist(self):
        """Verify all essential East Coast Indian ports are configured."""
        required_ports = ["Paradip", "Dhamra", "Visakhapatnam", "Haldia"]
        for port in required_ports:
            assert port in EAST_COAST_PORTS
            assert EAST_COAST_PORTS[port]["max_draft_m"] > 0
            assert EAST_COAST_PORTS[port]["discharge_rate_mt_day"] > 0

    def test_haldia_draft_restriction(self):
        """Verify Haldia has draft restrictions and lighterage configured."""
        haldia = EAST_COAST_PORTS["Haldia"]
        assert haldia["max_draft_m"] < 10.0
        assert haldia["lighterage_required"] is True
        assert haldia["lighterage_cost_usd_mt"] > 0

    def test_origins_exist(self):
        """Verify global origins are configured."""
        required_origins = ["Australia_HayPoint", "Australia_PortHedland", "USA_HamptonRoads"]
        for origin in required_origins:
            assert origin in ORIGIN_PORTS
            assert len(ORIGIN_PORTS[origin]["vessel_suitability"]) > 0

    def test_route_calculation(self):
        """Test route distance and voyage calculation."""
        details = get_route_details("Australia_HayPoint", "Paradip", "Capesize")
        assert details["distance_nm"] > 5000
        assert details["sea_days"] > 10
        assert details["is_draft_compatible"] is True
        assert details["total_vlsfo_mt"] > 500


class TestModelTrainingAndPrediction:
    """Test model training, evaluation metrics, and prediction engine."""

    def test_dataset_exists(self):
        """Verify real dataset was created."""
        csv_path = os.path.join(os.path.dirname(__file__), '..', "backend/data/freight_market_data.csv")
        assert os.path.exists(csv_path), "Market data CSV does not exist"
        df = pd.read_csv(csv_path)
        assert len(df) >= 1000
        assert "capesize_rate_usd_mt" in df.columns
        assert "bunker_vlsfo_usd_mt" in df.columns
        assert "iron_ore" in df.columns
        assert "usd_inr" in df.columns

    def test_model_training_and_accuracy(self):
        """Verify model trains and achieves acceptable MAE (< $2.00/mt)."""
        csv_path = os.path.join(os.path.dirname(__file__), '..', "backend/data/freight_market_data.csv")
        forecaster = FreightForecaster()
        metrics = forecaster.train(csv_path)

        # Verify key performance indicators
        assert metrics["test_mae"] < 2.0, f"MAE too high: {metrics['test_mae']}"
        assert metrics["test_r2"] > 0.80, f"R2 score too low: {metrics['test_r2']}"
        assert metrics["test_mape"] < 10.0, f"MAPE too high: {metrics['test_mape']}%"

    def test_model_prediction_output(self):
        """Verify model prediction gives realistic outputs."""
        model_path = os.path.join(os.path.dirname(__file__), '..', "backend/models/saved_models/freight_model.pkl")
        csv_path = os.path.join(os.path.dirname(__file__), '..', "backend/data/freight_market_data.csv")
        forecaster = FreightForecaster()
        forecaster.load_model(model_path)

        # Dummy input row
        df = pd.read_csv(csv_path)
        sample_input = df.iloc[-1].to_dict()

        prediction = forecaster.predict(sample_input)
        assert "predicted_rate_usd_mt" in prediction
        assert "confidence_interval_lower" in prediction
        assert "confidence_interval_upper" in prediction

        rate = prediction["predicted_rate_usd_mt"]
        assert 5.0 <= rate <= 60.0, f"Predicted rate ${rate}/mt outside realistic bounds"
        assert prediction["confidence_interval_lower"] < rate < prediction["confidence_interval_upper"]


if __name__ == "__main__":
    pytest.main(["-v", __file__])
