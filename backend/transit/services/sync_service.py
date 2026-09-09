import time
from django.utils import timezone
from ..models import (
    TransportAgency, TransportMode, Stop, Route, RouteStop,
    Transfer, Vehicle, VehiclePosition, FareRule, ServiceAlert,
    DataSource, DataSyncLog, PlaceLandmark
)
from ..providers.metro_provider import MetroProvider
from ..providers.brts_provider import BRTSProvider
from ..providers.amts_provider import AMTSProvider
from ..providers.rail_provider import RailProvider
from ..providers.gandhinagar_bus_provider import GandhinagarBusProvider

class SyncService:
    """Ingests and synchronizes all Ahmedabad, Gandhinagar & GIFT City transit providers."""

    @classmethod
    def sync_all(cls) -> dict:
        start_time = time.time()
        stats = {
            'agencies': 0,
            'modes': 0,
            'stops': 0,
            'routes': 0,
            'route_stops': 0,
            'transfers': 0,
            'fare_rules': 0,
            'vehicles': 0,
            'alerts': 0,
            'landmarks': 0,
        }

        # 1. Transport Modes
        modes_data = [
            ('METRO', 'Ahmedabad/Gandhinagar Metro', 'train', '#2563EB', 38.0, 2),
            ('BRTS', 'Janmarg BRTS', 'bus', '#F97316', 28.0, 1),
            ('AMTS', 'AMTS City Bus', 'bus', '#059669', 20.0, 2),
            ('RAIL', 'Indian Railways Intercity', 'train', '#7C3AED', 45.0, 3),
            ('BUS', 'Gandhinagar / GIFT Shuttle / GSRTC', 'bus', '#0D9488', 32.0, 2),
            ('WALK', 'Pedestrian Walk', 'footprints', '#64748B', 4.5, 0),
        ]
        for code, name, icon, color, speed, boarding in modes_data:
            TransportMode.objects.update_or_create(
                code=code,
                defaults={
                    'name': name,
                    'icon': icon,
                    'color': color,
                    'average_speed_kmh': speed,
                    'boarding_time_mins': boarding,
                }
            )
            stats['modes'] += 1

        # 2. Providers
        providers = [
            ('METRO', MetroProvider()),
            ('BRTS', BRTSProvider()),
            ('AMTS', AMTSProvider()),
            ('RAIL', RailProvider()),
            ('GND_TRANSIT', GandhinagarBusProvider()),
        ]

        for p_code, provider in providers:
            # Agency
            agency_info = provider.get_agency_info()
            agency, _ = TransportAgency.objects.update_or_create(
                code=agency_info['code'],
                defaults={
                    'name': agency_info['name'],
                    'full_name': agency_info.get('full_name', ''),
                    'website': agency_info.get('website', ''),
                    'helpline': agency_info.get('helpline', ''),
                    'fare_policy': agency_info.get('fare_policy', ''),
                    'is_active': True,
                }
            )
            stats['agencies'] += 1

            # Data Source Tracking
            ds, _ = DataSource.objects.update_or_create(
                source_name=f"{agency.name} Feed",
                defaults={
                    'provider_type': f"{p_code}_PROVIDER",
                    'status': 'OPERATIONAL',
                    'last_sync': timezone.now(),
                    'is_live_telemetry': False, # Demo simulated until official token
                    'freshness_seconds': 15,
                }
            )

            # Stops
            for s_data in provider.get_stops():
                Stop.objects.update_or_create(
                    stop_id=s_data['stop_id'],
                    defaults={
                        'name': s_data['name'],
                        'name_gu': s_data.get('name_gu', ''),
                        'name_hi': s_data.get('name_hi', ''),
                        'code': s_data.get('code', ''),
                        'city': s_data.get('city', 'AHMEDABAD'),
                        'agency': agency,
                        'mode': s_data['mode'],
                        'latitude': s_data['latitude'],
                        'longitude': s_data['longitude'],
                        'is_interchange': s_data.get('is_interchange', False),
                        'wheelchair_accessible': s_data.get('wheelchair_accessible', True),
                        'has_elevator': s_data.get('has_elevator', False),
                        'has_escalator': s_data.get('has_escalator', False),
                        'has_parking': s_data.get('has_parking', False),
                        'has_restroom': s_data.get('has_restroom', False),
                        'platform_info': s_data.get('platform_info', ''),
                    }
                )
                stats['stops'] += 1

            # Routes
            for r_data in provider.get_routes():
                Route.objects.update_or_create(
                    route_id=r_data['route_id'],
                    defaults={
                        'route_number': r_data['route_number'],
                        'route_name': r_data['route_name'],
                        'agency': agency,
                        'mode': r_data['mode'],
                        'color': r_data.get('color', '#2563EB'),
                        'text_color': r_data.get('text_color', '#FFFFFF'),
                        'headway_peak_mins': r_data.get('headway_peak_mins', 6),
                        'headway_offpeak_mins': r_data.get('headway_offpeak_mins', 12),
                        'first_trip_time': r_data.get('first_trip_time', '06:00'),
                        'last_trip_time': r_data.get('last_trip_time', '22:30'),
                        'average_speed_kmh': r_data.get('average_speed_kmh', 25.0),
                        'reliability_score': r_data.get('reliability_score', 0.9),
                        'is_active': True,
                    }
                )
                stats['routes'] += 1

            # Route Stops
            for rs_data in provider.get_route_stops():
                route = Route.objects.get(route_id=rs_data['route_id'])
                stop = Stop.objects.get(stop_id=rs_data['stop_id'])
                RouteStop.objects.update_or_create(
                    route=route,
                    sequence=rs_data['sequence'],
                    defaults={
                        'stop': stop,
                        'distance_from_start_km': rs_data.get('distance_from_start_km', 0.0),
                        'travel_time_mins': rs_data.get('travel_time_mins', 2.0),
                        'is_major_stop': rs_data.get('is_major_stop', False),
                    }
                )
                stats['route_stops'] += 1

            # Transfers
            for t_data in provider.get_transfers():
                from_s = Stop.objects.filter(stop_id=t_data['from_stop_id']).first()
                to_s = Stop.objects.filter(stop_id=t_data['to_stop_id']).first()
                if from_s and to_s:
                    Transfer.objects.update_or_create(
                        from_stop=from_s,
                        to_stop=to_s,
                        defaults={
                            'transfer_type': t_data.get('transfer_type', 'PEDESTRIAN_LINK'),
                            'walking_distance_m': t_data.get('walking_distance_m', 100),
                            'walking_time_mins': t_data.get('walking_time_mins', 2.0),
                            'transfer_penalty_mins': t_data.get('transfer_penalty_mins', 2.0),
                            'instructions': t_data.get('instructions', ''),
                            'from_platform': t_data.get('from_platform', ''),
                            'to_platform': t_data.get('to_platform', ''),
                            'stand_number': t_data.get('stand_number', ''),
                            'transfer_buffer_mins': t_data.get('transfer_buffer_mins', 3.0),
                            'is_step_free': t_data.get('is_step_free', True),
                        }
                    )
                    stats['transfers'] += 1

            # Fare Rules
            fare_info = provider.get_fare_rules()
            FareRule.objects.update_or_create(
                agency=agency,
                mode=fare_info['mode'],
                defaults={
                    'base_fare': fare_info.get('base_fare', 5.0),
                    'base_distance_km': fare_info.get('base_distance_km', 2.0),
                    'per_km_rate': fare_info.get('per_km_rate', 1.2),
                    'max_fare': fare_info.get('max_fare', 25.0),
                    'fare_brackets': fare_info.get('fare_brackets', []),
                    'is_active': True,
                }
            )
            stats['fare_rules'] += 1

            # Vehicles & Live Positions
            for v_data in provider.get_vehicles():
                route = Route.objects.filter(route_id=v_data.get('route_id')).first()
                vehicle, _ = Vehicle.objects.update_or_create(
                    vehicle_id=v_data['vehicle_id'],
                    defaults={
                        'registration': v_data.get('registration', ''),
                        'agency': agency,
                        'mode': v_data['mode'],
                        'current_route': route,
                        'capacity': v_data.get('capacity', 60),
                        'is_electric': v_data.get('is_electric', True),
                        'is_active': True,
                    }
                )
                stats['vehicles'] += 1

                next_s = Stop.objects.filter(stop_id=v_data.get('next_stop_id')).first()
                VehiclePosition.objects.update_or_create(
                    vehicle=vehicle,
                    defaults={
                        'latitude': v_data['latitude'],
                        'longitude': v_data['longitude'],
                        'speed_kmh': v_data.get('speed_kmh', 25.0),
                        'heading': v_data.get('heading', 45.0),
                        'current_location_name': v_data.get('current_location_name', 'Ahmedabad-Gandhinagar Transit Corridor'),
                        'next_stop': next_s,
                        'eta_next_stop_seconds': v_data.get('eta_next_stop_seconds', 180),
                        'delay_minutes': v_data.get('delay_minutes', 0),
                        'status': v_data.get('status', 'ON_TIME'),
                        'is_live': False, # Explicit demo telemetry
                        'data_source': 'DEMO_SIMULATION',
                        'last_updated': timezone.now(),
                    }
                )

            # Service Alerts
            for a_data in provider.get_service_alerts():
                ServiceAlert.objects.update_or_create(
                    title=a_data['title'],
                    agency=agency,
                    defaults={
                        'description': a_data['description'],
                        'severity': a_data.get('severity', 'INFO'),
                        'status': a_data.get('status', 'ACTIVE'),
                        'delay_impact_mins': a_data.get('delay_impact_mins', 0),
                        'valid_from': timezone.now(),
                    }
                )
                stats['alerts'] += 1

            # Update DataSource record count
            ds.records_count = Stop.objects.filter(agency=agency).count() + Route.objects.filter(agency=agency).count()
            ds.save()

            DataSyncLog.objects.create(
                source=ds,
                status='SUCCESS',
                records_updated=ds.records_count,
                duration_ms=int((time.time() - start_time) * 1000),
                details=f"Synchronized {agency.name} complete network."
            )

        # 3. Comprehensive Ahmedabad, Gandhinagar (Sectors 1-35) & GIFT City Landmarks
        landmarks_data = [
            # Ahmedabad Hubs
            ('Sabarmati Railway Station', 'સાબરમતી રેલવે સ્ટેશન', 'AHMEDABAD', 'RAILWAY_STATION', 'Dharamnagar, Sabarmati, Ahmedabad', 23.0762, 72.5855, ['Sabarmati Junction', 'SBT', 'Sabarmati Stn', 'Sabarmati']),
            ('Thaltej', 'થલતેજ', 'AHMEDABAD', 'RESIDENTIAL', 'Thaltej Cross Road, SG Highway, Ahmedabad', 23.0525, 72.5165, ['Thaltej Char Rasta', 'Thaltej Gam', 'Thaltej Metro']),
            ('Kalupur Railway Station', 'કાલુપુર રેલવે સ્ટેશન', 'AHMEDABAD', 'RAILWAY_STATION', 'Ahmedabad Central Railway Station, Kalupur', 23.0298, 72.5992, ['Ahmedabad Junction', 'ADI', 'Kalupur Station', 'Ahmedabad Railway Station']),
            ('Sardar Vallabhbhai Patel International Airport (SVPIA)', 'અમદાવાદ એરપોર્ટ', 'AHMEDABAD', 'AIRPORT', 'Hansol, Ahmedabad', 23.0735, 72.6345, ['Airport', 'AMD', 'SVPIA', 'Ahmedabad Airport']),
            ('Iskcon Temple & Cross Road', 'ઇસ્કોન મંદિર', 'AHMEDABAD', 'COMMERCIAL', 'SG Highway, Satellite, Ahmedabad', 23.0270, 72.5075, ['Iskcon', 'Iskcon Circle', 'SG Highway Iskcon']),
            ('Prahlad Nagar', 'પ્રહલાદ નગર', 'AHMEDABAD', 'COMMERCIAL', 'Prahlad Nagar Garden, SG Highway', 23.0120, 72.5080, ['Prahladnagar', 'Corporate Road']),
            ('Bopal Approach', 'બોપલ એપ્રોચ', 'AHMEDABAD', 'RESIDENTIAL', 'SP Ring Road, Bopal, Ahmedabad', 23.0310, 72.4850, ['Bopal', 'South Bopal']),
            ('Science City', 'સાયન્સ સિટી', 'AHMEDABAD', 'TOURIST', 'Science City Road, Sola, Ahmedabad', 23.0780, 72.5030, ['Gujarat Science City', 'Science City']),
            ('Gujarat University', 'ગુજરાત યુનિવર્સિટી', 'AHMEDABAD', 'EDUCATION', 'Navrangpura, Ahmedabad', 23.0381, 72.5482, ['GU', 'Gujarat Univ', 'Navrangpura']),
            ('IIM Ahmedabad', 'આઈઆઈએમ અમદાવાદ', 'AHMEDABAD', 'EDUCATION', 'Vastrapur, Ahmedabad', 23.0315, 72.5460, ['IIM-A', 'IIM Vastrapur']),
            ('Narendra Modi Stadium (Motera)', 'નરેન્દ્ર મોદી સ્ટેડિયમ (મોટેરા)', 'AHMEDABAD', 'TOURIST', 'Motera, Sabarmati, Ahmedabad', 23.0915, 72.5975, ['Motera Stadium', 'Motera', 'Cricket Stadium']),
            ('Ranip GSRTC Bus Hub', 'રાણીપ બસ ટર્મિનલ', 'AHMEDABAD', 'BRTS_HUB', 'Ranip, Ahmedabad', 23.0545, 72.5740, ['Ranip', 'Ranip Bus Stand', 'Ranip Terminal']),
            ('Tapovan Circle', 'તપોવન સર્કલ', 'AHMEDABAD', 'COMMERCIAL', 'Visat-Gandhinagar Highway, Ahmedabad', 23.1290, 72.5950, ['Tapovan', 'Visat Circle', 'Tapovan Hub']),
            ('Chandkheda', 'ચાંદખેડા', 'AHMEDABAD', 'RESIDENTIAL', 'Chandkheda, Ahmedabad', 23.1150, 72.5890, ['Chandkheda Road', 'IOC Road']),
            ('Gota Cross Road', 'ગોટા ચાર રસ્તા', 'AHMEDABAD', 'RESIDENTIAL', 'SG Highway, Gota, Ahmedabad', 23.0980, 72.5350, ['Gota', 'Gota SG Highway']),
            ('Maninagar', 'મણિનગર', 'AHMEDABAD', 'RESIDENTIAL', 'Maninagar, Ahmedabad', 22.9975, 72.6050, ['Maninagar Station', 'Kankaria']),
            ('Vastral', 'વસ્ત્રાલ', 'AHMEDABAD', 'RESIDENTIAL', 'Vastral Gam, Ahmedabad', 23.0005, 72.6560, ['Vastral Gam', 'Vastral Metro']),
            ('Naroda', 'નરોડા', 'AHMEDABAD', 'COMMERCIAL', 'Naroda GIDC, Ahmedabad', 23.0680, 72.6580, ['Naroda Patiya', 'Naroda']),
            ('Sarkhej', 'સરખેજ', 'AHMEDABAD', 'RESIDENTIAL', 'Sarkhej Roza, Ahmedabad', 22.9850, 72.4980, ['Sarkhej Sanand Cross Road']),
            ('Paldi', 'પાલડી', 'AHMEDABAD', 'RESIDENTIAL', 'Paldi Cross Road, Ahmedabad', 23.0160, 72.5695, ['Paldi Metro', 'Paldi Circle']),
            ('Ashram Road', 'આશ્રમ રોડ', 'AHMEDABAD', 'COMMERCIAL', 'Income Tax to Nehru Bridge, Ahmedabad', 23.0365, 72.5702, ['Income Tax Circle', 'Ashram Rd']),

            # GIFT City Prime Nodes
            ('GIFT City', 'ગિફ્ટ સિટી', 'GIFT_CITY', 'COMMERCIAL', 'Gujarat International Finance Tec-City, Gandhinagar', 23.1600, 72.6840, ['GIFT', 'GIFT SEZ', 'GIFT FinTech Hub', 'FinTech City']),
            ('GIFT Tower 1 & 2', 'ગિફ્ટ ટાવર ૧ અને ૨', 'GIFT_CITY', 'COMMERCIAL', 'Road 1C, Zone 1, GIFT City', 23.1630, 72.6865, ['GIFT One', 'GIFT Two', 'WTC GIFT City']),
            ('GIFT City Club', 'ગિફ્ટ સિટી ક્લબ', 'GIFT_CITY', 'COMMERCIAL', 'Block 49, Sector 2, GIFT City', 23.1550, 72.6810, ['GIFT Club', 'Grand Omaxe GIFT']),

            # Gandhinagar Landmarks
            ('Gandhinagar Capital Railway Station', 'ગાંધીનગર કેપિટલ રેલવે સ્ટેશન', 'GANDHINAGAR', 'RAILWAY_STATION', 'Sector 14, Gandhinagar', 23.2480, 72.6490, ['Gandhinagar Station', 'GNC', 'Gandhinagar Capital', 'The Leela Gandhinagar']),
            ('Gandhinagar', 'ગાંધીનગર', 'GANDHINAGAR', 'GOVERNMENT', 'Sector 10, Gandhinagar Capital City', 23.2200, 72.6500, ['Gandhinagar City', 'Capital City']),
            ('Mahatma Mandir', 'મહાત્મા મંદિર', 'GANDHINAGAR', 'COMMERCIAL', 'Sector 13C, Gandhinagar', 23.2500, 72.6520, ['Mahatma Mandir Convention', 'Mahatma Mandir Metro']),
            ('Infocity Gandhinagar', 'ઇન્ફોસિટી ગાંધીનગર', 'GANDHINAGAR', 'COMMERCIAL', 'Infocity Complex, Sector 0, Gandhinagar', 23.2280, 72.6600, ['Infocity', 'Infocity IT Park', 'Infocity Hub']),
            ('Akshardham Temple', 'અક્ષરધામ મંદિર', 'GANDHINAGAR', 'TOURIST', 'Sector 20, J Road, Gandhinagar', 23.2300, 72.6730, ['Akshardham', 'Swaminarayan Akshardham']),
            ('Gujarat New Sachivalaya (Secretariat)', 'નવું સચિવાલય', 'GANDHINAGAR', 'GOVERNMENT', 'Sector 10, Gandhinagar', 23.2420, 72.6580, ['Sachivalaya', 'Secretariat', 'Swarnim Sankul', 'Vidhan Sabha']),
            ('Pathikashram Central Bus Station', 'પથિકાશ્રમ સેન્ટ્રલ બસ સ્ટેશન', 'GANDHINAGAR', 'BRTS_HUB', 'Sector 11, Gandhinagar', 23.2200, 72.6480, ['Pathikashram', 'Gandhinagar Bus Stand', 'GSRTC Gandhinagar']),
            ('GNLU (Gujarat National Law University)', 'જીએનએલયુ', 'GANDHINAGAR', 'EDUCATION', 'Attalika Avenue, Knowledge Corridor, Koba', 23.1900, 72.6320, ['GNLU', 'GNLU Metro Interchange']),
            ('PDPU / PDEU University', 'પીડીપીયુ / પીડીઇયુ', 'GANDHINAGAR', 'EDUCATION', 'Knowledge Corridor, Raisan, Gandhinagar', 23.1940, 72.6600, ['PDPU', 'PDEU', 'Pandit Deendayal Energy University']),
            ('DA-IICT (Dhirubhai Ambani Institute)', 'ડીએ-આઇઆઇસીટી', 'GANDHINAGAR', 'EDUCATION', 'Near Indroda Circle, Gandhinagar', 23.1880, 72.6280, ['DAIICT', 'DA-IICT']),
            ('NIFT Gandhinagar', 'નિફ્ટ ગાંધીનગર', 'GANDHINAGAR', 'EDUCATION', 'GH-0 Road, Infocity, Gandhinagar', 23.2250, 72.6580, ['NIFT']),
            ('Indroda Dinosaur & Fossil Park', 'ઇન્દ્રોડા નેચર પાર્ક', 'GANDHINAGAR', 'TOURIST', 'Indroda, Gandhinagar', 23.1950, 72.6720, ['Indroda Park', 'Zoo Gandhinagar']),
        ]

        # Add all 35 Gandhinagar Sectors (Sectors 1 to 35) systematically
        sector_coords = {
            1: (23.2350, 72.6640), 2: (23.2400, 72.6680), 3: (23.2450, 72.6720), 4: (23.2500, 72.6760),
            5: (23.2550, 72.6790), 6: (23.2600, 72.6750), 7: (23.2550, 72.6700), 8: (23.2500, 72.6650),
            9: (23.2450, 72.6600), 10: (23.2420, 72.6580), 11: (23.2200, 72.6480), 12: (23.2250, 72.6450),
            13: (23.2300, 72.6420), 14: (23.2480, 72.6490), 15: (23.2420, 72.6380), 16: (23.2350, 72.6350),
            17: (23.2280, 72.6320), 18: (23.2220, 72.6300), 19: (23.2150, 72.6280), 20: (23.2300, 72.6730),
            21: (23.2380, 72.6420), 22: (23.2450, 72.6350), 23: (23.2520, 72.6300), 24: (23.2580, 72.6250),
            25: (23.2650, 72.6200), 26: (23.2700, 72.6250), 27: (23.2750, 72.6300), 28: (23.2800, 72.6350),
            29: (23.2850, 72.6400), 30: (23.2900, 72.6450), 31: (23.2950, 72.6500), 32: (23.3000, 72.6550),
            33: (23.3050, 72.6600), 34: (23.3100, 72.6650), 35: (23.3150, 72.6700),
        }

        for sec_num, (s_lat, s_lng) in sector_coords.items():
            landmarks_data.append((
                f"Gandhinagar Sector {sec_num}",
                f"ગાંધીનગર સેક્ટર {sec_num}",
                'GANDHINAGAR',
                'RESIDENTIAL',
                f"Sector {sec_num}, Gandhinagar",
                s_lat,
                s_lng,
                [f"Sector {sec_num}", f"Sec {sec_num}", f"Gandhinagar Sec {sec_num}"]
            ))

        for name, name_gu, city, cat, addr, lat, lng, aliases in landmarks_data:
            PlaceLandmark.objects.update_or_create(
                name=name,
                defaults={
                    'name_gu': name_gu,
                    'city': city,
                    'category': cat,
                    'address': addr,
                    'latitude': lat,
                    'longitude': lng,
                    'is_popular': True,
                    'aliases': aliases,
                }
            )
            stats['landmarks'] += 1

        return stats
