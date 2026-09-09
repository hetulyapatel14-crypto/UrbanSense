import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { JourneyRouteOption, LiveVehicle, TransitStop } from '../../types/transit'
import { Navigation, Layers, ChevronDown, ChevronUp } from 'lucide-react'

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface TransitMapProps {
  route: JourneyRouteOption | null
  liveVehicles?: LiveVehicle[]
  selectedStop?: TransitStop | null
  onSelectVehicle?: (vehicleId: string) => void
}

// Helper component to auto-fit map bounds to the route polyline
function MapBoundsUpdater({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map((c) => [c[0], c[1]]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [coordinates, map])
  return null
}

// Custom DivIcons
const createPinIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-transit-pin',
    html: `
      <div style="
        background: ${color};
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-weight: 800;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

const createStationIcon = (mode: string, isInterchange: boolean) => {
  let bg = '#2563EB'
  if (mode === 'METRO') bg = '#DC2626'
  else if (mode === 'BRTS') bg = '#F97316'
  else if (mode === 'AMTS') bg = '#059669'
  else if (mode === 'RAIL') bg = '#9333EA'
  else if (mode === 'BUS') bg = '#0D9488'

  return L.divIcon({
    className: 'station-node-pin',
    html: `
      <div style="
        width: ${isInterchange ? '18px' : '14px'};
        height: ${isInterchange ? '18px' : '14px'};
        background: ${isInterchange ? '#9333EA' : bg};
        border: 2.5px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        transform: translate(-50%, -50%);
      "></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

const createVehicleIcon = (mode: string, vehicleId: string, status: string) => {
  let bg = '#2563EB'
  if (mode === 'METRO') bg = '#DC2626'
  else if (mode === 'BRTS') bg = '#EA580C'
  else if (mode === 'AMTS') bg = '#059669'
  else if (mode === 'RAIL') bg = '#9333EA'
  else if (mode === 'BUS') bg = '#0D9488'

  const isDelayed = status === 'DELAYED'
  return L.divIcon({
    className: 'live-vehicle-marker',
    html: `
      <div style="
        background: ${bg};
        color: white;
        padding: 3px 6px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        border: 1.5px solid ${isDelayed ? '#EF4444' : '#10B981'};
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span style="
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${isDelayed ? '#EF4444' : '#10B981'};
          display: inline-block;
          animation: pulse 1.5s infinite;
        "></span>
        <span>${vehicleId.split('-').slice(-2).join('-')}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

export const TransitMap: React.FC<TransitMapProps> = ({
  route,
  liveVehicles = [],
  onSelectVehicle,
}) => {
  const [isLegendMinimized, setIsLegendMinimized] = useState(false)
  const defaultCenter: [number, number] = [23.1000, 72.6000] // Ahmedabad-Gandhinagar Midpoint

  // Collect all coordinates for bounds fitting
  const allCoords: [number, number][] = route?.polyline || [
    [23.0762, 72.5855],
    [23.1600, 72.6840]
  ]

  const originCoord: [number, number] | null =
    route?.steps && route.steps.length > 0 && route.steps[0].coordinates.length > 0
      ? route.steps[0].coordinates[0]
      : null

  const destCoord: [number, number] | null =
    route?.steps && route.steps.length > 0
      ? route.steps[route.steps.length - 1].coordinates[route.steps[route.steps.length - 1].coordinates.length - 1]
      : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm flex flex-col h-full min-h-[420px] relative">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-2 text-xs font-semibold text-slate-800">
        <Navigation className="w-3.5 h-3.5 text-indigo-600" />
        <span>Ahmedabad • Gandhinagar • GIFT City Transit GIS</span>
      </div>

      {/* Legend Overlay with Minimize / Expand option */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-md text-[11px] overflow-hidden transition-all duration-200 max-w-[240px]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsLegendMinimized(!isLegendMinimized)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsLegendMinimized(!isLegendMinimized)
            }
          }}
          className="flex items-center justify-between gap-3 px-2.5 py-1.5 bg-slate-50/90 hover:bg-slate-100 cursor-pointer select-none transition-colors"
          title={isLegendMinimized ? 'Expand Transit Network' : 'Minimize Transit Network'}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Transit Network
            </span>
          </div>
          <button
            type="button"
            aria-label={isLegendMinimized ? 'Expand Transit Network' : 'Minimize Transit Network'}
            className="p-0.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition"
          >
            {isLegendMinimized ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {!isLegendMinimized && (
          <div className="p-2.5 pt-2 space-y-1.5 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-red-600 rounded flex-shrink-0"></span>
              <span className="font-medium text-slate-700">Metro Phase 1 & 2 / GIFT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-purple-600 rounded flex-shrink-0"></span>
              <span className="font-medium text-slate-700">Western Railway Suburban</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-orange-500 rounded flex-shrink-0"></span>
              <span className="font-medium text-slate-700">Janmarg BRTS Busway</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-teal-600 rounded flex-shrink-0"></span>
              <span className="font-medium text-slate-700">GIFT Shuttle / Gandhinagar Bus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-emerald-600 rounded flex-shrink-0"></span>
              <span className="font-medium text-slate-700">AMTS City Bus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 border-t-2 border-dashed border-slate-500 flex-shrink-0"></span>
              <span className="font-medium text-slate-700">Pedestrian Walk</span>
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="w-full h-full min-h-[420px] z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto fit bounds to current route */}
        {allCoords.length > 0 && <MapBoundsUpdater coordinates={allCoords} />}

        {/* Draw Polylines for each step */}
        {route?.steps.map((step, idx) => {
          const isWalk = step.step_type === 'WALK' || step.step_type === 'TRANSFER'
          let lineColor = '#64748B'
          if (step.route_color) {
            lineColor = step.route_color
          } else if (step.mode === 'METRO') {
            lineColor = '#DC2626'
          } else if (step.mode === 'BRTS') {
            lineColor = '#F97316'
          } else if (step.mode === 'AMTS') {
            lineColor = '#059669'
          } else if (step.mode === 'RAIL') {
            lineColor = '#9333EA'
          } else if (step.mode === 'BUS') {
            lineColor = '#0D9488'
          }

          return (
            <Polyline
              key={idx}
              positions={step.coordinates}
              pathOptions={{
                color: lineColor,
                weight: isWalk ? 4 : 6,
                opacity: 0.9,
                dashArray: isWalk ? '6, 8' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )
        })}

        {/* Origin Marker */}
        {originCoord && (
          <Marker
            position={originCoord}
            icon={createPinIcon('#2563EB', 'Start')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-slate-900 block">{route?.steps[0]?.from_name || 'Origin'}</strong>
                <span className="text-slate-500">Starting Point • Departs {route?.departure_time}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destCoord && (
          <Marker
            position={destCoord}
            icon={createPinIcon('#DC2626', 'Destination')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-slate-900 block">{route?.steps[route.steps.length - 1]?.to_name || 'Destination'}</strong>
                <span className="text-slate-500">Final Arrival • Expected {route?.arrival_time}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Intermediate Station Nodes */}
        {route?.steps.map((step, idx) => {
          if (step.step_type === 'TRANSIT') {
            return step.coordinates.map((coord, cIdx) => (
              <Marker
                key={`${idx}-${cIdx}`}
                position={coord}
                icon={createStationIcon(step.mode, cIdx === 0 || cIdx === step.coordinates.length - 1)}
              >
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <div className="font-bold text-slate-800">{step.mode} Transit Stop</div>
                    <div className="text-slate-600">{step.route_name}</div>
                    {step.platform_info && (
                      <div className="text-[11px] font-semibold text-blue-600">{step.platform_info}</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))
          }
          return null
        })}

        {/* Live Vehicles on Map */}
        {liveVehicles.map((v) => (
          <Marker
            key={v.vehicle_id}
            position={[v.latitude, v.longitude]}
            icon={createVehicleIcon(v.mode, v.vehicle_id, v.status)}
            eventHandlers={{
              click: () => onSelectVehicle && onSelectVehicle(v.vehicle_id),
            }}
          >
            <Popup>
              <div className="p-1 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-slate-900">{v.vehicle_id}</strong>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {v.mode}
                  </span>
                </div>
                <div className="text-slate-600">Route: {v.route_number} ({v.route_name})</div>
                <div className="text-slate-600">Speed: {v.speed_kmh} km/h • Loc: {v.current_location_name}</div>
                {v.next_stop_name && (
                  <div className="text-slate-700">
                    Next Stop: <strong>{v.next_stop_name}</strong> (~{v.eta_next_stop_mins}m)
                  </div>
                )}
                <div className="text-[10px] text-slate-400 pt-1 border-t">
                  {v.freshness_label} • {v.data_source}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
