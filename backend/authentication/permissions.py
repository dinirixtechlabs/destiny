from rest_framework import permissions
from users.models import User


class IsPassenger(permissions.BasePermission):
    """
    Allows access only to authenticated users with the PASSENGER role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.ROLE_PASSENGER
        )


class IsDriver(permissions.BasePermission):
    """
    Allows access only to authenticated users with the DRIVER role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.ROLE_DRIVER
        )


class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with the ADMIN role or Django staff/superuser.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.ROLE_ADMIN or request.user.is_staff or request.user.is_superuser)
        )

