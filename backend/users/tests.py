from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from .admin_tests import AdminAPITests


class UserAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="testuser@example.com",
            password="testpassword123",
            full_name="Original Name",
            phone="9876543210",
            role=User.ROLE_PASSENGER
        )

    def test_get_profile_unauthenticated(self):
        url = reverse('user-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('user-me')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        data = response.data['data']
        self.assertEqual(data['id'], str(self.user.id))
        self.assertEqual(data['full_name'], "Original Name")
        self.assertEqual(data['email'], "testuser@example.com")
        self.assertEqual(data['phone'], "9876543210")
        self.assertEqual(data['role'], User.ROLE_PASSENGER)

    def test_update_profile_success(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('user-me')
        payload = {
            "full_name": "Updated Name",
            "phone": "9998887776"
        }
        response = self.client.put(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['full_name'], "Updated Name")
        self.assertEqual(response.data['data']['phone'], "9998887776")

        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "Updated Name")
        self.assertEqual(self.user.phone, "9998887776")

    def test_update_profile_duplicate_phone(self):
        User.objects.create_user(
            email="other@example.com",
            password="password123",
            full_name="Other User",
            phone="9998887776"
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('user-me')
        payload = {
            "full_name": "Updated Name",
            "phone": "9998887776"
        }
        response = self.client.put(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('phone', response.data['errors'])
