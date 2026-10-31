from django.contrib import admin
from .models import Rating


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('ride', 'passenger', 'driver', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('passenger__full_name', 'driver__user__full_name', 'review')
    readonly_fields = ('created_at',)
