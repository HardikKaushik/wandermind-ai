"""
Fallback itinerary generator — used when AI API is rate-limited or unavailable.
Returns realistic dummy data so the UI always works.
"""
import re
import random


def _parse_request(text):
    """Extract destination, days, budget from user text."""
    text_lower = text.lower()

    # Extract days
    days = 3
    days_match = re.search(r'(\d+)\s*(?:day|din|days|nights?)', text_lower)
    if days_match:
        days = min(int(days_match.group(1)), 10)

    # Extract budget
    budget = 50000
    budget_match = re.search(r'[₹rs\.]*\s*([\d,]+(?:\.\d+)?)\s*(?:k|thousand|lakh)?', text_lower)
    if budget_match:
        val = int(budget_match.group(1).replace(',', '').split('.')[0])
        if val < 500:
            val *= 1000  # e.g. "50k" → 50000
        budget = val

    # Extract destination
    dest_map = {
        'thailand': ('Thailand', 'Thailand', 'THB', 2.4),
        'bangkok': ('Bangkok', 'Thailand', 'THB', 2.4),
        'phuket': ('Phuket', 'Thailand', 'THB', 2.4),
        'bali': ('Bali', 'Indonesia', 'IDR', 0.0053),
        'goa': ('Goa', 'India', 'INR', 1.0),
        'manali': ('Manali', 'India', 'INR', 1.0),
        'shimla': ('Shimla', 'India', 'INR', 1.0),
        'kerala': ('Kerala', 'India', 'INR', 1.0),
        'maldives': ('Maldives', 'Maldives', 'MVR', 0.54),
        'dubai': ('Dubai', 'UAE', 'AED', 22.7),
        'singapore': ('Singapore', 'Singapore', 'SGD', 62.0),
        'paris': ('Paris', 'France', 'EUR', 90.0),
        'london': ('London', 'UK', 'GBP', 105.0),
        'japan': ('Tokyo', 'Japan', 'JPY', 0.56),
        'tokyo': ('Tokyo', 'Japan', 'JPY', 0.56),
        'europe': ('Paris', 'France', 'EUR', 90.0),
        'mumbai': ('Mumbai', 'India', 'INR', 1.0),
        'rajasthan': ('Jaipur', 'India', 'INR', 1.0),
        'jaipur': ('Jaipur', 'India', 'INR', 1.0),
        'ladakh': ('Ladakh', 'India', 'INR', 1.0),
        'vietnam': ('Hanoi', 'Vietnam', 'VND', 0.0035),
        'sri lanka': ('Colombo', 'Sri Lanka', 'LKR', 0.27),
    }

    destination = 'Goa'
    country = 'India'
    currency = 'INR'
    rate = 1.0

    for key, (dest, cntry, cur, rt) in dest_map.items():
        if key in text_lower:
            destination, country, currency, rate = dest, cntry, cur, rt
            break

    return destination, country, currency, rate, days, budget


