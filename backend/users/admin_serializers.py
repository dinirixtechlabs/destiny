from rest_framework import serializers
from users.models import User
from drivers.models import Driver
from rides.models import Ride
from vehicles.models import Vehicle


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'phone', 'role', 'is_active', 'is_staff', 'created_at')
        read_only_fields = fields


class AdminDriverVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ('id', 'vehicle_number', 'vehicle_model', 'vehicle_type', 'vehicle_color', 'is_active')


class AdminDriverSerializer(serializers.ModelSerializer):
    user = AdminUserSerializer(read_only=True)
    vehicles = AdminDriverVehicleSerializer(many=True, read_only=True)

    class Meta:
        model = Driver
        fields = ('id', 'user', 'license_number', 'is_approved', 'is_online', 'rating', 'vehicles', 'created_at')
        read_only_fields = fields


class AdminRideSerializer(serializers.ModelSerializer):
    passenger_name = serializers.CharField(source='passenger.full_name', read_only=True)
    passenger_email = serializers.CharField(source='passenger.email', read_only=True)
    driver_name = serializers.CharField(source='driver.user.full_name', read_only=True, default=None)

    class Meta:
        model = Ride
        fields = (
            'id',
            'passenger_id',
            'passenger_name',
            'passenger_email',
            'driver_id',
            'driver_name',
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
            'completed_at'
        )
        read_only_fields = fields

