import math
from datetime import date
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Driver
from rides.models import Ride
from ratings.models import Rating
from locations.models import DriverLocation
from .serializers import (
    DriverProfileSerializer,
    DriverUpdateSerializer,
    DriverStatusSerializer,
    NearbyDriverSerializer,
    DriverRatingItemSerializer
)


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate Haversine distance in kilometers between two GPS coordinates."""
    R = 6371.0  # Earth radius in km
    lat1_rad = math.radians(float(lat1))
    lon1_rad = math.radians(float(lon1))
    lat2_rad = math.radians(float(lat2))
    lon2_rad = math.radians(float(lon2))

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


class DriverMeView(APIView):
    """
    Retrieve or update the authenticated driver's profile.
    GET /api/v1/drivers/me/
    PUT /api/v1/drivers/me/
    """
    permission_classes = [IsAuthenticated]

    def get_driver(self, request):
        if not hasattr(request.user, 'driver_profile'):
            return None
        return request.user.driver_profile

    def get(self, request):
        driver = self.get_driver(request)
        if not driver:
            return Response(
                {"success": False, "message": "Authenticated user is not registered as a driver."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = DriverProfileSerializer(driver)
        return Response(
            {
                "success": True,
                "message": "Driver profile retrieved successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial=False):
        driver = self.get_driver(request)
        if not driver:
            return Response(
                {"success": False, "message": "Authenticated user is not registered as a driver."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = DriverUpdateSerializer(driver, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            data = DriverProfileSerializer(driver).data
            return Response(
                {
                    "success": True,
                    "message": "Driver profile updated successfully",
                    "data": data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Driver profile update failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class DriverStatusView(APIView):
    """
    Toggle driver online/offline status.
    POST /api/v1/drivers/status/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {"success": False, "message": "Authenticated user is not a driver."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = DriverStatusSerializer(data=request.data)
        if serializer.is_valid():
            driver = request.user.driver_profile
            is_online = serializer.validated_data['is_online']
            driver.is_online = is_online
            driver.save()
            return Response(
                {
                    "success": True,
                    "message": f"Driver is now {'online' if is_online else 'offline'}",
                    "data": {
                        "is_online": driver.is_online
                    }
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Invalid status data",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class NearbyDriversView(APIView):
    """
    Find nearby available online drivers within a given radius.
    GET /api/v1/drivers/nearby/?latitude=19.3149&longitude=84.7941&radius_km=10
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lat_str = request.query_params.get('latitude')
        lon_str = request.query_params.get('longitude')
        radius_str = request.query_params.get('radius_km', '10')

        if not lat_str or not lon_str:
            return Response(
                {
                    "success": False,
                    "message": "Both 'latitude' and 'longitude' query parameters are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_lat = float(lat_str)
            target_lon = float(lon_str)
            max_radius = float(radius_str)
        except ValueError:
            return Response(
                {
                    "success": False,
                    "message": "Invalid latitude, longitude, or radius value."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all online, approved drivers who have location reported
        active_locations = DriverLocation.objects.select_related(
            'driver', 'driver__user'
        ).prefetch_related('driver__vehicles').filter(
            driver__is_online=True,
            driver__is_approved=True
        )

        nearby_list = []
        for loc in active_locations:
            dist = calculate_distance(target_lat, target_lon, loc.latitude, loc.longitude)
            if dist <= max_radius:
                driver = loc.driver
                active_vehicle = driver.vehicles.filter(is_active=True).first()
                vehicle_data = None
                if active_vehicle:
                    vehicle_data = {
                        'id': active_vehicle.id,
                        'vehicle_number': active_vehicle.vehicle_number,
                        'vehicle_model': active_vehicle.vehicle_model,
                        'vehicle_type': active_vehicle.vehicle_type,
                        'vehicle_color': active_vehicle.vehicle_color,
                        'is_active': active_vehicle.is_active,
                    }

                nearby_list.append({
                    'driver_id': driver.id,
                    'full_name': driver.user.full_name,
                    'phone': driver.user.phone or '',
                    'rating': driver.rating,
                    'latitude': loc.latitude,
                    'longitude': loc.longitude,
                    'distance_km': dist,
                    'vehicle': vehicle_data
                })

        # Sort by nearest distance
        nearby_list.sort(key=lambda x: x['distance_km'])

        serializer = NearbyDriverSerializer(nearby_list, many=True)
        return Response(
            {
                "success": True,
                "message": "Nearby drivers retrieved",
                "count": len(nearby_list),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class DriverDetailView(APIView):
    """
    Retrieve details of a specific driver.
    GET /api/v1/drivers/{driver_id}/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, driver_id):
        driver = get_object_or_404(
            Driver.objects.select_related('user').prefetch_related('vehicles'),
            id=driver_id
        )
        serializer = DriverProfileSerializer(driver)
        return Response(
            {
                "success": True,
                "message": "Driver details retrieved successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class DriverEarningsView(APIView):
    """
    Retrieve earnings summary for the authenticated driver.
    GET /api/v1/drivers/earnings/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {"success": False, "message": "Authenticated user is not a driver."},
                status=status.HTTP_403_FORBIDDEN
            )
        driver = request.user.driver_profile

        # Rides completed by this driver
        completed_rides = Ride.objects.filter(driver=driver, status=Ride.COMPLETED)

        total_rides = completed_rides.count()
        total_earnings_agg = completed_rides.aggregate(total=Sum('final_fare'))['total'] or 0.0

        # Today's earnings
        today = date.today()
        today_earnings_agg = completed_rides.filter(
            completed_at__date=today
        ).aggregate(today_total=Sum('final_fare'))['today_total'] or 0.0

        return Response(
            {
                "success": True,
                "message": "Driver earnings retrieved successfully",
                "data": {
                    "total_earnings": float(total_earnings_agg),
                    "total_rides": total_rides,
                    "today_earnings": float(today_earnings_agg)
                }
            },
            status=status.HTTP_200_OK
        )


class DriverRatingsView(APIView):
    """
    Retrieve ratings for a specific driver.
    GET /api/v1/drivers/{driver_id}/ratings/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, driver_id):
        driver = get_object_or_404(Driver, id=driver_id)
        ratings = Rating.objects.select_related('passenger').filter(driver=driver).order_by('-created_at')
        serializer = DriverRatingItemSerializer(ratings, many=True)
        return Response(
            {
                "success": True,
                "message": "Driver ratings retrieved successfully",
                "count": ratings.count(),
                "average_rating": float(driver.rating),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
