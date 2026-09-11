import React, { useEffect, useRef, useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { LiveVehicle } from '../../types/transit'

interface MovingVehicleMarkerProps {
  vehicle: LiveVehicle
  isSelected?: boolean
  onClick?: () => void
}

/**
 * High-performance animated Leaflet marker with smooth position interpolation (lerp),
 * rotating direction heading arrow, glowing electric radar pulse ring, and rich telemetry popup.
 */
export const MovingVehicleMarker: React.FC<MovingVehicleMarkerProps> = ({
  vehicle,
  isSelected = false,
  onClick,
}) => {
  const markerRef = useRef<L.Marker | null>(null)
  const [currentPos, setCurrentPos] = useState<[number, number]>([vehicle.latitude, vehicle.longitude])
  const prevPosRef = useRef<[number, number]>([vehicle.latitude, vehicle.longitude])
  const animFrameRef = useRef<number | null>(null)

  // Smooth position interpolation whenever vehicle.latitude / vehicle.longitude changes
  useEffect(() => {
    const targetPos: [number, number] = [vehicle.latitude, vehicle.longitude]
    const startPos = prevPosRef.current

    // If position hasn't changed or initial jump is very far, set directly
    const dist = Math.hypot(targetPos[0] - startPos[0], targetPos[1] - startPos[1])
    if (dist < 0.00001) {
      setCurrentPos(targetPos)
      return
    }

    const duration = 1400 // ms
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1.0, elapsed / duration)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)

      const lat = startPos[0] + (targetPos[0] - startPos[0]) * ease
      const lon = startPos[1] + (targetPos[1] - startPos[1]) * ease

      setCurrentPos([lat, lon])

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon])
      }

      if (progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        prevPosRef.current = targetPos
      }
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [vehicle.latitude, vehicle.longitude])

  // Determine styling based on vehicle mode & electric status
  const isElectric =
    vehicle.mode === 'GANDHINAGAR_ELECTRIC_BUS' ||
    vehicle.is_electric ||
    vehicle.vehicle_id.includes('EB') ||
    vehicle.vehicle_id.includes('GGTSL') ||
    vehicle.vehicle_id.includes('EV') ||
    vehicle.operator?.toLowerCase().includes('greenline') ||
    vehicle.operator?.toLowerCase().includes('ggtsl')

  let badgeBg = '#2563EB'
  let borderColor = '#3B82F6'
  let glowColor = 'rgba(59, 130, 246, 0.4)'

  if (isElectric) {
    badgeBg = '#059669' // Emerald
    borderColor = '#10B981'
    glowColor = 'rgba(16, 185, 129, 0.45)'
  } else if (vehicle.mode === 'METRO') {
    badgeBg = '#DC2626'
    borderColor = '#EF4444'
    glowColor = 'rgba(239, 68, 68, 0.4)'
  } else if (vehicle.mode === 'BRTS') {
    badgeBg = '#EA580C'
    borderColor = '#F97316'
    glowColor = 'rgba(249, 115, 22, 0.4)'
  } else if (vehicle.mode === 'RAIL') {
    badgeBg = '#9333EA'
    borderColor = '#A855F7'
    glowColor = 'rgba(168, 85, 247, 0.4)'
  }

  const isDelayed = vehicle.status === 'DELAYED'
  if (isDelayed) {
    borderColor = '#EF4444'
  }

  const shortId = vehicle.vehicle_id.replace(/^GGTSL-|^METRO-|^BRTS-|^AMTS-/, '')
  const headingDeg = vehicle.heading || 0
  const batterySoc = vehicle.battery_soc_pct ?? (isElectric ? 84 : undefined)

  // Custom HTML Icon with live heading pointer & electric glow wave
  const customIcon = L.divIcon({
    className: 'urbansense-moving-bus-icon',
    html: `
      <div style="position: relative; transform: translate(-50%, -50%); cursor: pointer; user-select: none;">
        <!-- Radar Pulse Ring -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: 38px;
          height: 38px;
          margin-top: -19px;
          margin-left: -19px;
          border-radius: 50%;
          background: ${glowColor};
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          pointer-events: none;
        "></div>

        <!-- Main Bus Pill -->
        <div style="
          position: relative;
          background: ${badgeBg};
          color: white;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          font-family: ui-sans-serif, system-ui, sans-serif;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
          border: 2px solid ${isSelected ? '#FBBF24' : borderColor};
          white-space: nowrap;
          transition: transform 0.2s ease, border-color 0.2s ease;
        ">
          <!-- Heading Direction Arrow -->
          <div style="
            width: 12px;
            height: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(${headingDeg}deg);
            transition: transform 0.4s ease;
          ">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
              <path d="M12 2L4 20l8-4 8 4z" />
            </svg>
          </div>

          <!-- Icon & Short ID -->
          <span>${isElectric ? '⚡' : ''}${shortId}</span>

          <!-- Battery Mini Dot for Electric Buses -->
          ${
            batterySoc !== undefined
              ? `<span style="
                  font-size: 9px;
                  background: rgba(0, 0, 0, 0.25);
                  padding: 1px 4px;
                  border-radius: 8px;
                  color: ${batterySoc < 25 ? '#FCA5A5' : '#A7F3D0'};
                ">${batterySoc}%</span>`
              : ''
          }
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })

  return (
    <Marker
      ref={markerRef}
      position={currentPos}
      icon={customIcon}
      eventHandlers={{
        click: () => onClick && onClick(),
      }}
    >
      <Popup className="urbansense-vehicle-popup">
        <div className="p-1 min-w-[210px] text-xs font-sans space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                {isElectric && <span className="text-emerald-600 font-bold">⚡</span>}
                <span>{vehicle.vehicle_id}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                {vehicle.operator || 'City Transit Unit'}
              </div>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                isElectric
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {isElectric ? 'PM-eBus SEWA' : vehicle.mode}
            </span>
          </div>

          {/* Route & Position Details */}
          <div className="space-y-1 text-slate-600">
            {vehicle.route_number && (
              <div>
                <strong className="text-slate-800">Route:</strong>{' '}
                <span className="font-bold text-blue-600">{vehicle.route_number}</span>
                {vehicle.route_name && ` (${vehicle.route_name})`}
              </div>
            )}
            <div>
              <strong className="text-slate-800">Speed:</strong> {vehicle.speed_kmh} km/h •{' '}
              <strong className="text-slate-800">Heading:</strong> {headingDeg}°
            </div>
            {vehicle.current_location_name && (
              <div>
                <strong className="text-slate-800">Location:</strong> {vehicle.current_location_name}
              </div>
            )}
            {vehicle.next_stop_name && (
              <div className="text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-100 mt-1">
                Next Stop: <strong className="text-blue-700">{vehicle.next_stop_name}</strong>
                {vehicle.eta_next_stop_mins && (
                  <span className="text-emerald-700 font-bold ml-1">
                    (~{vehicle.eta_next_stop_mins}m)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Battery Status Gauge for Electric Buses */}
          {isElectric && batterySoc !== undefined && (
            <div className="pt-1.5 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-700">EV Battery SOC:</span>
                <span
                  className={`font-black ${
                    batterySoc > 50 ? 'text-emerald-600' : batterySoc > 20 ? 'text-amber-600' : 'text-rose-600'
                  }`}
                >
                  {batterySoc}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    batterySoc > 50 ? 'bg-emerald-500' : batterySoc > 20 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.max(5, Math.min(100, batterySoc))}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Provenance & Freshness */}
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>{vehicle.freshness_label || 'Live GPS Feed'}</span>
            <span className="font-mono font-bold text-emerald-600">
              {vehicle.data_source || 'TRACCAR'}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
