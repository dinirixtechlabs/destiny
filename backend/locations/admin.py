from django.contrib import admin
from .models import DriverLocation


@admin.register(DriverLocation)
class DriverLocationAdmin(admin.ModelAdmin):
    list_display = ('driver', 'latitude', 'longitude', 'updated_at')
    search_fields = ('driver__user__full_name', 'driver__license_number')
    readonly_fields = ('updated_at',)
