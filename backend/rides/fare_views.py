from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .fare_serializers import FareEstimateSerializer
from .utils import calculate_haversine_distance, calculate_fare_estimate


class FareEstimateView(APIView):
    """
    Estimate trip distance, duration, and fare based on coordinates.
    POST /api/v1/fares/estimate/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = FareEstimateSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            distance_km = calculate_haversine_distance(
                data['pickup_latitude'],
                data['pickup_longitude'],
                data['destination_latitude'],
                data['destination_longitude']
            )
            estimated_fare, duration_minutes = calculate_fare_estimate(distance_km)

            return Response(
                {
                    "success": True,
                    "data": {
                        "distance_km": distance_km,
                        "estimated_duration_minutes": duration_minutes,
                        "estimated_fare": estimated_fare
                    }
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

