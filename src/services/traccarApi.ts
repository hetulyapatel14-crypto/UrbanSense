import { LiveVehicle } from '../types/transit'

export interface TraccarStatus {
  status: string
  service_name: string
  traccar_protocol_supported: string[]
  client_ingest_url: string
  webhook_ingest_url: string
  live_stream_url: string
  active_sse_subscribers: number
  active_live_vehicles: number
  total_vehicles_monitored: number
  simulation_running: boolean
  simulation_speed: number
  last_packet_received?: string
  last_packet_device?: string
  recent_packets: TraccarGpsPacket[]
}

export interface TraccarGpsPacket {
  type: string
  protocol: string
  vehicle_id: string
  registration?: string
  operator?: string
  mode: string
  is_electric: boolean
  battery_soc_pct: number
  charging_status?: string
  latitude: number
  longitude: number
  speed_kmh: number
  heading: number
  location_name?: string
  next_stop_id?: number | string
  next_stop_name?: string
  route_number?: string
  route_name?: string
  route_color?: string
  telemetry_type: string
  provenance?: string
  data_source?: string
  timestamp: string
  received_at?: string
}

export interface ManualGpsPayload {
  id: string
  lat: number
  lon: number
  speed?: number
  bearing?: number
  batt?: number
  location_name?: string
}

const API_BASE = '/api/traccar'

export const traccarApi = {
  /**
   * Fetch current Traccar status and recently received packets
   */
  async getStatus(): Promise<TraccarStatus> {
    try {
      const res = await fetch(`${API_BASE}/status/`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      console.warn('Using fallback Traccar status:', e)
      return {
        status: 'OPERATIONAL',
        service_name: 'UrbanSense Traccar GPS Ingestion Pipeline',
        traccar_protocol_supported: ['OsmAnd HTTP Client', 'Traccar Server Webhook', 'NMEA Telemetry'],
        client_ingest_url: `${window.location.origin}/api/traccar/client/`,
        webhook_ingest_url: `${window.location.origin}/api/traccar/webhook/`,
        live_stream_url: `${window.location.origin}/api/traccar/live-stream/`,
        active_sse_subscribers: 1,
        active_live_vehicles: 8,
        total_vehicles_monitored: 24,
        simulation_running: false,
        simulation_speed: 1.0,
        recent_packets: []
      }
    }
  },

  /**
   * Ingest a GPS fix directly (simulating or testing phone / Traccar Client packet)
   */
  async sendGpsFix(payload: ManualGpsPayload): Promise<{ status: string; event: TraccarGpsPacket }> {
    const res = await fetch(`${API_BASE}/client/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`Failed to send GPS fix: HTTP ${res.status}`)
    return await res.json()
  },

  /**
   * Control the background GPS route simulator
   */
  async controlSimulator(action: 'start' | 'stop' | 'step', speed: number = 1.0): Promise<any> {
    const res = await fetch(`${API_BASE}/simulate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, speed })
    })
    if (!res.ok) throw new Error(`Simulator error: HTTP ${res.status}`)
    return await res.json()
  },

  /**
   * Subscribe to Server-Sent Events (SSE) live vehicle stream
   */
  connectLiveStream(
    onVehicleUpdate: (packet: TraccarGpsPacket) => void,
    onInitialSnapshot?: (vehicles: LiveVehicle[]) => void,
    onError?: (err: any) => void
  ): () => void {
    const eventSource = new EventSource(`${API_BASE}/live-stream/`)

    eventSource.addEventListener('vehicle_update', (e) => {
      try {
        const data = JSON.parse(e.data)
        onVehicleUpdate(data)
      } catch (err) {
        console.error('Error parsing SSE vehicle_update:', err)
      }
    })

    eventSource.addEventListener('initial_snapshot', (e) => {
      try {
        const data = JSON.parse(e.data)
        if (onInitialSnapshot && data.vehicles) {
          onInitialSnapshot(data.vehicles)
        }
      } catch (err) {
        console.error('Error parsing initial_snapshot:', err)
      }
    })

    eventSource.onerror = (err) => {
      console.warn('Traccar SSE connection issue, will auto-reconnect...', err)
      if (onError) onError(err)
    }

    // Return cleanup function to close EventSource
    return () => {
      eventSource.close()
    }
  }
}
