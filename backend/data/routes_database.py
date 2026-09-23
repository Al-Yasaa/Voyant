"""
Routes, Ports, and Maritime Database
Specifications for India East Coast Ports, Global Origins, Vessels, and Cost Parameters.
Includes full physical infrastructure limits (Draft, LOA, Beam, Discharge Rates),
all key East Coast discharge hubs (Paradip, Dhamra, Vizag, Gangavaram, Gopalpur, Sandheads, Haldia),
and multi-vessel engineering optimization.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

# Major East Coast India Ports (Discharge Ports for Steel Ministry & Private Mills)
EAST_COAST_PORTS: Dict[str, Dict[str, Any]] = {
    "Paradip": {
        "name": "Paradip Port",
        "state": "Odisha",
        "code": "INPRT",
        "lat": 20.26,
        "lon": 86.67,
        "max_draft_m": 18.7,
        "max_loa_m": 300.0,
        "max_beam_m": 48.0,
        "max_dwt": 180000,
        "max_vessel_class": "Capesize",
        "mechanized_coal_berth": True,
        "discharge_rate_mt_day": 45000,
        "baseline_waiting_days": 3.5,
        "monsoon_risk": "High (Bay of Bengal Cyclones Oct-Dec, Swell Jun-Sep)",
        "rail_connectivity": "East Coast Railway (Direct link to Rourkela/Kalinganagar/JSP/TATA belt)",
        "lighterage_required": False,
        "lighterage_cost_usd_mt": 0.0,
        "demurrage_rate_capesize_usd_day": 32000,
        "demurrage_rate_panamax_usd_day": 20000,
        "demurrage_rate_supramax_usd_day": 16000,
        "demurrage_rate_handysize_usd_day": 13000,
        "notes": "Primary deep-water coal import hub for Odisha/Jharkhand steel plants."
    },
    "Dhamra": {
        "name": "Dhamra Port",
        "state": "Odisha",
        "code": "INDHM",
        "lat": 20.80,
        "lon": 86.97,
        "max_draft_m": 18.0,
        "max_loa_m": 320.0,
        "max_beam_m": 50.0,
        "max_dwt": 180000,
        "max_vessel_class": "Capesize",
        "mechanized_coal_berth": True,
        "discharge_rate_mt_day": 50000,
        "baseline_waiting_days": 1.5,
        "monsoon_risk": "Moderate-High (Protected all-weather deep water)",
        "rail_connectivity": "Bhadrak-Dhamra dedicated railway line",
        "lighterage_required": False,
        "lighterage_cost_usd_mt": 0.0,
        "demurrage_rate_capesize_usd_day": 30000,
        "demurrage_rate_panamax_usd_day": 18000,
        "demurrage_rate_supramax_usd_day": 15000,
        "demurrage_rate_handysize_usd_day": 12000,
        "notes": "Adani-operated modern deep-water port, highest mechanized turnaround on East Coast."
    },
    "Visakhapatnam": {
        "name": "Visakhapatnam (Vizag) Port",
        "state": "Andhra Pradesh",
        "code": "INVTZ",
        "lat": 17.68,
        "lon": 83.21,
        "max_draft_m": 16.5,
        "max_loa_m": 260.0,
        "max_beam_m": 38.0,
        "max_dwt": 120000,
        "max_vessel_class": "Panamax / Baby Cape",
        "mechanized_coal_berth": True,
        "discharge_rate_mt_day": 35000,
        "baseline_waiting_days": 2.5,
        "monsoon_risk": "Moderate",
        "rail_connectivity": "Waltair Division, direct link to Rashtriya Ispat Nigam Ltd (RINL)",
        "lighterage_required": False,
        "lighterage_cost_usd_mt": 0.0,
        "demurrage_rate_capesize_usd_day": 28000,
        "demurrage_rate_panamax_usd_day": 18500,
        "demurrage_rate_supramax_usd_day": 15500,
        "demurrage_rate_handysize_usd_day": 12500,
        "notes": "Direct pipeline/conveyor to RINL (Vizag Steel). Draft limits full-laden standard Capesize."
    },
    "Gangavaram": {
        "name": "Gangavaram Port",
        "state": "Andhra Pradesh",
        "code": "INGGV",
        "lat": 17.61,
        "lon": 83.24,
        "max_draft_m": 19.5,
        "max_loa_m": 320.0,
        "max_beam_m": 50.0,
        "max_dwt": 200000,
        "max_vessel_class": "Capesize",
        "mechanized_coal_berth": True,
        "discharge_rate_mt_day": 55000,
        "baseline_waiting_days": 1.8,
        "monsoon_risk": "Low-Moderate (Deepest all-weather port in India)",
        "rail_connectivity": "Direct mainline connectivity to Vizag, SAIL Bhilai, and NMDC Nagarnar plants",
        "lighterage_required": False,
        "lighterage_cost_usd_mt": 0.0,
        "demurrage_rate_capesize_usd_day": 31000,
        "demurrage_rate_panamax_usd_day": 19000,
        "demurrage_rate_supramax_usd_day": 15000,
        "demurrage_rate_handysize_usd_day": 12000,
        "notes": "Deepest draft port in India (19.5m). Capable of fully unladen Newcastlemax & standard Capesizes without lighterage."
    },
    "Gopalpur": {
        "name": "Gopalpur Port",
        "state": "Odisha",
        "code": "INGPL",
        "lat": 19.30,
        "lon": 84.97,
        "max_draft_m": 14.5,
        "max_loa_m": 225.0,
        "max_beam_m": 33.0,
        "max_dwt": 85000,
        "max_vessel_class": "Panamax / Supramax",
        "mechanized_coal_berth": True,
        "discharge_rate_mt_day": 30000,
        "baseline_waiting_days": 2.2,
        "monsoon_risk": "Moderate (Southern Odisha all-weather gateway)",
        "rail_connectivity": "Chatrapur link on Howrah-Chennai mainline, serving Tata Steel SEZ & Jindal",
        "lighterage_required": False,
        "lighterage_cost_usd_mt": 0.0,
        "demurrage_rate_capesize_usd_day": 0,  # Capesize draft/LOA exceeded
        "demurrage_rate_panamax_usd_day": 17500,
        "demurrage_rate_supramax_usd_day": 14500,
        "demurrage_rate_handysize_usd_day": 11500,
        "notes": "Strategic southern Odisha port. Ideal for Panamax and Supramax parcels feeding South Odisha & Central India steel hubs."
    },
    "Sandheads_Sagar": {
        "name": "Sagar Island / Sandheads Anchorage",
        "state": "West Bengal",
        "code": "INSAG",
        "lat": 21.65,
        "lon": 88.08,
        "max_draft_m": 18.0,
        "max_loa_m": 300.0,
        "max_beam_m": 45.0,
        "max_dwt": 180000,
        "max_vessel_class": "Capesize",
        "mechanized_coal_berth": False,
        "discharge_rate_mt_day": 20000,
        "baseline_waiting_days": 4.0,
        "monsoon_risk": "Severe (Open sea anchorage, rough swells during Jun-Sep)",
        "rail_connectivity": "Barge transshipment to Haldia/Kolkata docks and National Waterway 1 (Ganges)",
        "lighterage_required": True,
        "lighterage_cost_usd_mt": 3.80,
        "demurrage_rate_capesize_usd_day": 29000,
        "demurrage_rate_panamax_usd_day": 18000,
        "demurrage_rate_supramax_usd_day": 15000,
        "demurrage_rate_handysize_usd_day": 12000,
        "notes": "Outer deep-water anchorage for Capesize/Panamax mid-stream lighterage into barges before sailing to draft-restricted Haldia."
    },
    "Haldia": {
        "name": "Haldia Dock Complex (SMP Kolkata)",
        "state": "West Bengal",
        "code": "INHAL",
        "lat": 22.02,
        "lon": 88.06,
        "max_draft_m": 9.1,
        "max_loa_m": 230.0,
        "max_beam_m": 32.5,
        "max_dwt": 55000,
        "max_vessel_class": "Supramax / Handysize only",
        "mechanized_coal_berth": False,
        "discharge_rate_mt_day": 15000,
        "baseline_waiting_days": 5.0,
        "monsoon_risk": "Severe (Hooghly river silting, bore tides & tidal draft constraints)",
        "rail_connectivity": "South Eastern Railway (Direct link to Durgapur, Burnpur/SAIL, and Asansol belt)",
        "lighterage_required": True,
        "lighterage_cost_usd_mt": 4.20,
        "demurrage_rate_capesize_usd_day": 0,  # Capesize cannot enter
        "demurrage_rate_panamax_usd_day": 22000,
        "demurrage_rate_supramax_usd_day": 17000,
        "demurrage_rate_handysize_usd_day": 13500,
        "notes": "Shallow riverine port. Large vessels require transshipment / lighterage at Sandheads/anchorage. Handysize/Supramax preferred."
    }
}

# Major Global Origin Ports for Raw Material Imports (Coking Coal, Iron Ore, Fluxes)
ORIGIN_PORTS: Dict[str, Dict[str, Any]] = {
    "Australia_HayPoint": {
        "name": "Hay Point / Dalrymple Bay",
        "country": "Australia",
        "region": "Queensland",
        "primary_commodity": "Hard Coking Coal (HCC)",
        "vessel_suitability": ["Capesize", "Panamax", "Supramax", "Handysize"],
        "max_loading_draft_m": 19.0,
        "max_loa_m": 330.0,
        "lat": -21.28,
        "lon": 149.30
    },
    "Australia_PortHedland": {
        "name": "Port Hedland / Dampier",
        "country": "Australia",
        "region": "Western Australia",
        "primary_commodity": "Iron Ore (Fines & Lump)",
        "vessel_suitability": ["Capesize", "Panamax", "Supramax"],
        "max_loading_draft_m": 19.8,
        "max_loa_m": 340.0,
        "lat": -20.31,
        "lon": 118.57
    },
    "USA_HamptonRoads": {
        "name": "Hampton Roads (Norfolk/Newport News)",
        "country": "USA",
        "region": "US East Coast",
        "primary_commodity": "High-Vol / Low-Vol Metallurgical Coal",
        "vessel_suitability": ["Capesize", "Panamax", "Supramax", "Handysize"],
        "max_loading_draft_m": 15.2,
        "max_loa_m": 300.0,
        "lat": 36.95,
        "lon": -76.32
    },
    "Mozambique_Maputo": {
        "name": "Maputo / Matola Coal Terminal",
        "country": "Mozambique",
        "region": "Southern Africa",
        "primary_commodity": "Coking & Thermal Coal",
        "vessel_suitability": ["Panamax", "Supramax", "Handysize"],
        "max_loading_draft_m": 14.5,
        "max_loa_m": 250.0,
        "lat": -25.96,
        "lon": 32.58
    },
    "SouthAfrica_RichardsBay": {
        "name": "Richards Bay Coal Terminal (RBCT)",
        "country": "South Africa",
        "region": "Southern Africa",
        "primary_commodity": "High-CV Thermal & Met Coal",
        "vessel_suitability": ["Capesize", "Panamax", "Supramax"],
        "max_loading_draft_m": 17.5,
        "max_loa_m": 315.0,
        "lat": -28.80,
        "lon": 32.05
    },
    "Indonesia_Taboneo": {
        "name": "Taboneo / Samarinda Anchorage",
        "country": "Indonesia",
        "region": "Kalimantan",
        "primary_commodity": "Thermal Coal / PCI Coal",
        "vessel_suitability": ["Panamax", "Supramax", "Handysize", "Capesize"],
        "max_loading_draft_m": 18.0,
        "max_loa_m": 300.0,
        "lat": -3.75,
        "lon": 114.45
    }
}

# Standard Nautical Mile Distances by Route (Origin -> Destination)
ROUTE_DISTANCES: Dict[str, Dict[str, int]] = {
    "Australia_HayPoint": {
        "Paradip": 5280,
        "Dhamra": 5320,
        "Visakhapatnam": 5150,
        "Gangavaram": 5140,
        "Gopalpur": 5210,
        "Sandheads_Sagar": 5380,
        "Haldia": 5410
    },
    "Australia_PortHedland": {
        "Paradip": 3650,
        "Dhamra": 3690,
        "Visakhapatnam": 3520,
        "Gangavaram": 3510,
        "Gopalpur": 3580,
        "Sandheads_Sagar": 3750,
        "Haldia": 3780
    },
    "USA_HamptonRoads": {
        "Paradip": 9650,
        "Dhamra": 9690,
        "Visakhapatnam": 9520,
        "Gangavaram": 9510,
        "Gopalpur": 9580,
        "Sandheads_Sagar": 9750,
        "Haldia": 9780
    },
    "Mozambique_Maputo": {
        "Paradip": 3980,
        "Dhamra": 4020,
        "Visakhapatnam": 3850,
        "Gangavaram": 3840,
        "Gopalpur": 3910,
        "Sandheads_Sagar": 4080,
        "Haldia": 4110
    },
    "SouthAfrica_RichardsBay": {
        "Paradip": 4710,
        "Dhamra": 4750,
        "Visakhapatnam": 4580,
        "Gangavaram": 4570,
        "Gopalpur": 4640,
        "Sandheads_Sagar": 4810,
        "Haldia": 4840
    },
    "Indonesia_Taboneo": {
        "Paradip": 2250,
        "Dhamra": 2290,
        "Visakhapatnam": 2100,
        "Gangavaram": 2090,
        "Gopalpur": 2170,
        "Sandheads_Sagar": 2350,
        "Haldia": 2380
    }
}

# Vessel Class Specifications (Capesize, Panamax, Supramax, Handysize)
VESSEL_CLASSES: Dict[str, Dict[str, Any]] = {
    "Capesize": {
        "name": "Capesize Bulk Carrier",
        "dwt_range": [150000, 210000],
        "default_capacity_mt": 170000,
        "typical_draft_laden_m": 18.2,
        "typical_loa_m": 295.0,
        "typical_beam_m": 45.0,
        "speed_knots_laden": 12.5,
        "speed_knots_ballast": 13.5,
        "vlsfo_consumption_sea_mt_day": 52.0,
        "mgo_consumption_port_mt_day": 3.0,
        "daily_operating_cost_usd": 7800,
        "ballast_bonus_typical_usd": 350000,
        "category_badge": "Long-Haul Bulk Titan",
        "description": "Standard workhorse for long-haul coking coal and iron ore from Australia & USA. Maximum economies of scale for deep-water ports."
    },
    "Panamax": {
        "name": "Panamax / Kamsarmax",
        "dwt_range": [70000, 85000],
        "default_capacity_mt": 75000,
        "typical_draft_laden_m": 14.5,
        "typical_loa_m": 225.0,
        "typical_beam_m": 32.3,
        "speed_knots_laden": 13.0,
        "speed_knots_ballast": 14.0,
        "vlsfo_consumption_sea_mt_day": 28.0,
        "mgo_consumption_port_mt_day": 2.5,
        "daily_operating_cost_usd": 5800,
        "ballast_bonus_typical_usd": 150000,
        "category_badge": "Versatile Mid-Bulk",
        "description": "Versatile mid-sized vessel for Mozambique, Indonesia, Gopalpur, and draft-restricted Indian East Coast ports."
    },
    "Supramax": {
        "name": "Supramax / Ultramax",
        "dwt_range": [50000, 65000],
        "default_capacity_mt": 58000,
        "typical_draft_laden_m": 12.8,
        "typical_loa_m": 199.0,
        "typical_beam_m": 32.2,
        "speed_knots_laden": 13.5,
        "speed_knots_ballast": 14.2,
        "vlsfo_consumption_sea_mt_day": 22.0,
        "mgo_consumption_port_mt_day": 2.0,
        "daily_operating_cost_usd": 4800,
        "ballast_bonus_typical_usd": 80000,
        "category_badge": "Geared Flexible Carrier",
        "description": "Geared vessel with onboard cranes and grabs. High flexibility for intermediate drafts and regional discharge ports."
    },
    "Handysize": {
        "name": "Handysize Bulk Carrier",
        "dwt_range": [30000, 45000],
        "default_capacity_mt": 38000,
        "typical_draft_laden_m": 10.2,
        "typical_loa_m": 180.0,
        "typical_beam_m": 28.0,
        "speed_knots_laden": 13.0,
        "speed_knots_ballast": 13.8,
        "vlsfo_consumption_sea_mt_day": 16.0,
        "mgo_consumption_port_mt_day": 1.8,
        "daily_operating_cost_usd": 4200,
        "ballast_bonus_typical_usd": 50000,
        "category_badge": "Shallow Port Specialist",
        "description": "Shallow-draft handy vessel capable of directly berthing at shallow ports (e.g. Haldia, coastal private jetties) without heavy lighterage."
    }
}


def get_route_details(origin_key: str, destination_key: str, vessel_key: str) -> Dict[str, Any]:
    """
    Retrieve full engineering specifications, physical clearance checks (Draft, LOA, Beam),
    and voyage economics for a chosen route.
    """
    if origin_key not in ORIGIN_PORTS:
        raise ValueError(f"Unknown origin: {origin_key}")
    if destination_key not in EAST_COAST_PORTS:
        raise ValueError(f"Unknown destination: {destination_key}")
    if vessel_key not in VESSEL_CLASSES:
        raise ValueError(f"Unknown vessel class: {vessel_key}")

    origin = ORIGIN_PORTS[origin_key]
    dest = EAST_COAST_PORTS[destination_key]
    vessel = VESSEL_CLASSES[vessel_key]
    distance = ROUTE_DISTANCES.get(origin_key, {}).get(destination_key, 5000)

    # Physical Dimension & Clearance Checks
    # 1. Draft check
    is_draft_compatible = vessel["typical_draft_laden_m"] <= dest["max_draft_m"]
    draft_clearance_m = round(dest["max_draft_m"] - vessel["typical_draft_laden_m"], 2)

    # 2. LOA check
    is_loa_compatible = vessel["typical_loa_m"] <= dest["max_loa_m"]
    loa_clearance_m = round(dest["max_loa_m"] - vessel["typical_loa_m"], 1)

    # 3. Beam check
    is_beam_compatible = vessel["typical_beam_m"] <= dest["max_beam_m"]
    beam_clearance_m = round(dest["max_beam_m"] - vessel["typical_beam_m"], 1)

    # Overall physical fit
    is_fully_compatible = is_draft_compatible and is_loa_compatible and is_beam_compatible

    # Lighterage requirements: Haldia or Sandheads, or when draft exceeds max draft
    requires_lighterage = dest["lighterage_required"] or (not is_draft_compatible)

    # Voyage duration calculation (One-way laden sea voyage)
    speed_knots = vessel["speed_knots_laden"]
    sea_days = round(distance / (speed_knots * 24), 1)
    port_days = round((vessel["default_capacity_mt"] / dest["discharge_rate_mt_day"]) + dest["baseline_waiting_days"], 1)
    total_voyage_days = round(sea_days + port_days, 1)

    # Estimated Bunker Fuel Consumption for voyage (MT VLSFO)
    total_vlsfo_mt = round(sea_days * vessel["vlsfo_consumption_sea_mt_day"] + port_days * vessel["mgo_consumption_port_mt_day"], 1)

    return {
        "route_id": f"{origin_key}_to_{destination_key}_{vessel_key}",
        "origin": origin,
        "destination": dest,
        "vessel": vessel,
        "distance_nm": distance,
        "sea_days": sea_days,
        "port_days": port_days,
        "total_voyage_days": total_voyage_days,
        "total_vlsfo_mt": total_vlsfo_mt,
        # Clearance checks
        "is_draft_compatible": is_draft_compatible,
        "draft_clearance_m": draft_clearance_m,
        "is_loa_compatible": is_loa_compatible,
        "loa_clearance_m": loa_clearance_m,
        "is_beam_compatible": is_beam_compatible,
        "beam_clearance_m": beam_clearance_m,
        "is_fully_compatible": is_fully_compatible,
        # Lighterage & Costs
        "requires_lighterage": requires_lighterage,
        "lighterage_cost_usd_mt": dest["lighterage_cost_usd_mt"] if requires_lighterage else 0.0,
        "port_demurrage_rate_day": dest.get(f"demurrage_rate_{vessel_key.lower()}_usd_day", 18000)
    }


def list_all_available_routes() -> List[Dict[str, Any]]:
    """Return a flat list of all operational combinations."""
    routes = []
    for o_key, o_val in ORIGIN_PORTS.items():
        for d_key, d_val in EAST_COAST_PORTS.items():
            for v_key in o_val.get("vessel_suitability", ["Capesize", "Panamax", "Supramax", "Handysize"]):
                if v_key in VESSEL_CLASSES:
                    details = get_route_details(o_key, d_key, v_key)
                    routes.append({
                        "route_code": f"{o_key}__{d_key}__{v_key}",
                        "origin_key": o_key,
                        "origin_name": o_val["name"],
                        "origin_country": o_val["country"],
                        "destination_key": d_key,
                        "destination_name": d_val["name"],
                        "commodity": o_val["primary_commodity"],
                        "vessel_class": v_key,
                        "distance_nm": details["distance_nm"],
                        "sea_days": details["sea_days"],
                        "is_compatible": details["is_fully_compatible"],
                        "requires_lighterage": details["requires_lighterage"]
                    })
    return routes


def compare_and_optimize_vessels(
    origin_key: str,
    destination_key: str,
    cargo_volume_mt: float,
    base_market_rate_usd_mt: float,
    bunker_price_usd_mt: float,
    usd_inr_rate: float
) -> Dict[str, Any]:
    """
    Vessel Optimization Engine:
    Evaluates Capesize, Panamax, Supramax, and Handysize across the given route.
    Calculates total landed freight cost per MT (including base freight, bunker fuel factor,
    lighterage if needed, and port demurrage risk), identifies physical feasibility,
    and returns a ranked comparison with the RECOMMENDED OPTIMAL VESSEL.
    """
    candidates = []
    dest = EAST_COAST_PORTS[destination_key]

    for v_key, v_specs in VESSEL_CLASSES.items():
        try:
            details = get_route_details(origin_key, destination_key, v_key)
        except Exception:
            continue

        # Route economics multiplier based on vessel scale and distance
        baseline_distance = 5000  # nm
        dist_factor = details["distance_nm"] / baseline_distance

        # Scale efficiency factor: larger vessels deliver lower cost/MT on long dry bulk hauls
        vessel_scale_factor = {
            "Capesize": 1.0,
            "Panamax": 1.18,
            "Supramax": 1.34,
            "Handysize": 1.55
        }.get(v_key, 1.2)

        # Bunker fuel cost contribution per MT of cargo
        shipment_capacity = v_specs["default_capacity_mt"]
        voyage_fuel_cost_usd = details["total_vlsfo_mt"] * bunker_price_usd_mt
        fuel_cost_per_mt = voyage_fuel_cost_usd / shipment_capacity

        # Base freight estimate ($/MT)
        raw_rate = (base_market_rate_usd_mt * dist_factor * vessel_scale_factor)

        # Lighterage add-on if applicable
        lighterage_cost = details["lighterage_cost_usd_mt"]
        effective_freight_rate = raw_rate + lighterage_cost

        # Number of shipments needed for the requested volume
        num_shipments = max(1, round(cargo_volume_mt / shipment_capacity, 1))
        total_cargo_cost_usd = effective_freight_rate * cargo_volume_mt
        total_cargo_cost_inr_cr = (total_cargo_cost_usd * usd_inr_rate) / 10000000.0

        # Physical clearance summary
        clearance_summary = []
        if not details["is_draft_compatible"]:
            clearance_summary.append(f"Draft exceeds limit ({v_specs['typical_draft_laden_m']}m > {dest['max_draft_m']}m)")
        if not details["is_loa_compatible"]:
            clearance_summary.append(f"LOA exceeds limit ({v_specs['typical_loa_m']}m > {dest['max_loa_m']}m)")
        if not details["is_beam_compatible"]:
            clearance_summary.append(f"Beam exceeds limit ({v_specs['typical_beam_m']}m > {dest['max_beam_m']}m)")

        # Suitability score (lower landed cost + full clearance = best score)
        # Infeasible vessels without lighterage receive penalty
        penalty = 50.0 if not details["is_fully_compatible"] and not details["requires_lighterage"] else 0.0
        score = effective_freight_rate + penalty

        candidates.append({
            "vessel_key": v_key,
            "vessel_name": v_specs["name"],
            "category_badge": v_specs["category_badge"],
            "capacity_mt": shipment_capacity,
            "estimated_rate_usd_mt": round(effective_freight_rate, 2),
            "base_rate_usd_mt": round(raw_rate, 2),
            "lighterage_cost_usd_mt": round(lighterage_cost, 2),
            "total_voyage_days": details["total_voyage_days"],
            "sea_days": details["sea_days"],
            "port_days": details["port_days"],
            "fuel_consumption_mt": details["total_vlsfo_mt"],
            "is_fully_compatible": details["is_fully_compatible"],
            "is_draft_compatible": details["is_draft_compatible"],
            "is_loa_compatible": details["is_loa_compatible"],
            "is_beam_compatible": details["is_beam_compatible"],
            "requires_lighterage": details["requires_lighterage"],
            "clearance_warnings": clearance_summary,
            "total_cost_usd": round(total_cargo_cost_usd, 2),
            "total_cost_inr_cr": round(total_cargo_cost_inr_cr, 2),
            "num_shipments_needed": num_shipments,
            "_score": score
        })

    # Sort candidates by cost/score
    candidates.sort(key=lambda x: x["_score"])

    # Determine recommended optimal vessel and add ranking
    optimal_vessel = candidates[0] if candidates else None
    for i, cand in enumerate(candidates):
        is_opt = (cand == optimal_vessel)
        cand["rank"] = i + 1
        cand["is_optimal"] = is_opt
        cand["is_recommended"] = is_opt

    return {
        "origin": origin_key,
        "destination": destination_key,
        "origin_key": origin_key,
        "destination_key": destination_key,
        "cargo_volume_mt": cargo_volume_mt,
        "recommended_vessel_class": optimal_vessel["vessel_key"] if optimal_vessel else "Capesize",
        "optimal_vessel_key": optimal_vessel["vessel_key"] if optimal_vessel else "Capesize",
        "optimal_vessel_name": optimal_vessel["vessel_name"] if optimal_vessel else "Capesize",
        "optimal_rate_usd_mt": optimal_vessel["estimated_rate_usd_mt"] if optimal_vessel else 0.0,
        "recommendation_reason": (
            f"Delivers the lowest landed cost (${optimal_vessel['estimated_rate_usd_mt']}/MT) "
            f"with {optimal_vessel['total_voyage_days']} days total turnaround time and optimal port fit."
            if optimal_vessel else "Standard baseline."
        ),
        "evaluated_options": candidates,
        "vessel_options": candidates
    }


def check_port_physical_clearance(destination_key: str, vessel_class_key: str) -> Dict[str, Any]:
    """
    3-Dimensional Physical Port Clearance Engine:
    Validates Maximum Draft (m), Maximum LOA (m), and Maximum Beam (m) limits
    for any Indian East Coast destination port and vessel class.
    Identifies if direct berthing is cleared or if lighterage transshipment is required.
    """
    dest = EAST_COAST_PORTS.get(destination_key, EAST_COAST_PORTS["Paradip"])
    vessel = VESSEL_CLASSES.get(vessel_class_key, VESSEL_CLASSES["Capesize"])

    draft_cleared = vessel["typical_draft_laden_m"] <= dest["max_draft_m"]
    draft_clearance_m = round(dest["max_draft_m"] - vessel["typical_draft_laden_m"], 2)

    loa_cleared = vessel["typical_loa_m"] <= dest["max_loa_m"]
    loa_clearance_m = round(dest["max_loa_m"] - vessel["typical_loa_m"], 1)

    beam_cleared = vessel["typical_beam_m"] <= dest["max_beam_m"]
    beam_clearance_m = round(dest["max_beam_m"] - vessel["typical_beam_m"], 1)

    warnings = []
    if not draft_cleared:
        warnings.append(f"Draft Alert: Vessel laden draft ({vessel['typical_draft_laden_m']}m) exceeds port max draft ({dest['max_draft_m']}m). Lighterage required.")
    if not loa_cleared:
        warnings.append(f"LOA Alert: Vessel length ({vessel['typical_loa_m']}m) exceeds port max LOA ({dest['max_loa_m']}m).")
    if not beam_cleared:
        warnings.append(f"Beam Alert: Vessel beam ({vessel['typical_beam_m']}m) exceeds berth max beam ({dest['max_beam_m']}m).")

    if dest.get("lighterage_required") or (not draft_cleared):
        overall = "LIGHTERAGE_REQUIRED" if (not draft_cleared or dest.get("lighterage_required")) else "WARNING"
    elif draft_cleared and loa_cleared and beam_cleared:
        overall = "PASSED"
    else:
        overall = "WARNING"

    requires_lighterage = dest.get("lighterage_required", False) or (not draft_cleared)

    return {
        "port_name": dest["name"],
        "port_key": destination_key,
        "vessel_class": vessel["name"],
        "vessel_key": vessel_class_key,
        "max_draft_m": dest["max_draft_m"],
        "vessel_draft_m": vessel["typical_draft_laden_m"],
        "draft_cleared": draft_cleared,
        "draft_clearance_m": draft_clearance_m,
        "max_loa_m": dest["max_loa_m"],
        "vessel_loa_m": vessel["typical_loa_m"],
        "loa_cleared": loa_cleared,
        "loa_clearance_m": loa_clearance_m,
        "max_beam_m": dest["max_beam_m"],
        "vessel_beam_m": vessel["typical_beam_m"],
        "beam_cleared": beam_cleared,
        "beam_clearance_m": beam_clearance_m,
        "overall_clearance": overall,
        "lighterage_required": requires_lighterage,
        "lighterage_cost_usd_mt": dest.get("lighterage_cost_usd_mt", 0.0) if requires_lighterage else 0.0,
        "discharge_rate_mt_day": dest.get("discharge_rate_mt_day", 35000),
        "clearance_warnings": warnings
    }


def calculate_contract_duration_strategy(
    spot_rate_usd_mt: float,
    cargo_volume_mt: float = 170000,
    is_bullish: bool = False,
    is_bearish: bool = False,
    usd_inr_rate: float = 83.2
) -> Dict[str, Any]:
    """
    Contract Timing Strategy Matrix:
    Compares Spot Fixture vs 1-Month Forward Contract vs 3-Month Period COA.
    """
    forward_1m = round(spot_rate_usd_mt * (1.04 if is_bullish else 0.97 if is_bearish else 1.01), 2)
    forward_3m = round(spot_rate_usd_mt * (1.08 if is_bullish else 0.94 if is_bearish else 1.03), 2)

    if is_bullish:
        rec_type = "3_MONTH_PERIOD_COA"
        rationale = "Freight forward curve indicates rising rates (+8%). Lock in a 3-month Contract of Affreightment (COA) immediately to hedge against spot price spikes."
    elif is_bearish:
        rec_type = "SPOT_FIXTURE"
        rationale = "Forward market is in backwardation / softening (-6%). Rely on Spot fixtures with delayed laycan windows to capture lower spot rates."
    else:
        rec_type = "SPOT_FIXTURE"
        rationale = "Freight curve is stable within standard historical range. Execute prompt spot chartering for immediate baseline delivery."

    total_spot_cost_usd = round(spot_rate_usd_mt * cargo_volume_mt, 2)
    total_spot_cost_inr_cr = round((total_spot_cost_usd * usd_inr_rate) / 10000000.0, 2)

    total_1m_cost_usd = round(forward_1m * cargo_volume_mt, 2)
    total_1m_cost_inr_cr = round((total_1m_cost_usd * usd_inr_rate) / 10000000.0, 2)

    total_3m_cost_usd = round(forward_3m * cargo_volume_mt, 2)
    total_3m_cost_inr_cr = round((total_3m_cost_usd * usd_inr_rate) / 10000000.0, 2)

    contract_options = [
        {
            "contract_type": "Spot Fixture (Single Voyage)",
            "rate_usd_mt": spot_rate_usd_mt,
            "cost_inr_crore": total_spot_cost_inr_cr,
            "duration": "Prompt (0-15 Days)",
            "risk_profile": "High spot exposure; instant capacity",
            "is_recommended": rec_type == "SPOT_FIXTURE"
        },
        {
            "contract_type": "1-Month Forward Contract",
            "rate_usd_mt": forward_1m,
            "cost_inr_crore": total_1m_cost_inr_cr,
            "duration": "30 Days Laycan",
            "risk_profile": "Medium hedge; near-term volume security",
            "is_recommended": rec_type == "1_MONTH_FORWARD"
        },
        {
            "contract_type": "3-Month Period COA",
            "rate_usd_mt": forward_3m,
            "cost_inr_crore": total_3m_cost_inr_cr,
            "duration": "90 Days Quarterly",
            "risk_profile": "Full price lock; insulated against volatility",
            "is_recommended": rec_type == "3_MONTH_PERIOD_COA"
        }
    ]

    return {
        "recommended_contract_type": rec_type,
        "spot_rate_usd_mt": spot_rate_usd_mt,
        "forward_1m_rate_usd_mt": forward_1m,
        "forward_3m_coa_rate_usd_mt": forward_3m,
        "cargo_volume_mt": cargo_volume_mt,
        "total_spot_cost_usd": total_spot_cost_usd,
        "total_spot_cost_inr_crore": total_spot_cost_inr_cr,
        "rationale": rationale,
        "contract_options": contract_options
    }


def generate_procurement_tender_sheet(
    origin_key: str,
    destination_key: str,
    vessel_class: str,
    cargo_volume_mt: float = 170000,
    commodity_type: str = "Hard Coking Coal",
    forecast_rate_usd_mt: float = 24.50,
    usd_inr_rate: float = 83.2,
    laycan_start: Optional[str] = None,
    laycan_end: Optional[str] = None,
    charterer_name: str = "Ministry of Steel / Steel Authority of India Ltd (SAIL) & RINL Joint Procurement Desk"
) -> Dict[str, Any]:
    """
    Generates a formal commercial Procurement Tender Specification & Fixture Document
    conforming to Indian Public Sector Steel Mill procurement norms (SAIL, RINL, NMDC).
    """
    route = get_route_details(origin_key, destination_key, vessel_class)
    dest = EAST_COAST_PORTS.get(destination_key, EAST_COAST_PORTS["Paradip"])
    origin = ORIGIN_PORTS.get(origin_key, ORIGIN_PORTS["Australia_HayPoint"])
    vessel = VESSEL_CLASSES.get(vessel_class, VESSEL_CLASSES["Capesize"])

    now = datetime.now()
    laycan_s = laycan_start or (now + timedelta(days=10)).strftime('%d-%b-%Y')
    laycan_e = laycan_end or (now + timedelta(days=20)).strftime('%d-%b-%Y')
    tender_ref = f"MOS/PROC/BULK/{now.strftime('%Y%m%d')}-{destination_key[:3].upper()}-9284"

    # Ceiling and floor rate benchmarks based on ML forecast
    ceiling_rate = round(forecast_rate_usd_mt * 1.05, 2)
    floor_rate = round(forecast_rate_usd_mt * 0.95, 2)
    total_freight_usd = round(forecast_rate_usd_mt * cargo_volume_mt, 2)
    total_freight_inr_cr = round((total_freight_usd * usd_inr_rate) / 10000000.0, 2)

    discharge_rate = dest["discharge_rate_mt_day"]
    allowed_laytime = round(cargo_volume_mt / discharge_rate, 1) + 1.0
    demurrage_usd_day = route.get("port_demurrage_rate_day", 18000)

    cargo_specs = {
        "commodity": commodity_type,
        "quantity_mt": cargo_volume_mt,
        "quantity_description": f"{cargo_volume_mt:,.0f} MT (+/- 10% MOLOO at Owner's Option)",
        "origin_terminal": f"{origin['name']} ({origin['country']})",
        "discharge_port": f"{dest['name']} ({dest['state']}, India)",
        "berth_type": "Mechanized Deepwater Coal Berth" if dest.get("mechanized_coal_berth") else "Conventional / Lighterage Anchorage"
    }

    vessel_restrictions = {
        "nominated_class": vessel["name"],
        "max_draft_arrival_m": dest["max_draft_m"],
        "vessel_draft_m": vessel["typical_draft_laden_m"],
        "max_loa_m": dest["max_loa_m"],
        "vessel_loa_m": vessel["typical_loa_m"],
        "max_beam_m": dest["max_beam_m"],
        "vessel_beam_m": vessel["typical_beam_m"],
        "max_dwt_berthing": dest["max_dwt"],
        "is_draft_feasible": route["is_draft_compatible"],
        "lighterage_terms": "At Charterer's risk and expense at Sandheads / Outer Anchorage" if route["requires_lighterage"] else "Direct Berthing Cleared",
        "vessel_age_limit": "Maximum 15 Years, IACS Classed, Valid P&I Cover"
    }

    port_specs = {
        "port_name": dest["name"],
        "state": dest["state"],
        "max_draft_m": dest["max_draft_m"],
        "max_loa_m": dest["max_loa_m"],
        "max_beam_m": dest["max_beam_m"],
        "discharge_rate_mt_day": discharge_rate,
        "demurrage_rate_usd_day": demurrage_usd_day,
        "despatch_rate_usd_day": round(demurrage_usd_day / 2)
    }

    commercial_terms = {
        "laycan_window": f"{laycan_s} to {laycan_e}",
        "benchmark_forecast_rate_usd_mt": forecast_rate_usd_mt,
        "recommended_ceiling_rate_usd_mt": ceiling_rate,
        "recommended_floor_rate_usd_mt": floor_rate,
        "loading_rate_terms": "25,000 MT PWWD SHINC",
        "discharge_rate_terms": f"{discharge_rate:,} MT PWWD SHINC",
        "allowed_discharge_laytime_days": allowed_laytime,
        "demurrage_rate_pdpr": f"${demurrage_usd_day:,} / day",
        "despatch_rate_pdpr": f"${round(demurrage_usd_day / 2):,} / day (Half Demurrage)",
        "payment_terms": "95% Freight within 3 banking days upon signing Bill of Lading, 5% on final discharge settlement.",
        "governing_law_and_arbitration": "Indian Arbitration and Conciliation Act 1996 (Seat: New Delhi) / English Maritime Law"
    }

    benchmark_valuation = {
        "model_freight_benchmark_usd_mt": forecast_rate_usd_mt,
        "ceiling_rate_usd_mt": ceiling_rate,
        "total_estimated_freight_usd": total_freight_usd,
        "total_estimated_freight_inr_crore": total_freight_inr_cr,
        "nautical_miles": route["distance_nm"],
        "estimated_sea_days": route["sea_days"]
    }

    return {
        "tender_reference_no": tender_ref,
        "tender_reference": tender_ref,
        "issuing_authority": charterer_name,
        "created_date": now.strftime('%d-%b-%Y %H:%M UTC'),
        "cargo_specifications": cargo_specs,
        "cargo_specification": cargo_specs,
        "vessel_restrictions": vessel_restrictions,
        "port_specifications": port_specs,
        "commercial_terms": commercial_terms,
        "benchmark_valuation": benchmark_valuation
    }
