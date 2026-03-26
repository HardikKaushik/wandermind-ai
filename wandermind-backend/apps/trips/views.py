from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Trip, TravelCompanion
from .serializers import TripSerializer, TripCreateSerializer, CompanionSerializer
from utils.ai_client import generate_itinerary
import uuid


class TripCreateView(generics.CreateAPIView):
    serializer_class = TripCreateSerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        session_key = self.request.session.session_key or str(uuid.uuid4())
        serializer.save(user=user, session_key=session_key)


class TripDetailView(generics.RetrieveUpdateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    lookup_field = 'pk'


class TripFinalizeView(APIView):
    def post(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk)
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=404)
        trip.status = 'finalized'
        trip.share_token = uuid.uuid4()
        trip.save()
        return Response({
            'status': 'finalized',
            'share_token': str(trip.share_token),
            'share_url': f"/shared/{trip.share_token}"
        })


class TripExportView(APIView):
    def get(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk)
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=404)
        return Response({
            'trip': TripSerializer(trip).data,
            'itinerary': trip.itinerary_json,
        })


class SharedTripView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            trip = Trip.objects.get(share_token=token)
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=404)
        return Response({
            'trip': TripSerializer(trip).data,
            'itinerary': trip.itinerary_json,
        })


class CompanionListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanionSerializer

    def get_queryset(self):
        return TravelCompanion.objects.filter(trip_id=self.kwargs['pk'])

    def perform_create(self, serializer):
        serializer.save(trip_id=self.kwargs['pk'])


class CompanionResolveView(APIView):
    def post(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk)
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=404)

        companions = TravelCompanion.objects.filter(trip=trip)
        if not companions.exists():
            return Response({'error': 'No companions added yet'}, status=400)

        prefs_summary = []
        for c in companions:
            prefs_summary.append(f"{c.name}: {c.preferences}")

        messages = [{
            'role': 'user',
            'content': (
                f"I have a group trip to {trip.destination} for {trip.total_days} days "
                f"with budget ₹{trip.budget_inr}. Here are everyone's preferences:\n"
                + "\n".join(prefs_summary)
                + "\nResolve conflicts and create an optimal itinerary for the group."
            )
        }]
        result = generate_itinerary(messages)
        if result.get('itinerary'):
            trip.itinerary_json = result['itinerary']
            trip.save()
        return Response(result)
