from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from drivers.models import Driver
from rides.models import Ride
from payments.models import Payment


class PaymentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Passenger 1
        self.passenger = User.objects.create_user(
            email="passenger1@example.com",
            password="password123",
            full_name="Alice Passenger",
            role=User.ROLE_PASSENGER
        )

        # Passenger 2 (unauthorized)
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
            full_name="Dave Driver",
            role=User.ROLE_DRIVER
        )
        self.driver = Driver.objects.create(
            user=self.driver_user,
            license_number="DL-DAVE-99",
            is_approved=True
        )

        # Ride
        self.ride = Ride.objects.create(
            passenger=self.passenger,
            driver=self.driver,
            pickup_address="Pickup A",
            pickup_latitude=19.31,
            pickup_longitude=84.79,
            destination_address="Dest B",
            destination_latitude=19.35,
            destination_longitude=84.82,
            estimated_fare=220.00,
            final_fare=250.00,
            status=Ride.COMPLETED
        )

    def test_create_cash_payment(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('payment-create')
        payload = {
            "ride_id": str(self.ride.id),
            "payment_method": Payment.METHOD_CASH
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        data = response.data['data']
        self.assertEqual(float(data['amount']), 250.0)
        self.assertEqual(data['payment_method'], Payment.METHOD_CASH)
        self.assertEqual(data['payment_status'], Payment.STATUS_COMPLETED)
        self.assertTrue(data['transaction_id'].startswith("TXN-"))

    def test_create_online_payment(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('payment-create')
        payload = {
            "ride_id": str(self.ride.id),
            "payment_method": Payment.METHOD_ONLINE,
            "transaction_id": "ONLINE-TXN-12345"
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['payment_method'], Payment.METHOD_ONLINE)
        self.assertEqual(response.data['data']['transaction_id'], "ONLINE-TXN-12345")

    def test_create_wallet_payment(self):
        self.client.force_authenticate(user=self.passenger)
        url = reverse('payment-create')
        payload = {
            "ride_id": str(self.ride.id),
            "payment_method": Payment.METHOD_WALLET
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['payment_method'], Payment.METHOD_WALLET)

    def test_get_payment_details(self):
        payment = Payment.objects.create(
            ride=self.ride,
            amount=Decimal('250.00'),
            payment_method=Payment.METHOD_CASH,
            payment_status=Payment.STATUS_COMPLETED,
            transaction_id="TXN-TEST-123"
        )
        self.client.force_authenticate(user=self.passenger)
        url = reverse('payment-detail', kwargs={'payment_id': payment.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['transaction_id'], "TXN-TEST-123")

    def test_get_ride_payment_details(self):
        payment = Payment.objects.create(
            ride=self.ride,
            amount=Decimal('250.00'),
            payment_method=Payment.METHOD_CASH,
            payment_status=Payment.STATUS_COMPLETED,
            transaction_id="TXN-RIDE-123"
        )
        self.client.force_authenticate(user=self.passenger)
        url = reverse('payment-ride-detail', kwargs={'ride_id': self.ride.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['transaction_id'], "TXN-RIDE-123")

    def test_unauthorized_user_cannot_access_payment(self):
        payment = Payment.objects.create(
            ride=self.ride,
            amount=Decimal('250.00'),
            payment_method=Payment.METHOD_CASH,
            payment_status=Payment.STATUS_COMPLETED
        )
        self.client.force_authenticate(user=self.other_passenger)
        url = reverse('payment-detail', kwargs={'payment_id': payment.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data['success'])
