from rest_framework import serializers
from .models import DriverLocation


class DriverLocationUpdateSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=10, decimal_places=6, required=True)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=6, required=True)

    def validate_latitude(self, value):
        if not (-90.0 <= float(value) <= 90.0):
            raise serializers.ValidationError("Latitude must be between -90 and 90 degrees.")
        return value

    def validate_longitude(self, value):
        if not (-180.0 <= float(value) <= 180.0):
            raise serializers.ValidationError("Longitude must be between -180 and 180 degrees.")
        return value


class DriverLocationSerializer(serializers.ModelSerializer):
    driver_id = serializers.UUIDField(source='driver.id', read_only=True)

    class Meta:
        model = DriverLocation
        fields = ('id', 'driver_id', 'latitude', 'longitude', 'updated_at')
        read_only_fields = fields

