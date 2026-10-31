import uuid
from django.db import models
from drivers.models import Driver


class DriverLocation(models.Model):
    """
    Live location of an active/online Driver.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driver = models.OneToOneField(
        Driver,
        on_delete=models.CASCADE,
        related_name='current_location'
    )
    latitude = models.DecimalField(max_digits=10, decimal_places=6)
    longitude = models.DecimalField(max_digits=10, decimal_places=6)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'driver_locations'
        ordering = ['-updated_at']

    def __str__(self):
        return f"Location: Driver {self.driver.user.full_name} ({self.latitude}, {self.longitude})"