# Template data for various destinations
DEST_DATA = {
    'Thailand': {
        'themes': ['Arrival & Temple Discovery', 'Floating Markets & Street Food', 'Beach Paradise', 'Island Adventure', 'Culture & Shopping', 'Night Markets & Nightlife', 'Relaxation Day'],
        'hotels': [
            {'name': 'Ibis Bangkok Riverside', 'stars': 3, 'price': 4000, 'rating': 4.2, 'reviews': 2100, 'amenities': ['pool', 'gym', 'free wifi'], 'address': '27 Soi Charoen Nakhon 17, Bangkok', 'phone': '+66 2 659 2888', 'email': 'info@ibisbangkok.com'},
            {'name': 'Novotel Bangkok Fenix Silom', 'stars': 4, 'price': 6500, 'rating': 4.3, 'reviews': 1800, 'amenities': ['pool', 'gym', 'spa', 'restaurant'], 'address': '320 Silom Road, Bangkok', 'phone': '+66 2 238 1999', 'email': 'info@novotelbangkok.com'},
            {'name': 'Red Planet Bangkok Surawong', 'stars': 2, 'price': 2200, 'rating': 3.9, 'reviews': 950, 'amenities': ['free wifi'], 'address': '119 Surawong Road, Bangkok', 'phone': '+66 2 238 3838', 'email': 'info@redplanet.com'},
            {'name': 'Mandarin Hotel Bangkok', 'stars': 5, 'price': 11000, 'rating': 4.6, 'reviews': 650, 'amenities': ['pool', 'gym', 'spa', 'restaurant', 'bar'], 'address': '662 Rama IV Road, Bangkok', 'phone': '+66 2 238 0222', 'email': 'info@mandarin-bangkok.com'},
        ],
        'activities': [
            {'name': 'Grand Palace', 'type': 'temple', 'rating': 4.6, 'reviews': 12000, 'cost': 500, 'duration': 2, 'desc': 'Iconic royal palace complex with stunning architecture.', 'address': 'Na Phra Lan Road, Bangkok', 'tip': 'Arrive before 9am to avoid crowds.'},
            {'name': 'Wat Pho (Reclining Buddha)', 'type': 'temple', 'rating': 4.5, 'reviews': 9000, 'cost': 300, 'duration': 1.5, 'desc': 'Home to the massive 46-meter reclining Buddha.', 'address': '2 Sanam Chai Rd, Bangkok', 'tip': 'Get a traditional Thai massage here.'},
            {'name': 'Chatuchak Weekend Market', 'type': 'shopping', 'rating': 4.4, 'reviews': 8000, 'cost': 0, 'duration': 3, 'desc': 'Largest outdoor market in the world with 15,000+ stalls.', 'address': 'Kamphaeng Phet 2 Rd, Bangkok', 'tip': 'Start from Section 1 and work clockwise.'},
            {'name': 'Damnoen Saduak Floating Market', 'type': 'market', 'rating': 4.3, 'reviews': 5500, 'cost': 800, 'duration': 3, 'desc': 'Famous floating market with boat vendors selling food and crafts.', 'address': 'Damnoen Saduak, Ratchaburi', 'tip': 'Go early morning for the authentic experience.'},
            {'name': 'Phi Phi Islands Day Trip', 'type': 'adventure', 'rating': 4.7, 'reviews': 7000, 'cost': 3500, 'duration': 8, 'desc': 'Stunning island hopping with snorkeling in crystal-clear waters.', 'address': 'Phi Phi Islands, Krabi', 'tip': 'Book a speedboat for less travel time.'},
            {'name': 'Patong Beach', 'type': 'beach', 'rating': 4.2, 'reviews': 6000, 'cost': 0, 'duration': 4, 'desc': 'Famous beach with water sports and vibrant nightlife nearby.', 'address': 'Patong, Phuket', 'tip': 'Sunset views from the southern end are spectacular.'},
            {'name': 'Elephant Nature Park', 'type': 'nature', 'rating': 4.8, 'reviews': 4500, 'cost': 4000, 'duration': 5, 'desc': 'Ethical elephant sanctuary in Chiang Mai.', 'address': 'Kuet Chang, Chiang Mai', 'tip': 'Book the half-day visit for a budget-friendly option.'},
            {'name': 'Khao San Road Night Walk', 'type': 'nightlife', 'rating': 4.1, 'reviews': 5000, 'cost': 0, 'duration': 2, 'desc': 'Backpacker hub with street food, bars, and shopping.', 'address': 'Khao San Road, Bangkok', 'tip': 'Visit after 8pm when the street comes alive.'},
        ],
        'restaurants': [
            {'name': 'Jay Fai', 'cuisine': 'Thai Street Food', 'cost': 350, 'rating': 4.5, 'reviews': 3200, 'dish': 'Crab Omelette', 'address': '327 Maha Chai Rd, Bangkok', 'phone': '+66 2 223 9384', 'hours': '3:00 PM - 12:00 AM', 'veg': True},
            {'name': 'Som Tam Nua', 'cuisine': 'Thai', 'cost': 250, 'rating': 4.3, 'reviews': 2800, 'dish': 'Green Papaya Salad', 'address': '392/14 Siam Square Soi 5, Bangkok', 'phone': '+66 2 251 4880', 'hours': '10:45 AM - 9:30 PM', 'veg': True},
            {'name': 'Thip Samai', 'cuisine': 'Thai', 'cost': 200, 'rating': 4.4, 'reviews': 4100, 'dish': 'Pad Thai wrapped in egg', 'address': '313 Maha Chai Rd, Bangkok', 'phone': '+66 2 221 6280', 'hours': '5:00 PM - 2:00 AM', 'veg': True},
            {'name': 'Bo.Lan', 'cuisine': 'Modern Thai', 'cost': 600, 'rating': 4.6, 'reviews': 1200, 'dish': 'Massaman Curry', 'address': '24 Sukhumvit 53, Bangkok', 'phone': '+66 2 260 2962', 'hours': '6:00 PM - 10:30 PM', 'veg': True},
            {'name': 'Raan Jay Fai', 'cuisine': 'Thai Seafood', 'cost': 500, 'rating': 4.7, 'reviews': 2000, 'dish': 'Drunken Noodles', 'address': '327 Maha Chai Rd, Bangkok', 'phone': '+66 2 223 9384', 'hours': '3:00 PM - 12:00 AM', 'veg': False},
            {'name': 'Nahm', 'cuisine': 'Fine Thai', 'cost': 800, 'rating': 4.5, 'reviews': 900, 'dish': 'Green Curry', 'address': '27 Sathorn Tai Rd, Bangkok', 'phone': '+66 2 625 3388', 'hours': '12:00 PM - 2:00 PM, 7:00 PM - 10:30 PM', 'veg': True},
        ],
    },
    'default': {
        'themes': ['Arrival & Exploration', 'Cultural Immersion', 'Nature & Adventure', 'Local Markets & Food', 'Beach & Relaxation', 'Sightseeing Day', 'Shopping & Departure'],
        'hotels': [
            {'name': 'Comfort Inn Central', 'stars': 3, 'price': 3500, 'rating': 4.1, 'reviews': 1500, 'amenities': ['free wifi', 'breakfast'], 'address': 'Central Area', 'phone': '+91 98765 43210', 'email': 'info@comfortinn.com'},
            {'name': 'Grand Heritage Resort', 'stars': 4, 'price': 6000, 'rating': 4.4, 'reviews': 2200, 'amenities': ['pool', 'gym', 'spa', 'restaurant'], 'address': 'Resort District', 'phone': '+91 98765 43211', 'email': 'info@grandheritage.com'},
            {'name': 'Backpackers Haven', 'stars': 2, 'price': 1800, 'rating': 4.0, 'reviews': 800, 'amenities': ['free wifi', 'common kitchen'], 'address': 'Old Town', 'phone': '+91 98765 43212', 'email': 'info@backpackershaven.com'},
            {'name': 'Royal Palace Hotel', 'stars': 5, 'price': 12000, 'rating': 4.7, 'reviews': 500, 'amenities': ['pool', 'gym', 'spa', 'restaurant', 'bar', 'concierge'], 'address': 'Premium District', 'phone': '+91 98765 43213', 'email': 'info@royalpalace.com'},
        ],
        'activities': [
            {'name': 'City Walking Tour', 'type': 'culture', 'rating': 4.3, 'reviews': 3000, 'cost': 500, 'duration': 3, 'desc': 'Explore the historic old town with a local guide.', 'address': 'Old Town Center', 'tip': 'Morning tours are cooler and less crowded.'},
            {'name': 'Local Market Visit', 'type': 'shopping', 'rating': 4.2, 'reviews': 2500, 'cost': 0, 'duration': 2, 'desc': 'Browse local handicrafts and fresh produce.', 'address': 'Central Market', 'tip': 'Bargain — start at 50% of asking price.'},
            {'name': 'Nature Trek', 'type': 'adventure', 'rating': 4.5, 'reviews': 1800, 'cost': 1500, 'duration': 5, 'desc': 'Scenic trek through hills and valleys.', 'address': 'Trail Head Point', 'tip': 'Carry at least 2 liters of water.'},
            {'name': 'Beach Day', 'type': 'beach', 'rating': 4.4, 'reviews': 4000, 'cost': 0, 'duration': 4, 'desc': 'Relax on pristine sands.', 'address': 'Main Beach', 'tip': 'Visit the north side for fewer tourists.'},
            {'name': 'Food Tour', 'type': 'food', 'rating': 4.6, 'reviews': 1500, 'cost': 1200, 'duration': 3, 'desc': 'Sample the best local dishes with a food expert.', 'address': 'Food Street', 'tip': 'Come hungry — you will eat a lot!'},
            {'name': 'Sunset Cruise', 'type': 'nature', 'rating': 4.5, 'reviews': 1200, 'cost': 2000, 'duration': 2, 'desc': 'Scenic boat ride with panoramic sunset views.', 'address': 'Harbor', 'tip': 'Book the upper deck for best views.'},
        ],
        'restaurants': [
            {'name': 'Local Flavors Kitchen', 'cuisine': 'Local', 'cost': 300, 'rating': 4.3, 'reviews': 1800, 'dish': 'Chef\'s Special Thali', 'address': 'Main Street', 'phone': '+91 98765 11111', 'hours': '8:00 AM - 10:00 PM', 'veg': True},
            {'name': 'Spice Garden', 'cuisine': 'Indian', 'cost': 250, 'rating': 4.2, 'reviews': 1500, 'dish': 'Paneer Butter Masala', 'address': 'Market Road', 'phone': '+91 98765 22222', 'hours': '11:00 AM - 11:00 PM', 'veg': True},
            {'name': 'Ocean View Cafe', 'cuisine': 'Multi-Cuisine', 'cost': 450, 'rating': 4.4, 'reviews': 900, 'dish': 'Grilled Fish', 'address': 'Beach Road', 'phone': '+91 98765 33333', 'hours': '7:00 AM - 11:00 PM', 'veg': False},
            {'name': 'Green Leaf Bistro', 'cuisine': 'Vegetarian', 'cost': 200, 'rating': 4.5, 'reviews': 2200, 'dish': 'Avocado Buddha Bowl', 'address': 'Garden Lane', 'phone': '+91 98765 44444', 'hours': '8:00 AM - 9:00 PM', 'veg': True},
        ],
    },
}

