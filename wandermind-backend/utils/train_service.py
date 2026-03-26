"""
Train search service with comprehensive Indian railway station data
and realistic dummy train results. In production, integrate with
IRCTC API, ConfirmTkt, or RailYatri API.
"""

import random
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Station database — all major Indian railway stations
# ---------------------------------------------------------------------------

STATIONS = [
    {"code": "NDLS", "name": "New Delhi", "city": "delhi new delhi"},
    {"code": "DEE", "name": "Delhi Sarai Rohilla", "city": "delhi"},
    {"code": "DLI", "name": "Old Delhi Junction", "city": "delhi old delhi"},
    {"code": "BCT", "name": "Mumbai Central", "city": "mumbai bombay"},
    {"code": "CSMT", "name": "Mumbai CSM Terminus", "city": "mumbai bombay cst vt"},
    {"code": "LTT", "name": "Mumbai Lokmanya Tilak", "city": "mumbai bombay"},
    {"code": "BRC", "name": "Vadodara Junction", "city": "vadodara baroda"},
    {"code": "ADI", "name": "Ahmedabad Junction", "city": "ahmedabad"},
    {"code": "JP", "name": "Jaipur Junction", "city": "jaipur"},
    {"code": "UDZ", "name": "Udaipur City", "city": "udaipur"},
    {"code": "JU", "name": "Jodhpur Junction", "city": "jodhpur"},
    {"code": "AJJ", "name": "Arakkonam Junction", "city": "arakkonam"},
    {"code": "SBC", "name": "Bengaluru City Junction", "city": "bangalore bengaluru"},
    {"code": "YPR", "name": "Bengaluru Yesvantpur", "city": "bangalore bengaluru yesvantpur"},
    {"code": "MAS", "name": "Chennai Central", "city": "chennai madras"},
    {"code": "MS", "name": "Chennai Egmore", "city": "chennai madras egmore"},
    {"code": "SC", "name": "Secunderabad Junction", "city": "hyderabad secunderabad"},
    {"code": "HYB", "name": "Hyderabad Deccan", "city": "hyderabad"},
    {"code": "HWH", "name": "Howrah Junction", "city": "kolkata calcutta howrah"},
    {"code": "SDAH", "name": "Sealdah", "city": "kolkata calcutta sealdah"},
    {"code": "PNBE", "name": "Patna Junction", "city": "patna"},
    {"code": "LKO", "name": "Lucknow Charbagh", "city": "lucknow"},
    {"code": "CNB", "name": "Kanpur Central", "city": "kanpur"},
    {"code": "AGC", "name": "Agra Cantt", "city": "agra"},
    {"code": "BSB", "name": "Varanasi Junction", "city": "varanasi banaras kashi"},
    {"code": "GWL", "name": "Gwalior Junction", "city": "gwalior"},
    {"code": "BPL", "name": "Bhopal Junction", "city": "bhopal"},
    {"code": "JBP", "name": "Jabalpur Junction", "city": "jabalpur"},
    {"code": "NGP", "name": "Nagpur Junction", "city": "nagpur"},
    {"code": "R", "name": "Raipur Junction", "city": "raipur chhattisgarh"},
    {"code": "BSP", "name": "Bilaspur Junction", "city": "bilaspur chhattisgarh"},
    {"code": "BBS", "name": "Bhubaneswar", "city": "bhubaneswar odisha orissa"},
    {"code": "PURI", "name": "Puri", "city": "puri odisha"},
    {"code": "RNC", "name": "Ranchi Junction", "city": "ranchi jharkhand"},
    {"code": "GAU", "name": "Guwahati", "city": "guwahati assam"},
    {"code": "DBG", "name": "Darbhanga Junction", "city": "darbhanga"},
    {"code": "GKP", "name": "Gorakhpur Junction", "city": "gorakhpur"},
    {"code": "ASR", "name": "Amritsar Junction", "city": "amritsar punjab"},
    {"code": "CDG", "name": "Chandigarh Junction", "city": "chandigarh"},
    {"code": "DDN", "name": "Dehradun", "city": "dehradun uttarakhand"},
    {"code": "HW", "name": "Haridwar Junction", "city": "haridwar rishikesh"},
    {"code": "JAT", "name": "Jammu Tawi", "city": "jammu"},
    {"code": "SVDK", "name": "Shri Mata Vaishno Devi Katra", "city": "katra vaishno devi"},
    {"code": "PNE", "name": "Pune Junction", "city": "pune"},
    {"code": "KYN", "name": "Kalyan Junction", "city": "kalyan thane mumbai"},
    {"code": "SUR", "name": "Solapur Junction", "city": "solapur"},
    {"code": "KOP", "name": "Kolhapur", "city": "kolhapur"},
    {"code": "MAO", "name": "Madgaon Junction", "city": "goa margao madgaon"},
    {"code": "KRMI", "name": "Karmali", "city": "goa karmali old goa"},
    {"code": "THVM", "name": "Thiruvananthapuram Central", "city": "thiruvananthapuram trivandrum kerala"},
    {"code": "ERS", "name": "Ernakulam Junction", "city": "kochi cochin ernakulam kerala"},
    {"code": "CLT", "name": "Kozhikode (Calicut)", "city": "calicut kozhikode kerala"},
    {"code": "MQ", "name": "Mangaluru Central", "city": "mangalore mangaluru"},
    {"code": "MDU", "name": "Madurai Junction", "city": "madurai"},
    {"code": "TPJ", "name": "Tiruchirappalli Junction", "city": "trichy tiruchirappalli"},
    {"code": "CBE", "name": "Coimbatore Junction", "city": "coimbatore"},
    {"code": "MYS", "name": "Mysuru Junction", "city": "mysore mysuru"},
    {"code": "UBL", "name": "Hubballi Junction", "city": "hubli dharwad hubballi"},
    {"code": "GTL", "name": "Guntakal Junction", "city": "guntakal"},
    {"code": "VSKP", "name": "Visakhapatnam", "city": "visakhapatnam vizag"},
    {"code": "TPTY", "name": "Tirupati", "city": "tirupati"},
    {"code": "KGP", "name": "Kharagpur Junction", "city": "kharagpur"},
    {"code": "ALD", "name": "Prayagraj Junction", "city": "prayagraj allahabad"},
    {"code": "SLN", "name": "Sultanpur Junction", "city": "sultanpur ayodhya"},
    {"code": "AY", "name": "Ayodhya Dham Junction", "city": "ayodhya faizabad"},
    {"code": "ST", "name": "Surat", "city": "surat"},
    {"code": "RJT", "name": "Rajkot Junction", "city": "rajkot"},
    {"code": "IDR", "name": "Indore Junction", "city": "indore"},
]

