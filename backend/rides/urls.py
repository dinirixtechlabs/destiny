from django.urls import path
from .views import (
    RideCreateListView,
    RideDetailView,
    PassengerRidesView,
    DriverRideRequestsView,
    AcceptRideView,
    RejectRideView,
    UpdateRideStatusView,
    CancelRideView
)

urlpatterns = [
    path('', RideCreateListView.as_view(), name='ride-create'),
    path('my-rides/', PassengerRidesView.as_view(), name='ride-my-rides'),
    path('requests/', DriverRideRequestsView.as_view(), name='ride-requests'),
    path('<uuid:ride_id>/', RideDetailView.as_view(), name='ride-detail'),
    path('<uuid:ride_id>/accept/', AcceptRideView.as_view(), name='ride-accept'),
    path('<uuid:ride_id>/reject/', RejectRideView.as_view(), name='ride-reject'),
    path('<uuid:ride_id>/status/', UpdateRideStatusView.as_view(), name='ride-status'),
    path('<uuid:ride_id>/cancel/', CancelRideView.as_view(), name='ride-cancel'),
]

