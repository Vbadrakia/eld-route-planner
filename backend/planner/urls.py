from django.urls import path
from .views import plan_trip, health

urlpatterns = [
    path("health/", health),
    path("plan-trip/", plan_trip),
]
