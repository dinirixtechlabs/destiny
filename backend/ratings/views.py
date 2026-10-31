from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Rating
from .serializers import CreateRatingSerializer, RatingDetailSerializer
from rides.models import Ride


class RateDriverView(APIView):
    """
    Passenger rates and reviews a completed ride.
    POST /api/v1/ratings/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateRatingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            rating_obj = serializer.save()
            data = RatingDetailSerializer(rating_obj).data
            data['driver_new_rating'] = float(rating_obj.driver.rating)

            return Response(
                {
                    "success": True,
                    "message": "Rating submitted successfully",
                    "data": data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "success": False,
                "message": "Rating submission failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class RideRatingDetailView(APIView):
    """
    Get rating for a specific ride.
    GET /api/v1/ratings/ride/{ride_id}/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, ride_id):
        ride = get_object_or_404(Ride, id=ride_id)
        try:
            rating = Rating.objects.select_related('passenger', 'driver', 'driver__user').get(ride=ride)
        except Rating.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "This ride has not been rated yet."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {
                "success": True,
                "message": "Rating retrieved successfully",
                "data": RatingDetailSerializer(rating).data
            },
            status=status.HTTP_200_OK
        )
