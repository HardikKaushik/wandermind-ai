"""
Flight search service using Sky-Scrapper API on RapidAPI.
Falls back to comprehensive dummy data when the API key is missing or the API fails.
"""

import logging
import random
from datetime import datetime, timedelta

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

RAPIDAPI_HOST = "sky-scrapper.p.rapidapi.com"
BASE_URL = f"https://{RAPIDAPI_HOST}/api"

# ---------------------------------------------------------------------------
# Airline metadata
# ---------------------------------------------------------------------------
AIRLINES = {
    "6E": {"name": "IndiGo", "logo": "https://logos.skyscnr.com/images/airlines/favicon/6E.png"},
    "AI": {"name": "Air India", "logo": "https://logos.skyscnr.com/images/airlines/favicon/AI.png"},
    "SG": {"name": "SpiceJet", "logo": "https://logos.skyscnr.com/images/airlines/favicon/SG.png"},
    "UK": {"name": "Vistara", "logo": "https://logos.skyscnr.com/images/airlines/favicon/UK.png"},
    "G8": {"name": "GoFirst", "logo": "https://logos.skyscnr.com/images/airlines/favicon/G8.png"},
    "I5": {"name": "AirAsia India", "logo": "https://logos.skyscnr.com/images/airlines/favicon/I5.png"},
    "QP": {"name": "Akasa Air", "logo": "https://logos.skyscnr.com/images/airlines/favicon/QP.png"},
    "IX": {"name": "Air India Express", "logo": "https://logos.skyscnr.com/images/airlines/favicon/IX.png"},
}


def _get_headers():
    return {
        "X-RapidAPI-Key": settings.RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
    }


# ---------------------------------------------------------------------------
# Airport search
# ---------------------------------------------------------------------------

