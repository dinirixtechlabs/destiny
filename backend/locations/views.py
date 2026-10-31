from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import DriverLocation
from .serializers import DriverLocationUpdateSerializer, DriverLocationSerializer
from drivers.models import Driver


class UpdateDriverLocationView(APIView):
    """
    Update live GPS coordinates for the authenticated driver.
    POST /api/v1/locations/update/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {
                    "success": False,
                    "message": "Only authenticated drivers can update location."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        driver = request.user.driver_profile
        serializer = DriverLocationUpdateSerializer(data=request.data)
        if serializer.is_valid():
            latitude = serializer.validated_data['latitude']
            longitude = serializer.validated_data['longitude']

            location, _ = DriverLocation.objects.update_or_create(
                driver=driver,
                defaults={
                    'latitude': latitude,
                    'longitude': longitude
                }
            )

            return Response(
                {
                    "success": True,
                    "message": "Driver location updated successfully",
                    "data": DriverLocationSerializer(location).data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Invalid coordinates",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class GetDriverLocationView(APIView):
    """
    Get the latest reported GPS location of a specific driver.
    GET /api/v1/locations/driver/{driver_id}/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, driver_id):
        driver = get_object_or_404(Driver, id=driver_id)
        try:
            location = DriverLocation.objects.get(driver=driver)
        except DriverLocation.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Location data not found for this driver."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DriverLocationSerializer(location)
        return Response(
            {
                "success": True,
                "message": "Driver location retrieved successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
