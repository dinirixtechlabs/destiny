from rest_framework import serializers
from .models import Ride
from .utils import calculate_haversine_distance, calculate_fare_estimate
from users.models import User
from drivers.models import Driver
from vehicles.serializers import VehicleSerializer


class RidePassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'phone')


class RideDriverSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    active_vehicle = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = ('id', 'full_name', 'phone', 'license_number', 'rating', 'active_vehicle')

    def get_active_vehicle(self, obj):
        vehicle = obj.vehicles.filter(is_active=True).first()
        if vehicle:
            return VehicleSerializer(vehicle).data
        return None


class RideCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ride
        fields = (
            'pickup_address',
            'pickup_latitude',
            'pickup_longitude',
            'destination_address',
            'destination_latitude',
            'destination_longitude'
        )

    def validate_pickup_latitude(self, value):
        if not (-90.0 <= float(value) <= 90.0):
            raise serializers.ValidationError("Invalid latitude.")
        return round(float(value), 6)

    def validate_destination_latitude(self, value):
        if not (-90.0 <= float(value) <= 90.0):
            raise serializers.ValidationError("Invalid latitude.")
        return round(float(value), 6)

    def validate_pickup_longitude(self, value):
        if not (-180.0 <= float(value) <= 180.0):
            raise serializers.ValidationError("Invalid longitude.")
        return round(float(value), 6)

    def validate_destination_longitude(self, value):
        if not (-180.0 <= float(value) <= 180.0):
            raise serializers.ValidationError("Invalid longitude.")
        return round(float(value), 6)

    def create(self, validated_data):
        passenger = self.context['request'].user
        distance = calculate_haversine_distance(
            validated_data['pickup_latitude'],
            validated_data['pickup_longitude'],
            validated_data['destination_latitude'],
            validated_data['destination_longitude']
        )
        fare, _ = calculate_fare_estimate(distance)

        ride = Ride.objects.create(
            passenger=passenger,
            status=Ride.SEARCHING_DRIVER,
            estimated_fare=fare,
            **validated_data
        )
        return ride


class RideDetailSerializer(serializers.ModelSerializer):
    passenger = RidePassengerSerializer(read_only=True)
    driver = RideDriverSerializer(read_only=True)

    class Meta:
        model = Ride
        fields = (
            'id',
            'passenger',
            'driver',
            'pickup_address',
            'pickup_latitude',
            'pickup_longitude',
            'destination_address',
            'destination_latitude',
            'destination_longitude',
            'estimated_fare',
            'final_fare',
            'status',
            'cancellation_reason',
            'requested_at',
            'completed_at',
            'created_at',
            'updated_at'
        )
        read_only_fields = fields


class RideStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        Ride.DRIVER_ARRIVING,
        Ride.ARRIVED,
        Ride.IN_PROGRESS,
        Ride.COMPLETED
    ])


class RideCancelSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)