# Train name templates
TRAIN_TEMPLATES = {
    "rajdhani": {"prefix": "Rajdhani Express", "type": "Rajdhani", "classes": ["1A", "2A", "3A"], "speed": "fast"},
    "shatabdi": {"prefix": "Shatabdi Express", "type": "Shatabdi", "classes": ["CC", "EC"], "speed": "fast"},
    "duronto": {"prefix": "Duronto Express", "type": "Duronto", "classes": ["1A", "2A", "3A", "SL"], "speed": "fast"},
    "vande_bharat": {"prefix": "Vande Bharat Express", "type": "Vande Bharat", "classes": ["CC", "EC"], "speed": "superfast"},
    "superfast": {"prefix": "SF Express", "type": "Superfast", "classes": ["1A", "2A", "3A", "SL"], "speed": "medium"},
    "express": {"prefix": "Express", "type": "Mail/Express", "classes": ["2A", "3A", "SL", "GN"], "speed": "medium"},
    "garib_rath": {"prefix": "Garib Rath", "type": "Garib Rath", "classes": ["3A", "CC"], "speed": "fast"},
}

CLASS_PRICES = {
    "1A": {"name": "First AC", "multiplier": 3.5},
    "2A": {"name": "AC 2 Tier", "multiplier": 2.0},
    "3A": {"name": "AC 3 Tier", "multiplier": 1.4},
    "SL": {"name": "Sleeper", "multiplier": 0.6},
    "CC": {"name": "AC Chair Car", "multiplier": 1.2},
    "EC": {"name": "Executive Chair", "multiplier": 2.5},
    "GN": {"name": "General", "multiplier": 0.25},
}

AVAILABILITY_STATUS = [
    "Available", "Available", "Available", "RAC", "WL 5", "WL 12", "Available", "REGRET/WL"
]


def search_stations(query: str) -> list:
    """Search railway stations by name, code, or city."""
    q = query.lower().strip()
    results = []
    for s in STATIONS:
        searchable = f"{s['name']} {s['code']} {s.get('city', '')}".lower()
        if q in searchable:
            results.append({"code": s["code"], "name": s["name"]})

    # Sort: exact code match first
    def sort_key(s):
        if s['code'].lower() == q:
            return 0
        if q in s['name'].lower():
            return 1
        return 2

    results.sort(key=sort_key)
    return results[:10]


