from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.PlaceSearchView.as_view(), name='place-search'),
    path('<int:pk>/photos/', views.PlacePhotosView.as_view(), name='place-photos'),
]
