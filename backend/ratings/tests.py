from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from drivers.models import Driver
from rides.models import Ride
from ratings.models import Rating


class RatingAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Passenger 1
        self.passenger = User.objects.create_user(
            email="passenger1@example.com",
            password="password123",
            full_name="Alice Passenger",
            role=User.ROLE_PASSENGER
        )

        # Passenger 2
        self.other_passenger = User.objects.create_user(
            email="passenger2@example.com",
            password="password123",
            full_name="Bob Passenger",
            role=User.ROLE_PASSENGER
        )

        # Driver
        self.driver_user = User.objects.create_user(
            email="driver1@example.com",
            password="password123",
            full_name="Charlie Driver",
            role=User.ROLE_DRIVER
        )
        self.driver = Driver.objects.create(
            user=self.driver_user,
            license_number="DL-CHARLIE-1",
            is_approved=True,
            rating=Decimal('5.00')
        )

        # Completed ride
        self.completed_ride = Ride.objects.create(
            passenger=self.passenger,
            driver=self.driver,
            pickup_address="Pickup St",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="Dest St",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=200.00,
            final_fare=200.00,
            status=Ride.COMPLETED
        )

        # In-progress ride
        self.in_progress_ride = Ride.objects.create(
            passenger=self.passenger,
            driver=self.driver,
            pickup_address="Pickup St",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="Dest St",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=200.00,
            status=Ride.IN_PROGRESS
        )

    def test_rate_completed_ride_success_and_updates_driver_avg(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('rating-create')
        payload = {
            "ride_id": str(self.completed_ride.id),
            "rating": 4,
            "review": "Very smooth ride and punctual."
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['rating'], 4)
        self.assertEqual(response.data['data']['driver_new_rating'], 4.0)

        # Verify driver model updated
        self.driver.refresh_from_db()
        self.assertEqual(self.driver.rating, Decimal('4.00'))

    def test_rate_in_progress_ride_fails(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('rating-create')
        payload = {
            "ride_id": str(self.in_progress_ride.id),
            "rating": 5
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn("Only completed rides can be rated.", str(response.data['errors']))

    def test_cannot_rate_same_ride_twice(self):
        Rating.objects.create(
            ride=self.completed_ride,
            passenger=self.passenger,
            driver=self.driver,
            rating=5,
            review="First rating"
        )
        self.client.force_authenticate(user=self.passenger)
        url = reverse('rating-create')
        payload = {
            "ride_id": str(self.completed_ride.id),
            "rating": 4
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn("This ride has already been rated.", str(response.data['errors']))

    def test_unrelated_passenger_cannot_rate(self):
        self.client.force_authenticate(user=self.other_passenger)
        url = reverse('rating-create')
        payload = {
            "ride_id": str(self.completed_ride.id),
            "rating": 5
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_rating_out_of_bounds(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('rating-create')
        payload = {
            "ride_id": str(self.completed_ride.id),
            "rating": 6  # Out of bounds (> 5)
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
