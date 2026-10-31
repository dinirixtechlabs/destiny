from decimal import Decimal
from django.db.models import Avg
from django.db import transaction
from rest_framework import serializers

from .models import Rating
from rides.models import Ride


class CreateRatingSerializer(serializers.Serializer):
    ride_id = serializers.UUIDField(required=True)
    rating = serializers.IntegerField(min_value=1, max_value=5, required=True)
    review = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_ride_id(self, value):
        try:
            ride = Ride.objects.select_related('passenger', 'driver').get(id=value)
        except Ride.DoesNotExist:
            raise serializers.ValidationError("Ride not found.")

        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        # Must be the passenger of this ride
        if ride.passenger != request.user:
            raise serializers.ValidationError("You can only rate rides you were the passenger on.")

        # Driver must be assigned
        if not ride.driver:
            raise serializers.ValidationError("Cannot rate a ride with no assigned driver.")

        # Ride must be completed
        if ride.status != Ride.COMPLETED:
            raise serializers.ValidationError("Only completed rides can be rated.")

        # Only one rating per ride
        if Rating.objects.filter(ride=ride).exists():
            raise serializers.ValidationError("This ride has already been rated.")

        self.context['ride'] = ride
        return value

    def create(self, validated_data):
        ride = self.context['ride']
        passenger = self.context['request'].user
        driver = ride.driver

        with transaction.atomic():
            rating_obj = Rating.objects.create(
                ride=ride,
                passenger=passenger,
                driver=driver,
                rating=validated_data['rating'],
                review=validated_data.get('review', '')
            )

            # Auto-update driver's average rating
            avg_result = Rating.objects.filter(driver=driver).aggregate(avg=Avg('rating'))['avg']
            if avg_result is not None:
                driver.rating = Decimal(str(round(avg_result, 2)))
                driver.save(update_fields=['rating', 'updated_at'])

        return rating_obj


class RatingDetailSerializer(serializers.ModelSerializer):
    passenger_name = serializers.CharField(source='passenger.full_name', read_only=True)
    driver_name = serializers.CharField(source='driver.user.full_name', read_only=True)

    class Meta:
        model = Rating
        fields = (
            'id',
            'ride_id',
            'passenger_id',
            'passenger_name',
            'driver_id',
            'driver_name',
            'rating',
            'review',
            'created_at'
        )
        read_only_fields = fields

