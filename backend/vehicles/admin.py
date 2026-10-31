from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle_number', 'vehicle_model', 'vehicle_type', 'vehicle_color', 'driver', 'is_active', 'created_at')
    list_filter = ('vehicle_type', 'is_active')
    search_fields = ('vehicle_number', 'vehicle_model', 'driver__user__full_name')
    readonly_fields = ('created_at', 'updated_at')
