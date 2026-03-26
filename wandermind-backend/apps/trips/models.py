from django.db import models
from django.conf import settings
import uuid


class Trip(models.Model):
    TRIP_STATUS = [
        ('draft', 'Draft'),
        ('finalized', 'Finalized'),
        ('shared', 'Shared'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='trips', null=True, blank=True
    )
    session_key = models.CharField(max_length=64, null=True, blank=True)
    destination = models.CharField(max_length=200, blank=True)
    total_days = models.PositiveIntegerField(default=3)
    budget_inr = models.DecimalField(max_digits=12, decimal_places=2, default=50000)
    budget_used_inr = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency_preference = models.CharField(max_length=3, default='INR')
    travel_style = models.JSONField(default=list, blank=True)
    travelers_count = models.PositiveIntegerField(default=1)
    travel_start_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=TRIP_STATUS, default='draft')
    itinerary_json = models.JSONField(default=dict, blank=True)
    language_preference = models.CharField(max_length=10, default='en')
    share_token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.destination} - {self.total_days} days"


class DayItinerary(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='days')
    day_number = models.PositiveIntegerField()
    theme = models.CharField(max_length=200, blank=True)
    hotel_data = models.JSONField(default=dict, blank=True)
    activities_data = models.JSONField(default=list, blank=True)
    food_data = models.JSONField(default=list, blank=True)
    transport_data = models.JSONField(default=dict, blank=True)
    day_cost_inr = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ('trip', 'day_number')
        ordering = ['day_number']

    def __str__(self):
        return f"Day {self.day_number} - {self.theme}"


class SavedPlace(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_places'
    )
    place_name = models.CharField(max_length=200)
    place_type = models.CharField(max_length=50)
    destination = models.CharField(max_length=200)
    rating = models.FloatField()
    image_keyword = models.CharField(max_length=200)
    saved_at = models.DateTimeField(auto_now_add=True)


class TravelCompanion(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='companions')
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
