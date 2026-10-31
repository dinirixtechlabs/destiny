from django.urls import path
from .views import (
    DriverMeView,
    DriverStatusView,
    NearbyDriversView,
    DriverEarningsView,
    DriverDetailView,
    DriverRatingsView
)

urlpatterns = [
    path('me/', DriverMeView.as_view(), name='driver-me'),
    path('status/', DriverStatusView.as_view(), name='driver-status'),
    path('nearby/', NearbyDriversView.as_view(), name='drivers-nearby'),
    path('earnings/', DriverEarningsView.as_view(), name='driver-earnings'),
    path('<uuid:driver_id>/', DriverDetailView.as_view(), name='driver-detail'),
    path('<uuid:driver_id>/ratings/', DriverRatingsView.as_view(), name='driver-ratings'),
]

