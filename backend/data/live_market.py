"""
Live Market Data Engine
Fetches real-time market indicators (USD/INR, Brent Crude, Bunker VLSFO, Iron Ore, BDI, Capesize rates)
using Yahoo Finance and open exchange rate APIs with in-memory caching and resilient fallbacks.
"""

import os
import time
import json
import urllib.request
from datetime import datetime
from typing import Dict, Any, Optional

# Cache configuration
_LIVE_MARKET_CACHE: Dict[str, Any] = {
    "data": None,
    "last_updated": 0,
    "ttl_seconds": 300  # 5 minutes cache
}

def fetch_live_usd_inr() -> Optional[float]:
    """Fetch live USD/INR exchange rate from fast public exchange rate APIs with fallback to yfinance."""
    # 1. Fast REST API (sub-second response)
    try:
        req = urllib.request.Request(
            'https://open.er-api.com/v6/latest/USD',
            headers={'User-Agent': 'FreightForecastingApp/2.0'}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if 'rates' in data and 'INR' in data['rates']:
                rate = float(data['rates']['INR'])
                if 70.0 <= rate <= 120.0:
                    return round(rate, 2)
    except Exception as e:
        pass

    # 2. Frankfurter API (ECB reference rate fallback)
    try:
        req = urllib.request.Request(
            'https://api.frankfurter.app/latest?from=USD&to=INR',
            headers={'User-Agent': 'FreightForecastingApp/2.0'}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if 'rates' in data and 'INR' in data['rates']:
                rate = float(data['rates']['INR'])
                if 70.0 <= rate <= 120.0:
                    return round(rate, 2)
    except Exception:
        pass

    return None


def get_live_market_data(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Get live real-time market data indicators.
    Caches results in memory for 5 minutes.
    """
    now = time.time()
    if not force_refresh and _LIVE_MARKET_CACHE["data"] is not None:
        if now - _LIVE_MARKET_CACHE["last_updated"] < _LIVE_MARKET_CACHE["ttl_seconds"]:
            return _LIVE_MARKET_CACHE["data"].copy()

    # Base baseline values
    today_str = datetime.now().strftime("%Y-%m-%d")
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M UTC")

    market_result = {
        "date": today_str,
        "timestamp": current_time_str,
        "is_live_feed": False,
        "bdi": 2359,
        "bdi_change_pct": 2.4,
        "capesize_rate_usd_mt": 23.94,
        "panamax_rate_usd_mt": 18.19,
        "supramax_rate_usd_mt": 15.65,
        "handysize_rate_usd_mt": 13.80,
        "bunker_vlsfo_usd_mt": 782.95,
        "crude_oil": 99.29,
        "iron_ore": 97.57,
        "usd_inr": 95.86,
        "source": "Historical Market Calibration Baseline"
    }

    # Step 1: Try fetching batch financial tickers from yfinance
    try:
        import yfinance as yf
        tickers = ['INR=X', 'BZ=F', 'TIO=F', 'BDRY']
        downloaded = yf.download(tickers, period='5d', progress=False)

        if downloaded is not None and not downloaded.empty:
            close_df = downloaded['Close'] if 'Close' in downloaded else downloaded

            # 1. USD/INR
            try:
                if 'INR=X' in close_df:
                    val = close_df['INR=X'].dropna().iloc[-1]
                    if isinstance(val, (int, float)) and 70.0 <= val <= 120.0:
                        market_result["usd_inr"] = round(float(val), 2)
                        market_result["is_live_feed"] = True
            except Exception:
                pass

            # 2. Brent Crude & Bunker VLSFO
            try:
                if 'BZ=F' in close_df:
                    brent = close_df['BZ=F'].dropna().iloc[-1]
                    if isinstance(brent, (int, float)) and 40.0 <= brent <= 180.0:
                        market_result["crude_oil"] = round(float(brent), 2)
                        # VLSFO = Brent * 7.33 (barrels to MT) + $55 refining crack spread
                        vlsfo = (float(brent) * 7.33) + 55.0
                        market_result["bunker_vlsfo_usd_mt"] = round(vlsfo, 2)
                        market_result["is_live_feed"] = True
            except Exception:
                pass

            # 3. Iron Ore 62% Fe CFR China
            try:
                if 'TIO=F' in close_df:
                    iron = close_df['TIO=F'].dropna().iloc[-1]
                    if isinstance(iron, (int, float)) and 50.0 <= iron <= 250.0:
                        market_result["iron_ore"] = round(float(iron), 2)
                        market_result["is_live_feed"] = True
            except Exception:
                pass

            # 4. BDRY / Dry Bulk Freight Index
            try:
                if 'BDRY' in close_df:
                    bdry = close_df['BDRY'].dropna().iloc[-1]
                    if isinstance(bdry, (int, float)) and bdry > 0:
                        bdry_val = float(bdry)
                        # BDRY maps to Baltic Dry Index and Capesize rate
                        bdi_est = int(round((bdry_val * 145.0) + 120.0))
                        market_result["bdi"] = max(800, min(5500, bdi_est))
                        cape_est = round(10.50 + (bdry_val * 0.85), 2)
                        market_result["capesize_rate_usd_mt"] = cape_est
                        market_result["panamax_rate_usd_mt"] = round(cape_est * 0.76, 2)
                        market_result["supramax_rate_usd_mt"] = round(cape_est * 0.65, 2)
                        market_result["handysize_rate_usd_mt"] = round(cape_est * 0.58, 2)
                        market_result["is_live_feed"] = True
            except Exception:
                pass

            market_result["source"] = "Yahoo Finance & Global Market Tickers (Real-Time)"

    except Exception as e:
        # Fallback or supplementary live API query for USD/INR
        pass

    # Step 2: Ensure USD/INR is live via fast REST API if yfinance was missing it
    if not market_result["is_live_feed"] or market_result["usd_inr"] < 90.0:
        fast_usd_inr = fetch_live_usd_inr()
        if fast_usd_inr:
            market_result["usd_inr"] = fast_usd_inr
            market_result["is_live_feed"] = True
            market_result["source"] = "Live Currency & Market Feed"

    # Store in memory cache
    _LIVE_MARKET_CACHE["data"] = market_result
    _LIVE_MARKET_CACHE["last_updated"] = now

    return market_result.copy()
