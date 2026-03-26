from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ChatSession, ChatMessage
from .serializers import ChatMessageSerializer
from apps.trips.models import Trip
from utils.ai_client import generate_itinerary
from utils.image_service import enrich_with_images
from utils.fallback_data import generate_fallback_itinerary
import uuid
import re


class StartSessionView(APIView):
    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key or str(uuid.uuid4())

        trip = Trip.objects.create(
            session_key=session_key,
            destination=request.data.get('destination', ''),
            total_days=request.data.get('days', 3),
            budget_inr=request.data.get('budget_inr', 50000),
            user=user,
        )

        session = ChatSession.objects.create(
            trip=trip,
            session_key=session_key,
        )

        welcome = (
            "Namaste! I'm WanderMind, your AI travel concierge. "
            "Tell me where you want to go! For example:\n\n"
            "- 'Plan a 5-day trip to Bali for 2 people in ₹80,000 budget'\n"
            "- 'Thailand 3 din ka trip ₹60,000 mein banao'\n"
            "- 'Weekend getaway from Mumbai under ₹15,000'\n\n"
            "I'll create a complete itinerary with hotels, activities, "
            "food, and transport — all optimized for Indian travelers!"
        )

        ChatMessage.objects.create(
            session=session, role='assistant', content=welcome
        )

        return Response({
            'session_id': str(session.id),
            'trip_id': str(trip.id),
            'welcome_message': welcome,
        }, status=status.HTTP_201_CREATED)


class SendMessageView(APIView):
    def post(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)

        user_message = request.data.get('message', '').strip()
        language = request.data.get('language', 'en')

        if not user_message:
            return Response({'error': 'Message required'}, status=400)

        ChatMessage.objects.create(
            session=session, role='user', content=user_message
        )

        history = list(session.messages.order_by('timestamp').values('role', 'content'))
        messages_for_ai = [
            {'role': m['role'], 'content': m['content']}
            for m in history
        ]

        try:
            ai_response = generate_itinerary(messages_for_ai, language=language)
        except ValueError as e:
            # API key not set — use fallback
            ai_response = generate_fallback_itinerary(user_message)
        except Exception as e:
            error_str = str(e)
            # Rate limit (429) or any API error → use fallback dummy data
            if '429' in error_str or 'rate_limit' in error_str or 'Rate limit' in error_str:
                ai_response = generate_fallback_itinerary(user_message)
            else:
                # Other errors → also fallback so user always gets a result
                ai_response = generate_fallback_itinerary(user_message)

        # Normalize AI response: it may return the itinerary directly at top level,
        # or wrapped as { message, itinerary }, or { message, itinerary: null }
        itinerary = None
        assistant_content = ''

        if not isinstance(ai_response, dict):
            # Non-dict response — treat as plain text
            assistant_content = str(ai_response)
        elif 'itinerary' in ai_response and isinstance(ai_response.get('itinerary'), dict):
            # Wrapped format: { message, itinerary: {...} }
            itinerary = ai_response['itinerary']
            assistant_content = ai_response.get('message', '')
        elif 'days' in ai_response and isinstance(ai_response.get('days'), list):
            # Direct itinerary at top level (no wrapper)
            itinerary = ai_response
            assistant_content = ai_response.get('message', '')
        else:
            # General text response or { message, itinerary: null }
            assistant_content = ai_response.get('message', '') or str(ai_response)

        if itinerary and isinstance(itinerary, dict):
            itinerary = enrich_with_images(itinerary)
            trip = session.trip
            if trip:
                trip.itinerary_json = itinerary
                trip.destination = itinerary.get('destination', trip.destination)
                trip.total_days = itinerary.get('total_days', trip.total_days)
                budget = itinerary.get('budget', {})
                if isinstance(budget, dict) and budget.get('total_inr'):
                    trip.budget_inr = budget['total_inr']
                    trip.budget_used_inr = budget['total_inr'] - budget.get('remaining_inr', 0)
                trip.save()

        if not assistant_content and itinerary:
            dest = itinerary.get('destination', 'your destination') if isinstance(itinerary, dict) else 'your destination'
            days = itinerary.get('total_days', '') if isinstance(itinerary, dict) else ''
            assistant_content = (
                f"I've created your {days}-day {dest} itinerary! "
                "Check out the details in the itinerary panel. "
                "Feel free to ask me to modify anything!"
            )

        ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=assistant_content,
            itinerary_snapshot=itinerary,
        )

        change_summary = ai_response.get('change_summary') if isinstance(ai_response, dict) else None

        return Response({
            'message': assistant_content,
            'itinerary': itinerary,
            'change_summary': change_summary,
            'session_id': str(session_id),
        })


class ChatHistoryView(APIView):
    def get(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)

        messages = session.messages.order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response({
            'session_id': str(session_id),
            'messages': serializer.data,
        })
