import urllib.request
import urllib.parse
import json
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import DriverLocation
from .serializers import DriverLocationUpdateSerializer, DriverLocationSerializer
from drivers.models import Driver


PRESET_LOCATIONS = [
    # Konark & Puri Coast (Odisha)
    {
        'title': 'Chandrabhaga Sea Beach',
        'subtitle': 'Marine Drive, Konark, Puri, Odisha 752111',
        'latitude': 19.865395,
        'longitude': 86.112345,
        'keywords': 'ch chandrabhaga sea beach coast ocean konark marine drive puri odisha',
    },
    {
        'title': 'Chandrabhaga Lighthouse',
        'subtitle': 'NH-316, Konark, Puri, Odisha 752111',
        'latitude': 19.867850,
        'longitude': 86.108086,
        'keywords': 'ch chandrabhaga light house tower konark sea marine',
    },
    {
        'title': 'Konark Sun Temple',
        'subtitle': 'UNESCO World Heritage Site, Konark, Puri, Odisha',
        'latitude': 19.887600,
        'longitude': 86.094500,
        'keywords': 'konark sun temple black pagoda heritage surya mandir monument',
    },
    {
        'title': 'Konark Bus Stand & Market',
        'subtitle': 'Main Road, Konark Town, Puri, Odisha',
        'latitude': 19.892000,
        'longitude': 86.088000,
        'keywords': 'konark bus stand market town center auto stand chhak',
    },
    {
        'title': 'Ramachandi Sea Beach & Temple',
        'subtitle': 'Kushabhadra River Confluence, Marine Drive, Konark',
        'latitude': 19.851000,
        'longitude': 86.059000,
        'keywords': 'ramachandi sea beach marine drive temple river konark boating',
    },
    {
        'title': 'Marine Drive Eco Retreat',
        'subtitle': 'Eco Tourism Zone, Konark Marine Drive, Odisha',
        'latitude': 19.870000,
        'longitude': 86.120000,
        'keywords': 'eco retreat marine drive konark luxury tents beach festival',
    },
    {
        'title': 'Kuruma Buddhist Site',
        'subtitle': 'Ancient Monastery, Konark Rural, Puri, Odisha',
        'latitude': 19.867000,
        'longitude': 86.042000,
        'keywords': 'kuruma buddhist heritage site monastery konark excavation',
    },
    {
        'title': 'Chhaitana Chhak',
        'subtitle': 'Konark - Gop Road Junction, Puri, Odisha',
        'latitude': 19.912000,
        'longitude': 86.045000,
        'keywords': 'chhaitana chhak gop konark road junction market',
    },
    {
        'title': 'Puri Sri Jagannath Temple',
        'subtitle': 'Grand Road (Bada Danda), Puri, Odisha',
        'latitude': 19.804900,
        'longitude': 85.817900,
        'keywords': 'puri jagannath temple srimandir grand road bada danda dham',
    },
    {
        'title': 'Puri Golden Beach (Blue Flag)',
        'subtitle': 'Chakratirtha / VIP Road, Puri, Odisha',
        'latitude': 19.798300,
        'longitude': 85.824900,
        'keywords': 'puri golden beach blue flag sea beach marine drive vip road',
    },
    {
        'title': 'Puri Railway Station',
        'subtitle': 'Station Road, Puri, Odisha 752002',
        'latitude': 19.813000,
        'longitude': 85.839000,
        'keywords': 'puri railway station train junction bada danda',
    },
    # Bhubaneswar
    {
        'title': 'Biju Patnaik Airport (BBI)',
        'subtitle': 'Airport Road, Bhubaneswar, Odisha 751020',
        'latitude': 20.252500,
        'longitude': 85.817800,
        'keywords': 'biju patnaik airport bbi terminal arrivals departures bhubaneswar',
    },
    {
        'title': 'Master Canteen Square',
        'subtitle': 'Bhubaneswar Central Railway Station, Odisha',
        'latitude': 20.264400,
        'longitude': 85.840000,
        'keywords': 'master canteen square railway station bhubaneswar janpath',
    },
    {
        'title': 'Patia Infocity',
        'subtitle': 'TCS, Infosys, KIIT Square, Bhubaneswar, Odisha',
        'latitude': 20.354000,
        'longitude': 85.819000,
        'keywords': 'patia infocity tech park kiit campus bhubaneswar it hub',
    },
    # Bengaluru Hubs
    {
        'title': 'Indiranagar 100ft Road',
        'subtitle': 'Metro & Dining District, Bengaluru, Karnataka',
        'latitude': 12.978400,
        'longitude': 77.640800,
        'keywords': 'indiranagar 100ft road metro bangalore',
    },
    {
        'title': 'Koramangala 5th Block',
        'subtitle': 'Startup & Cafe Hub, Bengaluru, Karnataka',
        'latitude': 12.935200,
        'longitude': 77.624500,
        'keywords': 'koramangala 5th block bangalore startup',
    },
    {
        'title': 'Electronic City Phase 1',
        'subtitle': 'Infosys & Wipro Tech Park, Bengaluru',
        'latitude': 12.839900,
        'longitude': 77.677000,
        'keywords': 'electronic city phase 1 infosys wipro tech park bangalore',
    },
    {
        'title': 'Kempegowda Int. Airport (BLR)',
        'subtitle': 'Terminal 1 & 2, Devanahalli, Bengaluru',
        'latitude': 13.198600,
        'longitude': 77.706600,
        'keywords': 'kempegowda airport blr devanahalli bangalore',
    },
    {
        'title': 'MG Road Metro Station',
        'subtitle': 'Brigade Road Junction, Bengaluru Central',
        'latitude': 12.975600,
        'longitude': 77.606600,
        'keywords': 'mg road metro station brigade central bangalore',
    },
]


