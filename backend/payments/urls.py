from django.urls import path
from .views import (
    CreatePaymentView,
    PaymentDetailView,
    RidePaymentDetailView
)

urlpatterns = [
    path('', CreatePaymentView.as_view(), name='payment-create'),
    path('<uuid:payment_id>/', PaymentDetailView.as_view(), name='payment-detail'),
    path('ride/<uuid:ride_id>/', RidePaymentDetailView.as_view(), name='payment-ride-detail'),
]

