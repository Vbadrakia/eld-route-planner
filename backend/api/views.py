from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripRequestSerializer, TripResponseSerializer
from routing.services import RouteService
from hos.services import HOSPlanner
import traceback


class PlanTripView(APIView):
    """
    POST /api/plan-trip/

    Accepts trip inputs, calls RouteService and HOSPlanner,
    and returns route geometry, fuel stops, daily logs and a summary.
    """

    def post(self, request):
        serializer = TripRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            # 1. Get route info (geocode + directions)
            route_service = RouteService()
            route = route_service.get_route(
                data["current_location"],
                data["pickup_location"],
                data["dropoff_location"],
            )

            # 2. Compute HOS plan (timeline, daily logs, fuel stops)
            hos_planner = HOSPlanner()
            plan = hos_planner.plan_trip(
                route_distance_km=route["distance_km"],
                route_duration_hr=route["duration_hr"],
                current_cycle_used=data["current_cycle_used_hours"],
            )

            response_data = {
                "route": route,
                "fuel_stops": plan["fuel_stops"],
                "daily_logs": plan["daily_logs"],
                "summary": plan["summary"],
            }
            out_serializer = TripResponseSerializer(response_data)
            return Response(out_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
