"""
URL configuration for destiny project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/drivers/', include('drivers.urls')),
    path('api/v1/vehicles/', include('vehicles.urls')),
    path('api/v1/locations/', include('locations.urls')),
    path('api/v1/rides/', include('rides.urls')),
    path('api/v1/fares/', include('rides.fare_urls')),
    path('api/v1/ratings/', include('ratings.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/admin/', include('users.admin_urls')),
]
