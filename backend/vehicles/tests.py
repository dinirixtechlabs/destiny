from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from drivers.models import Driver
from vehicles.models import Vehicle


class VehicleAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Passenger
        self.passenger = User.objects.create_user(
            email="passenger@example.com",
            password="password123",
            full_name="Alice Passenger",
            role=User.ROLE_PASSENGER
        )

        # Driver 1
        self.driver_user = User.objects.create_user(
            email="driver1@example.com",
            password="password123",
            full_name="Bob Driver",
            role=User.ROLE_DRIVER
        )
        self.driver = Driver.objects.create(
            user=self.driver_user,
            license_number="DL-1111",
            is_approved=True
        )

        # Driver 2
        self.driver_user2 = User.objects.create_user(
            email="driver2@example.com",
            password="password123",
            full_name="Charlie Driver",
            role=User.ROLE_DRIVER
        )
        self.driver2 = Driver.objects.create(
            user=self.driver_user2,
            license_number="DL-2222",
            is_approved=True
        )

        # Vehicle belonging to Driver 1
        self.vehicle1 = Vehicle.objects.create(
            driver=self.driver,
            vehicle_number="OD-07-AA-1111",
            vehicle_model="Swift Dzire",
            vehicle_type=Vehicle.TYPE_CAR,
            vehicle_color="White"
        )

    def test_add_vehicle_by_passenger_forbidden(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('vehicle-create')
        payload = {
            "vehicle_number": "OD-07-BB-2222",
            "vehicle_model": "Honda City",
            "vehicle_type": "CAR",
            "vehicle_color": "Black"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_add_vehicle_by_driver_success(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('vehicle-create')
        payload = {
            "vehicle_number": "OD-07-CC-3333",
            "vehicle_model": "Hyundai i20",
            "vehicle_type": "CAR",
            "vehicle_color": "Red"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['vehicle_number'], "OD-07-CC-3333")

        created = Vehicle.objects.get(vehicle_number="OD-07-CC-3333")
        self.assertEqual(created.driver, self.driver)

    def test_add_duplicate_vehicle_number(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('vehicle-create')
        payload = {
            "vehicle_number": "OD-07-AA-1111",
            "vehicle_model": "Another Car",
            "vehicle_type": "CAR",
            "vehicle_color": "Blue"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_get_my_vehicles(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('vehicle-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['id'], str(self.vehicle1.id))

    def test_update_vehicle_success(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('vehicle-detail', kwargs={'vehicle_id': self.vehicle1.id})
        payload = {
            "vehicle_number": "OD-07-AA-1111",
            "vehicle_model": "Swift Dzire Updated",
            "vehicle_type": "CAR",
            "vehicle_color": "Silver"
        }
        response = self.client.put(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        self.vehicle1.refresh_from_db()
        self.assertEqual(self.vehicle1.vehicle_model, "Swift Dzire Updated")
        self.assertEqual(self.vehicle1.vehicle_color, "Silver")

    def test_update_vehicle_by_unauthorized_driver(self):
        self.client.force_authenticate(user=self.driver_user2)
        url = reverse('vehicle-detail', kwargs={'vehicle_id': self.vehicle1.id})
        payload = {
            "vehicle_model": "Hacked Model"
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])

    def test_delete_vehicle_success(self):
        self.client.force_authenticate(user=self.driver_user)
        url = reverse('vehicle-detail', kwargs={'vehicle_id': self.vehicle1.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertFalse(Vehicle.objects.filter(id=self.vehicle1.id).exists())
