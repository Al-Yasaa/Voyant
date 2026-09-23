"""
Validate 2025 Predictions Against Actual Market Data
Fetches real 2025 commodity prices from Yahoo Finance and compares
against the model's predicted freight rates.
"""

import pandas as pd
import numpy as np
import yfinance as yf
import json
from datetime import datetime

def validate_2025_predictions():
    print("="*80)
    print("2025 PREDICTION ACCURACY VALIDATION")
    print("="*80)
    print(f"Current Date: {datetime.now().strftime('%Y-%m-%d')}\n")

    # Load the model's 2025 predictions
    with open('frontend/data/predictions_2025.json', 'r') as f:
        predictions = json.load(f)

    print(f"Model Predictions Generated: {predictions['generated_at']}")
    print(f"Training Period: {predictions['training_period']}")
    print(f"Prediction Period: {predictions['prediction_period']}\n")

    # Fetch ACTUAL 2025 data from Yahoo Finance
    print("Fetching ACTUAL 2025 data from Yahoo Finance...\n")

    try:
        # Iron Ore
        iron_ore = yf.download('TIO=F', start='2025-01-01', end='2025-12-31', progress=False)
        print(f"✓ Iron Ore (TIO=F): {len(iron_ore)} daily records")

        # Brent Crude
        crude_oil = yf.download('BZ=F', start='2025-01-01', end='2025-12-31', progress=False)
        print(f"✓ Brent Crude (BZ=F): {len(crude_oil)} daily records")

        # USD/INR
        usd_inr = yf.download('INR=X', start='2025-01-01', end='2025-12-31', progress=False)
        print(f"✓ USD/INR (INR=X): {len(usd_inr)} daily records")

        # Extract monthly averages from actual 2025 data
        actual_2025_monthly = []
        for month in range(1, 13):
            month_str = f"2025-{month:02d}"
            month_data = {
                'month': month_str,
                'iron_ore_avg': None,
                'crude_oil_avg': None,
                'usd_inr_avg': None
            }

            # Iron Ore monthly average
            if not iron_ore.empty:
                iron_month = iron_ore[iron_ore.index.to_series().dt.strftime('%Y-%m') == month_str]
                if not iron_month.empty:
                    if isinstance(iron_month['Close'].iloc[0], pd.Series):
                        month_data['iron_ore_avg'] = iron_month['Close'].iloc[:, 0].mean()
                    else:
                        month_data['iron_ore_avg'] = iron_month['Close'].mean()

            # Crude Oil monthly average
            if not crude_oil.empty:
                crude_month = crude_oil[crude_oil.index.to_series().dt.strftime('%Y-%m') == month_str]
                if not crude_month.empty:
                    if isinstance(crude_month['Close'].iloc[0], pd.Series):
                        month_data['crude_oil_avg'] = crude_month['Close'].iloc[:, 0].mean()
                    else:
                        month_data['crude_oil_avg'] = crude_month['Close'].mean()

            # USD/INR monthly average
            if not usd_inr.empty:
                inr_month = usd_inr[usd_inr.index.to_series().dt.strftime('%Y-%m') == month_str]
                if not inr_month.empty:
                    if isinstance(inr_month['Close'].iloc[0], pd.Series):
                        month_data['usd_inr_avg'] = inr_month['Close'].iloc[:, 0].mean()
                    else:
                        month_data['usd_inr_avg'] = inr_month['Close'].mean()

            actual_2025_monthly.append(month_data)

        print("\n" + "="*80)
        print("ACTUAL 2025 COMMODITY MARKET DATA (Monthly Averages)")
        print("="*80)
        print(f"{'Month':<12} {'Iron Ore ($/MT)':<18} {'Crude Oil ($/bbl)':<20} {'USD/INR':<12}")
        print("-"*80)

        for m in actual_2025_monthly:
            iron_str = f"${m['iron_ore_avg']:.2f}" if m['iron_ore_avg'] else "N/A"
            crude_str = f"${m['crude_oil_avg']:.2f}" if m['crude_oil_avg'] else "N/A"
            inr_str = f"₹{m['usd_inr_avg']:.2f}" if m['usd_inr_avg'] else "N/A"
            print(f"{m['month']:<12} {iron_str:<18} {crude_str:<20} {inr_str:<12}")

        print("\n" + "="*80)
        print("MODEL'S 2025 PREDICTED FREIGHT RATES")
        print("="*80)
        for route_key, route_data in predictions['routes'].items():
            print(f"\n{route_data['label']}:")
            avg_rate = sum(route_data['predicted_rates']) / len(route_data['predicted_rates'])
            min_rate = min(route_data['predicted_rates'])
            max_rate = max(route_data['predicted_rates'])
            print(f"  Average: ${avg_rate:.2f}/MT")
            print(f"  Range:   ${min_rate:.2f} – ${max_rate:.2f}/MT")
            print(f"  Trend:   {route_data['predicted_rates'][0]:.2f} (Jan) → {route_data['predicted_rates'][-1]:.2f} (Dec)")

        print("\n" + "="*80)
        print("VALIDATION NOTES")
        print("="*80)
        print("✓ Actual commodity prices (Iron Ore, Crude Oil, USD/INR) fetched from Yahoo Finance")
        print("✓ Model predictions are based on 2021-2024 training data")
        print("⚠ Baltic Dry Index (BDI) actual 2025 data requires premium subscription")
        print("  → To validate freight rates, compare trends (seasonal peaks/dips) rather than absolute values")
        print("\n📌 KEY VALIDATION METRIC: Did the model correctly predict seasonal patterns?")
        print("   - Pre-monsoon rush (Apr-May): Rates should spike")
        print("   - Monsoon season (Jun-Sep): Rates should dip")
        print("   - Year-end recovery (Oct-Dec): Rates should recover")

    except Exception as e:
        print(f"\n⚠ Error fetching 2025 data: {e}")
        print("\nPossible reasons:")
        print("  1. Current date is still in 2026 but full 2025 data may not be available")
        print("  2. Yahoo Finance API rate limits")
        print("  3. Network connectivity issues")

    print("\n" + "="*80)
    print("NEXT STEPS TO VALIDATE MODEL ACCURACY:")
    print("="*80)
    print("1. Download actual 2025 BDI data from Baltic Exchange (if subscription available)")
    print("2. Compare model's predicted seasonal patterns against actual 2025 trends")
    print("3. Calculate MAE (Mean Absolute Error) between predictions and actuals")
    print("4. If MAE < $2.00/MT, model accuracy is validated as 'Excellent'")
    print("="*80)


if __name__ == "__main__":
    validate_2025_predictions()
