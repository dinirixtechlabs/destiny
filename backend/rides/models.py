import uuid
from django.db import models
from django.conf import settings
from drivers.models import Driver


class Ride(models.Model):
    """
    Ride model tracking ride requests, assignments, status transitions, and fares.
    """
    REQUESTED = 'REQUESTED'
    SEARCHING_DRIVER = 'SEARCHING_DRIVER'
    ACCEPTED = 'ACCEPTED'
    DRIVER_ARRIVING = 'DRIVER_ARRIVING'
    ARRIVED = 'ARRIVED'
    IN_PROGRESS = 'IN_PROGRESS'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'

    STATUS_CHOICES = [
        (REQUESTED, 'Requested'),
        (SEARCHING_DRIVER, 'Searching Driver'),
        (ACCEPTED, 'Accepted'),
        (DRIVER_ARRIVING, 'Driver Arriving'),
        (ARRIVED, 'Driver Arrived'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    passenger = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='passenger_rides'
    )
    driver = models.ForeignKey(
        Driver,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='driver_rides'
    )

    pickup_address = models.TextField()
    pickup_latitude = models.DecimalField(max_digits=10, decimal_places=6)
    pickup_longitude = models.DecimalField(max_digits=10, decimal_places=6)

    destination_address = models.TextField()
    destination_latitude = models.DecimalField(max_digits=10, decimal_places=6)
    destination_longitude = models.DecimalField(max_digits=10, decimal_places=6)

    estimated_fare = models.DecimalField(max_digits=10, decimal_places=2)
    final_fare = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=REQUESTED, db_index=True)
    cancellation_reason = models.TextField(blank=True, null=True)

    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rides'
        ordering = ['-requested_at']

    def __str__(self):
        return f"Ride {self.id} [{self.status}] - Passenger: {self.passenger.full_name}"
