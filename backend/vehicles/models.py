import uuid
from django.db import models
from drivers.models import Driver


class Vehicle(models.Model):
    """
    Vehicle model belonging to a Driver.
    """
    TYPE_CAR = 'CAR'
    TYPE_AUTO = 'AUTO'
    TYPE_BIKE = 'BIKE'

    TYPE_CHOICES = [
        (TYPE_CAR, 'Car'),
        (TYPE_AUTO, 'Auto Rickshaw'),
        (TYPE_BIKE, 'Motorcycle / Bike'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driver = models.ForeignKey(
        Driver,
        on_delete=models.CASCADE,
        related_name='vehicles'
    )
    vehicle_number = models.CharField(max_length=50, unique=True, db_index=True)
    vehicle_model = models.CharField(max_length=100)
    vehicle_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default=TYPE_CAR)
    vehicle_color = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vehicles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.vehicle_model} ({self.vehicle_number}) - {self.driver.user.full_name}"
