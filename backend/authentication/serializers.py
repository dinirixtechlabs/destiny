from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate
from django.db import transaction
from users.models import User
from drivers.models import Driver


class PassengerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'phone', 'password')
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
            'phone': {'required': True},
        }

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized_email

    def validate_phone(self, value):
        if value:
            phone_stripped = value.strip()
            if User.objects.filter(phone=phone_stripped).exists():
                raise serializers.ValidationError("A user with this phone number already exists.")
            return phone_stripped
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['role'] = User.ROLE_PASSENGER
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class DriverRegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        style={'input_type': 'password'}
    )
    license_number = serializers.CharField(max_length=50, required=True)

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized_email

    def validate_phone(self, value):
        phone_stripped = value.strip()
        if User.objects.filter(phone=phone_stripped).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return phone_stripped

    def validate_license_number(self, value):
        license_stripped = value.strip().upper()
        if Driver.objects.filter(license_number__iexact=license_stripped).exists():
            raise serializers.ValidationError("A driver with this license number already exists.")
        return license_stripped

    def create(self, validated_data):
        license_number = validated_data.pop('license_number')
        password = validated_data.pop('password')

        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=password,
                full_name=validated_data['full_name'],
                phone=validated_data['phone'],
                role=User.ROLE_DRIVER
            )
            driver = Driver.objects.create(
                user=user,
                license_number=license_number,
                is_approved=False,
                is_online=False
            )

        return {
            'user': user,
            'driver': driver
        }


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This user account is inactive.")

        refresh = RefreshToken.for_user(user)

        user_data = {
            'id': str(user.id),
            'full_name': user.full_name,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
        }

        # Include driver_id if user is a driver
        if hasattr(user, 'driver_profile'):
            user_data['driver_id'] = str(user.driver_profile.id)
            user_data['is_approved'] = user.driver_profile.is_approved
            user_data['is_online'] = user.driver_profile.is_online

        attrs['user_data'] = user_data
        attrs['access'] = str(refresh.access_token)
        attrs['refresh'] = str(refresh)
        return attrs


class TokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)

    def validate(self, attrs):
        refresh_str = attrs.get('refresh')
        try:
            refresh_token = RefreshToken(refresh_str)
            access_token = str(refresh_token.access_token)
            return {'access': access_token}
        except TokenError as e:
            raise serializers.ValidationError(str(e))


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        refresh_str = attrs.get('refresh')
        if refresh_str:
            try:
                token = RefreshToken(refresh_str)
                token.blacklist()
            except TokenError:
                # Token might already be expired or blacklisted, continue gracefully
                pass
        return attrs

