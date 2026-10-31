import uuid
from rest_framework import serializers
from .models import Payment
from rides.models import Ride


class CreatePaymentSerializer(serializers.Serializer):
    ride_id = serializers.UUIDField(required=True)
    payment_method = serializers.ChoiceField(choices=Payment.METHOD_CHOICES, default=Payment.METHOD_CASH)
    payment_status = serializers.ChoiceField(choices=Payment.STATUS_CHOICES, default=Payment.STATUS_COMPLETED)
    transaction_id = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_ride_id(self, value):
        try:
            ride = Ride.objects.select_related('passenger', 'driver').get(id=value)
        except Ride.DoesNotExist:
            raise serializers.ValidationError("Ride does not exist.")

        request = self.context.get('request')
        if request and request.user.is_authenticated:
            is_passenger = (ride.passenger == request.user)
            is_driver = (hasattr(request.user, 'driver_profile') and ride.driver == request.user.driver_profile)
            is_admin = (request.user.is_staff or request.user.is_superuser)
            if not (is_passenger or is_driver or is_admin):
                raise serializers.ValidationError("You are not authorized to create a payment for this ride.")

        self.context['ride'] = ride
        return value

    def create(self, validated_data):
        ride = self.context['ride']
        method = validated_data.get('payment_method', Payment.METHOD_CASH)
        status_val = validated_data.get('payment_status', Payment.STATUS_COMPLETED)
        tx_id = validated_data.get('transaction_id')
        if not tx_id:
            tx_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

        amount = ride.final_fare or ride.estimated_fare

        # If payment already exists for this ride, update it
        payment, created = Payment.objects.update_or_create(
            ride=ride,
            defaults={
                'amount': amount,
                'payment_method': method,
                'payment_status': status_val,
                'transaction_id': tx_id
            }
        )
        return payment


class PaymentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id',
            'ride_id',
            'amount',
            'payment_method',
            'payment_status',
            'transaction_id',
            'created_at',
            'updated_at'
        )
        read_only_fields = fields

