from django.contrib import admin
from .models import Ride


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ('id', 'passenger', 'driver', 'status', 'estimated_fare', 'final_fare', 'requested_at', 'completed_at')
    list_filter = ('status', 'requested_at')
    search_fields = ('id', 'passenger__full_name', 'driver__user__full_name', 'pickup_address', 'destination_address')
    readonly_fields = ('requested_at', 'created_at', 'updated_at')
