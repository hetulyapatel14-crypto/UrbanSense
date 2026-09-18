import React from 'react'
import { TileLayer } from 'react-leaflet'
import { Map as MapIcon, Globe } from 'lucide-react'

export type MapTileMode = 'street' | 'satellite'

export const SATELLITE_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
export const SATELLITE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, GIS Community'

export const STREET_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const STREET_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

interface MapTileLayerProps {
  mode: MapTileMode
}

export const MapTileLayer: React.FC<MapTileLayerProps> = ({ mode }) => {
  if (mode === 'satellite') {
    return (
      <TileLayer
        key="satellite-tiles"
        url={SATELLITE_TILE_URL}
        attribution={SATELLITE_ATTRIBUTION}
        maxZoom={19}
      />
    )
  }

  return (
    <TileLayer
      key="street-tiles"
      url={STREET_TILE_URL}
      attribution={STREET_ATTRIBUTION}
    />
  )
}

export interface MapViewToggleProps {
  mode: MapTileMode
  onChange: (mode: MapTileMode) => void
  className?: string
  floating?: boolean
}

export const MapViewToggle: React.FC<MapViewToggleProps> = ({
  mode,
  onChange,
  className = '',
  floating = false,
}) => {
  return (
    <div
      className={`inline-flex items-center p-0.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-lg shadow-sm ${
        floating ? 'absolute top-3 right-3 z-[400]' : ''
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange('street')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
          mode === 'street'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <MapIcon className="w-3 h-3" />
        <span>Street</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('satellite')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
          mode === 'satellite'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <Globe className="w-3 h-3" />
        <span>Satellite</span>
      </button>
    </div>
  )
}

export default MapTileLayer
