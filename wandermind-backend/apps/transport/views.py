from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from utils.flight_service import search_airports, search_flights
from utils.train_service import search_stations, search_trains


class TrainStationSearchView(APIView):
    """Search railway stations by name or code.
    GET /api/v1/transport/stations/?q=raipur
    """
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'error': '"q" parameter required.'}, status=400)
        results = search_stations(query)
        return Response({'stations': results})


class TrainSearchView(APIView):
    """Search trains between two stations.
    GET /api/v1/transport/trains/?from=NDLS&to=BCT&date=2026-04-20
    """
    def get(self, request):
        from_code = request.query_params.get('from', '').strip().upper()
        to_code = request.query_params.get('to', '').strip().upper()
        date = request.query_params.get('date', '').strip()

        if not from_code or not to_code or not date:
            return Response(
                {'error': '"from", "to", and "date" are required.'},
                status=400,
            )

        trains = search_trains(from_code, to_code, date)
        cheapest = min((t['cheapest_price'] for t in trains), default=0)
        fastest = min((t['duration_minutes'] for t in trains), default=0)
        fh, fm = divmod(fastest, 60)

        return Response({
            'from': from_code,
            'to': to_code,
            'date': date,
            'trains': trains,
            'total_results': len(trains),
            'cheapest_price': cheapest,
            'cheapest_formatted': f'₹{cheapest:,}' if cheapest else None,
            'fastest_duration': f'{fh}h {fm}m' if fastest else None,
        })


class AirportSearchView(APIView):
    """Search airports by query string.
    GET /api/v1/transport/airports/?q=mumbai
    """
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'error': '"q" parameter required.'}, status=400)
        results = search_airports(query)
        return Response({'airports': results})


class FlightSearchView(APIView):
    """Search flights between two airports.
    GET /api/v1/transport/flights/?origin=BOMBA&dest=GOI&...
    """
    def get(self, request):
        origin = request.query_params.get('origin', '').strip()
        dest = request.query_params.get('dest', '').strip()
        origin_entity_id = request.query_params.get('originEntityId', '').strip()
        dest_entity_id = request.query_params.get('destEntityId', '').strip()
        date = request.query_params.get('date', '').strip()
        return_date = request.query_params.get('return_date', '').strip() or None
        adults = int(request.query_params.get('adults', '1'))
        cabin_class = request.query_params.get('cabin_class', 'economy').strip()

        if not origin or not dest or not date:
            return Response(
                {'error': '"origin", "dest", and "date" are required.'},
                status=400,
            )

        flights = search_flights(
            origin_sky_id=origin,
            destination_sky_id=dest,
            origin_entity_id=origin_entity_id,
            destination_entity_id=dest_entity_id,
            date=date,
            return_date=return_date,
            adults=adults,
            cabin_class=cabin_class,
        )

        cheapest_price = min((f['price_inr'] for f in flights), default=0)
        fastest_duration = min((f['duration_minutes'] for f in flights), default=0)
        fastest_hours, fastest_mins = divmod(fastest_duration, 60)

        return Response({
            'origin': origin,
            'destination': dest,
            'date': date,
            'return_date': return_date,
            'adults': adults,
            'cabin_class': cabin_class,
            'flights': flights,
            'total_results': len(flights),
            'cheapest_price': cheapest_price,
            'cheapest_price_formatted': f'₹{cheapest_price:,}' if cheapest_price else None,
            'fastest_duration': f'{fastest_hours}h {fastest_mins}m' if fastest_duration else None,
        })
