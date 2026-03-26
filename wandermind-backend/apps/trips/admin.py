from django.contrib import admin
from .models import Trip, DayItinerary, SavedPlace, TravelCompanion

admin.site.register(Trip)
admin.site.register(DayItinerary)
admin.site.register(SavedPlace)
admin.site.register(TravelCompanion)