# Copy Thailand data for Goa, Bali etc with slight modifications
DEST_DATA['Goa'] = {
    'themes': ['Beach Arrival & Sunset', 'North Goa Beaches', 'Old Goa Heritage', 'South Goa Serenity', 'Spice Plantation & Waterfall', 'Market Day & Nightlife', 'Departure Day'],
    'hotels': [
        {'name': 'Taj Holiday Village Resort', 'stars': 5, 'price': 9000, 'rating': 4.5, 'reviews': 3200, 'amenities': ['pool', 'gym', 'spa', 'beach access', 'restaurant'], 'address': 'Sinquerim, Candolim, Goa', 'phone': '+91 832 664 5858', 'email': 'info@tajhotels.com'},
        {'name': 'Goa Marriott Resort', 'stars': 4, 'price': 6500, 'rating': 4.3, 'reviews': 2500, 'amenities': ['pool', 'gym', 'spa', 'casino'], 'address': 'Miramar, Panaji, Goa', 'phone': '+91 832 246 3333', 'email': 'info@marriott.com'},
        {'name': 'OYO Flagship Calangute', 'stars': 2, 'price': 1500, 'rating': 3.8, 'reviews': 1200, 'amenities': ['free wifi', 'AC'], 'address': 'Calangute, Goa', 'phone': '+91 98765 55555', 'email': 'info@oyo.com'},
        {'name': 'Novotel Goa Dona Sylvia', 'stars': 4, 'price': 5500, 'rating': 4.4, 'reviews': 1800, 'amenities': ['pool', 'gym', 'restaurant', 'bar'], 'address': 'Cavelossim, South Goa', 'phone': '+91 832 287 1234', 'email': 'info@novotelgoa.com'},
    ],
    'activities': [
        {'name': 'Calangute Beach', 'type': 'beach', 'rating': 4.2, 'reviews': 8000, 'cost': 0, 'duration': 3, 'desc': 'Queen of beaches with water sports and shacks.', 'address': 'Calangute, North Goa', 'tip': 'Try parasailing here — costs around ₹800.'},
        {'name': 'Basilica of Bom Jesus', 'type': 'temple', 'rating': 4.6, 'reviews': 5000, 'cost': 0, 'duration': 1, 'desc': 'UNESCO World Heritage church with St. Francis Xavier remains.', 'address': 'Old Goa', 'tip': 'Visit early morning for peaceful experience.'},
        {'name': 'Dudhsagar Waterfall Trek', 'type': 'adventure', 'rating': 4.5, 'reviews': 3500, 'cost': 2500, 'duration': 6, 'desc': 'Majestic four-tiered waterfall on the Goa-Karnataka border.', 'address': 'Sanguem, Goa', 'tip': 'Visit during monsoon (July-Sep) for full flow.'},
        {'name': 'Saturday Night Market, Arpora', 'type': 'shopping', 'rating': 4.3, 'reviews': 4000, 'cost': 0, 'duration': 3, 'desc': 'Vibrant flea market with live music and food stalls.', 'address': 'Arpora, North Goa', 'tip': 'Starts at 6pm — arrive early for parking.'},
        {'name': 'Palolem Beach', 'type': 'beach', 'rating': 4.7, 'reviews': 6000, 'cost': 0, 'duration': 4, 'desc': 'Crescent-shaped beach in South Goa, perfect for kayaking.', 'address': 'Canacona, South Goa', 'tip': 'Rent a kayak and paddle to Butterfly Island.'},
        {'name': 'Spice Plantation Tour', 'type': 'nature', 'rating': 4.4, 'reviews': 2000, 'cost': 600, 'duration': 2, 'desc': 'Learn about local spices with a guided tour and lunch.', 'address': 'Ponda, Goa', 'tip': 'Sahakari Spice Farm includes a buffet lunch.'},
    ],
    'restaurants': [
        {'name': 'Vinayak Family Restaurant', 'cuisine': 'Goan Vegetarian', 'cost': 200, 'rating': 4.3, 'reviews': 3000, 'dish': 'Goan Thali', 'address': 'Calangute, Goa', 'phone': '+91 832 227 6789', 'hours': '8:00 AM - 10:30 PM', 'veg': True},
        {'name': 'Fisherman\'s Wharf', 'cuisine': 'Goan Seafood', 'cost': 500, 'rating': 4.5, 'reviews': 4500, 'dish': 'Goan Fish Curry Rice', 'address': 'Cavelossim, South Goa', 'phone': '+91 832 287 1234', 'hours': '12:00 PM - 11:00 PM', 'veg': False},
        {'name': 'Infantaria', 'cuisine': 'Bakery & Cafe', 'cost': 300, 'rating': 4.2, 'reviews': 2200, 'dish': 'Croissants & Cold Coffee', 'address': 'Calangute-Baga Road, Goa', 'phone': '+91 832 227 6789', 'hours': '7:30 AM - 11:00 PM', 'veg': True},
        {'name': 'Gunpowder', 'cuisine': 'South Indian & Kerala', 'cost': 400, 'rating': 4.6, 'reviews': 1800, 'dish': 'Appam with Stew', 'address': 'Assagao, North Goa', 'phone': '+91 832 226 8091', 'hours': '12:30 PM - 3:30 PM, 7:00 PM - 11:00 PM', 'veg': True},
    ],
}


