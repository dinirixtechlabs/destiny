from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Payment
from .serializers import CreatePaymentSerializer, PaymentDetailSerializer
from rides.models import Ride


class CreatePaymentView(APIView):
    """
    Create or record a payment for a ride.
    POST /api/v1/payments/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            payment = serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Payment recorded successfully",
                    "data": PaymentDetailSerializer(payment).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "success": False,
                "message": "Failed to process payment",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class PaymentDetailView(APIView):
    """
    Get payment details by payment ID.
    GET /api/v1/payments/{payment_id}/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        payment = get_object_or_404(Payment.objects.select_related('ride', 'ride__passenger', 'ride__driver'), id=payment_id)

        # Authorization check
        ride = payment.ride
        is_passenger = (ride.passenger == request.user)
        is_driver = (hasattr(request.user, 'driver_profile') and ride.driver == request.user.driver_profile)
        is_admin = (request.user.is_staff or request.user.is_superuser)

        if not (is_passenger or is_driver or is_admin):
            return Response(
                {
                    "success": False,
                    "message": "You are not authorized to view this payment."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            {
                "success": True,
                "message": "Payment details retrieved successfully",
                "data": PaymentDetailSerializer(payment).data
            },
            status=status.HTTP_200_OK
        )


class RidePaymentDetailView(APIView):
    """
    Get payment details by ride ID.
    GET /api/v1/payments/ride/{ride_id}/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, ride_id):
        ride = get_object_or_404(Ride, id=ride_id)

        is_passenger = (ride.passenger == request.user)
        is_driver = (hasattr(request.user, 'driver_profile') and ride.driver == request.user.driver_profile)
        is_admin = (request.user.is_staff or request.user.is_superuser)

        if not (is_passenger or is_driver or is_admin):
            return Response(
                {
                    "success": False,
                    "message": "You are not authorized to view this ride payment."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            payment = Payment.objects.get(ride=ride)
        except Payment.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "No payment record found for this ride."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {
                "success": True,
                "message": "Payment details retrieved successfully",
                "data": PaymentDetailSerializer(payment).data
            },
            status=status.HTTP_200_OK
        )
