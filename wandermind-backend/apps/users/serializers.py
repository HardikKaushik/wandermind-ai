from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'preferred_language',
                  'preferred_currency', 'travel_style_prefs', 'whatsapp_number',
                  'avatar_url']
        read_only_fields = ['id', 'username']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'preferred_language']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
