from django.urls import path
from .views import (
    VehicleCreateView,
    MyVehiclesView,
    VehicleDetailView
)

urlpatterns = [
    path('', VehicleCreateView.as_view(), name='vehicle-create'),
    path('me/', MyVehiclesView.as_view(), name='vehicle-me'),
    path('<uuid:vehicle_id>/', VehicleDetailView.as_view(), name='vehicle-detail'),
]

