from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from drivers.models import Driver
from rides.models import Ride


class RideAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Passenger 1
        self.passenger = User.objects.create_user(
            email="passenger1@example.com",
            password="password123",
            full_name="Passenger Alice",
            role=User.ROLE_PASSENGER
        )

        # Passenger 2 (unrelated user)
        self.passenger2 = User.objects.create_user(
            email="passenger2@example.com",
            password="password123",
            full_name="Passenger Bob",
            role=User.ROLE_PASSENGER
        )

        # Driver
        self.driver_user = User.objects.create_user(
            email="driver1@example.com",
            password="password123",
            full_name="Driver Dave",
            role=User.ROLE_DRIVER
        )
        self.driver = Driver.objects.create(
            user=self.driver_user,
            license_number="DL-DAVE-123",
            is_approved=True,
            is_online=True
        )

    def test_create_ride_request(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('ride-create')
        payload = {
            "pickup_address": "Main Street, Market Square",
            "pickup_latitude": 19.3149,
            "pickup_longitude": 84.7941,
            "destination_address": "City Mall, North Gate",
            "destination_latitude": 19.3500,
            "destination_longitude": 84.8200
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['status'], Ride.SEARCHING_DRIVER)
        self.assertGreater(response.data['data']['estimated_fare'], 0)

        ride_id = response.data['data']['ride_id']
        ride = Ride.objects.get(id=ride_id)
        self.assertEqual(ride.passenger, self.passenger)

    def test_get_ride_details_permissions(self):
        self.client.force_authenticate(user=self.passenger)
        ride = Ride.objects.create(
            passenger=self.passenger,
            pickup_address="A",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="B",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=100.00,
            status=Ride.SEARCHING_DRIVER
        )

        url = reverse('ride-detail', kwargs={'ride_id': ride.id})

        # Passenger can view
        res_passenger = self.client.get(url)
        self.assertEqual(res_passenger.status_code, status.HTTP_200_OK)
        self.assertTrue(res_passenger.data['success'])

        # Unrelated passenger cannot view
        self.client.force_authenticate(user=self.passenger2)
        res_unrelated = self.client.get(url)
        self.assertEqual(res_unrelated.status_code, status.HTTP_403_FORBIDDEN)

    def test_passenger_ride_history(self):
        self.client.force_authenticate(user=self.passenger)
        Ride.objects.create(
            passenger=self.passenger,
            pickup_address="A",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="B",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=100.00,
            status=Ride.COMPLETED
        )
        url = reverse('ride-my-rides')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 1)

    def test_driver_view_requests_when_online_and_offline(self):
        Ride.objects.create(
            passenger=self.passenger,
            pickup_address="A",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="B",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=120.00,
            status=Ride.SEARCHING_DRIVER
        )

        self.client.force_authenticate(user=self.driver_user)
        url = reverse('ride-requests')

        # Driver online
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 1)

        # Driver offline
        self.driver.is_online = False
        self.driver.save()
        res_offline = self.client.get(url)
        self.assertEqual(res_offline.status_code, status.HTTP_400_BAD_REQUEST)

    def test_accept_and_status_progression(self):
        ride = Ride.objects.create(
            passenger=self.passenger,
            pickup_address="A",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="B",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=150.00,
            status=Ride.SEARCHING_DRIVER
        )

        self.client.force_authenticate(user=self.driver_user)

        # 1. Accept ride
        accept_url = reverse('ride-accept', kwargs={'ride_id': ride.id})
        res_accept = self.client.post(accept_url)
        self.assertEqual(res_accept.status_code, status.HTTP_200_OK)
        ride.refresh_from_db()
        self.assertEqual(ride.status, Ride.ACCEPTED)
        self.assertEqual(ride.driver, self.driver)

        # 2. Driver Arriving
        status_url = reverse('ride-status', kwargs={'ride_id': ride.id})
        res_arriving = self.client.post(status_url, {"status": Ride.DRIVER_ARRIVING}, format='json')
        self.assertEqual(res_arriving.status_code, status.HTTP_200_OK)
        ride.refresh_from_db()
        self.assertEqual(ride.status, Ride.DRIVER_ARRIVING)

        # 3. Arrived
        res_arrived = self.client.post(status_url, {"status": Ride.ARRIVED}, format='json')
        self.assertEqual(res_arrived.status_code, status.HTTP_200_OK)
        ride.refresh_from_db()
        self.assertEqual(ride.status, Ride.ARRIVED)

        # 4. In Progress
        res_in_prog = self.client.post(status_url, {"status": Ride.IN_PROGRESS}, format='json')
        self.assertEqual(res_in_prog.status_code, status.HTTP_200_OK)
        ride.refresh_from_db()
        self.assertEqual(ride.status, Ride.IN_PROGRESS)

        # 5. Completed
        res_completed = self.client.post(status_url, {"status": Ride.COMPLETED}, format='json')
        self.assertEqual(res_completed.status_code, status.HTTP_200_OK)
        ride.refresh_from_db()
        self.assertEqual(ride.status, Ride.COMPLETED)
        self.assertIsNotNone(ride.completed_at)
        self.assertEqual(ride.final_fare, ride.estimated_fare)

    def test_cancel_ride(self):
        ride = Ride.objects.create(
            passenger=self.passenger,
            pickup_address="A",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="B",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=80.00,
            status=Ride.SEARCHING_DRIVER
        )

        self.client.force_authenticate(user=self.passenger)
        cancel_url = reverse('ride-cancel', kwargs={'ride_id': ride.id})
        response = self.client.post(cancel_url, {"reason": "Plans changed"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        ride.refresh_from_db()
        self.assertEqual(ride.status, Ride.CANCELLED)
        self.assertEqual(ride.cancellation_reason, "Plans changed")


class FareAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_fare_estimate_success(self):
        url = reverse('fare-estimate')
        payload = {
            "pickup_latitude": 19.3149,
            "pickup_longitude": 84.7941,
            "destination_latitude": 19.3500,
            "destination_longitude": 84.8200
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        data = response.data['data']
        self.assertIn('distance_km', data)
        self.assertIn('estimated_duration_minutes', data)
        self.assertIn('estimated_fare', data)
        self.assertGreater(data['distance_km'], 0)
        self.assertGreater(data['estimated_fare'], 0)
        self.assertGreater(data['estimated_duration_minutes'], 0)

    def test_fare_estimate_invalid_coordinates(self):
        url = reverse('fare-estimate')
        payload = {
            "pickup_latitude": 999.0,  # Invalid
            "pickup_longitude": 84.7941,
            "destination_latitude": 19.3500,
            "destination_longitude": 84.8200
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

