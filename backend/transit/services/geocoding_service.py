import math
from typing import List, Dict, Any, Optional, Tuple
from django.db.models import Q
from ..models import Stop, PlaceLandmark

class GeocodingService:
    """Geocoding & location intelligence for Ahmedabad Transit Network."""

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate great-circle distance in kilometers between two points."""
        r = 6371.0 # Earth radius in km
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return r * c

    @classmethod
    def search_locations(cls, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Searches landmarks, metro stations, BRTS stops, and AMTS stops."""
        q = query.strip()
        if not q:
            # Return top popular Ahmedabad landmarks
            landmarks = PlaceLandmark.objects.filter(is_popular=True)[:limit]
            return [cls._landmark_to_dict(l) for l in landmarks]

        results = []

        # 1. Search Landmarks
        landmarks = PlaceLandmark.objects.filter(
            Q(name__icontains=q) |
            Q(name_gu__icontains=q) |
            Q(address__icontains=q) |
            Q(category__icontains=q)
        )[:limit]
        for l in landmarks:
            results.append(cls._landmark_to_dict(l))

        # 2. Search Stops & Stations
        stops = Stop.objects.filter(
            Q(name__icontains=q) |
            Q(name_gu__icontains=q) |
            Q(code__icontains=q)
        ).select_related('agency')[:limit]
        for s in stops:
            results.append({
                'id': s.stop_id,
                'name': s.name,
                'name_gu': s.name_gu,
                'category': f"{s.mode}_STATION" if s.mode == 'METRO' else f"{s.mode}_STOP",
                'type': s.mode,
                'address': f"{s.mode} Network, Ahmedabad",
                'latitude': s.latitude,
                'longitude': s.longitude,
                'is_interchange': s.is_interchange,
                'wheelchair_accessible': s.wheelchair_accessible,
            })

        # Deduplicate by name & coordinates
        seen = set()
        deduped = []
        for r in results:
            key = (r['name'].lower(), round(r['latitude'], 3), round(r['longitude'], 3))
            if key not in seen:
                seen.add(key)
                deduped.append(r)

        return deduped[:limit]

    @classmethod
    def resolve_location(cls, name_or_query: str, lat: Optional[float] = None, lng: Optional[float] = None) -> Tuple[str, float, float]:
        """Resolves location name to (display_name, lat, lng)."""
        if lat is not None and lng is not None:
            return name_or_query or "Selected Location", float(lat), float(lng)

        # Look up landmark
        lm = PlaceLandmark.objects.filter(
            Q(name__icontains=name_or_query) |
            Q(name_gu__icontains=name_or_query)
        ).first()
        if lm:
            return lm.name, lm.latitude, lm.longitude

        # Look up Stop
        stop = Stop.objects.filter(
            Q(name__icontains=name_or_query) |
            Q(name_gu__icontains=name_or_query)
        ).first()
        if stop:
            return stop.name, stop.latitude, stop.longitude

        # Default fallback coordinates: Ahmedabad Center (Ashram Road)
        return name_or_query, 23.0300, 72.5800

    @classmethod
    def find_nearby_stops(cls, lat: float, lng: float, radius_km: float = 1.5, mode: Optional[str] = None, limit: int = 15) -> List[Dict[str, Any]]:
        """Finds nearest transit stops from a geographic point with realistic walking time."""
        stops = Stop.objects.all().select_related('agency')
        if mode:
            stops = stops.filter(mode=mode)

        results = []
        for s in stops:
            dist_km = cls.haversine_distance_km(lat, lng, s.latitude, s.longitude)
            if dist_km <= radius_km:
                walk_mins = max(1, math.ceil((dist_km / 4.5) * 60)) # 4.5 km/h walking speed
                results.append({
                    'stop_id': s.stop_id,
                    'name': s.name,
                    'name_gu': s.name_gu,
                    'mode': s.mode,
                    'agency_name': s.agency.name,
                    'latitude': s.latitude,
                    'longitude': s.longitude,
                    'distance_m': int(dist_km * 1000),
                    'distance_km': round(dist_km, 2),
                    'walking_time_mins': walk_mins,
                    'is_interchange': s.is_interchange,
                    'wheelchair_accessible': s.wheelchair_accessible,
                    'platform_info': s.platform_info,
                })

        results.sort(key=lambda x: x['distance_m'])
        return results[:limit]

    @classmethod
    def _landmark_to_dict(cls, l: PlaceLandmark) -> Dict[str, Any]:
        return {
            'id': f"LM-{l.id}",
            'name': l.name,
            'name_gu': l.name_gu,
            'category': l.category,
            'type': 'LANDMARK',
            'address': l.address,
            'latitude': l.latitude,
            'longitude': l.longitude,
            'is_popular': l.is_popular,
        }
