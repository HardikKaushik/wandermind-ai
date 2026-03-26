# WanderMind AI - Smart Travel Planner

An AI-powered travel planning platform built for Indian travelers. Chat with an AI concierge to create detailed day-by-day itineraries with real photos, budget tracking, hotel & restaurant recommendations, and booking links.

## Features

- **Chat-Based Itinerary Builder** — Type natural language prompts like "Plan a 5-day trip to Thailand for 2 people in Rs.80,000 budget" and get a complete day-by-day plan
- **Hindi / Hinglish Support** — Works with mixed language input ("Goa mein 3 din ka trip banao")
- **INR-Native Budget Tracker** — Live breakdown of Hotels, Food, Activities, Transport with visual progress bars
- **Hotel & Restaurant Carousels** — 4+ options per day with ratings, prices, contact details, and booking deep links
- **Flight & Train Search** — Compare prices across MakeMyTrip, Ixigo, EaseMyTrip, Cleartrip, Yatra with direct booking redirects
- **Interactive Map** — Leaflet map with highlighted destination markers and place photos on click
- **Full Itinerary View** — Expandable popup with all days, activities, meals, and transport details
- **PDF Export & WhatsApp Share** — Download your itinerary or share via WhatsApp in one click
- **Travel Essentials** — Visa info, currency tips, packing list, emergency contacts, festival alerts

## Tech Stack

### Backend
- Python 3.11+ / Django 5.0 / Django REST Framework
- Groq API (Llama 3.3 70B) for AI itinerary generation
- Google Places API for real destination photos
- SQLite (dev) / PostgreSQL (prod)

### Frontend
- React 18 + Vite
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animations)
- Leaflet.js (maps)
- React Query

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend Setup

```bash
cd wandermind-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys:
#   GROQ_API_KEY=your-groq-key
#   GOOGLE_PLACES_API_KEY=your-google-key (optional, for photos)

python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd wandermind-frontend
npm install

# Configure environment
cp .env.example .env
# Default API URL points to localhost:8000

npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
wandermind-backend/
  apps/
    chat/          # Chat sessions & AI message handling
    trips/         # Trip CRUD, finalize, share
    places/        # Places cache & photo resolution
    budget/        # Budget breakdown engine
    transport/     # Flight & train search
    users/         # Auth & preferences
  utils/
    ai_client.py   # Groq/LLM API wrapper
    image_service.py # Google Places photo resolver
    flight_service.py # Flight search & booking URLs
    train_service.py  # Train search & booking URLs
    fallback_data.py  # Demo data when AI is rate-limited

wandermind-frontend/
  src/
    pages/         # Landing, Planner, SharedTrip, Profile
    components/
      chat/        # ChatWindow, ChatMessage, MessageInput
      itinerary/   # DayCard, HotelCard, FinalItinerary, ItineraryMap
      budget/      # BudgetTracker, BudgetBreakdown
      flights/     # FlightSearch with price comparison
      trains/      # TrainSearch with booking links
      transport/   # Combined Flights/Trains popup
      travel-info/ # TravelEssentials, PackingList, FestivalAlert
    store/         # Zustand stores (trip, chat, auth)
    api/           # Axios instance & API calls
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat/start/` | Create chat session |
| POST | `/api/v1/chat/{id}/send/` | Send message, get AI response |
| GET | `/api/v1/chat/{id}/history/` | Conversation history |
| POST | `/api/v1/trips/{id}/finalize/` | Finalize trip |
| GET | `/api/v1/trips/shared/{token}/` | Public shared view |
| GET | `/api/v1/transport/flights/` | Search flights |
| GET | `/api/v1/transport/trains/` | Search trains |
| GET | `/api/v1/places/{id}/photos/` | Place photos |

## Environment Variables

### Backend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for Llama 3.3 70B |
| `GOOGLE_PLACES_API_KEY` | No | Google Places API for real photos |
| `SECRET_KEY` | Yes | Django secret key |
| `DEBUG` | No | Debug mode (default: True) |

### Frontend (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API URL |

## License

MIT
