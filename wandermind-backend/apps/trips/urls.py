from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.TripCreateView.as_view(), name='trip-create'),
    path('<uuid:pk>/', views.TripDetailView.as_view(), name='trip-detail'),
    path('<uuid:pk>/finalize/', views.TripFinalizeView.as_view(), name='trip-finalize'),
    path('<uuid:pk>/export/', views.TripExportView.as_view(), name='trip-export'),
    path('shared/<uuid:token>/', views.SharedTripView.as_view(), name='trip-shared'),
    path('<uuid:pk>/companions/', views.CompanionListCreateView.as_view(), name='companions'),
    path('<uuid:pk>/companions/resolve/', views.CompanionResolveView.as_view(), name='companions-resolve'),
]
