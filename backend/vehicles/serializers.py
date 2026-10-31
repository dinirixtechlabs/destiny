from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    driver_id = serializers.UUIDField(source='driver.id', read_only=True)

    class Meta:
        model = Vehicle
        fields = (
            'id',
            'driver_id',
            'vehicle_number',
            'vehicle_model',
            'vehicle_type',
            'vehicle_color',
            'is_active',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'driver_id', 'created_at', 'updated_at')

    def validate_vehicle_number(self, value):
        stripped = value.strip().upper()
        query = Vehicle.objects.filter(vehicle_number__iexact=stripped)
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("A vehicle with this registration number already exists.")
        return stripped