def generate_fallback_itinerary(user_text):
    """Generate a complete fallback itinerary from templates."""
    destination, country, currency, rate, num_days, budget = _parse_request(user_text)

    data = DEST_DATA.get(destination, DEST_DATA['default'])
    themes = data['themes']
    all_hotels = data['hotels']
    all_activities = data['activities']
    all_restaurants = data['restaurants']

    per_day = budget // num_days
    hotel_budget = int(per_day * 0.4)

    # Pick primary hotel (closest to budget)
    primary_hotel = min(all_hotels, key=lambda h: abs(h['price'] - hotel_budget))
    alt_hotels = [h for h in all_hotels if h['name'] != primary_hotel['name']]

    days = []
    for d in range(1, num_days + 1):
        theme = themes[(d - 1) % len(themes)]
        act = all_activities[(d - 1) % len(all_activities)]
        act2 = all_activities[d % len(all_activities)]

        meal_slots = ['breakfast', 'lunch', 'dinner']
        meals = []
        for mi, slot in enumerate(meal_slots):
            r_primary = all_restaurants[(d - 1 + mi) % len(all_restaurants)]
            alts = [all_restaurants[(d + mi + j) % len(all_restaurants)] for j in range(1, 4)]
            # Deduplicate
            seen = {r_primary['name']}
            unique_alts = []
            for a in alts:
                if a['name'] not in seen:
                    seen.add(a['name'])
                    unique_alts.append({
                        'place_name': a['name'], 'cuisine': a['cuisine'],
                        'rating': a['rating'], 'cost_per_person_inr': a['cost'],
                        'distance_from_hotel': f'{random.randint(3, 15) * 100}m',
                        'must_try_dish': a['dish'], '_isPrimary': False,
                    })
            meals.append({
                'meal_time': slot,
                'place_name': r_primary['name'],
                'cuisine': r_primary['cuisine'],
                'cost_per_person_inr': r_primary['cost'],
                'rating': r_primary['rating'],
                'review_count': r_primary['reviews'],
                'is_vegetarian_friendly': r_primary['veg'],
                'is_vegan_friendly': False,
                'must_try_dish': r_primary['dish'],
                'address': r_primary['address'],
                'maps_query': f"{r_primary['name']} {destination}",
                'image_keyword': f"{r_primary['cuisine']} restaurant {destination}",
                'distance_from_hotel': f'{random.randint(2, 10) * 100}m',
                'opening_hours': r_primary['hours'],
                'contact_phone': r_primary['phone'],
                'avg_cost_for_two_inr': r_primary['cost'] * 2,
                'alternatives': unique_alts,
            })

        food_cost = sum(m['cost_per_person_inr'] for m in meals)
        act_cost = act['cost'] + act2['cost']
        transport_cost = random.choice([200, 300, 500, 800])
        day_total = primary_hotel['price'] + food_cost + act_cost + transport_cost

        def _make_hotel(h, is_rec=False):
            return {
                'name': h['name'], 'stars': h['stars'],
                'price_per_night_inr': h['price'],
                'price_per_night_local': int(h['price'] / rate) if rate != 1 else h['price'],
                'rating': h['rating'], 'review_count': h['reviews'],
                'amenities': h['amenities'], 'address': h['address'],
                'image_keyword': f"{h['name']} hotel",
                'booking_link_hint': f"https://www.booking.com/searchresults.html?ss={h['name'].replace(' ', '+')}",
                'veg_friendly': True,
                'contact_phone': h['phone'], 'contact_email': h.get('email', ''),
                'website': f"https://www.google.com/search?q={h['name'].replace(' ', '+')}",
                'checkin_time': '2:00 PM', 'checkout_time': '12:00 PM',
                'booking_platforms': [
                    {'platform': 'Booking.com', 'estimated_price_inr': h['price'],
                     'url_hint': f"https://www.booking.com/searchresults.html?ss={h['name'].replace(' ', '+')}+{destination}"},
                    {'platform': 'MakeMyTrip', 'estimated_price_inr': int(h['price'] * 0.95),
                     'url_hint': f"https://www.makemytrip.com/hotels/hotel-listing/?searchText={h['name'].replace(' ', '+')}"},
                    {'platform': 'Goibibo', 'estimated_price_inr': int(h['price'] * 1.05),
                     'url_hint': f"https://www.goibibo.com/hotels/search/?query={h['name'].replace(' ', '+')}"},
                ],
                'why_consider': 'Top pick for value' if is_rec else f"{'Luxury' if h['stars'] >= 5 else 'Budget' if h['stars'] <= 2 else 'Mid-range'} option",
            }

        def _make_activity(a, slot):
            return {
                'time_slot': slot,
                'name': a['name'], 'type': a['type'],
                'rating': a['rating'], 'review_count': a['reviews'],
                'cost_inr': a['cost'], 'duration_hours': a['duration'],
                'description': a['desc'], 'address': a['address'],
                'maps_query': f"{a['name']} {destination}",
                'image_keyword': f"{a['name']} {destination}",
                'insider_tip': a['tip'],
                'accessibility': 'easy', 'best_for': ['couples', 'families'],
                'skip_if': None,
            }

        days.append({
            'day': d,
            'date': None,
            'theme': theme,
            'morning_brief': f"Day {d} in {destination} — {theme}",
            'weather_note': random.choice(['Sunny, 30°C', 'Partly cloudy, 28°C', 'Hot and humid, 32°C', 'Pleasant, 26°C']),
            'hotel': _make_hotel(primary_hotel, True),
            'alternative_hotels': [_make_hotel(h) for h in alt_hotels[:3]],
            'activities': [
                _make_activity(act, 'morning'),
                _make_activity(act2, 'afternoon'),
            ],
            'meals': meals,
            'transport': {
                'mode': random.choice(['taxi', 'auto-rickshaw', 'metro', 'bus']),
                'details': f'Local transport in {destination}',
                'cost_inr': transport_cost,
                'duration_minutes': random.randint(15, 45),
                'booking_tip': 'Use Grab/Bolt app for best prices' if country != 'India' else 'Use Ola/Uber for reliable rides',
            },
            'day_total_inr': day_total,
            'packing_tip': random.choice([
                'Carry sunscreen and a hat.',
                'Wear comfortable walking shoes.',
                'Keep a light rain jacket handy.',
                'Carry a reusable water bottle.',
            ]),
        })

    total_used = sum(d['day_total_inr'] for d in days)
    breakdown = {
        'hotels_inr': primary_hotel['price'] * num_days,
        'food_inr': int(total_used * 0.25),
        'activities_inr': int(total_used * 0.2),
        'transport_inr': int(total_used * 0.1),
        'misc_inr': int(total_used * 0.05),
    }

    itinerary = {
        'destination': destination,
        'country': country,
        'total_days': num_days,
        'travel_dates': {'start': None, 'end': None},
        'budget': {
            'total_inr': budget,
            'total_local': int(budget / rate) if rate != 1 else budget,
            'local_currency': currency,
            'exchange_rate': rate,
            'breakdown': breakdown,
            'remaining_inr': max(0, budget - total_used),
        },
        'summary': f"A {num_days}-day trip to {destination}, {country} packed with culture, food, and adventure — optimized for Indian travelers!",
        'travel_style': ['budget-friendly', 'cultural', 'foodie'],
        'festivals_events': [],
        'days': days,
        'india_transport': {
            'suggested_trains': [],
            'suggested_flights': [{
                'route': f'Delhi/Mumbai to {destination}',
                'approx_cost_inr': random.choice([8000, 12000, 15000, 18000]),
                'airlines': ['IndiGo', 'Air India', 'SpiceJet'],
                'booking_tip': 'Book 2-3 weeks in advance for best prices.',
            }],
        },
        'travel_essentials': {
            'best_time_to_visit': 'November to February' if country != 'India' else 'October to March',
            'visa_for_indians': 'Visa on Arrival (free for 15 days)' if country == 'Thailand' else ('Not required' if country == 'India' else 'E-visa available'),
            'visa_cost_inr': 0 if country in ('India', 'Thailand') else 3000,
            'currency_tips': f'{currency} is the local currency. Carry some cash for street vendors.',
            'local_customs': 'Respect local culture and dress modestly at religious sites.',
            'language_tips': 'English is widely spoken in tourist areas.',
            'emergency_contacts': {
                'police': '100' if country == 'India' else '191',
                'ambulance': '108' if country == 'India' else '1669',
                'indian_embassy': 'Contact nearest Indian embassy for assistance.',
            },
            'health_precautions': 'Carry basic medicines. Drink bottled water only.',
            'sim_card_tip': 'Buy a local SIM at the airport for cheap data.',
            'atm_availability': 'ATMs widely available. Notify your bank about travel.',
        },
        'packing_list': {
            'essentials': ['Passport', 'Travel insurance docs', 'Cash + cards', 'Phone charger'],
            'clothes': ['Light cotton clothes', 'Swimwear', 'Comfortable shoes', 'Sun hat'],
            'documents': ['Flight tickets', 'Hotel bookings', 'ID proof', 'Visa (if needed)'],
            'tech': ['Phone', 'Power bank', 'Camera', 'Universal adapter'],
        },
        'modifications_history': ['Generated from fallback data (AI temporarily unavailable)'],
    }

    return {
        'message': f"Here's your {num_days}-day {destination} itinerary! (Note: Generated from curated data as AI is temporarily rate-limited. You can modify this anytime!)",
        'itinerary': itinerary,
    }
