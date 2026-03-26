from rest_framework import serializers
from .models import Trip, DayItinerary, TravelCompanion


class DayItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DayItinerary
        fields = '__all__'


class TripSerializer(serializers.ModelSerializer):
    days = DayItinerarySerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'destination', 'total_days', 'budget_inr', 'budget_used_inr',
            'currency_preference', 'travel_style', 'travelers_count',
            'travel_start_date', 'status', 'itinerary_json',
            'language_preference', 'share_token', 'created_at', 'updated_at', 'days'
        ]
        read_only_fields = ['id', 'share_token', 'created_at', 'updated_at']


class TripCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ['destination', 'total_days', 'budget_inr', 'currency_preference',
                  'travel_style', 'travelers_count', 'travel_start_date',
                  'language_preference']


class CompanionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelCompanion
        fields = ['id', 'name', 'email', 'preferences', 'submitted_at']
        read_only_fields = ['id', 'submitted_at']
