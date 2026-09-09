import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from accounts.services import AccountService
from fleet.models import BusRoute, Bus, BusCamera, BusLocationHistory
from detections.models import Detection
from roads.models import RoadHazard, RoadSegment, MaintenanceTask
from traffic.models import TrafficObservation
from incidents.models import Incident
from vehicles.models import TrackedVehicle, VehicleDetection, ANPRDetection
from notifications.models import Alert
from common.models import SchoolZone, Location
from reports.models import DailyReport
from incidents.services import IncidentService

class Command(BaseCommand):
    help = 'Seeds realistic Ahmedabad urban sensing demo data for prototype and React frontend'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting urban intelligence database seeding...'))

        # 1. Users
        self.stdout.write('Creating default users (admin, operator, analyst, viewer)...')
        AccountService.get_or_create_default_users()

        # 2. Locations and Corridors around Ahmedabad
        ahmedabad_roads = [
            {"name": "SG Highway", "start": (22.9850, 72.4850), "end": (23.1100, 72.5400), "code": "SG-HWY"},
            {"name": "Ashram Road", "start": (23.0100, 72.5700), "end": (23.0600, 72.5750), "code": "ASH-RD"},
            {"name": "Ring Road", "start": (23.0200, 72.5100), "end": (23.0800, 72.6200), "code": "RNG-RD"},
            {"name": "CG Road", "start": (23.0250, 72.5550), "end": (23.0450, 72.5600), "code": "CG-RD"},
            {"name": "Naroda Road", "start": (23.0500, 72.6100), "end": (23.0800, 72.6500), "code": "NRD-RD"},
            {"name": "Drive In Road", "start": (23.0400, 72.5300), "end": (23.0500, 72.5450), "code": "DRV-RD"},
        ]

        for r_info in ahmedabad_roads:
            Location.objects.get_or_create(
                name=r_info["name"],
                defaults={
                    "city": "Ahmedabad",
                    "state": "Gujarat",
                    "latitude": r_info["start"][0],
                    "longitude": r_info["start"][1],
                    "landmark": f"{r_info['name']} Junction"
                }
            )

        # 3. Routes
        self.stdout.write('Creating bus routes...')
        route_configs = [
            ("18", "SG Highway Trunk Line", "Sarkhej Sanand Cross Road", "Vaishno Devi Circle"),
            ("22", "Central Ashram Corridor", "Paldi Cross Road", "Vadaj Terminal"),
            ("45", "Outer Ring Express", "Bopal Ring Road", "Naroda Patiya"),
            ("12", "CG Road Commercial Loop", "Navrangpura", "Ellis Bridge"),
            ("56", "Airport Express Link", "Kalupur Station", "SVPI Airport"),
            ("101", "West Ahmedabad Connector", "Iskcon Crossroads", "Chandkheda"),
        ]
        routes = []
        for num, name, start, end in route_configs:
            route, _ = BusRoute.objects.get_or_create(
                route_number=num,
                defaults={
                    "route_name": name,
                    "start_location": start,
                    "end_location": end,
                    "status": "ACTIVE"
                }
            )
            routes.append(route)

        # 4. Buses (27 buses positioned precisely on Ahmedabad road centerlines)
        self.stdout.write('Creating 27 buses with real road-aligned GPS...')
        bus_specs = [
            ("BUS-104", "GJ 01 XX 1040", routes[0], "ONLINE", 42.0, 23.0435, 72.5155, "SG Highway, Pakwan Junction"),
            ("BUS-087", "GJ 01 XX 0870", routes[1], "ONLINE", 28.0, 23.0312, 72.5724, "Ashram Road, Nehru Bridge"),
            ("BUS-121", "GJ 01 XX 1210", routes[2], "ONLINE", 35.0, 23.0248, 72.5318, "132ft Ring Road, Shivranjani"),
            ("BUS-156", "GJ 01 XX 1560", routes[3], "ONLINE", 22.0, 23.0258, 72.5586, "CG Road, Panchvati Circle"),
            ("BUS-101", "GJ 01 XX 1010", routes[0], "ONLINE", 38.0, 23.0512, 72.5188, "SG Highway, Thaltej Cross Road"),
            ("BUS-102", "GJ 01 XX 1020", routes[1], "PROCESSING", 31.0, 23.0418, 72.5708, "Ashram Road, Income Tax Junction"),
            ("BUS-092", "GJ 01 XX 0920", routes[4], "ONLINE", 45.0, 23.0768, 72.6186, "Airport Road, Hansol Circle"),
            ("BUS-114", "GJ 01 XX 1140", routes[5], "ONLINE", 29.0, 23.0678, 72.5622, "132ft Ring Road, Akhbarnagar Circle"),
            ("BUS-078", "GJ 01 XX 0780", routes[2], "OFFLINE", 0.0, 23.0015, 72.5482, "132ft Ring Road, Vasna Depot Bay"),
            ("BUS-133", "GJ 01 XX 1330", routes[0], "ONLINE", 40.0, 23.0278, 72.5078, "SG Highway, ISKCON Cross Road"),
            ("BUS-145", "GJ 01 XX 1450", routes[3], "PROCESSING", 18.0, 23.0336, 72.5572, "CG Road, Swastik Cross Road"),
            ("BUS-162", "GJ 01 XX 1620", routes[1], "ONLINE", 33.0, 23.0488, 72.5714, "Ashram Road, Usmanpura"),
            ("BUS-171", "GJ 01 XX 1710", routes[2], "MAINTENANCE", 0.0, 23.0042, 72.5028, "SG Highway, Sarkhej Flyover"),
            ("BUS-180", "GJ 01 XX 1800", routes[5], "ONLINE", 36.0, 23.0518, 72.5286, "Drive-In Road, Himalaya Mall"),
            ("BUS-195", "GJ 01 XX 1950", routes[4], "ONLINE", 50.0, 23.0568, 72.6242, "Naroda Road, Memco Cross Road"),
            ("BUS-116", "GJ 01 XX 1160", routes[4], "ONLINE", 25.5, 23.0298, 72.5996, "Kalupur Station Front Road"),
            ("BUS-117", "GJ 01 XX 1170", routes[0], "ONLINE", 41.0, 23.0362, 72.5118, "SG Highway, Rajpath Club"),
            ("BUS-118", "GJ 01 XX 1180", routes[2], "ONLINE", 33.5, 23.0338, 72.5332, "132ft Ring Road, IIM Vastrapur"),
            ("BUS-119", "GJ 01 XX 1190", routes[3], "ONLINE", 24.0, 23.0412, 72.5556, "CG Road, Stadium Cross Road"),
            ("BUS-120", "GJ 01 XX 1200", routes[1], "ONLINE", 29.5, 23.0238, 72.5715, "Ashram Road, Ellis Bridge Corner"),
            ("BUS-122", "GJ 01 XX 1220", routes[0], "ONLINE", 46.0, 23.0768, 72.5288, "SG Highway, Sola Overbridge"),
            ("BUS-123", "GJ 01 XX 1230", routes[4], "ONLINE", 47.0, 23.0728, 72.6282, "Airport Road, Terminal 2 Approach"),
            ("BUS-124", "GJ 01 XX 1240", routes[4], "ONLINE", 39.0, 23.0692, 72.6456, "Naroda Road, Galaxy Cinema"),
            ("BUS-125", "GJ 01 XX 1250", routes[2], "ONLINE", 34.0, 23.0478, 72.5376, "132ft Ring Road, Helmet Cross Road"),
            ("BUS-126", "GJ 01 XX 1260", routes[1], "ONLINE", 31.0, 23.0585, 72.5772, "Riverfront West Road, Subhash Bridge"),
            ("BUS-127", "GJ 01 XX 1270", routes[5], "ONLINE", 28.0, 23.0492, 72.5342, "Drive-In Road, Memnagar Fire Station"),
            ("BUS-128", "GJ 01 XX 1280", routes[3], "ONLINE", 35.0, 23.0182, 72.5606, "CG Road, Mahalaxmi Cross Road"),
        ]

        buses = []
        for b_id, reg, r, st, spd, lat, lng, loc in bus_specs:
            bus, _ = Bus.objects.update_or_create(
                bus_id=b_id,
                defaults={
                    "registration_number": reg,
                    "route": r,
                    "status": st,
                    "speed": spd,
                    "latitude": lat,
                    "longitude": lng,
                    "current_location_name": loc,
                    "ai_status": "Processing" if st == "ONLINE" else "Standby",
                    "cameras_status": {
                        "front": True, "rear": True, "left": True,
                        "right": True, "passenger": True
                    }
                }
            )
            buses.append(bus)


            # Cameras for bus
            cam_types = ['FRONT', 'REAR', 'LEFT', 'RIGHT', 'PASSENGER']
            for ct in cam_types:
                BusCamera.objects.get_or_create(
                    bus=bus,
                    camera_type=ct,
                    defaults={
                        'camera_id': f"{bus.bus_id}-CAM-{ct[:2]}",
                        'status': 'ACTIVE' if bus.status != 'MAINTENANCE' else 'INACTIVE',
                        'resolution': '1920x1080',
                        'fps': 30
                    }
                )

            # Location history points
            for m in range(5, 0, -1):
                BusLocationHistory.objects.get_or_create(
                    bus=bus,
                    timestamp=timezone.now() - timedelta(minutes=m * 2),
                    defaults={
                        'latitude': lat - (m * 0.001),
                        'longitude': lng - (m * 0.001),
                        'speed': max(0, spd - 5),
                        'heading': 180.0
                    }
                )

        # 5. School Zones
        self.stdout.write('Creating Ahmedabad school zones...')
        school_zones = [
            ("Delhi Public School Bopal", 23.0330, 72.4850, "HIGH", 350.0),
            ("St. Xavier's High School Navrangpura", 23.0345, 72.5560, "CRITICAL", 300.0),
            ("Udgam School for Children Thaltej", 23.0510, 72.5180, "HIGH", 300.0),
            ("The Riverside School Cantonment", 23.0680, 72.6050, "MEDIUM", 250.0),
            ("Shanti Asiatic School Shela", 23.0080, 72.4680, "MEDIUM", 400.0),
        ]
        for s_name, s_lat, s_lng, s_risk, s_rad in school_zones:
            SchoolZone.objects.get_or_create(
                name=s_name,
                defaults={
                    "latitude": s_lat,
                    "longitude": s_lng,
                    "risk_level": s_risk,
                    "radius": s_rad,
                    "active": True
                }
            )

        # 6. Road Hazards (precisely on road centerlines)
        self.stdout.write('Creating road hazards and condition segments on road centerlines...')
        hazards_data = [
            ("SG Highway, Sola Overbridge", "POTHOLE", "HIGH", 0.94, 23.0768, 72.5288, 86, 3),
            ("Ashram Road, Usmanpura", "ROAD_DAMAGE", "MEDIUM", 0.89, 23.0488, 72.5714, 72, 2),
            ("132ft Ring Road, Akhbarnagar Circle", "WATERLOGGING", "HIGH", 0.91, 23.0678, 72.5622, 88, 4),
            ("CG Road, Swastik Cross Road", "MISSING_DIVIDER", "MEDIUM", 0.85, 23.0336, 72.5572, 65, 1),
            ("Naroda Road, Galaxy Cinema", "POTHOLE", "CRITICAL", 0.97, 23.0692, 72.6456, 95, 5),
            ("Drive In Road, Memnagar Fire Station", "UNMARKED_SPEEDBUMP", "LOW", 0.88, 23.0492, 72.5342, 45, 1),
            ("Vastrapur Lake Road, IIM Approach", "POTHOLE", "MEDIUM", 0.92, 23.0338, 72.5332, 68, 2),
            ("SG Highway, Sarkhej Flyover", "ROAD_DAMAGE", "HIGH", 0.93, 23.0042, 72.5028, 84, 3),
            ("SG Highway, Pakwan Junction", "MISSING_ZEBRA_CROSSING", "HIGH", 0.90, 23.0435, 72.5155, 78, 2),
            ("Riverfront West Road, Subhash Bridge Approach", "WATERLOGGING", "CRITICAL", 0.96, 23.0585, 72.5772, 92, 4),
            ("132ft Ring Road, Shivranjani Cross Road", "POTHOLE", "HIGH", 0.93, 23.0248, 72.5318, 81, 3),
            ("Nehrunagar Main Road", "ROAD_DAMAGE", "LOW", 0.84, 23.0182, 72.5452, 42, 1),
        ]
        for r_name, h_type, sev, conf, lat, lng, prio, occ in hazards_data:
            RoadHazard.objects.update_or_create(
                road_name=r_name,
                hazard_type=h_type,
                defaults={
                    "severity": sev,
                    "confidence": conf,
                    "latitude": lat,
                    "longitude": lng,
                    "detected_by_bus": buses[0],
                    "maintenance_priority": prio,
                    "occurrence_count": occ,
                    "status": "PENDING"
                }
            )


        # 7. Detections (100+)
        self.stdout.write('Creating 100+ AI detections...')
        detection_choices = [
            ('POTHOLE', 'HIGH'),
            ('ROAD_DAMAGE', 'MEDIUM'),
            ('WATERLOGGING', 'HIGH'),
            ('VEHICLE', 'LOW'),
            ('PEDESTRIAN', 'MEDIUM'),
            ('SCHOOL_CHILD', 'HIGH'),
            ('RASH_DRIVING', 'HIGH'),
            ('TRAFFIC_SIGN', 'LOW')
        ]
        now = timezone.now()
        for idx in range(120):
            bus = buses[idx % len(buses)]
            det_type, sev = random.choice(detection_choices)
            conf = round(random.uniform(0.86, 0.98), 2)
            t_offset = timedelta(minutes=random.randint(1, 480))
            road_name = bus.current_location_name or "Ahmedabad Urban Road"

            Detection.objects.create(
                bus=bus,
                detection_type=det_type,
                confidence=conf,
                severity=sev,
                latitude=round(bus.latitude + (random.random() - 0.5) * 0.01, 5),
                longitude=round(bus.longitude + (random.random() - 0.5) * 0.01, 5),
                timestamp=now - t_offset,
                frame_reference=f"frame_det_{idx+1000}.jpg",
                location_name=road_name,
                status='NEW',
                metadata={"road": road_name, "severity": sev}
            )

        # 8. Tracked Vehicles and ANPR Records
        self.stdout.write('Creating Tracked Vehicles and ANPR detections...')
        suspect_reg = "GJ01XX4821"
        vehicle, _ = TrackedVehicle.objects.get_or_create(
            registration_number=suspect_reg,
            defaults={
                "vehicle_type": "White SUV",
                "vehicle_color": "White",
                "confidence": 0.964,
                "flagged_for_incident": True
            }
        )

        VehicleDetection.objects.filter(vehicle=vehicle).delete()
        ANPRDetection.objects.filter(registration_number=suspect_reg).delete()

        sightings = [
            (23.0278, 72.5078, "SG Highway, ISKCON Cross Road", "Northbound towards Pakwan", 40),
            (23.0362, 72.5118, "SG Highway, Rajpath Club", "Northbound towards Pakwan", 30),
            (23.0435, 72.5155, "SG Highway, Pakwan Cross Road", "Northbound towards Thaltej", 20),
            (23.0512, 72.5188, "SG Highway, Thaltej Underpass", "Westbound towards Sindhu Bhavan", 10),
        ]
        for s_lat, s_lng, s_loc, s_dir, s_min_ago in sightings:
            s_time = now - timedelta(minutes=s_min_ago)
            VehicleDetection.objects.create(
                vehicle=vehicle,
                latitude=s_lat,
                longitude=s_lng,
                bus=buses[0],
                timestamp=s_time,
                direction=s_dir,
                confidence=0.964,
                location_name=s_loc,
                frame_reference=f"anpr_{vehicle.registration_number}_{s_min_ago}.jpg"
            )
            ANPRDetection.objects.create(
                registration_number=suspect_reg,
                latitude=s_lat,
                longitude=s_lng,
                vehicle=vehicle,
                bus=buses[0],
                confidence=0.964,
                timestamp=s_time,
                location_name=s_loc,
                image_reference=f"anpr_crop_{s_min_ago}.jpg"
            )

        # 9. Incidents (including Hit-and-Run)
        self.stdout.write('Creating safety incidents...')
        Incident.objects.all().delete()
        Alert.objects.all().delete()

        IncidentService.process_hit_and_run_detection(
            bus=buses[0],
            latitude=23.0435,
            longitude=72.5155,
            vehicle_registration=suspect_reg,
            vehicle_type="White SUV",
            vehicle_color="White",
            location_name="SG Highway, Pakwan Junction"
        )

        other_incidents = [
            ("RASH_DRIVING", "HIGH", buses[1], "Ashram Road, Nehru Bridge", 23.0312, 72.5724, "Reckless overtaking near BRTS lane"),
            ("PEDESTRIAN_RISK", "HIGH", buses[2], "132ft Ring Road, Shivranjani", 23.0248, 72.5318, "Pedestrians crossing high-speed corridor"),
            ("WATERLOGGING", "MEDIUM", buses[3], "CG Road, Swastik Underpass", 23.0336, 72.5572, "Water accumulation of 6 inches reported"),
            ("ACCIDENT", "CRITICAL", buses[4], "Naroda Road, Galaxy Junction", 23.0692, 72.6456, "Minor two-wheeler collision obstructing lane 2"),
        ]
        for inc_type, sev, b_inst, loc, lat, lng, desc in other_incidents:
            Incident.objects.create(
                incident_type=inc_type,
                location=loc,
                severity=sev,
                bus=b_inst,
                latitude=lat,
                longitude=lng,
                confidence=0.93,
                status="INVESTIGATING",
                description=desc,
                assigned_team="Ahmedabad Municipal Traffic Response"
            )

        # 10. Traffic Observations
        self.stdout.write('Creating hourly traffic observations...')
        TrafficObservation.objects.all().delete()
        for hour in range(24):
            t_time = now.replace(hour=hour, minute=0, second=0)
            is_peak = (8 <= hour <= 11) or (17 <= hour <= 20)
            base_count = 950 if is_peak else 420
            avg_speed = 26.0 if is_peak else 44.0
            cong_index = random.randint(68, 85) if is_peak else random.randint(30, 52)
            cong_level = 'HEAVY' if is_peak else 'MODERATE'

            TrafficObservation.objects.create(
                bus=buses[hour % len(buses)],
                location="SG Highway",
                latitude=23.0435,
                longitude=72.5155,
                timestamp=t_time,
                vehicle_count=base_count,
                car_count=int(base_count * 0.45),
                bus_count=int(base_count * 0.08),
                truck_count=int(base_count * 0.06),
                two_wheeler_count=int(base_count * 0.35),
                auto_count=int(base_count * 0.06),
                average_speed=avg_speed,
                congestion_level=cong_level,
                congestion_index=cong_index
            )

        # 11. Alerts
        self.stdout.write('Creating alerts on road centerlines...')
        alerts = [
            ("HIT_AND_RUN", "CRITICAL", "Critical Hit-and-Run Detected", "GJ 01 XX 4821 flagged on SG Highway (Confidence: 96.4%)", "SG Highway, Pakwan Junction", buses[0]),
            ("POTHOLE", "HIGH", "Severe Pothole Cluster", "Multiple deep potholes identified near Naroda Industrial Road", "Naroda Road, Galaxy Cinema", buses[4]),
            ("SCHOOL_CHILD", "HIGH", "Pedestrian Surge Near School", "Large cluster of students crossing during rush hour", "Ashram Road, Usmanpura", buses[1]),
            ("WATERLOGGING", "MEDIUM", "Lane Inundation Warning", "Lane 1 submerged under water near Ring Road underpass", "132ft Ring Road, Akhbarnagar Circle", buses[2]),
        ]
        for a_type, sev, title, msg, loc, b_inst in alerts:
            Alert.objects.create(
                title=title,
                alert_type=a_type,
                severity=sev,
                message=msg,
                location=loc,
                bus=b_inst,
                latitude=b_inst.latitude,
                longitude=b_inst.longitude,
                confidence=0.94
            )



        # 12. Daily Report
        self.stdout.write('Creating daily report...')
        DailyReport.objects.get_or_create(
            report_date=now.date(),
            defaults={
                "total_buses": 248,
                "total_detections": 12846,
                "road_hazards": 327,
                "traffic_events": 840,
                "incidents": 18,
                "critical_incidents": 4,
                "average_confidence": 94.6,
                "summary_text": "City-wide urban intelligence report for Ahmedabad. 248 buses online sensing roads and traffic.",
                "report_data": {
                    "corridors": ["SG Highway", "Ashram Road", "Ring Road", "CG Road"],
                    "maintenance_priority_index": 86
                }
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all urban sensing prototype data for Ahmedabad!'))
