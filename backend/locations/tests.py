from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from drivers.models import Driver
from locations.models import DriverLocation


class LocationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Passenger
        self.passenger = User.objects.create_user(
            email="passenger@example.com",
            password="password123",
            full_name="Passenger Alice",
            role=User.ROLE_PASSENGER
        )

        # Driver 1
        self.driver_user = User.objects.create_user(
            email="driver1@example.com",
            password="password123",
            full_name="Driver Bob",
            role=User.ROLE_DRIVER
        )
        self.driver = Driver.objects.create(
            user=self.driver_user,
            license_number="DL-1111",
            is_approved=True,
            is_online=True
        )

        # Driver 2 (without location)
        self.driver_user2 = User.objects.create_user(
            email="driver2@example.com",
            password="password123",
            full_name="Driver Charlie",
            role=User.ROLE_DRIVER
        )
        self.driver2 = Driver.objects.create(
            user=self.driver_user2,
            license_number="DL-2222",
            is_approved=True
        )

    def test_update_location_by_passenger_forbidden(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('location-update')
        payload = {"latitude": 19.3149, "longitude": 84.7941}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_update_location_by_driver_success(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('location-update')
        payload = {"latitude": 19.314900, "longitude": 84.794100}
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(float(response.data['data']['latitude']), 19.3149)
        self.assertEqual(float(response.data['data']['longitude']), 84.7941)

        # Update again (update_or_create)
        payload_update = {"latitude": 19.320000, "longitude": 84.800000}
        res2 = self.client.post(url, payload_update, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(DriverLocation.objects.filter(driver=self.driver).count(), 1)
        self.assertEqual(float(res2.data['data']['latitude']), 19.32)

    def test_update_location_invalid_coordinates(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('location-update')
        payload = {"latitude": 95.0, "longitude": 84.7941}  # Invalid latitude (> 90)
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_get_driver_location_success(self):
        DriverLocation.objects.create(
            driver=self.driver,
            latitude=19.314900,
            longitude=84.794100
        )
        self.client.force_authenticate(user=self.passenger)
        url = reverse('location-driver', kwargs={'driver_id': self.driver.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(float(response.data['data']['latitude']), 19.3149)

    def test_get_driver_location_not_found(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('location-driver', kwargs={'driver_id': self.driver2.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
