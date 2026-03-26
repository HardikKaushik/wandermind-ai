from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    LANGUAGES = [('en', 'English'), ('hi', 'Hindi'), ('hinglish', 'Hinglish')]

    preferred_language = models.CharField(max_length=20, choices=LANGUAGES, default='en')
    preferred_currency = models.CharField(max_length=3, default='INR')
    travel_style_prefs = models.JSONField(default=list, blank=True)
    whatsapp_number = models.CharField(max_length=15, blank=True)
    avatar_url = models.URLField(blank=True)

    class Meta:
        db_table = 'users'
