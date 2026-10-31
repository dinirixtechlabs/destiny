from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'ride', 'amount', 'payment_method', 'payment_status', 'transaction_id', 'created_at')
    list_filter = ('payment_method', 'payment_status', 'created_at')
    search_fields = ('id', 'transaction_id', 'ride__id')
    readonly_fields = ('created_at', 'updated_at')
