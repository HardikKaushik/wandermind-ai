from django.urls import path
from . import views

urlpatterns = [
    path('trains/', views.TrainSearchView.as_view(), name='train-search'),
    path('stations/', views.TrainStationSearchView.as_view(), name='station-search'),
    path('flights/', views.FlightSearchView.as_view(), name='flight-search'),
    path('airports/', views.AirportSearchView.as_view(), name='airport-search'),
]
