from django.urls import path
from .views import RateDriverView, RideRatingDetailView

urlpatterns = [
    path('', RateDriverView.as_view(), name='rating-create'),
    path('ride/<uuid:ride_id>/', RideRatingDetailView.as_view(), name='rating-ride-detail'),
]

