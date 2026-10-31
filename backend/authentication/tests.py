from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from drivers.models import Driver


class AuthenticationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_passenger_success(self):
        url = reverse('register-passenger')
        data = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "9876543210",
            "password": "securepassword123"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('user_id', response.data['data'])

        user = User.objects.get(email="john@example.com")
        self.assertEqual(user.full_name, "John Doe")
        self.assertEqual(user.role, User.ROLE_PASSENGER)
        self.assertTrue(user.check_password("securepassword123"))

    def test_register_passenger_duplicate_email(self):
        User.objects.create_user(
            email="existing@example.com",
            password="password123",
            full_name="Existing User",
            phone="1111111111"
        )
        url = reverse('register-passenger')
        data = {
            "full_name": "New User",
            "email": "existing@example.com",
            "phone": "2222222222",
            "password": "securepassword123"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_register_driver_success(self):
        url = reverse('register-driver')
        data = {
            "full_name": "Driver Bob",
            "email": "driver@example.com",
            "phone": "9876543211",
            "password": "driverpassword123",
            "license_number": "DL-OD-123456"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('user_id', response.data['data'])
        self.assertIn('driver_id', response.data['data'])

        driver = Driver.objects.get(license_number="DL-OD-123456")
        self.assertEqual(driver.user.email, "driver@example.com")
        self.assertEqual(driver.user.role, User.ROLE_DRIVER)
        self.assertFalse(driver.is_approved)

    def test_login_success(self):
        User.objects.create_user(
            email="login_user@example.com",
            password="mypassword123",
            full_name="Login User",
            phone="9998887776",
            role=User.ROLE_PASSENGER
        )
        url = reverse('login')
        data = {
            "email": "login_user@example.com",
            "password": "mypassword123"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])
        self.assertEqual(response.data['data']['user']['email'], "login_user@example.com")

    def test_login_invalid_credentials(self):
        url = reverse('login')
        data = {
            "email": "wrong@example.com",
            "password": "wrongpassword"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_token_refresh(self):
        user = User.objects.create_user(
            email="refresh_user@example.com",
            password="mypassword123",
            full_name="Refresh User"
        )
        login_res = self.client.post(reverse('login'), {
            "email": "refresh_user@example.com",
            "password": "mypassword123"
        }, format='json')
        refresh_token = login_res.data['data']['refresh']

        url = reverse('token-refresh')
        response = self.client.post(url, {"refresh": refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])

    def test_logout(self):
        user = User.objects.create_user(
            email="logout_user@example.com",
            password="mypassword123",
            full_name="Logout User"
        )
        login_res = self.client.post(reverse('login'), {
            "email": "logout_user@example.com",
            "password": "mypassword123"
        }, format='json')
        access_token = login_res.data['data']['access']
        refresh_token = login_res.data['data']['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        url = reverse('logout')
        response = self.client.post(url, {"refresh": refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
