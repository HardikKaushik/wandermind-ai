from django.urls import path
from . import views

urlpatterns = [
    path('<uuid:trip_id>/breakdown/', views.BudgetBreakdownView.as_view(), name='budget-breakdown'),
    path('<uuid:trip_id>/update/', views.BudgetUpdateView.as_view(), name='budget-update'),
]
