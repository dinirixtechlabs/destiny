from rest_framework import serializers
from .models import User


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing user profile."""
    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'phone', 'role', 'created_at')
        read_only_fields = ('id', 'email', 'role', 'created_at')


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile (full_name, phone)."""
    class Meta:
        model = User
        fields = ('full_name', 'phone')

    def validate_phone(self, value):
        if value:
            phone_stripped = value.strip()
            # Ensure the phone is not used by any other user
            if User.objects.filter(phone=phone_stripped).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("This phone number is already registered to another account.")
            return phone_stripped
        return value

