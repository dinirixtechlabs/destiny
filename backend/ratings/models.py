import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from drivers.models import Driver
from rides.models import Ride


class Rating(models.Model):
    """
    Passenger rating and review for a completed ride.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ride = models.OneToOneField(
        Ride,
        on_delete=models.CASCADE,
        related_name='rating'
    )
    passenger = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given'
    )
    driver = models.ForeignKey(
        Driver,
        on_delete=models.CASCADE,
        related_name='ratings_received'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ratings'
        ordering = ['-created_at']

    def __str__(self):
        return f"Rating: {self.rating}★ by {self.passenger.full_name} for Driver {self.driver.user.full_name}"
