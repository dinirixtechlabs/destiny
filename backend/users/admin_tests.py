from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from drivers.models import Driver
from rides.models import Ride


class AdminAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin User
        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            password="adminpassword123",
            full_name="Admin Boss",
            phone="9000000000"
        )

        # Normal Passenger
        self.passenger = User.objects.create_user(
            email="passenger@example.com",
            password="password123",
            full_name="Passenger Alice",
            role=User.ROLE_PASSENGER
        )

        # Driver
        self.driver_user = User.objects.create_user(
            email="driver@example.com",
            password="password123",
            full_name="Driver Dave",
            role=User.ROLE_DRIVER
        )
        self.driver = Driver.objects.create(
            user=self.driver_user,
            license_number="DL-ADMIN-100",
            is_approved=False,
            is_online=False
        )

        # Ride
        self.ride = Ride.objects.create(
            passenger=self.passenger,
            driver=self.driver,
            pickup_address="A",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="B",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=200.00,
            status=Ride.SEARCHING_DRIVER
        )

    def test_non_admin_cannot_access_dashboard(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('admin-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_dashboard_stats(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-dashboard')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        data = response.data['data']
        self.assertEqual(data['total_passengers'], 1)
        self.assertEqual(data['total_drivers'], 1)
        self.assertEqual(data['active_drivers'], 0)
        self.assertEqual(data['total_rides'], 1)
        self.assertEqual(data['active_rides'], 1)

    def test_admin_list_users(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-users')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(response.data['count'], 3)

        # Filter by role
        res_filter = self.client.get(f"{url}?role=PASSENGER")
        self.assertEqual(res_filter.status_code, status.HTTP_200_OK)
        self.assertEqual(res_filter.data['count'], 1)

    def test_admin_list_drivers(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-drivers')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['license_number'], "DL-ADMIN-100")

    def test_admin_approve_and_suspend_driver(self):
        self.client.force_authenticate(user=self.admin_user)

        # 1. Approve
        approve_url = reverse('admin-driver-approve', kwargs={'driver_id': self.driver.id})
        res_approve = self.client.post(approve_url)
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)
        self.assertTrue(res_approve.data['data']['is_approved'])
        self.driver.refresh_from_db()
        self.assertTrue(self.driver.is_approved)

        # 2. Suspend
        suspend_url = reverse('admin-driver-suspend', kwargs={'driver_id': self.driver.id})
        res_suspend = self.client.post(suspend_url)
        self.assertEqual(res_suspend.status_code, status.HTTP_200_OK)
        self.assertFalse(res_suspend.data['data']['is_approved'])
        self.driver.refresh_from_db()
        self.assertFalse(self.driver.is_approved)

    def test_admin_list_rides(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-rides')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['passenger_name'], "Passenger Alice")

