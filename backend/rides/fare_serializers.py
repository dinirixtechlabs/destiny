from rest_framework import serializers


class FareEstimateSerializer(serializers.Serializer):
    pickup_latitude = serializers.FloatField(required=True)
    pickup_longitude = serializers.FloatField(required=True)
    destination_latitude = serializers.FloatField(required=True)
    destination_longitude = serializers.FloatField(required=True)

    def validate_pickup_latitude(self, value):
        if not (-90.0 <= float(value) <= 90.0):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return round(float(value), 6)

    def validate_destination_latitude(self, value):
        if not (-90.0 <= float(value) <= 90.0):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return round(float(value), 6)

    def validate_pickup_longitude(self, value):
        if not (-180.0 <= float(value) <= 180.0):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return round(float(value), 6)

    def validate_destination_longitude(self, value):
        if not (-180.0 <= float(value) <= 180.0):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return round(float(value), 6)
