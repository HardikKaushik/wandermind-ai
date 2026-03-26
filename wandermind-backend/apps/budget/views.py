from rest_framework.views import APIView
from rest_framework.response import Response
from apps.trips.models import Trip


class BudgetBreakdownView(APIView):
    def get(self, request, trip_id):
        try:
            trip = Trip.objects.get(pk=trip_id)
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=404)

        itinerary = trip.itinerary_json
        budget = itinerary.get('budget', {})

        return Response({
            'trip_id': str(trip.id),
            'total_inr': budget.get('total_inr', float(trip.budget_inr)),
            'breakdown': budget.get('breakdown', {}),
            'remaining_inr': budget.get('remaining_inr', 0),
            'used_inr': float(trip.budget_used_inr),
        })


class BudgetUpdateView(APIView):
    def patch(self, request, trip_id):
        try:
            trip = Trip.objects.get(pk=trip_id)
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=404)

        itinerary = trip.itinerary_json
        if not itinerary or 'days' not in itinerary:
            return Response({'error': 'No itinerary to calculate'}, status=400)

        total_cost = 0
        for day in itinerary.get('days', []):
            total_cost += day.get('day_total_inr', 0)

        budget = itinerary.get('budget', {})
        budget_total = budget.get('total_inr', float(trip.budget_inr))
        budget['remaining_inr'] = budget_total - total_cost
        itinerary['budget'] = budget

        trip.itinerary_json = itinerary
        trip.budget_used_inr = total_cost
        trip.save()

        return Response({
            'total_inr': budget_total,
            'used_inr': total_cost,
            'remaining_inr': budget['remaining_inr'],
        })
