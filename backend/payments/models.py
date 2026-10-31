import uuid
from django.db import models
from rides.models import Ride


class Payment(models.Model):
    """
    Payment transaction record for a Ride.
    """
    METHOD_CASH = 'CASH'
    METHOD_ONLINE = 'ONLINE'
    METHOD_WALLET = 'WALLET'

    METHOD_CHOICES = [
        (METHOD_CASH, 'Cash'),
        (METHOD_ONLINE, 'Online / Card / UPI'),
        (METHOD_WALLET, 'Wallet'),
    ]

    STATUS_PENDING = 'PENDING'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_FAILED = 'FAILED'
    STATUS_REFUNDED = 'REFUNDED'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_REFUNDED, 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ride = models.OneToOneField(
        Ride,
        on_delete=models.CASCADE,
        related_name='payment'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default=METHOD_CASH)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    transaction_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} for Ride {self.ride_id}: ₹{self.amount} ({self.payment_status})"
