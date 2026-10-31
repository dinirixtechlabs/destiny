from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from drivers.models import Driver
from vehicles.models import Vehicle
from rides.models import Ride
from ratings.models import Rating
from locations.models import DriverLocation


class DriverAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Passenger
        self.passenger = User.objects.create_user(
            email="passenger@example.com",
            password="passpassword123",
            full_name="Passenger Alice",
            phone="9111111111",
            role=User.ROLE_PASSENGER
        )

        # Driver User
        self.driver_user = User.objects.create_user(
            email="driver1@example.com",
            password="driverpassword123",
            full_name="Driver Bob",
            phone="9222222222",
            role=User.ROLE_DRIVER
        )
        self.driver = Driver.objects.create(
            user=self.driver_user,
            license_number="DL-OD-1111",
            is_approved=True,
            is_online=True,
            rating=4.90
        )

        # Driver Vehicle
        self.vehicle = Vehicle.objects.create(
            driver=self.driver,
            vehicle_number="OD-07-AB-1234",
            vehicle_model="Toyota Innova",
            vehicle_type=Vehicle.TYPE_CAR,
            vehicle_color="Silver",
            is_active=True
        )

        # Driver Location
        self.driver_location = DriverLocation.objects.create(
            driver=self.driver,
            latitude=19.314900,
            longitude=84.794100
        )

    def test_get_driver_profile_me(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('driver-me')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        data = response.data['data']
        self.assertEqual(data['license_number'], "DL-OD-1111")
        self.assertEqual(data['user']['full_name'], "Driver Bob")
        self.assertEqual(len(data['vehicles']), 1)

    def test_update_driver_profile_me(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('driver-me')
        payload = {
            "license_number": "DL-OD-9999",
            "full_name": "Driver Robert"
        }
        response = self.client.put(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.driver.refresh_from_db()
        self.driver_user.refresh_from_db()
        self.assertEqual(self.driver.license_number, "DL-OD-9999")
        self.assertEqual(self.driver_user.full_name, "Driver Robert")

    def test_toggle_driver_status(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('driver-status')

        # Go offline
        res_offline = self.client.post(url, {"is_online": False}, format='json')
        self.assertEqual(res_offline.status_code, status.HTTP_200_OK)
        self.assertFalse(res_offline.data['data']['is_online'])
        self.driver.refresh_from_db()
        self.assertFalse(self.driver.is_online)

        # Go online
        res_online = self.client.post(url, {"is_online": True}, format='json')
        self.assertEqual(res_online.status_code, status.HTTP_200_OK)
        self.assertTrue(res_online.data['data']['is_online'])
        self.driver.refresh_from_db()
        self.assertTrue(self.driver.is_online)

    def test_get_nearby_drivers(self):
        self.client.force_authenticate(user=self.passenger)
        url = f"{reverse('drivers-nearby')}?latitude=19.3149&longitude=84.7941&radius_km=5"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(response.data['count'], 1)
        driver_entry = response.data['data'][0]
        self.assertEqual(driver_entry['driver_id'], str(self.driver.id))
        self.assertEqual(driver_entry['distance_km'], 0.0)

    def test_get_driver_details(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('driver-detail', kwargs={'driver_id': self.driver.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['id'], str(self.driver.id))

    def test_get_driver_earnings(self):
        self.client.force_authenticate(user=self.driver_user)

        # Create completed ride
        Ride.objects.create(
            passenger=self.passenger,
            driver=self.driver,
            pickup_address="A",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="B",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=200.00,
            final_fare=250.00,
            status=Ride.COMPLETED,
            completed_at=timezone.now()
        )

        url = reverse('driver-earnings')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        data = response.data['data']
        self.assertEqual(data['total_earnings'], 250.0)
        self.assertEqual(data['total_rides'], 1)
        self.assertEqual(data['today_earnings'], 250.0)

    def test_get_driver_ratings(self):
        self.client.force_authenticate(user=self.passenger)

        ride = Ride.objects.create(
            passenger=self.passenger,
            driver=self.driver,
            pickup_address="A",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="B",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=150.00,
            final_fare=150.00,
            status=Ride.COMPLETED,
            completed_at=timezone.now()
        )

        Rating.objects.create(
            ride=ride,
            passenger=self.passenger,
            driver=self.driver,
            rating=5,
            review="Excellent driver!"
        )

        url = reverse('driver-ratings', kwargs={'driver_id': self.driver.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['rating'], 5)
        self.assertEqual(response.data['data'][0]['passenger_name'], "Passenger Alice")
