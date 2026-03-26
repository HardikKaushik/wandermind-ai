import requests
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import quote
from django.conf import settings

# File-based cache
_CACHE_DIR = Path(settings.BASE_DIR) / '.image_cache'
_CACHE_DIR.mkdir(exist_ok=True)

GOOGLE_API_KEY = getattr(settings, 'GEMINI_API_KEY', '')


def _cache_get(key: str) -> str | None:
    h = hashlib.md5(key.encode()).hexdigest()
    path = _CACHE_DIR / f"{h}.json"
    if path.exists():
        try:
            return json.loads(path.read_text()).get('url')
        except Exception:
            pass
    return None


def _cache_set(key: str, url: str):
    h = hashlib.md5(key.encode()).hexdigest()
    path = _CACHE_DIR / f"{h}.json"
    try:
        path.write_text(json.dumps({'key': key, 'url': url}))
    except Exception:
        pass


def get_place_photo(keyword: str, width=800, height=500) -> str:
    cached = _cache_get(keyword)
    if cached:
        return cached

    url = None

    # Strategy 1: Google Places (New) Photo API
    if GOOGLE_API_KEY:
        url = _google_places_photo(keyword, width)

    # Strategy 2: Wikimedia Commons image search (better than Wikipedia for photos)
    if not url:
        url = _wikimedia_commons_photo(keyword)

    # Strategy 3: Wikipedia article image
    if not url:
        url = _wikipedia_photo(keyword)

    # Strategy 4: Placeholder with place name
    if not url:
        encoded = quote(keyword[:30])
        url = f"https://placehold.co/{width}x{height}/0F2337/0EA5E9?text={encoded}"

    _cache_set(keyword, url)
    return url


def _google_places_photo(keyword: str, max_width=800) -> str | None:
    try:
        resp = requests.post(
            "https://places.googleapis.com/v1/places:searchText",
            json={"textQuery": keyword, "maxResultCount": 1},
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY,
                "X-Goog-FieldMask": "places.photos",
            },
            timeout=5,
        )
        data = resp.json()
        if 'error' in data:
            return None
        places = data.get('places', [])
        if not places or not places[0].get('photos'):
            return None
        photo_name = places[0]['photos'][0]['name']
        return (
            f"https://places.googleapis.com/v1/{photo_name}/media"
            f"?maxWidthPx={max_width}&key={GOOGLE_API_KEY}"
        )
    except Exception:
        return None


def _wikimedia_commons_photo(keyword: str) -> str | None:
    """Search Wikimedia Commons directly for photos — better coverage than Wikipedia."""
    headers = {"User-Agent": "WanderMind/1.0 (travel planner)"}
    try:
        # Search Commons for images matching the keyword
        resp = requests.get(
            "https://commons.wikimedia.org/w/api.php",
            params={
                "action": "query",
                "generator": "search",
                "gsrsearch": f"{keyword} photo",
                "gsrnamespace": 6,  # File namespace
                "gsrlimit": 5,
                "prop": "imageinfo",
                "iiprop": "url|size|mime",
                "iiurlwidth": 800,
                "format": "json",
            },
            headers=headers,
            timeout=5,
        )
        data = resp.json()
        pages = data.get('query', {}).get('pages', {})

        for page in sorted(pages.values(), key=lambda p: p.get('index', 999)):
            imageinfo = page.get('imageinfo', [{}])[0]
            mime = imageinfo.get('mime', '')
            if not mime.startswith('image/'):
                continue
            # Prefer the thumbnail URL (800px wide)
            thumb_url = imageinfo.get('thumburl')
            if thumb_url:
                return thumb_url
            # Fallback to full URL
            full_url = imageinfo.get('url')
            if full_url:
                return full_url
    except Exception:
        pass
    return None


def _wikipedia_photo(keyword: str) -> str | None:
    """Search Wikipedia for article page image."""
    headers = {"User-Agent": "WanderMind/1.0 (travel planner)"}
    try:
        resp = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "generator": "search",
                "gsrsearch": keyword,
                "gsrlimit": 3,
                "prop": "pageimages",
                "format": "json",
                "pithumbsize": 800,
            },
            headers=headers,
            timeout=5,
        )
        data = resp.json()
        pages = data.get('query', {}).get('pages', {})
        for page in pages.values():
            thumb = page.get('thumbnail', {}).get('source')
            if thumb:
                return thumb
    except Exception:
        pass
    return None


def _clean_search_term(name: str, destination: str = '') -> str:
    """Extract the core place name for better image search."""
    # Remove common hotel brand prefixes
    brands = [
        'treebo', 'oyo', 'fabhotel', 'zostel', 'novotel', 'ibis', 'marriott',
        'hilton', 'hyatt', 'radisson', 'taj', 'itc', 'oberoi', 'leela',
        'lemon tree', 'ginger', 'club mahindra',
    ]
    lower = name.lower()
    for brand in brands:
        if lower.startswith(brand):
            # For hotels, search for the location instead
            return f"{destination} hotel" if destination else name

    # Remove trailing "Goa", "India" etc. for better specificity
    # But keep destination in search for uniqueness
    return name


def enrich_with_images(itinerary: dict) -> dict:
    if not itinerary or not isinstance(itinerary, dict):
        return itinerary

    destination = itinerary.get('destination', '')

    for day in itinerary.get('days', []):
        if not isinstance(day, dict):
            continue

        # Hotel photo — search for hotel name + destination
        hotel = day.get('hotel')
        if isinstance(hotel, dict):
            name = hotel.get('name', '')
            kw = _clean_search_term(name, destination)
            if kw:
                hotel['photo_url'] = get_place_photo(kw)

        # Alternative hotel photos
        for alt_hotel in day.get('alternative_hotels', []):
            if not isinstance(alt_hotel, dict):
                continue
            alt_name = alt_hotel.get('name', '')
            alt_kw = _clean_search_term(alt_name, destination)
            if alt_kw:
                alt_hotel['photo_url'] = get_place_photo(alt_kw)

        # Activity photos — use the actual place name
        for activity in day.get('activities', []):
            if not isinstance(activity, dict):
                continue
            name = activity.get('name', '')
            if name:
                # Search with just the place name — most specific
                activity['photo_url'] = get_place_photo(name)

        # Meal photos — search restaurant + cuisine + destination
        for meal in day.get('meals', []):
            if not isinstance(meal, dict):
                continue
            name = meal.get('place_name', '')
            cuisine = meal.get('cuisine', '')
            if name:
                search = f"{cuisine} food {destination}" if cuisine else f"{name} restaurant"
                meal['photo_url'] = get_place_photo(search)

    return itinerary
