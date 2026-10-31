from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import UserProfileSerializer, UserUpdateSerializer


class CurrentUserProfileView(APIView):
    """
    Retrieve or update the authenticated user's profile.
    GET /api/v1/users/me/
    PUT /api/v1/users/me/
    PATCH /api/v1/users/me/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(
            {
                "success": True,
                "message": "User profile retrieved successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial=False):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            profile_data = UserProfileSerializer(request.user).data
            return Response(
                {
                    "success": True,
                    "message": "Profile updated successfully",
                    "data": profile_data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Profile update failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
