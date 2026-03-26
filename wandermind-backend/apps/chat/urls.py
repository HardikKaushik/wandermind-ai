from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.StartSessionView.as_view(), name='chat-start'),
    path('<uuid:session_id>/send/', views.SendMessageView.as_view(), name='chat-send'),
    path('<uuid:session_id>/history/', views.ChatHistoryView.as_view(), name='chat-history'),
]