def search_airports(query: str) -> list:
    """Search airports by city / airport name. Returns list of dicts with
    skyId, entityId, name, iata, country."""
    if settings.RAPIDAPI_KEY:
        try:
            resp = requests.get(
                f"{BASE_URL}/v1/flights/searchAirport",
                headers=_get_headers(),
                params={"query": query, "locale": "en-US"},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

            results = []
            for item in data.get("data", []):
                presentation = item.get("presentation", {})
                navigation = item.get("navigation", {})
                entity_info = navigation.get("relevantFlightParams", {})
                results.append({
                    "skyId": entity_info.get("skyId", ""),
                    "entityId": entity_info.get("entityId", ""),
                    "name": presentation.get("title", ""),
                    "subtitle": presentation.get("subtitle", ""),
                    "iata": entity_info.get("skyId", ""),
                    "country": presentation.get("subtitle", "").split(",")[-1].strip() if presentation.get("subtitle") else "",
                })
            return results
        except Exception as exc:
            logger.warning("Airport search API failed, returning fallback: %s", exc)

    # Fallback — common Indian + international airports
    return _fallback_airports(query)


def _fallback_airports(query: str) -> list:
    airports = [
        # ── INDIA: Major Metro ──
        {"skyId": "BOMBA", "entityId": "27544008", "name": "Mumbai (Chhatrapati Shivaji Maharaj)", "iata": "BOM", "country": "India", "city": "mumbai bombay"},
        {"skyId": "DEL", "entityId": "27544008", "name": "New Delhi (Indira Gandhi International)", "iata": "DEL", "country": "India", "city": "delhi new delhi"},
        {"skyId": "BLR", "entityId": "27540506", "name": "Bengaluru (Kempegowda International)", "iata": "BLR", "country": "India", "city": "bangalore bengaluru"},
        {"skyId": "MAA", "entityId": "27539898", "name": "Chennai International", "iata": "MAA", "country": "India", "city": "chennai madras"},
        {"skyId": "HYD", "entityId": "27539604", "name": "Hyderabad (Rajiv Gandhi International)", "iata": "HYD", "country": "India", "city": "hyderabad"},
        {"skyId": "CCU", "entityId": "27539585", "name": "Kolkata (Netaji Subhas Chandra Bose)", "iata": "CCU", "country": "India", "city": "kolkata calcutta"},
        # ── INDIA: Tier 2 Cities ──
        {"skyId": "GOI", "entityId": "27539793", "name": "Goa (Dabolim / Manohar International)", "iata": "GOI", "country": "India", "city": "goa"},
        {"skyId": "COK", "entityId": "27540064", "name": "Kochi (Cochin International)", "iata": "COK", "country": "India", "city": "kochi cochin ernakulam kerala"},
        {"skyId": "JAI", "entityId": "27539733", "name": "Jaipur International", "iata": "JAI", "country": "India", "city": "jaipur"},
        {"skyId": "AMD", "entityId": "27539561", "name": "Ahmedabad (Sardar Vallabhbhai Patel)", "iata": "AMD", "country": "India", "city": "ahmedabad"},
        {"skyId": "PNQ", "entityId": "27540372", "name": "Pune (Lohegaon Airport)", "iata": "PNQ", "country": "India", "city": "pune"},
        {"skyId": "LKO", "entityId": "27539816", "name": "Lucknow (Chaudhary Charan Singh)", "iata": "LKO", "country": "India", "city": "lucknow"},
        {"skyId": "RPR", "entityId": "27540413", "name": "Raipur (Swami Vivekananda Airport)", "iata": "RPR", "country": "India", "city": "raipur chhattisgarh"},
        {"skyId": "NAG", "entityId": "27540228", "name": "Nagpur (Dr. Babasaheb Ambedkar)", "iata": "NAG", "country": "India", "city": "nagpur"},
        {"skyId": "IXC", "entityId": "27539586", "name": "Chandigarh Airport", "iata": "IXC", "country": "India", "city": "chandigarh"},
        {"skyId": "PAT", "entityId": "27540343", "name": "Patna (Jay Prakash Narayan)", "iata": "PAT", "country": "India", "city": "patna bihar"},
        {"skyId": "BBI", "entityId": "27539566", "name": "Bhubaneswar (Biju Patnaik)", "iata": "BBI", "country": "India", "city": "bhubaneswar odisha orissa"},
        {"skyId": "IDR", "entityId": "27539718", "name": "Indore (Devi Ahilyabai Holkar)", "iata": "IDR", "country": "India", "city": "indore"},
        {"skyId": "BHO", "entityId": "27539572", "name": "Bhopal (Raja Bhoj Airport)", "iata": "BHO", "country": "India", "city": "bhopal"},
        {"skyId": "GAU", "entityId": "27539669", "name": "Guwahati (Lokpriya Gopinath Bordoloi)", "iata": "GAU", "country": "India", "city": "guwahati assam"},
        {"skyId": "SXR", "entityId": "27540512", "name": "Srinagar (Sheikh ul-Alam)", "iata": "SXR", "country": "India", "city": "srinagar kashmir"},
        {"skyId": "VNS", "entityId": "27540600", "name": "Varanasi (Lal Bahadur Shastri)", "iata": "VNS", "country": "India", "city": "varanasi banaras kashi"},
        {"skyId": "IXB", "entityId": "27539582", "name": "Bagdogra Airport", "iata": "IXB", "country": "India", "city": "bagdogra siliguri darjeeling"},
        {"skyId": "IXR", "entityId": "27539741", "name": "Ranchi (Birsa Munda Airport)", "iata": "IXR", "country": "India", "city": "ranchi jharkhand"},
        {"skyId": "VTZ", "entityId": "27540608", "name": "Visakhapatnam Airport", "iata": "VTZ", "country": "India", "city": "visakhapatnam vizag"},
        {"skyId": "TRV", "entityId": "27540557", "name": "Thiruvananthapuram International", "iata": "TRV", "country": "India", "city": "thiruvananthapuram trivandrum kerala"},
        {"skyId": "CCJ", "entityId": "27539583", "name": "Calicut (Karipur International)", "iata": "CCJ", "country": "India", "city": "calicut kozhikode kerala"},
        {"skyId": "IXA", "entityId": "27539581", "name": "Agartala (Maharaja Bir Bikram)", "iata": "IXA", "country": "India", "city": "agartala tripura"},
        {"skyId": "IXZ", "entityId": "27539752", "name": "Port Blair (Veer Savarkar)", "iata": "IXZ", "country": "India", "city": "port blair andaman"},
        {"skyId": "IMF", "entityId": "27539720", "name": "Imphal (Bir Tikendrajit)", "iata": "IMF", "country": "India", "city": "imphal manipur"},
        {"skyId": "DIB", "entityId": "27539632", "name": "Dibrugarh (Mohanbari Airport)", "iata": "DIB", "country": "India", "city": "dibrugarh assam"},
        {"skyId": "JRH", "entityId": "27539756", "name": "Jorhat Airport", "iata": "JRH", "country": "India", "city": "jorhat assam"},
        {"skyId": "IXM", "entityId": "27539739", "name": "Madurai Airport", "iata": "IXM", "country": "India", "city": "madurai"},
        {"skyId": "TRZ", "entityId": "27540558", "name": "Tiruchirappalli (Trichy Airport)", "iata": "TRZ", "country": "India", "city": "trichy tiruchirappalli"},
        {"skyId": "CJB", "entityId": "27539591", "name": "Coimbatore Airport", "iata": "CJB", "country": "India", "city": "coimbatore"},
        {"skyId": "IXE", "entityId": "27539735", "name": "Mangaluru (Mangalore International)", "iata": "IXE", "country": "India", "city": "mangalore mangaluru"},
        {"skyId": "HBX", "entityId": "27539698", "name": "Hubli Airport", "iata": "HBX", "country": "India", "city": "hubli dharwad"},
        {"skyId": "UDR", "entityId": "27540574", "name": "Udaipur (Maharana Pratap Airport)", "iata": "UDR", "country": "India", "city": "udaipur"},
        {"skyId": "JDH", "entityId": "27539748", "name": "Jodhpur Airport", "iata": "JDH", "country": "India", "city": "jodhpur"},
        {"skyId": "RAJ", "entityId": "27540395", "name": "Rajkot Airport", "iata": "RAJ", "country": "India", "city": "rajkot"},
        {"skyId": "STV", "entityId": "27540505", "name": "Surat Airport", "iata": "STV", "country": "India", "city": "surat"},
        {"skyId": "BDQ", "entityId": "27539567", "name": "Vadodara Airport", "iata": "BDQ", "country": "India", "city": "vadodara baroda"},
        {"skyId": "IXL", "entityId": "27539738", "name": "Leh (Kushok Bakula Rimpochee)", "iata": "IXL", "country": "India", "city": "leh ladakh"},
        {"skyId": "DED", "entityId": "27539625", "name": "Dehradun (Jolly Grant Airport)", "iata": "DED", "country": "India", "city": "dehradun uttarakhand"},
        {"skyId": "DHM", "entityId": "27539629", "name": "Dharamshala (Gaggal Airport)", "iata": "DHM", "country": "India", "city": "dharamshala kangra himachal"},
        {"skyId": "KUU", "entityId": "27539801", "name": "Kullu-Manali (Bhuntar Airport)", "iata": "KUU", "country": "India", "city": "kullu manali himachal"},
        {"skyId": "ATQ", "entityId": "27539563", "name": "Amritsar (Sri Guru Ram Dass Jee)", "iata": "ATQ", "country": "India", "city": "amritsar punjab"},
        {"skyId": "IXJ", "entityId": "27539737", "name": "Jammu (Satwari Airport)", "iata": "IXJ", "country": "India", "city": "jammu"},
        {"skyId": "MYQ", "entityId": "27540224", "name": "Mysore (Mandakalli Airport)", "iata": "MYQ", "country": "India", "city": "mysore mysuru"},
        {"skyId": "TIR", "entityId": "27540541", "name": "Tirupati Airport", "iata": "TIR", "country": "India", "city": "tirupati"},
        {"skyId": "RJA", "entityId": "27540407", "name": "Rajahmundry Airport", "iata": "RJA", "country": "India", "city": "rajahmundry"},
        {"skyId": "GWL", "entityId": "27539691", "name": "Gwalior Airport", "iata": "GWL", "country": "India", "city": "gwalior"},
        {"skyId": "JLR", "entityId": "27539753", "name": "Jabalpur Airport", "iata": "JLR", "country": "India", "city": "jabalpur"},
        {"skyId": "AYJ", "entityId": "27539564", "name": "Ayodhya (Maharishi Valmiki)", "iata": "AYJ", "country": "India", "city": "ayodhya faizabad"},
        # ── INTERNATIONAL: South-East Asia ──
        {"skyId": "BKK", "entityId": "27536671", "name": "Bangkok (Suvarnabhumi)", "iata": "BKK", "country": "Thailand", "city": "bangkok"},
        {"skyId": "DMK", "entityId": "27536671", "name": "Bangkok (Don Mueang)", "iata": "DMK", "country": "Thailand", "city": "bangkok"},
        {"skyId": "HKT", "entityId": "27536671", "name": "Phuket International", "iata": "HKT", "country": "Thailand", "city": "phuket"},
        {"skyId": "SIN", "entityId": "27536153", "name": "Singapore Changi", "iata": "SIN", "country": "Singapore", "city": "singapore"},
        {"skyId": "KUL", "entityId": "27536162", "name": "Kuala Lumpur International (KLIA)", "iata": "KUL", "country": "Malaysia", "city": "kuala lumpur kl"},
        {"skyId": "DPS", "entityId": "27536000", "name": "Bali (Ngurah Rai International)", "iata": "DPS", "country": "Indonesia", "city": "bali denpasar"},
        {"skyId": "HAN", "entityId": "27536500", "name": "Hanoi (Noi Bai International)", "iata": "HAN", "country": "Vietnam", "city": "hanoi"},
        {"skyId": "SGN", "entityId": "27536501", "name": "Ho Chi Minh City (Tan Son Nhat)", "iata": "SGN", "country": "Vietnam", "city": "ho chi minh saigon"},
        {"skyId": "MNL", "entityId": "27536300", "name": "Manila (Ninoy Aquino)", "iata": "MNL", "country": "Philippines", "city": "manila"},
        {"skyId": "CMB", "entityId": "27536100", "name": "Colombo (Bandaranaike)", "iata": "CMB", "country": "Sri Lanka", "city": "colombo sri lanka"},
        {"skyId": "KTM", "entityId": "27536200", "name": "Kathmandu (Tribhuvan)", "iata": "KTM", "country": "Nepal", "city": "kathmandu nepal"},
        {"skyId": "DAC", "entityId": "27536050", "name": "Dhaka (Hazrat Shahjalal)", "iata": "DAC", "country": "Bangladesh", "city": "dhaka bangladesh"},
        {"skyId": "MLE", "entityId": "27536250", "name": "Male (Velana International)", "iata": "MLE", "country": "Maldives", "city": "male maldives"},
        # ── INTERNATIONAL: Middle East ──
        {"skyId": "DXB", "entityId": "27537452", "name": "Dubai International", "iata": "DXB", "country": "UAE", "city": "dubai"},
        {"skyId": "AUH", "entityId": "27537453", "name": "Abu Dhabi International", "iata": "AUH", "country": "UAE", "city": "abu dhabi"},
        {"skyId": "SHJ", "entityId": "27537454", "name": "Sharjah International", "iata": "SHJ", "country": "UAE", "city": "sharjah"},
        {"skyId": "DOH", "entityId": "27537400", "name": "Doha (Hamad International)", "iata": "DOH", "country": "Qatar", "city": "doha qatar"},
        {"skyId": "MCT", "entityId": "27537500", "name": "Muscat International", "iata": "MCT", "country": "Oman", "city": "muscat oman"},
        {"skyId": "BAH", "entityId": "27537300", "name": "Bahrain International", "iata": "BAH", "country": "Bahrain", "city": "bahrain"},
        {"skyId": "KWI", "entityId": "27537350", "name": "Kuwait International", "iata": "KWI", "country": "Kuwait", "city": "kuwait"},
        {"skyId": "RUH", "entityId": "27537550", "name": "Riyadh (King Khalid)", "iata": "RUH", "country": "Saudi Arabia", "city": "riyadh saudi"},
        {"skyId": "JED", "entityId": "27537551", "name": "Jeddah (King Abdulaziz)", "iata": "JED", "country": "Saudi Arabia", "city": "jeddah saudi"},
        # ── INTERNATIONAL: Europe ──
        {"skyId": "LHR", "entityId": "27539600", "name": "London Heathrow", "iata": "LHR", "country": "United Kingdom", "city": "london"},
        {"skyId": "LGW", "entityId": "27539601", "name": "London Gatwick", "iata": "LGW", "country": "United Kingdom", "city": "london gatwick"},
        {"skyId": "CDG", "entityId": "27539700", "name": "Paris Charles de Gaulle", "iata": "CDG", "country": "France", "city": "paris"},
        {"skyId": "FRA", "entityId": "27539800", "name": "Frankfurt am Main", "iata": "FRA", "country": "Germany", "city": "frankfurt"},
        {"skyId": "AMS", "entityId": "27539560", "name": "Amsterdam Schiphol", "iata": "AMS", "country": "Netherlands", "city": "amsterdam"},
        {"skyId": "FCO", "entityId": "27539650", "name": "Rome Fiumicino", "iata": "FCO", "country": "Italy", "city": "rome"},
        {"skyId": "BCN", "entityId": "27539568", "name": "Barcelona El Prat", "iata": "BCN", "country": "Spain", "city": "barcelona"},
        {"skyId": "IST", "entityId": "27539725", "name": "Istanbul Airport", "iata": "IST", "country": "Turkey", "city": "istanbul"},
        {"skyId": "ZRH", "entityId": "27539900", "name": "Zurich Airport", "iata": "ZRH", "country": "Switzerland", "city": "zurich switzerland"},
        {"skyId": "MUC", "entityId": "27539850", "name": "Munich Airport", "iata": "MUC", "country": "Germany", "city": "munich"},
        # ── INTERNATIONAL: East Asia ──
        {"skyId": "NRT", "entityId": "27538000", "name": "Tokyo Narita", "iata": "NRT", "country": "Japan", "city": "tokyo"},
        {"skyId": "HND", "entityId": "27538001", "name": "Tokyo Haneda", "iata": "HND", "country": "Japan", "city": "tokyo haneda"},
        {"skyId": "ICN", "entityId": "27538100", "name": "Seoul Incheon", "iata": "ICN", "country": "South Korea", "city": "seoul"},
        {"skyId": "HKG", "entityId": "27538200", "name": "Hong Kong International", "iata": "HKG", "country": "Hong Kong", "city": "hong kong"},
        {"skyId": "PEK", "entityId": "27538300", "name": "Beijing Capital", "iata": "PEK", "country": "China", "city": "beijing"},
        {"skyId": "PVG", "entityId": "27538301", "name": "Shanghai Pudong", "iata": "PVG", "country": "China", "city": "shanghai"},
        # ── INTERNATIONAL: Americas ──
        {"skyId": "JFK", "entityId": "27537542", "name": "New York (JFK)", "iata": "JFK", "country": "United States", "city": "new york"},
        {"skyId": "EWR", "entityId": "27537543", "name": "New York (Newark Liberty)", "iata": "EWR", "country": "United States", "city": "new york newark"},
        {"skyId": "LAX", "entityId": "27537544", "name": "Los Angeles International", "iata": "LAX", "country": "United States", "city": "los angeles la"},
        {"skyId": "SFO", "entityId": "27537545", "name": "San Francisco International", "iata": "SFO", "country": "United States", "city": "san francisco"},
        {"skyId": "ORD", "entityId": "27537546", "name": "Chicago O'Hare", "iata": "ORD", "country": "United States", "city": "chicago"},
        {"skyId": "YYZ", "entityId": "27537600", "name": "Toronto Pearson", "iata": "YYZ", "country": "Canada", "city": "toronto"},
        # ── INTERNATIONAL: Oceania & Africa ──
        {"skyId": "SYD", "entityId": "27538400", "name": "Sydney (Kingsford Smith)", "iata": "SYD", "country": "Australia", "city": "sydney"},
        {"skyId": "MEL", "entityId": "27538401", "name": "Melbourne (Tullamarine)", "iata": "MEL", "country": "Australia", "city": "melbourne"},
        {"skyId": "NBO", "entityId": "27538500", "name": "Nairobi (Jomo Kenyatta)", "iata": "NBO", "country": "Kenya", "city": "nairobi kenya"},
        {"skyId": "JNB", "entityId": "27538600", "name": "Johannesburg (O.R. Tambo)", "iata": "JNB", "country": "South Africa", "city": "johannesburg"},
        {"skyId": "CAI", "entityId": "27538700", "name": "Cairo International", "iata": "CAI", "country": "Egypt", "city": "cairo egypt"},
    ]

    q = query.lower().strip()
    results = []
    for a in airports:
        searchable = f"{a['name']} {a['iata']} {a['skyId']} {a['country']} {a.get('city', '')}".lower()
        if q in searchable:
            # Don't include the internal 'city' field in the response
            results.append({k: v for k, v in a.items() if k != 'city'})

    # Sort: exact IATA match first, then city match, then name match
    def sort_key(a):
        if a['iata'].lower() == q:
            return 0
        if q in a.get('name', '').lower().split('(')[0]:
            return 1
        return 2

    results.sort(key=sort_key)
    return results[:10]


# ---------------------------------------------------------------------------
# Flight search
# ---------------------------------------------------------------------------

def search_flights(
    origin_sky_id: str,
    destination_sky_id: str,
    origin_entity_id: str,
    destination_entity_id: str,
    date: str,
    return_date: str = None,
    adults: int = 1,
    cabin_class: str = "economy",
) -> list:
    """Search flights via Sky-Scrapper API. Returns parsed list of flight dicts."""
    if settings.RAPIDAPI_KEY:
        try:
            params = {
                "originSkyId": origin_sky_id,
                "destinationSkyId": destination_sky_id,
                "originEntityId": origin_entity_id,
                "destinationEntityId": destination_entity_id,
                "date": date,
                "cabinClass": cabin_class,
                "adults": adults,
                "currency": "INR",
                "market": "IN",
                "countryCode": "IN",
            }
            if return_date:
                params["returnDate"] = return_date

            resp = requests.get(
                f"{BASE_URL}/v2/flights/searchFlights",
                headers=_get_headers(),
                params=params,
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()
            return _parse_flight_results(data, origin_sky_id, destination_sky_id, date)
        except Exception as exc:
            logger.warning("Flight search API failed, returning fallback: %s", exc)

    return _generate_dummy_flights(origin_sky_id, destination_sky_id, date, cabin_class)


def _parse_flight_results(data: dict, origin: str, destination: str, date: str) -> list:
    """Parse the Sky-Scrapper API response into a clean list."""
    flights = []
    itineraries = data.get("data", {}).get("itineraries", [])

    for itin in itineraries:
        try:
            legs = itin.get("legs", [])
            if not legs:
                continue
            leg = legs[0]
            segments = leg.get("segments", [])
            if not segments:
                continue

            first_seg = segments[0]
            carrier = first_seg.get("marketingCarrier", {})
            airline_code = carrier.get("alternateId", "")
            airline_info = AIRLINES.get(airline_code, {})

            price_raw = itin.get("price", {}).get("raw", 0)
            price_formatted = itin.get("price", {}).get("formatted", f"₹{price_raw:,.0f}")

            stop_count = leg.get("stopCount", 0)

            departure_dt = leg.get("departure", "")
            arrival_dt = leg.get("arrival", "")
            duration_min = leg.get("durationInMinutes", 0)
            hours, mins = divmod(duration_min, 60)

            flight_numbers = [s.get("flightNumber", "") for s in segments]
            carrier_codes = [s.get("marketingCarrier", {}).get("alternateId", "") for s in segments]
            display_flight = f"{carrier_codes[0]}-{flight_numbers[0]}" if flight_numbers else ""

            booking_url = f"https://www.google.com/travel/flights?q=flights+from+{origin}+to+{destination}+on+{date}"

            flights.append({
                "airline": airline_info.get("name", carrier.get("name", "Unknown")),
                "airline_code": airline_code,
                "logo": airline_info.get("logo", ""),
                "flight_number": display_flight,
                "departure": departure_dt,
                "arrival": arrival_dt,
                "duration": f"{hours}h {mins}m",
                "duration_minutes": duration_min,
                "stops": stop_count,
                "stops_label": "Direct" if stop_count == 0 else f"{stop_count} stop{'s' if stop_count > 1 else ''}",
                "price_inr": price_raw,
                "price_formatted": price_formatted,
                "booking_url": booking_url,
                "cabin_class": "economy",
                "platform_prices": _generate_platform_prices(int(price_raw)),
            })
        except Exception as exc:
            logger.debug("Skipping itinerary due to parse error: %s", exc)
            continue

    flights.sort(key=lambda f: f["price_inr"])
    return flights


# ---------------------------------------------------------------------------
# Platform price generation (realistic OTA price variation)
# ---------------------------------------------------------------------------

def _generate_platform_prices(base_price: int, rng=None) -> list:
    """Generate realistic price variations across booking platforms.
    Each platform has a slightly different price based on their commission
    structure, convenience fees, and dynamic pricing."""
    if rng is None:
        rng = random.Random()

    platforms = [
        {"platform": "Google Flights", "icon": "google", "variance": (-0.02, 0.03)},
        {"platform": "Skyscanner", "icon": "skyscanner", "variance": (-0.03, 0.05)},
        {"platform": "MakeMyTrip", "icon": "makemytrip", "variance": (0.01, 0.08)},
        {"platform": "ixigo", "icon": "ixigo", "variance": (-0.01, 0.06)},
        {"platform": "Cleartrip", "icon": "cleartrip", "variance": (0.0, 0.07)},
        {"platform": "EaseMyTrip", "icon": "easemytrip", "variance": (-0.04, 0.04)},
    ]

    results = []
    for p in platforms:
        lo, hi = p["variance"]
        multiplier = 1 + rng.uniform(lo, hi)
        price = round(base_price * multiplier / 10) * 10  # round to nearest 10
        results.append({
            "platform": p["platform"],
            "icon": p["icon"],
            "price_inr": price,
            "price_formatted": f"₹{price:,}",
        })

    # Sort by price so cheapest platform is first
    results.sort(key=lambda x: x["price_inr"])

    # Mark cheapest
    if results:
        results[0]["is_cheapest"] = True

    return results


# ---------------------------------------------------------------------------
# Comprehensive dummy / fallback data
# ---------------------------------------------------------------------------

def _generate_dummy_flights(origin: str, destination: str, date: str, cabin_class: str = "economy") -> list:
    """Generate realistic dummy flight data for any route."""

    booking_url = f"https://www.google.com/travel/flights?q=flights+from+{origin}+to+{destination}+on+{date}"

    # Route-specific templates
    route_key = f"{origin}-{destination}".upper()
    reverse_key = f"{destination}-{origin}".upper()

    # Determine route characteristics
    domestic_routes = {
        "DEL-GOI", "GOI-DEL", "BOMBA-GOI", "GOI-BOMBA", "BOM-GOI", "GOI-BOM",
        "DEL-BOMBA", "BOMBA-DEL", "DEL-BOM", "BOM-DEL",
        "DEL-BLR", "BLR-DEL", "BOMBA-BLR", "BLR-BOMBA", "BOM-BLR", "BLR-BOM",
        "DEL-MAA", "MAA-DEL", "BOMBA-MAA", "MAA-BOMBA", "BOM-MAA", "MAA-BOM",
        "DEL-CCU", "CCU-DEL", "BOMBA-CCU", "CCU-BOMBA", "BOM-CCU", "CCU-BOM",
        "DEL-HYD", "HYD-DEL", "BOMBA-HYD", "HYD-BOMBA", "BOM-HYD", "HYD-BOM",
        "DEL-JAI", "JAI-DEL", "DEL-AMD", "AMD-DEL",
        "BOMBA-AMD", "AMD-BOMBA", "BOM-AMD", "AMD-BOM",
        "DEL-COK", "COK-DEL", "BOMBA-COK", "COK-BOMBA", "BOM-COK", "COK-BOM",
        "DEL-SXR", "SXR-DEL", "DEL-GAU", "GAU-DEL",
        "BLR-GOI", "GOI-BLR", "HYD-GOI", "GOI-HYD",
        "DEL-PNQ", "PNQ-DEL", "BOMBA-PNQ", "PNQ-BOMBA", "BOM-PNQ", "PNQ-BOM",
    }

    international_short = {
        "DEL-DXB", "DXB-DEL", "BOMBA-DXB", "DXB-BOMBA", "BOM-DXB", "DXB-BOM",
        "DEL-BKK", "BKK-DEL", "BOMBA-BKK", "BKK-BOMBA", "BOM-BKK", "BKK-BOM",
        "DEL-SIN", "SIN-DEL", "BOMBA-SIN", "SIN-BOMBA", "BOM-SIN", "SIN-BOM",
        "DEL-KUL", "KUL-DEL", "BOMBA-KUL", "KUL-BOMBA", "BOM-KUL", "KUL-BOM",
        "BLR-DXB", "DXB-BLR", "BLR-BKK", "BKK-BLR", "BLR-SIN", "SIN-BLR",
        "MAA-SIN", "SIN-MAA", "MAA-DXB", "DXB-MAA", "MAA-KUL", "KUL-MAA",
        "CCU-BKK", "BKK-CCU", "HYD-DXB", "DXB-HYD",
        "COK-DXB", "DXB-COK",
    }

    international_long = {
        "DEL-LHR", "LHR-DEL", "BOMBA-LHR", "LHR-BOMBA", "BOM-LHR", "LHR-BOM",
        "DEL-JFK", "JFK-DEL", "BOMBA-JFK", "JFK-BOMBA", "BOM-JFK", "JFK-BOM",
        "BLR-LHR", "LHR-BLR", "BLR-JFK", "JFK-BLR",
    }

    is_domestic = route_key in domestic_routes or reverse_key in domestic_routes
    is_intl_short = route_key in international_short or reverse_key in international_short
    is_intl_long = route_key in international_long or reverse_key in international_long

    if is_domestic:
        price_range = (2500, 9500)
        duration_range = (90, 180)  # minutes
        stop_options = [0, 0, 0, 0, 1]  # mostly direct
        airline_pool = ["6E", "AI", "SG", "UK", "I5", "QP", "IX"]
    elif is_intl_short:
        price_range = (8000, 25000)
        duration_range = (180, 420)
        stop_options = [0, 0, 1, 1, 1]
        airline_pool = ["6E", "AI", "UK", "I5", "IX"]
    elif is_intl_long:
        price_range = (25000, 75000)
        duration_range = (480, 900)
        stop_options = [0, 1, 1, 1, 2]
        airline_pool = ["AI", "UK", "6E"]
    else:
        # Generic fallback for unknown routes
        price_range = (3500, 15000)
        duration_range = (120, 300)
        stop_options = [0, 0, 1, 1]
        airline_pool = ["6E", "AI", "SG", "UK", "I5", "QP"]

    # Seed with date for deterministic but varied results
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        dt = datetime.now()
    seed = hash(f"{route_key}-{date}") % 10000
    rng = random.Random(seed)

    departure_hours = [5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22]
    flights = []

    num_flights = rng.randint(6, 8)
    chosen_departures = rng.sample(departure_hours, min(num_flights, len(departure_hours)))
    chosen_departures.sort()

    for i, dep_hour in enumerate(chosen_departures):
        airline_code = rng.choice(airline_pool)
        airline = AIRLINES[airline_code]
        stops = rng.choice(stop_options)

        base_dur = rng.randint(duration_range[0], duration_range[1])
        if stops == 1:
            base_dur += rng.randint(60, 120)
        elif stops >= 2:
            base_dur += rng.randint(120, 240)

        hours_dur, mins_dur = divmod(base_dur, 60)

        dep_min = rng.randint(0, 55)
        dep_time = dt.replace(hour=dep_hour, minute=dep_min, second=0, microsecond=0)
        arr_time = dep_time + timedelta(minutes=base_dur)

        base_price = rng.randint(price_range[0], price_range[1])
        # Early morning / late night cheaper
        if dep_hour < 7 or dep_hour > 21:
            base_price = int(base_price * 0.85)
        # Direct flights slightly pricier
        if stops == 0 and base_price < price_range[1] * 0.7:
            base_price = int(base_price * 1.1)

        # Round to nearest 50
        base_price = round(base_price / 50) * 50

        flight_num = f"{airline_code}-{rng.randint(100, 9999)}"

        # Generate platform-specific prices (realistic variation ±2-12%)
        platform_prices = _generate_platform_prices(base_price, rng)

        flights.append({
            "airline": airline["name"],
            "airline_code": airline_code,
            "logo": airline["logo"],
            "flight_number": flight_num,
            "departure": dep_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "arrival": arr_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "duration": f"{hours_dur}h {mins_dur}m",
            "duration_minutes": base_dur,
            "stops": stops,
            "stops_label": "Direct" if stops == 0 else f"{stops} stop{'s' if stops > 1 else ''}",
            "price_inr": base_price,
            "price_formatted": f"₹{base_price:,}",
            "booking_url": booking_url,
            "cabin_class": cabin_class,
            "platform_prices": platform_prices,
        })

    flights.sort(key=lambda f: f["price_inr"])
    return flights
