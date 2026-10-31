from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle

from .serializers import (
    PassengerRegisterSerializer,
    DriverRegisterSerializer,
    LoginSerializer,
    TokenRefreshSerializer,
    LogoutSerializer
)


class PassengerRegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = PassengerRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Passenger registered successfully",
                    "data": {
                        "user_id": str(user.id)
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "success": False,
                "message": "Registration failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class DriverRegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = DriverRegisterSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Driver registered successfully",
                    "data": {
                        "user_id": str(result['user'].id),
                        "driver_id": str(result['driver'].id)
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "success": False,
                "message": "Registration failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            return Response(
                {
                    "success": True,
                    "message": "Login successful",
                    "data": {
                        "access": validated_data['access'],
                        "refresh": validated_data['refresh'],
                        "user": validated_data['user_data']
                    }
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Login failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        if serializer.is_valid():
            return Response(
                {
                    "success": True,
                    "message": "Token refreshed successfully",
                    "data": {
                        "access": serializer.validated_data['access']
                    }
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Invalid or expired refresh token",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            return Response(
                {
                    "success": True,
                    "message": "Logout successful"
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Logout failed",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
