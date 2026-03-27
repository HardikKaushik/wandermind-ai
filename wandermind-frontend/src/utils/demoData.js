// Demo data generator for when backend is unavailable

const DESTINATIONS = {
  goa: buildGoaItinerary,
  bali: buildBaliItinerary,
  thailand: buildThailandItinerary,
  bangkok: buildThailandItinerary,
  default: buildGoaItinerary,
}

export function generateDemoResponse(userMessage) {
  const msg = userMessage.toLowerCase()

  // Check if it's a modification request (but NOT a new trip creation with "budget" keyword)
  const isNewTrip = msg.includes('plan') || msg.includes('trip') || msg.includes('itinerary') || msg.includes('day') || msg.includes('din')
  if (
    !isNewTrip && (
      msg.includes('change') || msg.includes('replace') || msg.includes('modify') ||
      msg.includes('cheaper') || msg.includes('different') || msg.includes('update') ||
      msg.includes('optimize') || msg.includes('cut') || msg.includes('budget')
    )
  ) {
    return {
      message: "I've updated your itinerary based on your request! Check the itinerary panel for the changes.",
      change_summary: 'Updated based on your preferences',
      itinerary: null, // Keep existing itinerary
    }
  }

  // Check if it's a general question
  if (msg.includes('?') && !msg.includes('plan') && !msg.includes('trip') && !msg.includes('itinerary')) {
    return {
      message: "That's a great question! Based on my travel knowledge, I'd recommend checking the Travel Essentials panel for detailed information about your destination.",
      itinerary: null,
    }
  }

  // Detect destination and build itinerary
  let builder = DESTINATIONS.default
  let days = 3
  let budget = 45000

  for (const [key, fn] of Object.entries(DESTINATIONS)) {
    if (msg.includes(key)) {
      builder = fn
      break
    }
  }
  if (msg.includes('bali') || msg.includes('indonesia')) builder = DESTINATIONS.bali
  if (msg.includes('thailand') || msg.includes('bangkok') || msg.includes('phuket')) builder = DESTINATIONS.thailand

  // Parse days
  const dayMatch = msg.match(/(\d+)\s*(?:day|din|days)/)
  if (dayMatch) days = Math.min(parseInt(dayMatch[1]), 7)

  // Parse budget
  const budgetMatch = msg.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i) || msg.match(/([\d,]+(?:\.\d+)?)\s*(?:budget|₹)/i)
  if (budgetMatch) budget = parseInt(budgetMatch[1].replace(/,/g, ''))

  const itinerary = builder(days, budget)

  return {
    message: `I've created your ${days}-day ${itinerary.destination} itinerary! Total estimated cost is ₹${(budget - itinerary.budget.remaining_inr).toLocaleString('en-IN')}. Check out the details in the itinerary panel. Feel free to ask me to modify anything!`,
    itinerary,
    change_summary: null,
  }
}