class LocationAutocompleteView(APIView):
    """
    Real-time location autocomplete search for Pickup and Destination.
    GET /api/v1/locations/autocomplete/?q=...
    """
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response(
                {
                    "success": True,
                    "count": len(PRESET_LOCATIONS),
                    "data": PRESET_LOCATIONS[:6]
                },
                status=status.HTTP_200_OK
            )

        q_lower = query.lower()
        matched = []

        # 1. Instant match in predefined database
        for loc in PRESET_LOCATIONS:
            if (
                q_lower in loc['title'].lower()
                or q_lower in loc['subtitle'].lower()
                or q_lower in loc.get('keywords', '').lower()
            ):
                matched.append({
                    'title': loc['title'],
                    'subtitle': loc['subtitle'],
                    'latitude': loc['latitude'],
                    'longitude': loc['longitude'],
                })

        # 2. If fewer than 4 matches and query length >= 3, query live geocoder (Nominatim)
        if len(matched) < 5 and len(query) >= 3:
            try:
                encoded_q = urllib.parse.quote(query)
                url = f"https://nominatim.openstreetmap.org/search?q={encoded_q}&format=json&limit=5&addressdetails=1"
                req = urllib.request.Request(
                    url,
                    headers={'User-Agent': 'DestinyMobilityPlatform/1.0 (contact@destiny.com)'}
                )
                with urllib.request.urlopen(req, timeout=3.5) as res:
                    geo_data = json.loads(res.read().decode())
                    for item in geo_data:
                        disp_name = item.get('display_name', '')
                        parts = [p.strip() for p in disp_name.split(',')]
                        title = parts[0] if parts else query.title()
                        subtitle = ', '.join(parts[1:4]) if len(parts) > 1 else disp_name
                        lat = round(float(item['lat']), 6)
                        lon = round(float(item['lon']), 6)

                        # Avoid duplicating existing match
                        if not any(abs(m['latitude'] - lat) < 0.001 and abs(m['longitude'] - lon) < 0.001 for m in matched):
                            matched.append({
                                'title': title,
                                'subtitle': subtitle,
                                'latitude': lat,
                                'longitude': lon,
                            })
            except Exception as e:
                # Fallback gracefully to existing matches if offline or timed out
                pass

        return Response(
            {
                "success": True,
                "count": len(matched),
                "data": matched[:8]
            },
            status=status.HTTP_200_OK
        )


class UpdateDriverLocationView(APIView):
    """
    Update live GPS coordinates for the authenticated driver.
    POST /api/v1/locations/update/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {
                    "success": False,
                    "message": "Only authenticated drivers can update location."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        driver = request.user.driver_profile
        serializer = DriverLocationUpdateSerializer(data=request.data)
        if serializer.is_valid():
            latitude = serializer.validated_data['latitude']
            longitude = serializer.validated_data['longitude']

            location, _ = DriverLocation.objects.update_or_create(
                driver=driver,
                defaults={
                    'latitude': latitude,
                    'longitude': longitude
                }
            )

            return Response(
                {
                    "success": True,
                    "message": "Driver location updated successfully",
                    "data": DriverLocationSerializer(location).data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Invalid coordinates",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class GetDriverLocationView(APIView):
    """
    Get the latest reported GPS location of a specific driver.
    GET /api/v1/locations/driver/{driver_id}/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, driver_id):
        driver = get_object_or_404(Driver, id=driver_id)
        try:
            location = DriverLocation.objects.get(driver=driver)
        except DriverLocation.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Location data not found for this driver."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DriverLocationSerializer(location)
        return Response(
            {
                "success": True,
                "message": "Driver location retrieved successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
