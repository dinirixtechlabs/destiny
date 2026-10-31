from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Vehicle
from .serializers import VehicleSerializer


class VehicleCreateView(APIView):
    """
    Create a new vehicle for the authenticated driver.
    POST /api/v1/vehicles/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {
                    "success": False,
                    "message": "Only drivers can register vehicles."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        driver = request.user.driver_profile
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            vehicle = serializer.save(driver=driver)
            return Response(
                {
                    "success": True,
                    "message": "Vehicle added successfully",
                    "data": VehicleSerializer(vehicle).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "success": False,
                "message": "Failed to add vehicle",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class MyVehiclesView(APIView):
    """
    List all vehicles belonging to the authenticated driver.
    GET /api/v1/vehicles/me/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {
                    "success": False,
                    "message": "Authenticated user is not a driver."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        vehicles = Vehicle.objects.filter(driver=request.user.driver_profile)
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(
            {
                "success": True,
                "message": "Vehicles retrieved successfully",
                "count": vehicles.count(),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class VehicleDetailView(APIView):
    """
    Retrieve, update, or delete a vehicle.
    GET /api/v1/vehicles/{vehicle_id}/
    PUT /api/v1/vehicles/{vehicle_id}/
    DELETE /api/v1/vehicles/{vehicle_id}/
    """
    permission_classes = [IsAuthenticated]

    def get_vehicle_and_check_permission(self, request, vehicle_id):
        vehicle = get_object_or_404(Vehicle, id=vehicle_id)
        # Only the driver who owns the vehicle or an admin can access/modify it
        if not (request.user.is_staff or request.user.is_superuser):
            if not hasattr(request.user, 'driver_profile') or vehicle.driver != request.user.driver_profile:
                return None, Response(
                    {
                        "success": False,
                        "message": "You do not have permission to access or modify this vehicle."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        return vehicle, None

    def get(self, request, vehicle_id):
        vehicle, error_response = self.get_vehicle_and_check_permission(request, vehicle_id)
        if error_response:
            return error_response
        serializer = VehicleSerializer(vehicle)
        return Response(
            {
                "success": True,
                "message": "Vehicle retrieved successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def put(self, request, vehicle_id):
        return self._update(request, vehicle_id, partial=False)

    def patch(self, request, vehicle_id):
        return self._update(request, vehicle_id, partial=True)

    def _update(self, request, vehicle_id, partial=False):
        vehicle, error_response = self.get_vehicle_and_check_permission(request, vehicle_id)
        if error_response:
            return error_response

        serializer = VehicleSerializer(vehicle, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Vehicle updated successfully",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Failed to update vehicle",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, vehicle_id):
        vehicle, error_response = self.get_vehicle_and_check_permission(request, vehicle_id)
        if error_response:
            return error_response

        vehicle.delete()
        return Response(
            {
                "success": True,
                "message": "Vehicle deleted successfully"
            },
            status=status.HTTP_200_OK
        )
