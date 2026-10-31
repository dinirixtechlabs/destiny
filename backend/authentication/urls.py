from django.urls import path
from .views import (
    PassengerRegisterView,
    DriverRegisterView,
    LoginView,
    RefreshTokenView,
    LogoutView
)

urlpatterns = [
    path('register/', PassengerRegisterView.as_view(), name='register-passenger'),
    path('register/driver/', DriverRegisterView.as_view(), name='register-driver'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
]

