from django.urls import path
from .views import (
    UpdateDriverLocationView,
    GetDriverLocationView
)

urlpatterns = [
    path('update/', UpdateDriverLocationView.as_view(), name='location-update'),
    path('driver/<uuid:driver_id>/', GetDriverLocationView.as_view(), name='location-driver'),
]

