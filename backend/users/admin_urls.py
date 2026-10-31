from django.urls import path
from .admin_views import (
    AdminDashboardStatsView,
    AdminUserListView,
    AdminDriverListView,
    AdminApproveDriverView,
    AdminSuspendDriverView,
    AdminRideListView
)

urlpatterns = [
    path('dashboard/', AdminDashboardStatsView.as_view(), name='admin-dashboard'),
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('drivers/', AdminDriverListView.as_view(), name='admin-drivers'),
    path('drivers/<uuid:driver_id>/approve/', AdminApproveDriverView.as_view(), name='admin-driver-approve'),
    path('drivers/<uuid:driver_id>/suspend/', AdminSuspendDriverView.as_view(), name='admin-driver-suspend'),
    path('rides/', AdminRideListView.as_view(), name='admin-rides'),
]