def search_trains(from_code: str, to_code: str, date: str) -> list:
    """Generate realistic train results for a route."""
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        dt = datetime.now()

    seed = hash(f"{from_code}-{to_code}-{date}") % 10000
    rng = random.Random(seed)

    # Determine route distance (rough estimate for pricing)
    # Use station index difference as rough distance proxy
    code_list = [s["code"] for s in STATIONS]
    from_idx = code_list.index(from_code) if from_code in code_list else 0
    to_idx = code_list.index(to_code) if to_code in code_list else len(code_list) // 2
    distance_km = abs(from_idx - to_idx) * 80 + rng.randint(100, 400)

    # Base fare per km (₹0.5 for SL class)
    base_fare_per_km = 0.55

    # Generate 5-8 trains
    num_trains = rng.randint(5, 8)
    trains = []

    # Decide which train types to include
    if distance_km > 800:
        types = ["rajdhani", "duronto", "superfast", "express", "express", "garib_rath", "vande_bharat", "superfast"]
    elif distance_km > 400:
        types = ["shatabdi", "superfast", "express", "express", "garib_rath", "vande_bharat", "superfast", "express"]
    else:
        types = ["shatabdi", "vande_bharat", "superfast", "express", "express", "express", "superfast", "express"]

    departure_hours = [5, 6, 7, 8, 10, 12, 14, 16, 18, 20, 22, 23]
    chosen = rng.sample(departure_hours, min(num_trains, len(departure_hours)))
    chosen.sort()

    from_name = next((s["name"] for s in STATIONS if s["code"] == from_code), from_code)
    to_name = next((s["name"] for s in STATIONS if s["code"] == to_code), to_code)

    for i, dep_hour in enumerate(chosen):
        train_type_key = types[i % len(types)]
        tt = TRAIN_TEMPLATES[train_type_key]

        # Train number
        train_no = str(rng.randint(10000, 29999))

        # Duration based on speed and distance
        speed_map = {"superfast": 90, "fast": 70, "medium": 55}
        avg_speed = speed_map.get(tt["speed"], 55)
        duration_min = int((distance_km / avg_speed) * 60) + rng.randint(-30, 60)
        duration_min = max(duration_min, 90)  # minimum 1.5 hours
        dur_h, dur_m = divmod(duration_min, 60)

        dep_min = rng.randint(0, 55)
        dep_time = dt.replace(hour=dep_hour, minute=dep_min)
        arr_time = dep_time + timedelta(minutes=duration_min)

        # Generate class-wise pricing
        base_price = int(distance_km * base_fare_per_km)
        classes = []
        for cls_code in tt["classes"]:
            cls_info = CLASS_PRICES[cls_code]
            price = round(base_price * cls_info["multiplier"] / 10) * 10
            price = max(price, 150)  # minimum ₹150
            avail = rng.choice(AVAILABILITY_STATUS)
            classes.append({
                "class_code": cls_code,
                "class_name": cls_info["name"],
                "price_inr": price,
                "price_formatted": f"₹{price:,}",
                "availability": avail,
                "is_available": avail in ["Available", "RAC"],
            })

        # Train name
        route_names = [from_name.split()[0], to_name.split()[0]]
        train_name = f"{route_names[0]}-{route_names[1]} {tt['prefix']}"

        # Days of run (most trains don't run daily)
        all_days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        if train_type_key in ["rajdhani", "vande_bharat", "shatabdi"]:
            run_days = all_days  # daily
        else:
            run_days = sorted(rng.sample(all_days, rng.randint(3, 7)), key=all_days.index)

        trains.append({
            "train_number": train_no,
            "train_name": train_name,
            "train_type": tt["type"],
            "from_station": {"code": from_code, "name": from_name},
            "to_station": {"code": to_code, "name": to_name},
            "departure": dep_time.strftime("%H:%M"),
            "arrival": arr_time.strftime("%H:%M"),
            "arrival_day": "Same Day" if arr_time.date() == dep_time.date() else f"+{(arr_time.date() - dep_time.date()).days} Day",
            "duration": f"{dur_h}h {dur_m}m",
            "duration_minutes": duration_min,
            "distance_km": distance_km,
            "classes": classes,
            "cheapest_price": min(c["price_inr"] for c in classes),
            "run_days": run_days,
            "runs_daily": len(run_days) == 7,
            "pantry": train_type_key in ["rajdhani", "duronto", "shatabdi", "vande_bharat"],
        })

    trains.sort(key=lambda t: t["cheapest_price"])
    return trains
