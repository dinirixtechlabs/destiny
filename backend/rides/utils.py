import math


def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate Haversine distance in kilometers between two GPS coordinates."""
    R = 6371.0  # Earth's radius in km
    lat1_rad = math.radians(float(lat1))
    lon1_rad = math.radians(float(lon1))
    lat2_rad = math.radians(float(lat2))
    lon2_rad = math.radians(float(lon2))

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def calculate_fare_estimate(distance_km):
    """
    Calculate estimated fare and duration based on distance.
    Base fare: ₹50 for first 2 km, then ₹15 per km.
    """
    BASE_FARE = 50.0
    BASE_KM = 2.0
    PER_KM_RATE = 15.0

    if distance_km <= BASE_KM:
        fare = BASE_FARE
    else:
        fare = BASE_FARE + (distance_km - BASE_KM) * PER_KM_RATE

    duration_minutes = max(5, int(round(distance_km * 2.4 + 3)))
    return round(fare, 2), duration_minutes

