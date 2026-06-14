from rest_framework import serializers


class TripRequestSerializer(serializers.Serializer):
    """Validates the incoming trip planning request."""
    current_location = serializers.CharField(max_length=255)
    pickup_location = serializers.CharField(max_length=255)
    dropoff_location = serializers.CharField(max_length=255)
    current_cycle_used_hours = serializers.FloatField(min_value=0, max_value=70)


class TripResponseSerializer(serializers.Serializer):
    """Shapes the outgoing trip plan response."""
    route = serializers.JSONField()
    fuel_stops = serializers.ListField(child=serializers.JSONField())
    daily_logs = serializers.ListField(child=serializers.JSONField())
    summary = serializers.JSONField()
