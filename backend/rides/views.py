from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Ride
from .serializers import (
    RideCreateSerializer,
    RideDetailSerializer,
    RideStatusUpdateSerializer,
    RideCancelSerializer
)


class RideCreateListView(APIView):
    """
    Create a new ride request.
    POST /api/v1/rides/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RideCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            ride = serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Ride request created",
                    "data": {
                        "ride_id": str(ride.id),
                        "status": ride.status,
                        "estimated_fare": float(ride.estimated_fare)
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "success": False,
                "message": "Failed to create ride request",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class RideDetailView(APIView):
    """
    Get detailed information about a specific ride.
    GET /api/v1/rides/{ride_id}/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, ride_id):
        ride = get_object_or_404(
            Ride.objects.select_related('passenger', 'driver', 'driver__user').prefetch_related('driver__vehicles'),
            id=ride_id
        )

        # Access control: passenger, assigned driver, or admin
        is_passenger = (ride.passenger == request.user)
        is_assigned_driver = (hasattr(request.user, 'driver_profile') and ride.driver == request.user.driver_profile)
        is_admin = (request.user.is_staff or request.user.is_superuser)

        if not (is_passenger or is_assigned_driver or is_admin):
            return Response(
                {
                    "success": False,
                    "message": "You do not have permission to view this ride."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = RideDetailSerializer(ride)
        return Response(
            {
                "success": True,
                "message": "Ride details retrieved successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class PassengerRidesView(APIView):
    """
    Get ride history for the authenticated passenger.
    GET /api/v1/rides/my-rides/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rides = Ride.objects.select_related('passenger', 'driver', 'driver__user').filter(
            passenger=request.user
        ).order_by('-requested_at')

        serializer = RideDetailSerializer(rides, many=True)
        return Response(
            {
                "success": True,
                "message": "Passenger ride history retrieved",
                "count": rides.count(),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class DriverRideRequestsView(APIView):
    """
    Get active pending ride requests available for online drivers.
    GET /api/v1/rides/requests/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {
                    "success": False,
                    "message": "Only drivers can view available ride requests."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        driver = request.user.driver_profile
        if not driver.is_online:
            return Response(
                {
                    "success": False,
                    "message": "You must be online to view ride requests."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Available rides searching for driver
        pending_rides = Ride.objects.select_related('passenger').filter(
            status__in=[Ride.REQUESTED, Ride.SEARCHING_DRIVER],
            driver__isnull=True
        ).order_by('-requested_at')

        serializer = RideDetailSerializer(pending_rides, many=True)
        return Response(
            {
                "success": True,
                "message": "Available ride requests retrieved",
                "count": pending_rides.count(),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class AcceptRideView(APIView):
    """
    Driver accepts a pending ride request.
    POST /api/v1/rides/{ride_id}/accept/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, ride_id):
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {
                    "success": False,
                    "message": "Only drivers can accept ride requests."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        driver = request.user.driver_profile
        if not driver.is_approved:
            return Response(
                {
                    "success": False,
                    "message": "Your driver account is not approved yet."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        ride = get_object_or_404(Ride, id=ride_id)

        if ride.status not in [Ride.REQUESTED, Ride.SEARCHING_DRIVER]:
            return Response(
                {
                    "success": False,
                    "message": f"Cannot accept ride in status: {ride.status}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ride.driver = driver
        ride.status = Ride.ACCEPTED
        ride.save()

        serializer = RideDetailSerializer(ride)
        return Response(
            {
                "success": True,
                "message": "Ride accepted successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class RejectRideView(APIView):
    """
    Driver declines/rejects a ride request.
    POST /api/v1/rides/{ride_id}/reject/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, ride_id):
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {
                    "success": False,
                    "message": "Only drivers can reject ride requests."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        ride = get_object_or_404(Ride, id=ride_id)
        # If this driver was previously assigned, unassign them and put it back to SEARCHING_DRIVER
        if ride.driver == request.user.driver_profile:
            ride.driver = None
            ride.status = Ride.SEARCHING_DRIVER
            ride.save()

        return Response(
            {
                "success": True,
                "message": "Ride rejected successfully"
            },
            status=status.HTTP_200_OK
        )


class UpdateRideStatusView(APIView):
    """
    Driver updates active ride status.
    POST /api/v1/rides/{ride_id}/status/
    Allowed statuses: DRIVER_ARRIVING, ARRIVED, IN_PROGRESS, COMPLETED
    """
    permission_classes = [IsAuthenticated]

    ALLOWED_NEXT_STATUSES = {
        Ride.ACCEPTED: [Ride.DRIVER_ARRIVING, Ride.CANCELLED],
        Ride.DRIVER_ARRIVING: [Ride.ARRIVED, Ride.CANCELLED],
        Ride.ARRIVED: [Ride.IN_PROGRESS, Ride.CANCELLED],
        Ride.IN_PROGRESS: [Ride.COMPLETED, Ride.CANCELLED],
    }

    def post(self, request, ride_id):
        ride = get_object_or_404(Ride, id=ride_id)

        # Only assigned driver (or admin) can advance ride status
        is_assigned_driver = (hasattr(request.user, 'driver_profile') and ride.driver == request.user.driver_profile)
        is_admin = (request.user.is_staff or request.user.is_superuser)

        if not (is_assigned_driver or is_admin):
            return Response(
                {
                    "success": False,
                    "message": "You are not authorized to update this ride's status."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = RideStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid status value",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        new_status = serializer.validated_data['status']
        current_status = ride.status

        # Validate status progression
        valid_transitions = self.ALLOWED_NEXT_STATUSES.get(current_status, [])
        if new_status not in valid_transitions:
            return Response(
                {
                    "success": False,
                    "message": f"Cannot transition ride status from '{current_status}' to '{new_status}'."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ride.status = new_status
        if new_status == Ride.COMPLETED:
            ride.completed_at = timezone.now()
            if not ride.final_fare:
                ride.final_fare = ride.estimated_fare

        ride.save()

        return Response(
            {
                "success": True,
                "message": f"Ride status updated to {new_status}",
                "data": RideDetailSerializer(ride).data
            },
            status=status.HTTP_200_OK
        )


class CancelRideView(APIView):
    """
    Cancel an active or requested ride.
    POST /api/v1/rides/{ride_id}/cancel/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, ride_id):
        ride = get_object_or_404(Ride, id=ride_id)

        # Either the passenger, assigned driver, or admin can cancel
        is_passenger = (ride.passenger == request.user)
        is_assigned_driver = (hasattr(request.user, 'driver_profile') and ride.driver == request.user.driver_profile)
        is_admin = (request.user.is_staff or request.user.is_superuser)

        if not (is_passenger or is_assigned_driver or is_admin):
            return Response(
                {
                    "success": False,
                    "message": "You are not authorized to cancel this ride."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if ride.status in [Ride.COMPLETED, Ride.CANCELLED]:
            return Response(
                {
                    "success": False,
                    "message": f"Cannot cancel a ride that is already {ride.status}."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RideCancelSerializer(data=request.data)
        serializer.is_valid()
        reason = serializer.validated_data.get('reason', '')

        ride.status = Ride.CANCELLED
        ride.cancellation_reason = reason
        ride.save()

        return Response(
            {
                "success": True,
                "message": "Ride cancelled successfully",
                "data": {
                    "ride_id": str(ride.id),
                    "status": ride.status,
                    "cancellation_reason": ride.cancellation_reason
                }
            },
            status=status.HTTP_200_OK
        )
