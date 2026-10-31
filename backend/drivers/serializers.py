from rest_framework import serializers
from .models import Driver
from users.models import User
from vehicles.models import Vehicle
from ratings.models import Rating


class DriverUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'phone')
        read_only_fields = fields


class DriverVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ('id', 'vehicle_number', 'vehicle_model', 'vehicle_type', 'vehicle_color', 'is_active')


class DriverProfileSerializer(serializers.ModelSerializer):
    user = DriverUserSerializer(read_only=True)
    vehicles = DriverVehicleSerializer(many=True, read_only=True)

    class Meta:
        model = Driver
        fields = ('id', 'user', 'license_number', 'is_approved', 'is_online', 'rating', 'vehicles', 'created_at')
        read_only_fields = ('id', 'user', 'is_approved', 'rating', 'created_at')


class DriverUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False, write_only=True)
    phone = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = Driver
        fields = ('license_number', 'full_name', 'phone')

    def validate_license_number(self, value):
        if value:
            license_stripped = value.strip().upper()
            if Driver.objects.filter(license_number__iexact=license_stripped).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("A driver with this license number already exists.")
            return license_stripped
        return value

    def update(self, instance, validated_data):
        full_name = validated_data.pop('full_name', None)
        phone = validated_data.pop('phone', None)

        user = instance.user
        updated_user = False
        if full_name:
            user.full_name = full_name
            updated_user = True
        if phone:
            phone_stripped = phone.strip()
            if User.objects.filter(phone=phone_stripped).exclude(id=user.id).exists():
                raise serializers.ValidationError({"phone": "This phone number is already registered to another user."})
            user.phone = phone_stripped
            updated_user = True
        if updated_user:
            user.save()

        return super().update(instance, validated_data)


class DriverStatusSerializer(serializers.Serializer):
    is_online = serializers.BooleanField(required=True)


class NearbyDriverSerializer(serializers.Serializer):
    driver_id = serializers.UUIDField()
    full_name = serializers.CharField()
    phone = serializers.CharField()
    rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    latitude = serializers.DecimalField(max_digits=10, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=6)
    distance_km = serializers.FloatField()
    vehicle = DriverVehicleSerializer(allow_null=True)


class DriverRatingItemSerializer(serializers.ModelSerializer):
    passenger_name = serializers.CharField(source='passenger.full_name', read_only=True)

    class Meta:
        model = Rating
        fields = ('id', 'ride_id', 'passenger_name', 'rating', 'review', 'created_at')

