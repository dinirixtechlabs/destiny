from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from authentication.permissions import IsAdminUserRole
from users.models import User
from drivers.models import Driver
from rides.models import Ride
from .admin_serializers import (
    AdminUserSerializer,
    AdminDriverSerializer,
    AdminRideSerializer
)


class AdminDashboardStatsView(APIView):
    """
    Get high-level platform statistics for the Admin Dashboard.
    GET /api/v1/admin/dashboard/
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_passengers = User.objects.filter(role=User.ROLE_PASSENGER).count()
        total_drivers = Driver.objects.count()
        active_drivers = Driver.objects.filter(is_online=True).count()
        total_rides = Ride.objects.count()
        active_rides = Ride.objects.filter(
            status__in=[
                Ride.SEARCHING_DRIVER,
                Ride.ACCEPTED,
                Ride.DRIVER_ARRIVING,
                Ride.ARRIVED,
                Ride.IN_PROGRESS
            ]
        ).count()

        return Response(
            {
                "success": True,
                "message": "Dashboard statistics retrieved",
                "data": {
                    "total_passengers": total_passengers,
                    "total_drivers": total_drivers,
                    "active_drivers": active_drivers,
                    "total_rides": total_rides,
                    "active_rides": active_rides
                }
            },
            status=status.HTTP_200_OK
        )


class AdminUserListView(APIView):
    """
    List all platform users with filtering and search.
    GET /api/v1/admin/users/?role=PASSENGER&search=john
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = User.objects.all().order_by('-created_at')

        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(role__iexact=role.strip())

        search = request.query_params.get('search')
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )

        serializer = AdminUserSerializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Users retrieved successfully",
                "count": queryset.count(),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class AdminDriverListView(APIView):
    """
    List all drivers with vehicle details and status filtering.
    GET /api/v1/admin/drivers/?is_approved=true&is_online=true
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = Driver.objects.select_related('user').prefetch_related('vehicles').all().order_by('-created_at')

        is_approved = request.query_params.get('is_approved')
        if is_approved is not None:
            if is_approved.lower() in ['true', '1']:
                queryset = queryset.filter(is_approved=True)
            elif is_approved.lower() in ['false', '0']:
                queryset = queryset.filter(is_approved=False)

        is_online = request.query_params.get('is_online')
        if is_online is not None:
            if is_online.lower() in ['true', '1']:
                queryset = queryset.filter(is_online=True)
            elif is_online.lower() in ['false', '0']:
                queryset = queryset.filter(is_online=False)

        search = request.query_params.get('search')
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(user__full_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(license_number__icontains=search)
            )

        serializer = AdminDriverSerializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Drivers retrieved successfully",
                "count": queryset.count(),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class AdminApproveDriverView(APIView):
    """
    Approve a driver's account.
    POST /api/v1/admin/drivers/{driver_id}/approve/
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request, driver_id):
        driver = get_object_or_404(Driver, id=driver_id)
        driver.is_approved = True
        driver.save(update_fields=['is_approved', 'updated_at'])

        return Response(
            {
                "success": True,
                "message": f"Driver {driver.user.full_name} approved successfully",
                "data": {
                    "driver_id": str(driver.id),
                    "is_approved": driver.is_approved
                }
            },
            status=status.HTTP_200_OK
        )


class AdminSuspendDriverView(APIView):
    """
    Suspend a driver's account.
    POST /api/v1/admin/drivers/{driver_id}/suspend/
    """
    permission_classes = [IsAdminUserRole]

    def post(self, request, driver_id):
        driver = get_object_or_404(Driver, id=driver_id)
        driver.is_approved = False
        driver.is_online = False
        driver.save(update_fields=['is_approved', 'is_online', 'updated_at'])

        return Response(
            {
                "success": True,
                "message": f"Driver {driver.user.full_name} suspended successfully",
                "data": {
                    "driver_id": str(driver.id),
                    "is_approved": driver.is_approved,
                    "is_online": driver.is_online
                }
            },
            status=status.HTTP_200_OK
        )


class AdminRideListView(APIView):
    """
    List all platform rides with filtering by status.
    GET /api/v1/admin/rides/?status=COMPLETED
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        queryset = Ride.objects.select_related('passenger', 'driver', 'driver__user').all().order_by('-requested_at')

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status__iexact=status_param.strip())

        serializer = AdminRideSerializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Rides retrieved successfully",
                "count": queryset.count(),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