function buildGoaItinerary(days = 3, budget = 45000) {
  // Use ~80% of budget so there's a healthy remaining amount
  const usableBudget = Math.round(budget * 0.80)
  const perDay = Math.round(usableBudget / days)
  const hotelCost = Math.round(perDay * 0.35)
  const foodCost = Math.round(perDay * 0.2)
  const actCost = Math.round(perDay * 0.25)
  const transCost = Math.round(perDay * 0.15)

  const goaDays = []
  const themes = [
    'North Goa Beaches & Nightlife',
    'Old Goa Heritage & Spice Plantation',
    'South Goa Serenity & Water Sports',
    'Dudhsagar Falls & Adventure Day',
    'Panjim City Walk & Shopping',
    'Island Hopping & Dolphin Cruise',
    'Yoga, Wellness & Departure',
  ]

  const hotels = [
    { name: 'Treebo Trend Morjim', stars: 3, price: hotelCost, rating: 4.2, reviews: 1847, amenities: ['Free WiFi', 'Pool', 'Restaurant', 'Beach Access'], address: 'Morjim Beach Rd, Goa', image_keyword: 'goa beach resort', veg_friendly: true },
    { name: 'Novotel Goa Dona Sylvia', stars: 4, price: Math.round(hotelCost * 1.3), rating: 4.5, reviews: 3241, amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'], address: 'Cavelossim Beach, South Goa', image_keyword: 'goa luxury hotel pool', veg_friendly: true },
    { name: 'The Fern Kesarval Hotel', stars: 4, price: Math.round(hotelCost * 1.1), rating: 4.3, reviews: 2100, amenities: ['Free WiFi', 'Pool', 'Restaurant', 'Parking'], address: 'Verna, Goa', image_keyword: 'goa hotel garden', veg_friendly: true },
  ]

  const activitiesByDay = [
    [
      { time_slot: 'morning', name: 'Calangute Beach', type: 'beach', rating: 4.1, reviews: 15420, cost_inr: 0, duration_hours: 2.5, description: 'Start your Goa trip at the famous Queen of Beaches. Perfect for morning walks and water activities.', address: 'Calangute, North Goa', maps_query: 'Calangute Beach Goa', image_keyword: 'calangute beach goa', insider_tip: 'Go before 9 AM to avoid crowds. The shacks on the south end are cheaper and less touristy.', accessibility: 'easy', best_for: ['couples', 'families', 'solo'] },
      { time_slot: 'afternoon', name: 'Aguada Fort', type: 'museum', rating: 4.4, reviews: 8900, cost_inr: 50, duration_hours: 2, description: 'Historic Portuguese fort with stunning ocean views. The lighthouse offers panoramic views of the Arabian Sea.', address: 'Fort Aguada Rd, Sinquerim', maps_query: 'Fort Aguada Goa', image_keyword: 'aguada fort goa', insider_tip: 'Visit the old jail turned art gallery inside the complex. Most tourists miss it.', accessibility: 'moderate', best_for: ['couples', 'families', 'solo', 'groups'] },
      { time_slot: 'evening', name: 'Baga Beach Night Market', type: 'shopping', rating: 4.0, reviews: 6300, cost_inr: 500, duration_hours: 3, description: 'Famous Saturday night market with live music, food stalls, and shopping. Great Goan vibe!', address: 'Baga Beach Road, North Goa', maps_query: 'Baga Night Market Goa', image_keyword: 'baga beach goa night', insider_tip: 'Bargain hard — start at 40% of the asking price. The food stalls at the back have better prices.', accessibility: 'easy', best_for: ['couples', 'groups'] },
    ],
    [
      { time_slot: 'morning', name: 'Basilica of Bom Jesus', type: 'temple', rating: 4.6, reviews: 12000, cost_inr: 0, duration_hours: 1.5, description: 'UNESCO World Heritage Site housing the remains of St. Francis Xavier. Stunning Baroque architecture.', address: 'Old Goa', maps_query: 'Basilica of Bom Jesus Goa', image_keyword: 'basilica bom jesus old goa', insider_tip: 'Visit on a weekday morning for a peaceful experience. The museum next door is often empty.', accessibility: 'easy', best_for: ['families', 'solo', 'couples'] },
      { time_slot: 'afternoon', name: 'Sahakari Spice Farm', type: 'nature', rating: 4.3, reviews: 5400, cost_inr: 400, duration_hours: 3, description: 'Tour a working spice plantation, see cashews, cardamom, and vanilla growing. Includes a delicious Goan vegetarian lunch.', address: 'Ponda, Goa', maps_query: 'Sahakari Spice Farm Goa', image_keyword: 'goa spice plantation', insider_tip: 'The lunch buffet here is one of the best authentic Goan meals you\'ll get. The elephant ride is optional — skip it.', accessibility: 'moderate', best_for: ['families', 'couples', 'groups'] },
      { time_slot: 'evening', name: 'Fontainhas Latin Quarter', type: 'museum', rating: 4.5, reviews: 4200, cost_inr: 0, duration_hours: 2, description: 'Explore the colorful Portuguese-era neighbourhood in Panjim. Beautiful colonial architecture and art galleries.', address: 'Fontainhas, Panjim', maps_query: 'Fontainhas Panjim Goa', image_keyword: 'fontainhas goa colorful houses', insider_tip: 'Visit Venite Restaurant in Fontainhas for authentic Goan food with colonial ambiance.', accessibility: 'easy', best_for: ['couples', 'solo'] },
    ],
    [
      { time_slot: 'morning', name: 'Palolem Beach', type: 'beach', rating: 4.5, reviews: 9800, cost_inr: 0, duration_hours: 3, description: 'Crescent-shaped beach in South Goa known for calm waters, dolphin spotting, and kayaking.', address: 'Palolem, Canacona, South Goa', maps_query: 'Palolem Beach Goa', image_keyword: 'palolem beach goa', insider_tip: 'Kayak to Butterfly Beach (adjacent) early morning. You might have it entirely to yourself.', accessibility: 'easy', best_for: ['couples', 'solo', 'families'] },
      { time_slot: 'afternoon', name: 'Scuba Diving at Grande Island', type: 'adventure', rating: 4.4, reviews: 3200, cost_inr: 3500, duration_hours: 4, description: 'Beginner-friendly scuba diving with coral reefs, tropical fish, and shipwrecks around Grande Island.', address: 'Grande Island, Goa', maps_query: 'Grande Island Scuba Diving Goa', image_keyword: 'goa scuba diving', insider_tip: 'Book with PADI-certified operators only. Morning slots have better visibility.', accessibility: 'moderate', best_for: ['couples', 'groups', 'solo'] },
      { time_slot: 'evening', name: 'Sunset at Cabo de Rama Fort', type: 'nature', rating: 4.2, reviews: 2100, cost_inr: 0, duration_hours: 2, description: 'Ancient fort with dramatic clifftop views. One of the most spectacular sunset spots in Goa.', address: 'Cabo de Rama, South Goa', maps_query: 'Cabo de Rama Fort Goa', image_keyword: 'cabo de rama fort goa sunset', insider_tip: 'Almost no tourists come here. Bring water and snacks — there are no shops nearby.', accessibility: 'moderate', best_for: ['couples', 'solo'] },
    ],
  ]

  const mealsByDay = [
    [
      { meal_time: 'breakfast', place_name: 'Infantaria', cuisine: 'Goan-Portuguese', cost_per_person_inr: 350, rating: 4.3, is_vegetarian_friendly: true, is_vegan_friendly: false, must_try_dish: 'Bebinca pancakes', address: 'Calangute', image_keyword: 'goan breakfast' },
      { meal_time: 'lunch', place_name: 'Gunpowder', cuisine: 'South Indian-Goan', cost_per_person_inr: 500, rating: 4.5, is_vegetarian_friendly: true, is_vegan_friendly: true, must_try_dish: 'Appam with stew', address: 'Assagao', image_keyword: 'south indian food goa' },
      { meal_time: 'dinner', place_name: 'Thalassa', cuisine: 'Greek-Mediterranean', cost_per_person_inr: 800, rating: 4.4, is_vegetarian_friendly: true, is_vegan_friendly: false, must_try_dish: 'Greek mezze platter', address: 'Vagator', image_keyword: 'thalassa goa restaurant sunset' },
    ],
    [
      { meal_time: 'breakfast', place_name: 'Cafe Bodega', cuisine: 'Continental', cost_per_person_inr: 400, rating: 4.4, is_vegetarian_friendly: true, is_vegan_friendly: true, must_try_dish: 'Granola bowl', address: 'Sunaparanta, Panjim', image_keyword: 'cafe bodega goa' },
      { meal_time: 'lunch', place_name: 'Spice Farm Buffet', cuisine: 'Goan Vegetarian', cost_per_person_inr: 0, rating: 4.3, is_vegetarian_friendly: true, is_vegan_friendly: true, must_try_dish: 'Goan thali (included in farm tour)', address: 'Ponda', image_keyword: 'goan vegetarian thali' },
      { meal_time: 'dinner', place_name: 'Vinayak Family Restaurant', cuisine: 'Goan-Indian', cost_per_person_inr: 300, rating: 4.2, is_vegetarian_friendly: true, is_vegan_friendly: false, must_try_dish: 'Paneer Cafreal', address: 'Panjim', image_keyword: 'goan restaurant dinner' },
    ],
    [
      { meal_time: 'breakfast', place_name: 'Dropadi', cuisine: 'Indian', cost_per_person_inr: 250, rating: 4.1, is_vegetarian_friendly: true, is_vegan_friendly: true, must_try_dish: 'Poha and chai', address: 'Palolem', image_keyword: 'indian breakfast poha' },
      { meal_time: 'lunch', place_name: 'Ourem 88', cuisine: 'Multi-cuisine', cost_per_person_inr: 450, rating: 4.3, is_vegetarian_friendly: true, is_vegan_friendly: false, must_try_dish: 'Mushroom risotto', address: 'Palolem', image_keyword: 'palolem beach restaurant' },
      { meal_time: 'dinner', place_name: 'Magic Italy', cuisine: 'Italian', cost_per_person_inr: 550, rating: 4.4, is_vegetarian_friendly: true, is_vegan_friendly: false, must_try_dish: 'Wood-fired pizza', address: 'Palolem Beach Road', image_keyword: 'italian food goa beach' },
    ],
  ]

  for (let i = 0; i < days; i++) {
    const idx = i % 3
    const dayTotal = hotelCost + foodCost * 2 + actCost + transCost
    goaDays.push({
      day: i + 1,
      date: null,
      theme: themes[i % themes.length],
      morning_brief: `Start Day ${i + 1} early to make the most of your Goa adventure!`,
      weather_note: i === 0 ? '30°C Sunny — Pack sunscreen and sunglasses' : '29°C Partly cloudy — Comfortable for outdoor activities',
      hotel: {
        ...hotels[idx],
        price_per_night_inr: hotels[idx].price,
        price_per_night_local: hotels[idx].price,
        photo_url: `https://source.unsplash.com/600x400/?${encodeURIComponent(hotels[idx].image_keyword)}`,
        booking_link_hint: 'booking.com',
      },
      activities: activitiesByDay[idx].map((a) => ({
        ...a,
        photo_url: `https://source.unsplash.com/600x400/?${encodeURIComponent(a.image_keyword)}`,
        skip_if: null,
      })),
      meals: mealsByDay[idx].map((m) => ({
        ...m,
        photo_url: `https://source.unsplash.com/400x300/?${encodeURIComponent(m.image_keyword)}`,
      })),
      transport: {
        mode: i === 0 ? 'Airport taxi + Scooter rental' : 'Rented scooter',
        details: i === 0 ? 'Pre-book taxi from Dabolim Airport (₹800). Rent scooter for ₹350/day at hotel.' : 'Scooter is the best way to explore Goa',
        cost_inr: i === 0 ? 1150 : 350,
        duration_minutes: 30,
        booking_tip: 'Always carry your driving license. Helmet is mandatory — fine is ₹500!',
      },
      day_total_inr: dayTotal,
      packing_tip: i === 0 ? 'Sunscreen SPF 50+, comfortable sandals' : i === 1 ? 'Modest clothing for churches, mosquito repellent' : 'Swimwear, waterproof phone pouch',
    })
  }

  const hotelsTotal = goaDays.reduce((s, d) => s + (d.hotel?.price_per_night_inr || 0), 0)
  const foodTotal = goaDays.reduce((s, d) => s + d.meals.reduce((ms, m) => ms + (m.cost_per_person_inr || 0), 0), 0)
  const activitiesTotal = goaDays.reduce((s, d) => s + d.activities.reduce((as, a) => as + (a.cost_inr || 0), 0), 0)
  const transportTotal = goaDays.reduce((s, d) => s + (d.transport?.cost_inr || 0), 0)
  const miscTotal = Math.round(budget * 0.03)
  const totalUsed = hotelsTotal + foodTotal + activitiesTotal + transportTotal + miscTotal

  return {
    destination: 'Goa',
    country: 'India',
    total_days: days,
    travel_dates: { start: null, end: null },
    budget: {
      total_inr: budget,
      total_local: budget,
      local_currency: 'INR',
      exchange_rate: 1,
      breakdown: {
        hotels_inr: hotelsTotal,
        food_inr: foodTotal,
        activities_inr: activitiesTotal,
        transport_inr: transportTotal,
        misc_inr: miscTotal,
      },
      remaining_inr: Math.max(0, budget - totalUsed),
    },
    summary: `A perfect ${days}-day Goa adventure covering pristine beaches, Portuguese heritage, spice plantations, and water sports. Optimized for the budget-conscious Indian traveler with vegetarian-friendly dining options.`,
    travel_style: ['beach', 'culture', 'adventure', 'food'],
    festivals_events: [
      { name: 'Sunburn Festival', date: 'Dec 28-30', note: 'Asia\'s biggest EDM festival in Vagator — book early if you want to attend!' },
    ],
    days: goaDays,
    india_transport: {
      suggested_trains: [
        { train_name: 'Konkan Kanya Express', train_number: '10111', from: 'Mumbai CST', to: 'Madgaon (Goa)', duration: '12h', approx_cost_inr: 650, class_recommended: 'Sleeper (SL) or AC 3-Tier' },
        { train_name: 'Jan Shatabdi Express', train_number: '12051', from: 'Mumbai CST', to: 'Karmali (Goa)', duration: '10h 30m', approx_cost_inr: 800, class_recommended: 'Chair Car (CC)' },
      ],
      suggested_flights: [
        { route: 'Mumbai → Goa (Dabolim)', approx_cost_inr: 3500, airlines: ['IndiGo', 'SpiceJet', 'Air India Express'], booking_tip: 'Book 3-4 weeks in advance. Tuesday/Wednesday flights are cheapest.' },
        { route: 'Delhi → Goa (Dabolim)', approx_cost_inr: 5500, airlines: ['IndiGo', 'SpiceJet', 'Vistara'], booking_tip: 'Morning flights are cheaper. Use MakeMyTrip or Google Flights for price comparison.' },
      ],
    },
    travel_essentials: {
      best_time_to_visit: 'November to February (peak season: pleasant weather, 25-32°C). Monsoon (June-Sep) for budget deals and lush greenery.',
      visa_for_indians: 'No visa required — Goa is a state in India!',
      visa_cost_inr: 0,
      currency_tips: 'INR accepted everywhere. ATMs widely available. Carry cash for beach shacks and small shops. UPI (GPay/PhonePe) accepted at most restaurants.',
      local_customs: 'Goa is relaxed but respect local sentiments at churches. Dress modestly in religious places. Tipping 10% at restaurants is appreciated.',
      language_tips: 'Konkani is the local language. Hindi, English, and Marathi are widely spoken. "Dev Borem Korum" means "God bless you" in Konkani.',
      emergency_contacts: { police: '100', ambulance: '108', indian_embassy: 'N/A (domestic)' },
      health_precautions: 'Stay hydrated, use mosquito repellent in the evening. Avoid drinking tap water. Sunburn is real — use SPF 50+.',
      sim_card_tip: 'Your Indian SIM works in Goa. 4G/5G coverage is good across North and South Goa.',
      atm_availability: 'ATMs in all towns. Beach areas may have limited ATMs — carry cash from Panjim/Mapusa.',
    },
    packing_list: {
      essentials: ['Sunscreen SPF 50+', 'Sunglasses', 'Reusable water bottle', 'Mosquito repellent', 'Power bank', 'Cash (₹5,000-8,000)'],
      clothes: ['Swimwear', 'Light cotton clothes', 'Comfortable sandals', 'Modest outfit for churches', 'Light rain jacket (monsoon)'],
      documents: ['Aadhaar Card / ID proof', 'Driving license (for scooter)', 'Hotel booking confirmations', 'Train/flight tickets'],
      tech: ['Waterproof phone pouch', 'Camera', 'Charger + power bank', 'Bluetooth speaker'],
    },
    modifications_history: [],
  }
}

function buildBaliItinerary(days = 5, budget = 80000) {
  const it = buildGoaItinerary(days, budget)
  it.destination = 'Bali'
  it.country = 'Indonesia'
  it.summary = `A magical ${days}-day Bali journey through rice terraces, ancient temples, stunning beaches, and vibrant nightlife. Budget-friendly options for Indian travelers with vegetarian dining at every stop.`
  it.travel_style = ['culture', 'nature', 'adventure', 'food']
  it.budget.local_currency = 'IDR'
  it.budget.exchange_rate = 0.0054
  it.festivals_events = [{ name: 'Nyepi (Day of Silence)', date: 'March', note: 'Entire island shuts down for 24 hours — plan around this if visiting in March' }]

  const baliThemes = ['Ubud Rice Terraces & Monkey Forest', 'Uluwatu Temple & Beach Clubs', 'Nusa Penida Island Day Trip', 'Seminyak Shopping & Spa Day', 'Mount Batur Sunrise Trek']
  it.days.forEach((d, i) => {
    d.theme = baliThemes[i % baliThemes.length]
    d.weather_note = '28°C Tropical — Light rain possible in the afternoon'
    d.hotel = {
      ...d.hotel,
      name: ['Ubud Village Hotel', 'The Kayon Resort', 'Seminyak Beach Lodge', 'Nusa Dua Retreat', 'Kuta Bay Hotel'][i % 5],
      image_keyword: 'bali hotel pool rice terrace',
      address: 'Ubud, Bali, Indonesia',
      photo_url: `https://source.unsplash.com/600x400/?bali,hotel,pool`,
    }
    d.activities.forEach((a) => {
      a.image_keyword = 'bali ' + a.type
      a.photo_url = `https://source.unsplash.com/600x400/?bali,${a.type}`
    })
  })

  it.travel_essentials = {
    best_time_to_visit: 'April to October (dry season). Peak tourist season is July-August.',
    visa_for_indians: 'Visa on Arrival available for Indian passport holders. 30-day stay. Can be extended once for another 30 days.',
    visa_cost_inr: 2950,
    currency_tips: 'Indonesian Rupiah (IDR). 1 INR ≈ 185 IDR. Use authorized money changers in Kuta/Seminyak. ATMs charge ₹200-300 per withdrawal.',
    local_customs: 'Balinese are Hindu — respect temples, wear sarong when entering. Don\'t point with your feet. Offerings (canang sari) on streets are sacred — don\'t step on them.',
    language_tips: 'Bahasa Indonesia is official. "Terima kasih" = Thank you. "Berapa harganya?" = How much? English widely spoken in tourist areas.',
    emergency_contacts: { police: '110', ambulance: '118', indian_embassy: '+62 21 5204150 (Jakarta)' },
    health_precautions: 'Drink only bottled water. Use mosquito repellent (dengue risk). Travel insurance recommended.',
    sim_card_tip: 'Buy Telkomsel SIM at airport for ~₹500 (20GB data). Works across all of Bali.',
    atm_availability: 'ATMs everywhere in tourist areas. BCA and Mandiri banks have best rates.',
  }

  it.india_transport.suggested_flights = [
    { route: 'Mumbai → Bali (via KL/Singapore)', approx_cost_inr: 18000, airlines: ['AirAsia', 'IndiGo', 'Scoot'], booking_tip: 'Transit via Kuala Lumpur is cheapest. Book 6-8 weeks ahead.' },
    { route: 'Delhi → Bali (via Bangkok/Singapore)', approx_cost_inr: 20000, airlines: ['Thai AirAsia', 'Scoot', 'Vistara'], booking_tip: 'Singapore Airlines sometimes has deals under ₹22k with premium layover.' },
  ]
  it.india_transport.suggested_trains = []

  it.packing_list = {
    essentials: ['Sunscreen SPF 50+', 'Mosquito repellent', 'Reusable water bottle', 'Day backpack', 'Power adapter (Type C/F)'],
    clothes: ['Swimwear', 'Sarong (for temples)', 'Light comfortable clothes', 'Trekking shoes (for Batur)', 'Rain jacket'],
    documents: ['Passport (6+ months validity)', 'Visa on Arrival fee (cash USD 35)', 'Travel insurance docs', 'Hotel confirmations', 'Return flight ticket'],
    tech: ['Waterproof phone pouch', 'GoPro/Camera', 'Universal charger', 'Offline maps downloaded'],
  }

  return it
}

function buildThailandItinerary(days = 4, budget = 60000) {
  const it = buildGoaItinerary(days, budget)
  it.destination = 'Bangkok & Pattaya'
  it.country = 'Thailand'
  it.summary = `An exciting ${days}-day Thailand adventure covering Bangkok's temples and street food, plus Pattaya's beaches and nightlife. Perfect mix of culture, food, and fun for Indian travelers.`
  it.travel_style = ['food', 'culture', 'nightlife', 'shopping']
  it.budget.local_currency = 'THB'
  it.budget.exchange_rate = 2.4
  it.festivals_events = [{ name: 'Songkran Water Festival', date: 'April 13-15', note: 'World\'s biggest water fight! Expect to get drenched if visiting in April.' }]

  const thaiThemes = ['Grand Palace & Temple Run', 'Floating Markets & Chinatown', 'Pattaya Beach & Water Sports', 'Chatuchak Market & Street Food Tour']
  it.days.forEach((d, i) => {
    d.theme = thaiThemes[i % thaiThemes.length]
    d.weather_note = '33°C Hot & Humid — Stay hydrated!'
    d.hotel = {
      ...d.hotel,
      name: ['Ibis Bangkok Siam', 'Asoke Suites', 'Pattaya Sea View Hotel', 'Khao San Palace'][i % 4],
      image_keyword: 'bangkok hotel',
      address: 'Bangkok, Thailand',
      photo_url: `https://source.unsplash.com/600x400/?bangkok,hotel`,
    }
  })

  it.travel_essentials = {
    best_time_to_visit: 'November to February (cool and dry). March-May is very hot. June-October is rainy but cheaper.',
    visa_for_indians: 'Visa required for Indians. Apply at Thai Embassy/VFS. 60-day tourist visa. Visa on Arrival NOT available for Indians.',
    visa_cost_inr: 3500,
    currency_tips: 'Thai Baht (THB). 1 INR ≈ 0.42 THB (or 1 THB ≈ 2.4 INR). Exchange at SuperRich counters — best rates in Bangkok. Avoid airport exchange.',
    local_customs: 'Never disrespect the King or Royal family (serious crime). Remove shoes before entering temples. Dress modestly at temples (knees and shoulders covered).',
    language_tips: '"Sawasdee krap/ka" = Hello. "Khob khun krap/ka" = Thank you. "Tao rai?" = How much? Add "krap" (men) or "ka" (women) for politeness.',
    emergency_contacts: { police: '191', ambulance: '1669', indian_embassy: '+66 2 2580300 (Bangkok)' },
    health_precautions: 'Drink bottled water only. Street food is generally safe — eat where locals eat. Carry basic medicines for stomach issues.',
    sim_card_tip: 'Buy AIS or DTAC tourist SIM at Suvarnabhumi Airport (₹500 for 8-day unlimited data).',
    atm_availability: 'ATMs everywhere but charge ₹200/withdrawal. Carry cash — many markets are cash-only.',
  }

  it.india_transport.suggested_flights = [
    { route: 'Mumbai → Bangkok (Suvarnabhumi)', approx_cost_inr: 12000, airlines: ['Thai AirAsia', 'IndiGo', 'Thai Smile'], booking_tip: 'AirAsia X has the cheapest fares. Book directly on their website.' },
    { route: 'Delhi → Bangkok', approx_cost_inr: 11000, airlines: ['Thai AirAsia', 'IndiGo', 'SpiceJet'], booking_tip: 'IndiGo has direct flights from Delhi. Red-eye flights save a hotel night.' },
  ]
  it.india_transport.suggested_trains = []

  it.packing_list = {
    essentials: ['Sunscreen', 'Mosquito repellent', 'Umbrella/rain jacket', 'Day backpack', 'Cash (THB + USD for visa)'],
    clothes: ['Modest temple clothes (covering knees + shoulders)', 'Swimwear', 'Comfortable walking shoes', 'Light clothes', 'Flip flops'],
    documents: ['Passport (6+ months validity)', 'Thai visa (pre-approved)', 'Travel insurance', 'Hotel bookings', 'Return flight ticket', 'Passport photos (2 extra)'],
    tech: ['Power adapter (Type A/B/C)', 'Phone charger', 'Waterproof phone case', 'Offline maps'],
  }

  return it
}
