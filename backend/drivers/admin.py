from django.contrib import admin
from .models import Driver


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'is_approved', 'is_online', 'rating', 'created_at')
    list_filter = ('is_approved', 'is_online')
    search_fields = ('user__full_name', 'user__email', 'license_number')
    readonly_fields = ('created_at', 'updated_at')
