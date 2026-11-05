from django.urls import path
from .views import (
    UpdateDriverLocationView,
    GetDriverLocationView,
    LocationAutocompleteView
)

urlpatterns = [
    path('autocomplete/', LocationAutocompleteView.as_view(), name='location-autocomplete'),
    path('update/', UpdateDriverLocationView.as_view(), name='location-update'),
    path('driver/<uuid:driver_id>/', GetDriverLocationView.as_view(), name='location-driver'),
]
